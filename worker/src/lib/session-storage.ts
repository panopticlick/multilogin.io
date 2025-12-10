import type { Env } from '../types/env';
import { parseJsonOrThrow } from './utils';

const SESSION_PREFIX = 'sessions';
const LEGACY_SEPARATOR = '/';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

function getCanonicalKey(teamId: string, profileId: string) {
  return `${SESSION_PREFIX}/${teamId}/${profileId}.json`;
}

function getLegacyKey(teamId: string, profileId: string) {
  return `${teamId}${LEGACY_SEPARATOR}${profileId}`;
}

// Derive encryption key from JWT_SECRET and teamId for per-team encryption
async function deriveEncryptionKey(secret: string, teamId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(`multilogin-session-${teamId}`),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt session data
async function encryptData(data: string, key: CryptoKey): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encoder.encode(data)
  );

  // Prepend IV to encrypted data
  const combined = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), IV_LENGTH);
  return combined.buffer;
}

// Decrypt session data
async function decryptData(data: ArrayBuffer, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(data);
  const iv = combined.slice(0, IV_LENGTH);
  const encrypted = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

export interface SessionPayload {
  cookies?: Array<Record<string, unknown>>;
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  indexedDB?: Record<string, unknown>;
  uploadedAt?: number;
  uploadedBy?: string;
  version?: number;
}

export interface SessionReadResult {
  key: string;
  data: SessionPayload;
  isLegacy: boolean;
}

export async function readSessionData(env: Env, teamId: string, profileId: string): Promise<SessionReadResult | null> {
  const canonicalKey = getCanonicalKey(teamId, profileId);
  const object = await env.R2.get(canonicalKey);

  if (object) {
    const isEncrypted = object.customMetadata?.encrypted === 'true';

    if (isEncrypted && env.JWT_SECRET) {
      // Decrypt the data
      const key = await deriveEncryptionKey(env.JWT_SECRET, teamId);
      const decrypted = await decryptData(await object.arrayBuffer(), key);
      return {
        key: canonicalKey,
        data: parseJsonOrThrow<SessionPayload>(decrypted, `session data for ${profileId}`),
        isLegacy: false,
      };
    }

    // Unencrypted data (legacy or encryption disabled)
    return {
      key: canonicalKey,
      data: await object.json<SessionPayload>(),
      isLegacy: false,
    };
  }

  // Try legacy key (always unencrypted)
  const legacyKey = getLegacyKey(teamId, profileId);
  const legacyObject = await env.R2.get(legacyKey);
  if (legacyObject) {
    return {
      key: legacyKey,
      data: await legacyObject.json<SessionPayload>(),
      isLegacy: true,
    };
  }

  return null;
}

export async function writeSessionData(
  env: Env,
  teamId: string,
  profileId: string,
  payload: SessionPayload
): Promise<void> {
  const canonicalKey = getCanonicalKey(teamId, profileId);
  const jsonData = JSON.stringify(payload);

  // Encrypt session data if JWT_SECRET is available
  if (env.JWT_SECRET) {
    const key = await deriveEncryptionKey(env.JWT_SECRET, teamId);
    const encryptedData = await encryptData(jsonData, key);

    await env.R2.put(canonicalKey, encryptedData, {
      customMetadata: {
        teamId,
        profileId,
        uploadedAt: String(payload.uploadedAt ?? Date.now()),
        uploadedBy: payload.uploadedBy ?? 'system',
        encrypted: 'true',
      },
    });
  } else {
    // Fallback to unencrypted storage (development only)
    await env.R2.put(canonicalKey, jsonData, {
      customMetadata: {
        teamId,
        profileId,
        uploadedAt: String(payload.uploadedAt ?? Date.now()),
        uploadedBy: payload.uploadedBy ?? 'system',
        encrypted: 'false',
      },
    });
  }

  // Clean up legacy key if different
  const legacyKey = getLegacyKey(teamId, profileId);
  if (legacyKey !== canonicalKey) {
    await env.R2.delete(legacyKey).catch(() => undefined);
  }
}

export async function deleteSessionData(env: Env, teamId: string, profileId: string): Promise<void> {
  const canonicalKey = getCanonicalKey(teamId, profileId);
  await env.R2.delete(canonicalKey).catch(() => undefined);
  const legacyKey = getLegacyKey(teamId, profileId);
  await env.R2.delete(legacyKey).catch(() => undefined);
}

export async function headSessionData(env: Env, teamId: string, profileId: string) {
  const canonicalKey = getCanonicalKey(teamId, profileId);
  const object = await env.R2.head(canonicalKey);
  if (object) {
    return { key: canonicalKey, object, isLegacy: false };
  }
  const legacyKey = getLegacyKey(teamId, profileId);
  const legacyObject = await env.R2.head(legacyKey);
  if (legacyObject) {
    return { key: legacyKey, object: legacyObject, isLegacy: true };
  }
  return null;
}

export { getCanonicalKey as getSessionStorageKey };
