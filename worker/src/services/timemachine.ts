import type { Env } from '../types/env';
import {
  readSessionData,
  writeSessionData,
  type SessionPayload,
} from '../lib/session-storage';

export type SnapshotType =
  | 'manual'
  | 'auto:launch'
  | 'auto:release'
  | 'pre-restore'
  | 'pre-upgrade'
  | 'system';

export interface SnapshotSummary {
  id: string;
  profileId: string;
  teamId: string;
  version: number;
  timestamp: number;
  size: number;
  type: SnapshotType;
  description?: string | null;
  cookieCount: number;
  localStorageCount: number;
  sessionStorageCount: number;
  domains: string[];
  isAutoSave: boolean;
  author: {
    id: string | null;
    name: string;
  };
}

export interface SnapshotDiff {
  added: {
    cookies: Array<Record<string, unknown>>;
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  };
  removed: {
    cookies: Array<Record<string, unknown>>;
    localStorage: string[];
    sessionStorage: string[];
  };
  modified: {
    cookies: Array<{ old: Record<string, unknown>; new: Record<string, unknown> }>;
    localStorage: Array<{ key: string; old: string; new: string }>;
    sessionStorage: Array<{ key: string; old: string; new: string }>;
  };
}

export interface PartialRestoreRequest {
  cookies?: Array<{ domain: string; name: string; path?: string }>;
  localStorageKeys?: string[];
  sessionStorageKeys?: string[];
}

export interface PartialRestoreResult {
  restoredCookies: number;
  localStorageKeys: number;
  sessionStorageKeys: number;
  snapshot: SnapshotSummary;
}

interface ProfileVersionRow {
  id: string;
  profile_id: string;
  team_id: string;
  version_number: number;
  type: string;
  description: string | null;
  size: number;
  checksum: string | null;
  has_cookies: number;
  has_local_storage: number;
  has_session_storage: number;
  cookie_count: number;
  local_storage_count: number | null;
  session_storage_count: number | null;
  created_at: number;
  created_by: string | null;
  r2_key: string | null;
  domains: string | null;
  author_name?: string | null;
}

const SNAPSHOT_PREFIX = 'time-machine';
const LEGACY_SNAPSHOT_PREFIX = 'profiles';
export const AUTO_SNAPSHOT_INTERVAL_MS = 15 * 60 * 1000;

const RETENTION_POLICY: { maxVersions: number; maxDays: number } = {
  maxVersions: 365,
  maxDays: 365,
};

function getSnapshotKey(teamId: string, profileId: string, snapshotId: string) {
  return `${SNAPSHOT_PREFIX}/teams/${teamId}/profiles/${profileId}/${snapshotId}.json.gz`;
}

function getLegacySnapshotKey(profileId: string, snapshotId: string) {
  return `${LEGACY_SNAPSHOT_PREFIX}/${profileId}/versions/${snapshotId}.json.gz`;
}

function cookieKey(cookie: Record<string, unknown>) {
  const domain = (cookie.domain as string) || 'domain';
  const name = (cookie.name as string) || 'name';
  const path = (cookie.path as string) || '/';
  return `${domain}:${name}:${path}`;
}

