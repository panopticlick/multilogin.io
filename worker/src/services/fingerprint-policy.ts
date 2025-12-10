import type { Env } from '../types/env';
import { parseUserAgentVersion, isOutdated } from './fingerprint-aging';
import type { BrowserVersions } from './fingerprint-aging';

type JsonArray = string[];

export interface BrowserVersionRecord {
  id: string;
  browser: string;
  channel: string;
  platform: string;
  region: string;
  version: number;
  majorVersion: number | null;
  releaseDate: number | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  updatedAt: number;
}

export interface FingerprintPolicyRecord {
  id: string;
  teamId: string;
  name: string;
  description?: string | null;
  maxVersionsBehind: number;
  maxVersionsBehindMobile: number;
  autoUpgrade: boolean;
  upgradeWindowHours: number;
  requireManualApproval: boolean;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  allowedBrowsers: string[];
  preferredProxyTypes: string[];
  regions: string[];
  notificationChannels: string[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

const DEFAULT_BROWSER_VERSIONS: BrowserVersions = {
  chrome: { stable: 131, beta: 132, dev: 133 },
  firefox: { stable: 133, beta: 134 },
  safari: { stable: 18 },
  edge: { stable: 131 },
  updatedAt: Date.now(),
};

const DEFAULT_POLICY: Omit<FingerprintPolicyRecord, 'id' | 'teamId' | 'createdAt' | 'updatedAt'> = {
  name: 'Default Policy',
  description: 'Baseline fingerprint upgrade policy',
  maxVersionsBehind: 2,
  maxVersionsBehindMobile: 1,
  autoUpgrade: false,
  upgradeWindowHours: 48,
  requireManualApproval: true,
  riskTolerance: 'balanced',
  allowedBrowsers: ['chrome', 'firefox', 'edge'],
  preferredProxyTypes: ['residential', 'mobile'],
  regions: ['global'],
  notificationChannels: ['email'],
  metadata: {},
};

function parseJsonArray(value?: string | null): JsonArray {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeJsonArray(value?: JsonArray): string {
  return JSON.stringify(value ?? []);
}

function parseMetadata(value?: string | null): Record<string, unknown> | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export async function listBrowserVersions(env: Env): Promise<BrowserVersionRecord[]> {
  const result = await env.DB.prepare(`
    SELECT id, browser, channel, platform, region, version, major_version, release_date, notes, metadata, updated_at
    FROM browser_versions
    ORDER BY browser ASC, channel ASC
  `).all<{
    id: string;
    browser: string;
    channel: string;
    platform: string;
    region: string;
    version: number;
    major_version: number | null;
    release_date: number | null;
    notes: string | null;
    metadata: string | null;
    updated_at: number;
  }>();

  if (!result.results) return [];

  return result.results.map((row) => ({
    id: row.id,
    browser: row.browser,
    channel: row.channel,
    platform: row.platform,
    region: row.region,
    version: row.version,
    majorVersion: row.major_version,
    releaseDate: row.release_date,
    notes: row.notes,
    metadata: parseMetadata(row.metadata),
    updatedAt: row.updated_at,
  }));
}

export interface UpsertBrowserVersionInput {
  browser: string;
  channel: string;
  platform: string;
  region?: string;
  version: number;
  majorVersion?: number;
  releaseDate?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export async function upsertBrowserVersions(env: Env, entries: UpsertBrowserVersionInput[]): Promise<void> {
  if (!entries.length) return;

  const now = Date.now();
  const statements = entries.map((entry) =>
    env.DB.prepare(
      `INSERT INTO browser_versions (id, browser, channel, platform, region, version, major_version, release_date, notes, metadata, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (browser, channel, platform, region)
       DO UPDATE SET version = excluded.version,
                     major_version = excluded.major_version,
                     release_date = excluded.release_date,
                     notes = excluded.notes,
                     metadata = excluded.metadata,
                     updated_at = excluded.updated_at`
    ).bind(
      crypto.randomUUID(),
      entry.browser,
      entry.channel,
      entry.platform,
      entry.region ?? 'global',
      entry.version,
      entry.majorVersion ?? entry.version,
      entry.releaseDate ?? now,
      entry.notes ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      now
    )
  );

  await env.DB.batch(statements);
}

export async function getBrowserVersionMap(env: Env): Promise<BrowserVersions> {
  const versions = await listBrowserVersions(env);

  if (!versions.length) {
    return DEFAULT_BROWSER_VERSIONS;
  }

  const byBrowser: BrowserVersions = {
    chrome: { stable: 0, beta: 0, dev: 0 },
    firefox: { stable: 0, beta: 0 },
    safari: { stable: 0 },
    edge: { stable: 0 },
    updatedAt: Date.now(),
  };

  versions.forEach((record) => {
    const browserKey = record.browser as keyof BrowserVersions;
    const channelKey = record.channel as keyof BrowserVersions['chrome'];

    if (browserKey in byBrowser && channelKey && typeof channelKey === 'string') {
      // @ts-expect-error dynamic assignment for available channels
      byBrowser[browserKey][channelKey] = record.version;
    }
  });

  byBrowser.updatedAt = versions[0]?.updatedAt ?? Date.now();
  return byBrowser;
}

function mapPolicyRow(row: {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  max_versions_behind: number;
  max_versions_behind_mobile: number | null;
  auto_upgrade: number;
  upgrade_window_hours: number;
  require_manual_approval: number;
  risk_tolerance: string;
  allowed_browsers: string | null;
  preferred_proxy_types: string | null;
  regions: string | null;
  notification_channels: string | null;
  metadata: string | null;
  created_at: number;
  updated_at: number;
}): FingerprintPolicyRecord {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    description: row.description,
    maxVersionsBehind: row.max_versions_behind,
    maxVersionsBehindMobile: row.max_versions_behind_mobile ?? row.max_versions_behind,
    autoUpgrade: !!row.auto_upgrade,
    upgradeWindowHours: row.upgrade_window_hours,
    requireManualApproval: !!row.require_manual_approval,
    riskTolerance: (row.risk_tolerance as FingerprintPolicyRecord['riskTolerance']) ?? 'balanced',
    allowedBrowsers: parseJsonArray(row.allowed_browsers),
    preferredProxyTypes: parseJsonArray(row.preferred_proxy_types),
    regions: parseJsonArray(row.regions),
    notificationChannels: parseJsonArray(row.notification_channels),
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPolicies(env: Env, teamId: string): Promise<FingerprintPolicyRecord[]> {
  const result = await env.DB.prepare(`
    SELECT * FROM fingerprint_policies WHERE team_id = ? ORDER BY created_at ASC
  `).bind(teamId).all<{
    id: string;
    team_id: string;
    name: string;
    description: string | null;
    max_versions_behind: number;
    max_versions_behind_mobile: number | null;
    auto_upgrade: number;
    upgrade_window_hours: number;
    require_manual_approval: number;
    risk_tolerance: string;
    allowed_browsers: string | null;
    preferred_proxy_types: string | null;
    regions: string | null;
    notification_channels: string | null;
    metadata: string | null;
    created_at: number;
    updated_at: number;
  }>();

  if (!result.results) return [];
  return result.results.map(mapPolicyRow);
}

export interface PolicyInput {
  name: string;
  description?: string;
  maxVersionsBehind?: number;
  maxVersionsBehindMobile?: number;
  autoUpgrade?: boolean;
  upgradeWindowHours?: number;
  requireManualApproval?: boolean;
  riskTolerance?: FingerprintPolicyRecord['riskTolerance'];
  allowedBrowsers?: string[];
  preferredProxyTypes?: string[];
  regions?: string[];
  notificationChannels?: string[];
  metadata?: Record<string, unknown>;
}

function buildPolicyValues(teamId: string, input: PolicyInput, existing?: FingerprintPolicyRecord) {
  const source = existing ?? { ...DEFAULT_POLICY };
  return {
    teamId,
    name: input.name ?? source.name,
    description: input.description ?? source.description ?? null,
    maxVersionsBehind: input.maxVersionsBehind ?? source.maxVersionsBehind,
    maxVersionsBehindMobile: input.maxVersionsBehindMobile ?? source.maxVersionsBehindMobile,
    autoUpgrade: input.autoUpgrade ?? source.autoUpgrade,
    upgradeWindowHours: input.upgradeWindowHours ?? source.upgradeWindowHours,
    requireManualApproval: input.requireManualApproval ?? source.requireManualApproval,
    riskTolerance: input.riskTolerance ?? source.riskTolerance,
    allowedBrowsers: serializeJsonArray(input.allowedBrowsers ?? source.allowedBrowsers),
    preferredProxyTypes: serializeJsonArray(input.preferredProxyTypes ?? source.preferredProxyTypes),
    regions: serializeJsonArray(input.regions ?? source.regions),
    notificationChannels: serializeJsonArray(input.notificationChannels ?? source.notificationChannels),
    metadata: JSON.stringify(input.metadata ?? source.metadata ?? {}),
  };
}

export async function getPolicy(env: Env, teamId: string, policyId: string): Promise<FingerprintPolicyRecord | null> {
  const row = await env.DB.prepare(`
    SELECT * FROM fingerprint_policies WHERE id = ? AND team_id = ?
  `)
    .bind(policyId, teamId)
    .first<{
      id: string;
      team_id: string;
      name: string;
      description: string | null;
      max_versions_behind: number;
      max_versions_behind_mobile: number | null;
      auto_upgrade: number;
      upgrade_window_hours: number;
      require_manual_approval: number;
      risk_tolerance: string;
      allowed_browsers: string | null;
      preferred_proxy_types: string | null;
      regions: string | null;
      notification_channels: string | null;
      metadata: string | null;
      created_at: number;
      updated_at: number;
    }>();

  return row ? mapPolicyRow(row) : null;
}

export async function ensureDefaultPolicy(env: Env, teamId: string): Promise<FingerprintPolicyRecord> {
  const existing = await env.DB.prepare(`
    SELECT * FROM fingerprint_policies WHERE team_id = ? ORDER BY created_at ASC LIMIT 1
  `)
    .bind(teamId)
    .first<{
      id: string;
      team_id: string;
      name: string;
      description: string | null;
      max_versions_behind: number;
      max_versions_behind_mobile: number | null;
      auto_upgrade: number;
      upgrade_window_hours: number;
      require_manual_approval: number;
      risk_tolerance: string;
      allowed_browsers: string | null;
      preferred_proxy_types: string | null;
      regions: string | null;
      notification_channels: string | null;
      metadata: string | null;
      created_at: number;
      updated_at: number;
    }>();

  if (existing) {
    return mapPolicyRow(existing);
  }

  const now = Date.now();
  const id = crypto.randomUUID();
  const values = buildPolicyValues(teamId, DEFAULT_POLICY);

  await env.DB.prepare(`
    INSERT INTO fingerprint_policies (
      id, team_id, name, description, max_versions_behind, max_versions_behind_mobile, auto_upgrade,
      upgrade_window_hours, require_manual_approval, risk_tolerance, allowed_browsers,
      preferred_proxy_types, regions, notification_channels, metadata, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      teamId,
      values.name,
      values.description,
      values.maxVersionsBehind,
      values.maxVersionsBehindMobile,
      values.autoUpgrade ? 1 : 0,
      values.upgradeWindowHours,
      values.requireManualApproval ? 1 : 0,
      values.riskTolerance,
      values.allowedBrowsers,
      values.preferredProxyTypes,
      values.regions,
      values.notificationChannels,
      values.metadata,
      now,
      now
    )
    .run();

  return (await getPolicy(env, teamId, id))!;
}

export async function createPolicy(env: Env, teamId: string, input: PolicyInput): Promise<FingerprintPolicyRecord> {
  const now = Date.now();
  const id = crypto.randomUUID();
  const values = buildPolicyValues(teamId, input);

  await env.DB.prepare(`
    INSERT INTO fingerprint_policies (
      id, team_id, name, description, max_versions_behind, max_versions_behind_mobile, auto_upgrade,
      upgrade_window_hours, require_manual_approval, risk_tolerance, allowed_browsers,
      preferred_proxy_types, regions, notification_channels, metadata, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      teamId,
      values.name,
      values.description,
      values.maxVersionsBehind,
      values.maxVersionsBehindMobile,
      values.autoUpgrade ? 1 : 0,
      values.upgradeWindowHours,
      values.requireManualApproval ? 1 : 0,
      values.riskTolerance,
      values.allowedBrowsers,
      values.preferredProxyTypes,
      values.regions,
      values.notificationChannels,
      values.metadata,
      now,
      now
    )
    .run();

  return (await getPolicy(env, teamId, id))!;
}

export async function updatePolicy(
  env: Env,
  teamId: string,
  policyId: string,
  input: PolicyInput
): Promise<FingerprintPolicyRecord> {
  const current = await getPolicy(env, teamId, policyId);
  if (!current) {
    throw new Error('Policy not found');
  }

  const now = Date.now();
  const values = buildPolicyValues(teamId, input, current);

  await env.DB.prepare(`
    UPDATE fingerprint_policies
    SET name = ?, description = ?, max_versions_behind = ?, max_versions_behind_mobile = ?,
        auto_upgrade = ?, upgrade_window_hours = ?, require_manual_approval = ?, risk_tolerance = ?,
        allowed_browsers = ?, preferred_proxy_types = ?, regions = ?, notification_channels = ?, metadata = ?,
        updated_at = ?
    WHERE id = ? AND team_id = ?
  `)
    .bind(
      values.name,
      values.description,
      values.maxVersionsBehind,
      values.maxVersionsBehindMobile,
      values.autoUpgrade ? 1 : 0,
      values.upgradeWindowHours,
      values.requireManualApproval ? 1 : 0,
      values.riskTolerance,
      values.allowedBrowsers,
      values.preferredProxyTypes,
      values.regions,
      values.notificationChannels,
      values.metadata,
      now,
      policyId,
      teamId
    )
    .run();

  return (await getPolicy(env, teamId, policyId))!;
}

export async function deletePolicy(env: Env, teamId: string, policyId: string): Promise<void> {
  await env.DB.prepare(`DELETE FROM fingerprint_policies WHERE id = ? AND team_id = ?`).bind(policyId, teamId).run();
}

export interface PolicyEvaluationResult {
  profileId: string;
  policyId: string;
  status: 'compliant' | 'warning' | 'violation';
  versionsBehind?: number;
  latestVersion?: number;
  currentVersion?: number;
  browser?: {
    name: string;
    version: number;
    os: string;
    osVersion: string;
  } | null;
  details: string[];
}

export async function evaluateProfileAgainstPolicy(
  env: Env,
  teamId: string,
  profileId: string,
  policy?: FingerprintPolicyRecord | null
): Promise<PolicyEvaluationResult> {
  const dbProfile = await env.DB.prepare(`
    SELECT id, user_agent, fingerprint_policy_id
    FROM profiles
    WHERE id = ? AND team_id = ?
  `).bind(profileId, teamId)
    .first<{ id: string; user_agent: string; fingerprint_policy_id: string | null }>();

  if (!dbProfile) {
    throw new Error('Profile not found');
  }

  const activePolicy = policy ?? (dbProfile.fingerprint_policy_id
    ? await getPolicy(env, teamId, dbProfile.fingerprint_policy_id)
    : await ensureDefaultPolicy(env, teamId));

  const browserInfo = parseUserAgentVersion(dbProfile.user_agent);
  const versions = await getBrowserVersionMap(env);
  const agingInfo = isOutdated(dbProfile.user_agent, versions);

  if (!browserInfo || !agingInfo) {
    return {
      profileId: dbProfile.id,
      policyId: activePolicy.id,
      status: 'warning',
      details: ['Unable to parse user agent; manual review required.'],
      browser: browserInfo ?? null,
    };
  }

  const details: string[] = [];
  let status: PolicyEvaluationResult['status'] = 'compliant';
  const allowableLag = browserInfo.browser === 'chrome' && browserInfo.os === 'android'
    ? activePolicy.maxVersionsBehindMobile
    : activePolicy.maxVersionsBehind;

  if (agingInfo.versionsBehind > allowableLag) {
    status = 'violation';
    details.push(`Fingerprint is ${agingInfo.versionsBehind} versions behind latest ${browserInfo.browser}.`);
  } else if (agingInfo.versionsBehind === allowableLag) {
    status = 'warning';
    details.push('Fingerprint is approaching policy limits; schedule upgrade.');
  }

  if (activePolicy.allowedBrowsers.length && !activePolicy.allowedBrowsers.includes(browserInfo.browser)) {
    status = 'violation';
    details.push(`${browserInfo.browser} is not approved in policy.`);
  }

  if (!details.length) {
    details.push('Fingerprint complies with current policy.');
  }

  return {
    profileId: dbProfile.id,
    policyId: activePolicy.id,
    status,
    versionsBehind: agingInfo.versionsBehind,
    latestVersion: agingInfo.latestVersion,
    currentVersion: agingInfo.currentVersion,
    browser: browserInfo,
    details,
  };
}
