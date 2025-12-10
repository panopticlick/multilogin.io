import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  upsertBrowserVersions,
  evaluateProfileAgainstPolicy,
  type FingerprintPolicyRecord,
} from '../../src/services/fingerprint-policy';
import type { Env } from '../../src/types/env';

const WINDOWS_CHROME_120 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const WINDOWS_FIREFOX_130 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';

interface BrowserVersionRow {
  id: string;
  browser: string;
  channel: string;
  platform: string;
  region: string;
  version: number;
  major_version: number;
  release_date: number;
  notes: string | null;
  metadata: string | null;
  updated_at: number;
}

interface ProfileRow {
  id: string;
  teamId: string;
  userAgent: string;
  policyId: string | null;
}

type StatementKind = 'selectProfile' | 'selectBrowserVersions' | 'upsertBrowserVersion';
type ExecutionMode = 'first' | 'all' | 'run';

interface MockStatement {
  kind: StatementKind;
  args: unknown[];
  bind: (...args: unknown[]) => MockStatement;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<{ results: T[] }>;
  run: () => Promise<void>;
}

class MockD1Database {
  public browserVersions: BrowserVersionRow[];
  private profiles = new Map<string, ProfileRow>();

  constructor(initial?: { browserVersions?: BrowserVersionRow[]; profiles?: ProfileRow[] }) {
    this.browserVersions = initial?.browserVersions ? [...initial.browserVersions] : [];
    initial?.profiles?.forEach((profile) => this.setProfile(profile));
  }

  public setProfile(profile: ProfileRow) {
    this.profiles.set(profile.id, profile);
  }

  public findBrowserVersion(browser: string, channel: string, platform: string, region: string) {
    return this.browserVersions.find(
      (row) => row.browser === browser && row.channel === channel && row.platform === platform && row.region === region
    );
  }

  public prepare(sql: string) {
    const kind = this.detectKind(sql);
    const statement: MockStatement = {
      kind,
      args: [],
      bind: (...args: unknown[]) => {
        statement.args = args;
        return statement;
      },
      first: async <T>() => this.execute(kind, statement.args, 'first') as T | null,
      all: async <T>() => ({ results: this.execute(kind, statement.args, 'all') as T[] }),
      run: async () => {
        await this.execute(kind, statement.args, 'run');
      },
    };

    return statement;
  }

  public async batch(statements: MockStatement[]) {
    for (const statement of statements) {
      await this.execute(statement.kind as StatementKind, statement.args, 'run');
    }
  }

  private detectKind(sql: string): StatementKind {
    if (sql.includes('FROM profiles')) return 'selectProfile';
    if (sql.includes('FROM browser_versions')) return 'selectBrowserVersions';
    if (sql.includes('INSERT INTO browser_versions')) return 'upsertBrowserVersion';
    throw new Error(`Unsupported SQL in mock: ${sql}`);
  }

  private execute(kind: StatementKind, args: unknown[], mode: ExecutionMode) {
    switch (kind) {
      case 'selectProfile': {
        const [profileId, teamId] = args as [string, string];
        const profile = this.profiles.get(profileId);
        if (!profile || profile.teamId !== teamId) {
          return mode === 'all' ? [] : null;
        }
        return {
          id: profile.id,
          user_agent: profile.userAgent,
          fingerprint_policy_id: profile.policyId,
        };
      }
      case 'selectBrowserVersions': {
        if (mode === 'all') {
          return this.browserVersions.map((row) => ({ ...row }));
        }
        return null;
      }
      case 'upsertBrowserVersion': {
        if (mode === 'run') {
          this.applyUpsert(args as [string, string, string, string, string, number, number, number, string | null, string | null, number]);
        }
        return null;
      }
      default:
        return null;
    }
  }

  private applyUpsert(args: [string, string, string, string, string, number, number, number, string | null, string | null, number]) {
    const [id, browser, channel, platform, region, version, majorVersion, releaseDate, notes, metadata, updatedAt] = args;
    const existing = this.findBrowserVersion(browser, channel, platform, region);
    if (existing) {
      existing.version = version;
      existing.major_version = majorVersion;
      existing.release_date = releaseDate;
      existing.notes = notes;
      existing.metadata = metadata;
      existing.updated_at = updatedAt;
      return;
    }

    this.browserVersions.push({
      id,
      browser,
      channel,
      platform,
      region,
      version,
      major_version: majorVersion,
      release_date: releaseDate,
      notes,
      metadata,
      updated_at: updatedAt,
    });
  }
}

