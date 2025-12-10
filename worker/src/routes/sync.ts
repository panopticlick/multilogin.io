import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { errors } from '../middleware/error';
import { requirePermission } from '../middleware/auth';
import {
  deleteSessionData,
  headSessionData,
  readSessionData,
  writeSessionData,
} from '../lib/session-storage';

const app = new Hono<{ Bindings: Env }>();

// Size limits for session data (in bytes)
const MAX_SESSION_SIZE = 10 * 1024 * 1024; // 10MB total
const MAX_COOKIES_COUNT = 5000;
const MAX_STORAGE_KEYS = 2000;
const MAX_STORAGE_VALUE_SIZE = 5 * 1024 * 1024; // 5MB per value

// Cookie schema with size limits
const cookieSchema = z.object({
  name: z.string().max(1024),
  value: z.string().max(1024 * 1024), // 1MB per cookie value
  domain: z.string().max(255),
  path: z.string().max(512).optional(),
  expires: z.number().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
}).passthrough();

// Storage value with size check
const storageLimitedRecord = z.record(z.string().max(MAX_STORAGE_VALUE_SIZE));

// Schemas with size validation
const uploadSessionSchema = z.object({
  cookies: z.array(cookieSchema).max(MAX_COOKIES_COUNT).optional(),
  localStorage: storageLimitedRecord.optional().refine(
    (val) => !val || Object.keys(val).length <= MAX_STORAGE_KEYS,
    { message: `localStorage cannot have more than ${MAX_STORAGE_KEYS} keys` }
  ),
  sessionStorage: storageLimitedRecord.optional().refine(
    (val) => !val || Object.keys(val).length <= MAX_STORAGE_KEYS,
    { message: `sessionStorage cannot have more than ${MAX_STORAGE_KEYS} keys` }
  ),
  indexedDB: z.record(z.unknown()).optional().refine(
    (val) => !val || Object.keys(val).length <= 100,
    { message: 'indexedDB cannot have more than 100 databases' }
  ),
  extensions: z.array(z.string().max(255)).max(100).optional(),
});

// Helper to check total payload size
function checkPayloadSize(data: unknown): void {
  const size = JSON.stringify(data).length;
  if (size > MAX_SESSION_SIZE) {
    throw errors.badRequest(
      `Session data too large: ${Math.round(size / 1024 / 1024)}MB exceeds limit of ${MAX_SESSION_SIZE / 1024 / 1024}MB`
    );
  }
}

// POST /api/v1/sync/:profileId/upload - Upload session data
app.post('/:profileId/upload', requirePermission('profiles:launch'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('profileId');
  const body = await c.req.json();

  // Check payload size before parsing
  checkPayloadSize(body);

  const data = uploadSessionSchema.parse(body);

  // Verify profile exists and is locked by this client
  const clientId = c.req.header('X-Client-ID') || auth.userId;
  const profile = await c.env.DB.prepare(`
    SELECT id, locked_by FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string; locked_by: string | null }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  if (profile.locked_by !== clientId) {
    throw errors.forbidden('You must have the profile locked to upload session data');
  }

  // Upload to R2
  const sessionData = {
    ...data,
    uploadedAt: Date.now(),
    uploadedBy: auth.userId,
    version: Date.now(),
  };

  await writeSessionData(c.env, auth.teamId, profileId, sessionData);

  // Update profile last_active
  await c.env.DB.prepare(`
    UPDATE profiles SET last_active = ?, updated_at = ? WHERE id = ?
  `).bind(Date.now(), Date.now(), profileId).run();

  return c.json({
    success: true,
    data: {
      version: sessionData.version,
      size: JSON.stringify(sessionData).length,
    },
  });
});

// GET /api/v1/sync/:profileId/download - Download session data
app.get('/:profileId/download', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('profileId');

  // Verify profile exists
  const profile = await c.env.DB.prepare(`
    SELECT id FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  // Get from R2
  const session = await readSessionData(c.env, auth.teamId, profileId);

  if (!session) {
    return c.json({
      success: true,
      data: null,
      message: 'No session data found',
    });
  }

  return c.json({
    success: true,
    data: session.data,
  });
});

// DELETE /api/v1/sync/:profileId - Delete session data
app.delete('/:profileId', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('profileId');

  // Verify profile exists and is not locked
  const profile = await c.env.DB.prepare(`
    SELECT id, locked_by FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string; locked_by: string | null }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  if (profile.locked_by) {
    throw errors.conflict('Cannot delete session data while profile is in use');
  }

  // Delete from R2
  await deleteSessionData(c.env, auth.teamId, profileId);

  return c.json({
    success: true,
    message: 'Session data deleted',
  });
});

// GET /api/v1/sync/:profileId/status - Get sync status
app.get('/:profileId/status', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('profileId');

  // Verify profile exists
  const profile = await c.env.DB.prepare(`
    SELECT id FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  // Get R2 object metadata
  const head = await headSessionData(c.env, auth.teamId, profileId);

  if (!head) {
    return c.json({
      success: true,
      data: {
        hasData: false,
      },
    });
  }

  return c.json({
    success: true,
    data: {
      hasData: true,
      size: head.object.size,
      lastModified: head.object.uploaded?.toISOString(),
      metadata: head.object.customMetadata,
    },
  });
});

// POST /api/v1/sync/bulk-upload - Bulk upload multiple profiles' data
app.post('/bulk-upload', requirePermission('profiles:launch'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  // Check total payload size for bulk upload (50MB limit for batch)
  const bulkSize = JSON.stringify(body).length;
  if (bulkSize > 50 * 1024 * 1024) {
    throw errors.badRequest(
      `Bulk upload too large: ${Math.round(bulkSize / 1024 / 1024)}MB exceeds limit of 50MB`
    );
  }

  const { sessions } = z.object({
    sessions: z.array(z.object({
      profileId: z.string(),
      data: uploadSessionSchema,
    })).min(1).max(10),
  }).parse(body);

  const clientId = c.req.header('X-Client-ID') || auth.userId;
  const results: Array<{ profileId: string; success: boolean; error?: string }> = [];

  for (const session of sessions) {
    try {
      // Verify profile is locked by this client
      const profile = await c.env.DB.prepare(`
        SELECT id, locked_by FROM profiles WHERE id = ? AND team_id = ?
      `)
        .bind(session.profileId, auth.teamId)
        .first<{ id: string; locked_by: string | null }>();

      if (!profile) {
        results.push({ profileId: session.profileId, success: false, error: 'Profile not found' });
        continue;
      }

      if (profile.locked_by !== clientId) {
        results.push({ profileId: session.profileId, success: false, error: 'Profile not locked by you' });
        continue;
      }

      // Upload to R2
      const sessionData = {
        ...session.data,
        uploadedAt: Date.now(),
        uploadedBy: auth.userId,
        version: Date.now(),
      };

      await writeSessionData(c.env, auth.teamId, session.profileId, sessionData);

      results.push({ profileId: session.profileId, success: true });
    } catch {
      results.push({ profileId: session.profileId, success: false, error: 'Upload failed' });
    }
  }

  return c.json({
    success: true,
    data: {
      results,
      uploaded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
  });
});

export { app as syncRoutes };