function parseDomains(domains: string | null): string[] {
  if (!domains) return [];
  try {
    const parsed = JSON.parse(domains);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toSummary(row: ProfileVersionRow): SnapshotSummary {
  return {
    id: row.id,
    profileId: row.profile_id,
    teamId: row.team_id,
    version: row.version_number,
    timestamp: row.created_at,
    size: row.size,
    type: (row.type as SnapshotType) || 'manual',
    description: row.description,
    cookieCount: row.cookie_count,
    localStorageCount: row.local_storage_count ?? 0,
    sessionStorageCount: row.session_storage_count ?? 0,
    domains: parseDomains(row.domains),
    isAutoSave: row.type?.startsWith('auto') ?? false,
    author: {
      id: row.created_by,
      name: row.author_name ?? (row.created_by ? 'Member' : 'System'),
    },
  };
}

async function ensureProfile(env: Env, profileId: string, teamId: string) {
  const profile = await env.DB.prepare(`
    SELECT id FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, teamId)
    .first<{ id: string }>();

  if (!profile) {
    throw new Error('Profile not found');
  }
}

async function getPlanPolicy() {
  return RETENTION_POLICY;
}

async function nextVersionNumber(env: Env, profileId: string, teamId: string) {
  const row = await env.DB.prepare(`
    SELECT COALESCE(MAX(version_number), 0) as max_version
    FROM profile_versions
    WHERE profile_id = ? AND team_id = ?
  `)
    .bind(profileId, teamId)
    .first<{ max_version: number | null }>();

  return (row?.max_version ?? 0) + 1;
}

async function computeChecksum(buffer: ArrayBuffer) {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function encodeSnapshot(data: SessionPayload) {
  const json = JSON.stringify(data);
  const encoded = new TextEncoder().encode(json);
  const compressedStream = new Response(encoded).body!.pipeThrough(new CompressionStream('gzip'));
  const compressed = await new Response(compressedStream).arrayBuffer();
  const checksum = await computeChecksum(compressed);
  return { buffer: compressed, size: compressed.byteLength, checksum };
}

async function decodeSnapshot(object: R2ObjectBody) {
  const compressed = await object.arrayBuffer();
  const decompressedStream = new Response(compressed).body!.pipeThrough(new DecompressionStream('gzip'));
  const text = await new Response(decompressedStream).text();
  return JSON.parse(text) as SessionPayload;
}

export function diffSessions(fromData?: SessionPayload, toData?: SessionPayload): SnapshotDiff {
  const fromCookies = new Map(
    (fromData?.cookies ?? []).map((cookie): [string, Record<string, unknown>] => [cookieKey(cookie), cookie])
  );
  const toCookies = new Map(
    (toData?.cookies ?? []).map((cookie): [string, Record<string, unknown>] => [cookieKey(cookie), cookie])
  );

  const cookiesAdded: Array<Record<string, unknown>> = [];
  const cookiesRemoved: Array<Record<string, unknown>> = [];
  const cookiesModified: Array<{ old: Record<string, unknown>; new: Record<string, unknown> }> = [];

  for (const [key, cookie] of toCookies) {
    if (!fromCookies.has(key)) {
      cookiesAdded.push(cookie);
    } else {
      const existing = fromCookies.get(key)!;
      if (JSON.stringify(existing) !== JSON.stringify(cookie)) {
        cookiesModified.push({ old: existing, new: cookie });
      }
    }
  }

  for (const [key, cookie] of fromCookies) {
    if (!toCookies.has(key)) {
      cookiesRemoved.push(cookie);
    }
  }

  const diffRecords = (
    base: Record<string, string> | undefined,
    target: Record<string, string> | undefined
  ) => {
    const baseEntries = base ?? {};
    const targetEntries = target ?? {};
    const added: Record<string, string> = {};
    const removed: string[] = [];
    const modified: Array<{ key: string; old: string; new: string }> = [];

    for (const [key, value] of Object.entries(targetEntries)) {
      if (!(key in baseEntries)) {
        added[key] = value;
      } else if (baseEntries[key] !== value) {
        modified.push({ key, old: baseEntries[key], new: value });
      }
    }

    for (const key of Object.keys(baseEntries)) {
      if (!(key in targetEntries)) {
        removed.push(key);
      }
    }

    return { added, removed, modified };
  };

  const localStorageDiff = diffRecords(fromData?.localStorage, toData?.localStorage);
  const sessionStorageDiff = diffRecords(fromData?.sessionStorage, toData?.sessionStorage);

  return {
    added: {
      cookies: cookiesAdded,
      localStorage: localStorageDiff.added,
      sessionStorage: sessionStorageDiff.added,
    },
    removed: {
      cookies: cookiesRemoved,
      localStorage: localStorageDiff.removed,
      sessionStorage: sessionStorageDiff.removed,
    },
    modified: {
      cookies: cookiesModified,
      localStorage: localStorageDiff.modified,
      sessionStorage: sessionStorageDiff.modified,
    },
  };
}

export function planRetention(
  versions: Array<{ id: string; created_at: number }>,
  policy: { maxVersions: number; maxDays: number },
  now: number = Date.now()
) {
  const cutoff = now - policy.maxDays * 24 * 60 * 60 * 1000;
  const sorted = [...versions].sort((a, b) => b.created_at - a.created_at);
  const toDelete: string[] = [];

  sorted.forEach((version, index) => {
    if (index >= policy.maxVersions || version.created_at < cutoff) {
      toDelete.push(version.id);
    }
  });

  return toDelete;
}

function hasSessionContent(data?: SessionPayload) {
  if (!data) return false;
  if (Array.isArray(data.cookies) && data.cookies.length > 0) return true;
  if (data.localStorage && Object.keys(data.localStorage).length > 0) return true;
  if (data.sessionStorage && Object.keys(data.sessionStorage).length > 0) return true;
  if (data.indexedDB && Object.keys(data.indexedDB).length > 0) return true;
  return false;
}

async function enforceRetention(env: Env, teamId: string, profileId: string, policy: { maxVersions: number; maxDays: number }) {
  const versions = await env.DB.prepare(`
    SELECT id, created_at, r2_key FROM profile_versions
    WHERE profile_id = ? AND team_id = ?
    ORDER BY created_at DESC
  `)
    .bind(profileId, teamId)
    .all<{ id: string; created_at: number; r2_key: string | null }>();

  const idsToDelete = planRetention(versions.results || [], policy);

  for (const id of idsToDelete) {
    const target = versions.results?.find((row) => row.id === id);
    const key = target?.r2_key || getLegacySnapshotKey(profileId, id);
    await env.R2.delete(key).catch(() => undefined);
    await env.DB.prepare(`DELETE FROM profile_versions WHERE id = ? AND team_id = ?`).bind(id, teamId).run();
  }
}

export async function createVersion(
  env: Env,
  profileId: string,
  teamId: string,
  data: SessionPayload,
  options: { type?: SnapshotType; description?: string; createdBy?: string } = {}
): Promise<SnapshotSummary> {
  await ensureProfile(env, profileId, teamId);
  const policy = await getPlanPolicy();
  const versionNumber = await nextVersionNumber(env, profileId, teamId);
  const snapshotId = crypto.randomUUID();
  const timestamp = Date.now();

  const cookieCount = data.cookies?.length ?? 0;
  const localStorageCount = data.localStorage ? Object.keys(data.localStorage).length : 0;
  const sessionStorageCount = data.sessionStorage ? Object.keys(data.sessionStorage).length : 0;
  const domains = [...new Set((data.cookies ?? []).map((cookie) => ((cookie.domain as string) || '').replace(/^\./, '') || 'unknown'))];

  const { buffer, size, checksum } = await encodeSnapshot({
    ...data,
    createdAt: timestamp,
  });

  const r2Key = getSnapshotKey(teamId, profileId, snapshotId);
  await env.R2.put(r2Key, buffer, {
    customMetadata: {
      profileId,
      teamId,
      version: String(versionNumber),
      createdAt: String(timestamp),
      type: options.type ?? 'manual',
    },
  });

  await env.DB.prepare(`
    INSERT INTO profile_versions (
      id, profile_id, team_id, version_number, type, description, size, checksum,
      has_cookies, has_local_storage, has_session_storage, cookie_count,
      local_storage_count, session_storage_count, created_at, created_by, r2_key, domains
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      snapshotId,
      profileId,
      teamId,
      versionNumber,
      options.type ?? 'manual',
      options.description ?? null,
      size,
      checksum,
      cookieCount > 0 ? 1 : 0,
      localStorageCount > 0 ? 1 : 0,
      sessionStorageCount > 0 ? 1 : 0,
      cookieCount,
      localStorageCount,
      sessionStorageCount,
      timestamp,
      options.createdBy ?? null,
      r2Key,
      JSON.stringify(domains)
    )
    .run();

  await enforceRetention(env, teamId, profileId, policy);

  const row = await env.DB.prepare(`
    SELECT pv.*, u.name as author_name
    FROM profile_versions pv
    LEFT JOIN users u ON pv.created_by = u.id
    WHERE pv.id = ?
  `)
    .bind(snapshotId)
    .first<ProfileVersionRow>();

  if (!row) {
    throw new Error('Failed to create snapshot');
  }

  return toSummary(row);
}

export async function listVersions(env: Env, profileId: string, teamId: string): Promise<SnapshotSummary[]> {
  await ensureProfile(env, profileId, teamId);
  const rows = await env.DB.prepare(`
    SELECT pv.*, u.name as author_name
    FROM profile_versions pv
    LEFT JOIN users u ON pv.created_by = u.id
    WHERE pv.profile_id = ? AND pv.team_id = ?
    ORDER BY pv.version_number ASC
  `)
    .bind(profileId, teamId)
    .all<ProfileVersionRow>();

  return (rows.results || []).map(toSummary);
}

export async function getVersion(
  env: Env,
  profileId: string,
  teamId: string,
  versionId: string
): Promise<{ version: SnapshotSummary; data: SessionPayload } | null> {
  const row = await env.DB.prepare(`
    SELECT pv.*, u.name as author_name
    FROM profile_versions pv
    LEFT JOIN users u ON pv.created_by = u.id
    WHERE pv.id = ? AND pv.profile_id = ? AND pv.team_id = ?
  `)
    .bind(versionId, profileId, teamId)
    .first<ProfileVersionRow>();

  if (!row) {
    return null;
  }

  const key = row.r2_key || getLegacySnapshotKey(profileId, versionId);
  const object = await env.R2.get(key);
  if (!object) {
    throw new Error('Snapshot data not found');
  }

  const data = await decodeSnapshot(object);
  return { version: toSummary(row), data };
}

export async function restoreVersion(
  env: Env,
  profileId: string,
  teamId: string,
  versionId: string,
  userId: string
) {
  const snapshot = await getVersion(env, profileId, teamId, versionId);
  if (!snapshot) {
    throw new Error('Version not found');
  }

  const current = await readSessionData(env, teamId, profileId);
  if (current?.data && hasSessionContent(current.data)) {
    await createVersion(env, profileId, teamId, current.data, {
      type: 'pre-restore',
      description: `Backup before restore to ${versionId}`,
      createdBy: userId,
    });
  }

  const payload: SessionPayload = {
    ...snapshot.data,
    uploadedAt: Date.now(),
    uploadedBy: userId,
    version: Date.now(),
  };
  await writeSessionData(env, teamId, profileId, payload);

  await env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'backup_restored', 'profile', ?, ?, '', 'TimeMachine', ?)
  `)
    .bind(
      `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
      teamId,
      userId,
      profileId,
      JSON.stringify({ versionId, versionTimestamp: snapshot.version.timestamp, cookiesRestored: snapshot.data.cookies?.length ?? 0 }),
      Date.now()
    )
    .run();

  return {
    success: true,
    restoredFrom: snapshot.version,
    restoredAt: Date.now(),
    changes: {
      cookiesRestored: snapshot.data.cookies?.length ?? 0,
      domainsAffected: snapshot.version.domains,
    },
  };
}

export async function partialRestore(
  env: Env,
  profileId: string,
  teamId: string,
  versionId: string,
  userId: string,
  payload: PartialRestoreRequest
): Promise<PartialRestoreResult> {
  const snapshot = await getVersion(env, profileId, teamId, versionId);
  if (!snapshot) {
    throw new Error('Version not found');
  }

  const current = await readSessionData(env, teamId, profileId);
  const currentData: SessionPayload = current?.data ?? {};
  const cookiesToUpdate = new Set(
    (payload.cookies ?? []).map((cookie) => cookieKey({
      domain: cookie.domain,
      name: cookie.name,
      path: cookie.path ?? '/',
    }))
  );
  const localKeys = new Set(payload.localStorageKeys ?? []);
  const sessionKeys = new Set(payload.sessionStorageKeys ?? []);

  if (cookiesToUpdate.size === 0 && localKeys.size === 0 && sessionKeys.size === 0) {
    throw new Error('No partial restore instructions provided');
  }

  const targetCookies = new Map(
    (snapshot.data.cookies ?? []).map((cookie): [string, Record<string, unknown>] => [cookieKey(cookie), cookie])
  );
  const currentCookies = new Map(
    (currentData.cookies ?? []).map((cookie): [string, Record<string, unknown>] => [cookieKey(cookie), cookie])
  );

  let restoredCookies = 0;

  if (cookiesToUpdate.size > 0) {
    for (const key of cookiesToUpdate) {
      if (targetCookies.has(key)) {
        currentCookies.set(key, targetCookies.get(key)!);
      } else {
        currentCookies.delete(key);
      }
      restoredCookies++;
    }
  }

  const nextLocalStorage = { ...(currentData.localStorage ?? {}) };
  let restoredLocal = 0;
  for (const key of localKeys) {
    if (snapshot.data.localStorage && key in snapshot.data.localStorage) {
      nextLocalStorage[key] = snapshot.data.localStorage[key];
    } else {
      delete nextLocalStorage[key];
    }
    restoredLocal++;
  }

  const nextSessionStorage = { ...(currentData.sessionStorage ?? {}) };
  let restoredSession = 0;
  for (const key of sessionKeys) {
    if (snapshot.data.sessionStorage && key in snapshot.data.sessionStorage) {
      nextSessionStorage[key] = snapshot.data.sessionStorage[key];
    } else {
      delete nextSessionStorage[key];
    }
    restoredSession++;
  }

  const payloadToWrite: SessionPayload = {
    ...currentData,
    cookies: Array.from(currentCookies.values()),
    localStorage: Object.keys(nextLocalStorage).length ? nextLocalStorage : undefined,
    sessionStorage: Object.keys(nextSessionStorage).length ? nextSessionStorage : undefined,
    uploadedAt: Date.now(),
    uploadedBy: userId,
    version: Date.now(),
  };

  await writeSessionData(env, teamId, profileId, payloadToWrite);

  await env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'backup_partial_restore', 'profile', ?, ?, '', 'TimeMachine', ?)
  `)
    .bind(
      `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
      teamId,
      userId,
      profileId,
      JSON.stringify({ versionId, restoredCookies, restoredLocal, restoredSession }),
      Date.now()
    )
    .run();

  return {
    restoredCookies,
    localStorageKeys: restoredLocal,
    sessionStorageKeys: restoredSession,
    snapshot: snapshot.version,
  };
}