function createEnv(initial?: { browserVersions?: BrowserVersionRow[]; profiles?: ProfileRow[] }) {
  const db = new MockD1Database(initial);
  const env: Env = {
    DB: db as unknown as D1Database,
    R2: {} as R2Bucket,
    KV: {} as KVNamespace,
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'development',
  };

  return { env, db };
}

function buildPolicy(overrides: Partial<FingerprintPolicyRecord> = {}): FingerprintPolicyRecord {
  return {
    id: overrides.id ?? 'policy-1',
    teamId: overrides.teamId ?? 'team-1',
    name: overrides.name ?? 'Default',
    description: overrides.description,
    maxVersionsBehind: overrides.maxVersionsBehind ?? 2,
    maxVersionsBehindMobile: overrides.maxVersionsBehindMobile ?? 1,
    autoUpgrade: overrides.autoUpgrade ?? false,
    upgradeWindowHours: overrides.upgradeWindowHours ?? 48,
    requireManualApproval: overrides.requireManualApproval ?? true,
    riskTolerance: overrides.riskTolerance ?? 'balanced',
    allowedBrowsers: overrides.allowedBrowsers ?? ['chrome'],
    preferredProxyTypes: overrides.preferredProxyTypes ?? [],
    regions: overrides.regions ?? [],
    notificationChannels: overrides.notificationChannels ?? [],
    metadata: overrides.metadata ?? {},
    createdAt: overrides.createdAt ?? 0,
    updatedAt: overrides.updatedAt ?? 0,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-12-01T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('upsertBrowserVersions', () => {
  it('updates existing rows and inserts new browser versions', async () => {
    const { env, db } = createEnv({
      browserVersions: [
        {
          id: 'chrome-stable',
          browser: 'chrome',
          channel: 'stable',
          platform: 'desktop',
          region: 'global',
          version: 121,
          major_version: 121,
          release_date: Date.now() - 1000,
          notes: null,
          metadata: null,
          updated_at: Date.now() - 1000,
        },
      ],
    });

    await upsertBrowserVersions(env, [
      {
        browser: 'chrome',
        channel: 'stable',
        platform: 'desktop',
        version: 126,
        releaseDate: Date.now(),
      },
      {
        browser: 'firefox',
        channel: 'stable',
        platform: 'desktop',
        version: 133,
      },
    ]);

    const updated = db.findBrowserVersion('chrome', 'stable', 'desktop', 'global');
    expect(updated?.version).toBe(126);
    expect(updated?.id).toBe('chrome-stable');

    const firefox = db.findBrowserVersion('firefox', 'stable', 'desktop', 'global');
    expect(firefox?.version).toBe(133);
    expect(db.browserVersions).toHaveLength(2);
  });
});

describe('evaluateProfileAgainstPolicy', () => {
  it('returns a violation when fingerprint exceeds allowed lag', async () => {
    const { env, db } = createEnv({
      browserVersions: [
        {
          id: 'chrome-stable',
          browser: 'chrome',
          channel: 'stable',
          platform: 'desktop',
          region: 'global',
          version: 131,
          major_version: 131,
          release_date: Date.now(),
          notes: null,
          metadata: null,
          updated_at: Date.now(),
        },
      ],
      profiles: [
        {
          id: 'profile-1',
          teamId: 'team-1',
          userAgent: WINDOWS_CHROME_120,
          policyId: null,
        },
      ],
    });

    const policy = buildPolicy();
    const result = await evaluateProfileAgainstPolicy(env, 'team-1', 'profile-1', policy);

    expect(result.status).toBe('violation');
    expect(result.details[0]).toContain('versions behind');
    expect(result.versionsBehind).toBe(11);
    expect(db.findBrowserVersion('chrome', 'stable', 'desktop', 'global')).toBeTruthy();
  });

  it('returns a warning when fingerprint is at the policy limit', async () => {
    const { env } = createEnv({
      browserVersions: [
        {
          id: 'firefox-stable',
          browser: 'firefox',
          channel: 'stable',
          platform: 'desktop',
          region: 'global',
          version: 132,
          major_version: 132,
          release_date: Date.now(),
          notes: null,
          metadata: null,
          updated_at: Date.now(),
        },
      ],
      profiles: [
        {
          id: 'profile-2',
          teamId: 'team-1',
          userAgent: WINDOWS_FIREFOX_130,
          policyId: null,
        },
      ],
    });

    const policy = buildPolicy({
      id: 'policy-2',
      allowedBrowsers: ['firefox'],
      maxVersionsBehind: 2,
    });

    const result = await evaluateProfileAgainstPolicy(env, 'team-1', 'profile-2', policy);

    expect(result.status).toBe('warning');
    expect(result.details[0]).toContain('approaching policy limits');
    expect(result.versionsBehind).toBe(2);
  });
});
