/**
 * Time Machine API Routes
 *
 * Endpoints for disaster recovery and version management
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { requirePermission } from '../middleware/auth';
import { errors } from '../middleware/error';
import {
  compareVersions,
  createVersion,
  deleteVersion,
  getStorageUsage,
  getVersion,
  listVersions,
  partialRestore,
  restoreVersion,
} from '../services/timemachine';
import { readSessionData, type SessionPayload } from '../lib/session-storage';

const app = new Hono<{ Bindings: Env }>();

function getProfileParam(c: Context<{ Bindings: Env }>) {
  return c.req.param('profileId') ?? c.req.param('id');
}

function hasSessionPayload(data: SessionPayload | null | undefined) {
  if (!data) return false;
  if (Array.isArray(data.cookies) && data.cookies.length > 0) return true;
  if (data.localStorage && Object.keys(data.localStorage).length > 0) return true;
  if (data.sessionStorage && Object.keys(data.sessionStorage).length > 0) return true;
  if (data.indexedDB && Object.keys(data.indexedDB).length > 0) return true;
  return false;
}

// Helpers to dual-register legacy and new routes
function registerListRoute(path: string) {
  app.get(path, requirePermission('profiles:read'), async (c) => {
    const auth = c.get('auth');
    const profileId = getProfileParam(c);

    try {
      const snapshots = await listVersions(c.env, profileId, auth.teamId);
      return c.json({ success: true, data: snapshots });
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not found') {
        throw errors.notFound('Profile');
      }
      throw error;
    }
  });
}

registerListRoute('/profile/:id/versions');
registerListRoute('/:profileId/snapshots');

function registerCreateRoute(path: string) {
  app.post(path, requirePermission('profiles:update'), async (c) => {
    const auth = c.get('auth');
    const profileId = getProfileParam(c);
    const body = await c.req.json().catch(() => ({}));
    const schema = z.object({ description: z.string().max(200).optional() });
    const { description } = schema.parse(body);

    const limit = 50; // manual backups per day for all users

    if (limit > 0) {
      const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
      const key = `backup:${auth.teamId}:${day}`;
      const current = parseInt((await c.env.KV.get(key)) || '0', 10);
      if (current >= limit) {
        return c.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: `Maximum ${limit} manual backups per day.`,
          },
          429
        );
      }
      await c.env.KV.put(key, String(current + 1), { expirationTtl: 24 * 60 * 60 });
    }

    const session = await readSessionData(c.env, auth.teamId, profileId);
    if (!session || !hasSessionPayload(session.data)) {
      throw errors.badRequest('No session data to backup');
    }

    try {
      const snapshot = await createVersion(c.env, profileId, auth.teamId, session.data, {
        type: 'manual',
        description,
        createdBy: auth.userId,
      });

      return c.json({ success: true, data: snapshot, message: 'Snapshot created successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not found') {
        throw errors.notFound('Profile');
      }
      throw error;
    }
  });
}

registerCreateRoute('/profile/:id/backup');
registerCreateRoute('/:profileId/snapshots');

function registerDetailRoute(path: string) {
  app.get(path, requirePermission('profiles:read'), async (c) => {
    const auth = c.get('auth');
    const profileId = getProfileParam(c);
    const snapshotId = c.req.param('versionId') ?? c.req.param('snapshotId');

    try {
      const snapshot = await getVersion(c.env, profileId, auth.teamId, snapshotId);
      if (!snapshot) {
        throw errors.notFound('Version');
      }

      return c.json({
        success: true,
        data: {
          id: snapshot.version.id,
          version: snapshot.version.version,
          timestamp: snapshot.version.timestamp,
          cookies: snapshot.data.cookies ?? [],
          localStorage: snapshot.data.localStorage ?? {},
          sessionStorage: snapshot.data.sessionStorage ?? {},
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not found') {
        throw errors.notFound('Profile');
      }
      throw error;
    }
  });
}

registerDetailRoute('/profile/:id/version/:versionId');
registerDetailRoute('/:profileId/snapshots/:snapshotId');

function registerRestoreRoute(path: string) {
  app.post(path, requirePermission('profiles:update'), async (c) => {
    const auth = c.get('auth');
    const profileId = getProfileParam(c);
    const snapshotId = c.req.param('versionId') ?? c.req.param('snapshotId');

    const body = await c.req.json().catch(() => ({}));
    const schema = z.object({ confirm: z.boolean().default(false) });
    const { confirm } = schema.parse(body);

    if (!confirm) {
      const snapshot = await getVersion(c.env, profileId, auth.teamId, snapshotId);
      if (!snapshot) {
        throw errors.notFound('Version');
      }
      return c.json({
        success: true,
        data: {
          preview: true,
          version: snapshot.version,
          warning: 'This will replace current session data. A backup of current state will be created automatically.',
          message: 'Send confirm: true to proceed with restore',
        },
      });
    }

    try {
      const restored = await restoreVersion(c.env, profileId, auth.teamId, snapshotId, auth.userId);
      return c.json({ success: true, data: restored, message: 'Profile restored successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Profile not found') {
          throw errors.notFound('Profile');
        }
        if (error.message === 'Version not found') {
          throw errors.notFound('Version');
        }
      }
      throw error;
    }
  });
}

registerRestoreRoute('/profile/:id/restore/:versionId');
registerRestoreRoute('/:profileId/restore/:snapshotId');

app.post('/:profileId/partial-restore', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const profileId = getProfileParam(c);
  const schema = z.object({
    snapshotId: z.string(),
    cookies: z.array(z.object({ domain: z.string(), name: z.string(), path: z.string().optional() })).optional(),
    localStorageKeys: z.array(z.string()).optional(),
    sessionStorageKeys: z.array(z.string()).optional(),
  });
  const payload = schema.parse(await c.req.json());

  if (!payload.cookies && !payload.localStorageKeys && !payload.sessionStorageKeys) {
    throw errors.badRequest('Select at least one data category to restore');
  }

  try {
    const result = await partialRestore(
      c.env,
      profileId,
      auth.teamId,
      payload.snapshotId,
      auth.userId,
      {
        cookies: payload.cookies,
        localStorageKeys: payload.localStorageKeys,
        sessionStorageKeys: payload.sessionStorageKeys,
      }
    );

    return c.json({ success: true, data: result, message: 'Partial restore scheduled' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Version not found') {
      throw errors.notFound('Version');
    }
    throw error;
  }
});

function registerCompareRoute(path: string, legacy: boolean) {
  app.get(path, requirePermission('profiles:read'), async (c) => {
    const auth = c.get('auth');
    const profileId = getProfileParam(c);
    const query = c.req.query();

    let from: string | undefined;
    let to: string | undefined;

    if (legacy) {
      const schema = z.object({ version1: z.string(), version2: z.string() });
      const parsed = schema.parse(query);
      from = parsed.version1;
      to = parsed.version2;
    } else {
      const schema = z.object({ from: z.string(), to: z.string() });
      const parsed = schema.parse(query);
      from = parsed.from;
      to = parsed.to;
    }

    try {
      const diff = await compareVersions(c.env, profileId, auth.teamId, from, to);
      return c.json({ success: true, data: diff });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Profile not found') {
          throw errors.notFound('Profile');
        }
        if (error.message.includes('not found')) {
          throw errors.notFound('Version');
        }
      }
      throw error;
    }
  });
}

registerCompareRoute('/profile/:id/compare', true);
registerCompareRoute('/:profileId/compare', false);

function registerDeleteRoute(path: string) {
  app.delete(path, requirePermission('profiles:delete'), async (c) => {
    const auth = c.get('auth');
    const profileId = getProfileParam(c);
    const snapshotId = c.req.param('versionId') ?? c.req.param('snapshotId');

    try {
      const deleted = await deleteVersion(c.env, profileId, auth.teamId, snapshotId, auth.userId);
      if (!deleted) {
        throw errors.notFound('Version');
      }
      return c.json({ success: true, message: 'Snapshot deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Profile not found') {
          throw errors.notFound('Profile');
        }
        if (error.message.includes('only remaining')) {
          throw errors.badRequest(error.message);
        }
      }
      throw error;
    }
  });
}

registerDeleteRoute('/profile/:id/version/:versionId');
registerDeleteRoute('/:profileId/snapshots/:snapshotId');

// GET /api/v1/timemachine/usage - Get storage usage
app.get('/usage', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');
  const usage = await getStorageUsage(c.env, auth.teamId);

  const limit: number | null = null; // Unlimited for free offering

  return c.json({
    success: true,
    data: {
      ...usage,
      limit,
      usagePercent: 0,
    },
  });
});

// GET /api/v1/timemachine/retention - Get retention policy
app.get('/retention', requirePermission('team:read'), async (c) => {
  const policy = { maxVersions: 365, maxDays: 365, description: 'Keep last 365 versions for up to 1 year (free)' };

  return c.json({
    success: true,
    data: {
      plan: 'free',
      policy,
      allPolicies: { free: policy },
    },
  });
});

export default app;