export async function compareVersions(
  env: Env,
  profileId: string,
  teamId: string,
  fromVersionId: string,
  toVersionId: string
): Promise<SnapshotDiff> {
  const [fromVersion, toVersion] = await Promise.all([
    getVersion(env, profileId, teamId, fromVersionId),
    getVersion(env, profileId, teamId, toVersionId),
  ]);

  if (!fromVersion || !toVersion) {
    throw new Error('One or both versions not found');
  }

  return diffSessions(fromVersion.data, toVersion.data);
}

export async function deleteVersion(
  env: Env,
  profileId: string,
  teamId: string,
  versionId: string,
  userId: string
): Promise<boolean> {
  const countRow = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM profile_versions WHERE profile_id = ? AND team_id = ?
  `)
    .bind(profileId, teamId)
    .first<{ count: number }>();

  if ((countRow?.count ?? 0) <= 1) {
    throw new Error('Cannot delete the only remaining version');
  }

  const row = await env.DB.prepare(`
    SELECT r2_key FROM profile_versions WHERE id = ? AND profile_id = ? AND team_id = ?
  `)
    .bind(versionId, profileId, teamId)
    .first<{ r2_key: string | null }>();

  if (!row) {
    return false;
  }

  const key = row.r2_key || getLegacySnapshotKey(profileId, versionId);
  await env.R2.delete(key).catch(() => undefined);
  await env.DB.prepare(`DELETE FROM profile_versions WHERE id = ? AND team_id = ?`).bind(versionId, teamId).run();

  await env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'backup_deleted', 'profile', ?, ?, '', 'TimeMachine', ?)
  `)
    .bind(
      `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
      teamId,
      userId,
      profileId,
      JSON.stringify({ versionId }),
      Date.now()
    )
    .run();

  return true;
}

export async function getStorageUsage(env: Env, teamId: string) {
  const rows = await env.DB.prepare(`
    SELECT pv.profile_id, SUM(pv.size) as size, COUNT(*) as versions, p.name as profile_name
    FROM profile_versions pv
    LEFT JOIN profiles p ON pv.profile_id = p.id
    WHERE pv.team_id = ?
    GROUP BY pv.profile_id
  `)
    .bind(teamId)
    .all<{ profile_id: string; size: number; versions: number; profile_name: string | null }>();

  const sizeByProfile = (rows.results || []).map((row) => ({
    profileId: row.profile_id,
    profileName: row.profile_name || 'Unknown profile',
    size: row.size,
    versions: row.versions,
  }));

  const totalVersions = sizeByProfile.reduce((sum, entry) => sum + entry.versions, 0);
  const totalSize = sizeByProfile.reduce((sum, entry) => sum + entry.size, 0);

  return {
    totalProfiles: sizeByProfile.length,
    totalVersions,
    totalSize,
    sizeByProfile: sizeByProfile.sort((a, b) => b.size - a.size),
  };
}

export function shouldAutoSnapshot(lastCreatedAt: number | null, now: number = Date.now(), intervalMs: number = AUTO_SNAPSHOT_INTERVAL_MS) {
  if (!lastCreatedAt) return true;
  return now - lastCreatedAt >= intervalMs;
}

export async function autoSnapshotFromSession(
  env: Env,
  profileId: string,
  teamId: string,
  trigger: 'launch' | 'release',
  userId: string
): Promise<SnapshotSummary | null> {
  const latest = await env.DB.prepare(`
    SELECT created_at FROM profile_versions
    WHERE profile_id = ? AND team_id = ? AND type = ?
    ORDER BY created_at DESC LIMIT 1
  `)
    .bind(profileId, teamId, `auto:${trigger}`)
    .first<{ created_at: number }>();

  if (!shouldAutoSnapshot(latest?.created_at ?? null)) {
    return null;
  }

  const session = await readSessionData(env, teamId, profileId);
  if (!session || !hasSessionContent(session.data)) {
    return null;
  }

  return createVersion(env, profileId, teamId, session.data, {
    type: `auto:${trigger}`,
    description: trigger === 'launch' ? 'Auto snapshot before launch' : 'Auto snapshot after release',
    createdBy: userId,
  });
}
