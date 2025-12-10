import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { Profile } from '../types/models';
import { errors } from '../middleware/error';
import { requirePermission } from '../middleware/auth';
import { autoSnapshotFromSession } from '../services/timemachine';
import { readSessionData } from '../lib/session-storage';
import { safeJsonParse } from '../lib/utils';

const app = new Hono<{ Bindings: Env }>();

// Schemas
const createProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters'),
  templateId: z.string().regex(/^[a-z_]+$/, 'Invalid template ID'),
  groupId: z
    .string()
    .regex(/^grp_[a-zA-Z0-9]+$/)
    .optional()
    .nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  proxy: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

const updateProfileSchema = createProfileSchema.partial().extend({
  name: z.string().min(1).max(100).optional(),
});

const listQuerySchema = z.object({
  search: z.string().optional(),
  groupId: z.string().optional(),
  status: z.enum(['available', 'in_use', 'locked']).optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['name', 'lastActive', 'createdAt']).default('lastActive'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// Helper functions
function generateId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

// Import fingerprint templates
import { generateFingerprint } from '../services/fingerprint';

// GET /api/v1/profiles - List profiles
app.get('/', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const query = listQuerySchema.parse(c.req.query());

  const conditions: string[] = ['team_id = ?'];
  const params: (string | number)[] = [auth.teamId];

  if (query.search) {
    conditions.push('name LIKE ?');
    params.push(`%${query.search}%`);
  }

  if (query.groupId) {
    conditions.push('group_id = ?');
    params.push(query.groupId);
  }

  if (query.status) {
    if (query.status === 'available') {
      conditions.push('locked_by IS NULL');
    } else if (query.status === 'in_use' || query.status === 'locked') {
      conditions.push('locked_by IS NOT NULL');
    }
  }

  const sortColumn = {
    name: 'name',
    lastActive: 'last_active',
    createdAt: 'created_at',
  }[query.sortBy];

  const whereClause = conditions.join(' AND ');
  const offset = (query.page - 1) * query.limit;

  // Get total count
  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM profiles WHERE ${whereClause}
  `)
    .bind(...params)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get profiles
  const profiles = await c.env.DB.prepare(`
    SELECT * FROM profiles
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${query.sortOrder.toUpperCase()}
    LIMIT ? OFFSET ?
  `)
    .bind(...params, query.limit, offset)
    .all<Profile>();

  return c.json({
    success: true,
    data: {
      items: profiles.results.map((p) => ({
        ...p,
        tags: safeJsonParse<string[]>(p.tags, []),
        status: p.locked_by ? 'in_use' : 'available',
      })),
      total,
      page: query.page,
      pageSize: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

// GET /api/v1/profiles/:id - Get profile details
app.get('/:id', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  const profile = await c.env.DB.prepare(`
    SELECT * FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<Profile>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  return c.json({
    success: true,
    data: {
      ...profile,
      tags: safeJsonParse<string[]>(profile.tags, []),
      status: profile.locked_by ? 'in_use' : 'available',
    },
  });
});

// POST /api/v1/profiles - Create profile
app.post('/', requirePermission('profiles:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = createProfileSchema.parse(body);

  // Generate fingerprint from template
  const fingerprint = generateFingerprint(data.templateId);
  if (!fingerprint) {
    throw errors.badRequest('Invalid template ID');
  }

  const now = Date.now();
  const profileId = generateId('prf');

  await c.env.DB.prepare(`
    INSERT INTO profiles (
      id, team_id, name, template_id, group_id, tags,
      user_agent, platform, vendor, screen_width, screen_height,
      color_depth, device_memory, hardware_concurrency,
      webgl_vendor, webgl_renderer, timezone, language, proxy, notes,
      launch_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).bind(
    profileId,
    auth.teamId,
    data.name,
    data.templateId,
    data.groupId || null,
    JSON.stringify(data.tags || []),
    fingerprint.userAgent,
    fingerprint.platform,
    fingerprint.vendor,
    fingerprint.screenWidth,
    fingerprint.screenHeight,
    fingerprint.colorDepth,
    fingerprint.deviceMemory,
    fingerprint.hardwareConcurrency,
    fingerprint.webglVendor,
    fingerprint.webglRenderer,
    data.timezone || fingerprint.timezone,
    data.language || fingerprint.language,
    data.proxy || null,
    data.notes || null,
    now,
    now
  ).run();

  // Log audit
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'profile.create', 'profile', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    profileId,
    JSON.stringify({ name: data.name, templateId: data.templateId }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    data: {
      id: profileId,
      name: data.name,
      templateId: data.templateId,
      ...fingerprint,
      tags: data.tags || [],
      proxy: data.proxy || null,
      notes: data.notes || null,
      status: 'available',
      createdAt: now,
    },
  }, 201);
});

// PATCH /api/v1/profiles/:id - Update profile
app.patch('/:id', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');
  const body = await c.req.json();
  const data = updateProfileSchema.parse(body);

  // Check profile exists and belongs to team
  const existing = await c.env.DB.prepare(`
    SELECT id, locked_by FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string; locked_by: string | null }>();

  if (!existing) {
    throw errors.notFound('Profile');
  }

  // Can't update locked profile
  if (existing.locked_by) {
    throw errors.conflict('Cannot update profile while it is in use');
  }

  // Build update query
  const updates: string[] = ['updated_at = ?'];
  const params: (string | number | null)[] = [Date.now()];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.groupId !== undefined) {
    updates.push('group_id = ?');
    params.push(data.groupId);
  }
  if (data.tags !== undefined) {
    updates.push('tags = ?');
    params.push(JSON.stringify(data.tags));
  }
  if (data.timezone !== undefined) {
    updates.push('timezone = ?');
    params.push(data.timezone);
  }
  if (data.language !== undefined) {
    updates.push('language = ?');
    params.push(data.language);
  }
  if (data.proxy !== undefined) {
    updates.push('proxy = ?');
    params.push(data.proxy);
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    params.push(data.notes);
  }

  params.push(profileId, auth.teamId);

  await c.env.DB.prepare(`
    UPDATE profiles SET ${updates.join(', ')} WHERE id = ? AND team_id = ?
  `).bind(...params).run();

  return c.json({
    success: true,
    message: 'Profile updated successfully',
  });
});

// DELETE /api/v1/profiles/:id - Delete profile
app.delete('/:id', requirePermission('profiles:delete'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  const existing = await c.env.DB.prepare(`
    SELECT id, locked_by FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string; locked_by: string | null }>();

  if (!existing) {
    throw errors.notFound('Profile');
  }

  if (existing.locked_by) {
    throw errors.conflict('Cannot delete profile while it is in use');
  }

  // Delete profile
  await c.env.DB.prepare(`DELETE FROM profiles WHERE id = ? AND team_id = ?`)
    .bind(profileId, auth.teamId)
    .run();

  // Delete session data from R2
  try {
    await c.env.R2.delete(`${auth.teamId}/${profileId}`);
  } catch {
    // Ignore R2 errors
  }

  // Log audit
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'profile.delete', 'profile', ?, '{}', ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    profileId,
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    Date.now()
  ).run();

  return c.json({
    success: true,
    message: 'Profile deleted successfully',
  });
});

// POST /api/v1/profiles/:id/launch - Launch profile (acquire lock)
app.post('/:id/launch', requirePermission('profiles:launch'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');
  const clientId = c.req.header('X-Client-ID') || auth.userId;

  const profile = await c.env.DB.prepare(`
    SELECT * FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<Profile>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  const now = Date.now();
  const lockTimeout = 5 * 60 * 1000; // 5 minutes

  // Check if locked
  if (profile.locked_by && profile.locked_at) {
    const lockAge = now - profile.locked_at;

    // If locked by same client, refresh lock
    if (profile.locked_by === clientId) {
      await c.env.DB.prepare(`
        UPDATE profiles SET locked_at = ?, updated_at = ? WHERE id = ?
      `).bind(now, now, profileId).run();
    }
    // If lock is stale, override it
    else if (lockAge > lockTimeout) {
      await c.env.DB.prepare(`
        UPDATE profiles SET locked_by = ?, locked_at = ?, updated_at = ? WHERE id = ?
      `).bind(clientId, now, now, profileId).run();
    }
    // Lock is active
    else {
      throw errors.conflict('Profile is currently in use by another session');
    }
  } else {
    // Acquire lock
    await c.env.DB.prepare(`
      UPDATE profiles SET locked_by = ?, locked_at = ?, last_active = ?, launch_count = launch_count + 1, updated_at = ? WHERE id = ?
    `).bind(clientId, now, now, now, profileId).run();
  }

  // Get session data from storage
  let sessionData = null;
  try {
    const session = await readSessionData(c.env, auth.teamId, profileId);
    sessionData = session?.data ?? null;
  } catch {
    sessionData = null;
  }

  c.executionCtx.waitUntil(
    autoSnapshotFromSession(c.env, profileId, auth.teamId, 'launch', auth.userId).catch(() => undefined)
  );

  return c.json({
    success: true,
    data: {
      profile: {
        ...profile,
        tags: safeJsonParse<string[]>(profile.tags, []),
        lockedBy: clientId,
        lockedAt: now,
      },
      sessionData,
    },
  });
});

// POST /api/v1/profiles/:id/release - Release profile lock
app.post('/:id/release', requirePermission('profiles:launch'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');
  const clientId = c.req.header('X-Client-ID') || auth.userId;

  const profile = await c.env.DB.prepare(`
    SELECT locked_by FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ locked_by: string | null }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  // Only the lock holder can release
  if (profile.locked_by && profile.locked_by !== clientId) {
    throw errors.forbidden('You are not the lock holder');
  }

  await c.env.DB.prepare(`
    UPDATE profiles SET locked_by = NULL, locked_at = NULL, last_active = ?, updated_at = ? WHERE id = ?
  `).bind(Date.now(), Date.now(), profileId).run();

  c.executionCtx.waitUntil(
    autoSnapshotFromSession(c.env, profileId, auth.teamId, 'release', auth.userId).catch(() => undefined)
  );

  return c.json({
    success: true,
    message: 'Profile lock released',
  });
});

// POST /api/v1/profiles/bulk-delete - Bulk delete profiles
app.post('/bulk-delete', requirePermission('profiles:delete'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const { ids } = z.object({ ids: z.array(z.string()).min(1).max(50) }).parse(body);

  // Check all profiles exist and are not locked
  const placeholders = ids.map(() => '?').join(',');
  const profiles = await c.env.DB.prepare(`
    SELECT id, locked_by FROM profiles WHERE id IN (${placeholders}) AND team_id = ?
  `)
    .bind(...ids, auth.teamId)
    .all<{ id: string; locked_by: string | null }>();

  const lockedProfiles = profiles.results.filter((p) => p.locked_by);
  if (lockedProfiles.length > 0) {
    throw errors.conflict(`${lockedProfiles.length} profiles are currently in use`);
  }

  // Delete profiles
  await c.env.DB.prepare(`
    DELETE FROM profiles WHERE id IN (${placeholders}) AND team_id = ?
  `).bind(...ids, auth.teamId).run();

  return c.json({
    success: true,
    message: `${profiles.results.length} profiles deleted`,
  });
});

// POST /api/v1/profiles/:id/duplicate - Duplicate a profile
app.post('/:id/duplicate', requirePermission('profiles:create'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { newName } = z.object({ newName: z.string().min(1).max(100).optional() }).parse(body);

  // Get original profile
  const original = await c.env.DB.prepare(`
    SELECT * FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<Profile>();

  if (!original) {
    throw errors.notFound('Profile');
  }

  const now = Date.now();
  const newId = generateId('prf');
  const duplicateName = newName || `${original.name} (Copy)`;

  // Create duplicate with new fingerprint
  const newFingerprint = await generateFingerprint(original.template_id);
  if (!newFingerprint) {
    throw errors.badRequest('Failed to generate fingerprint for template: ' + original.template_id);
  }

  await c.env.DB.prepare(`
    INSERT INTO profiles (
      id, team_id, name, template_id, group_id, tags,
      user_agent, platform, vendor, screen_width, screen_height,
      color_depth, device_memory, hardware_concurrency,
      webgl_vendor, webgl_renderer, timezone, language,
      proxy, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    newId,
    auth.teamId,
    duplicateName,
    original.template_id,
    original.group_id,
    original.tags,
    newFingerprint.userAgent,
    newFingerprint.platform,
    newFingerprint.vendor,
    newFingerprint.screenWidth,
    newFingerprint.screenHeight,
    newFingerprint.colorDepth,
    newFingerprint.deviceMemory,
    newFingerprint.hardwareConcurrency,
    newFingerprint.webglVendor,
    newFingerprint.webglRenderer,
    original.timezone,
    original.language,
    original.proxy,
    original.notes,
    now,
    now
  ).run();

  // Log audit
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'profile.create', 'profile', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    newId,
    JSON.stringify({ source: 'duplicate', originalId: profileId, name: duplicateName }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    data: {
      id: newId,
      name: duplicateName,
      templateId: original.template_id,
      createdAt: now,
    },
  }, 201);
});

// GET /api/v1/profiles/export - Export profiles to JSON
app.get('/export', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const query = c.req.query();
  const ids = query.ids?.split(',').filter(Boolean);

  let whereClause = 'team_id = ?';
  const params: (string | number)[] = [auth.teamId];

  if (ids && ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    whereClause += ` AND id IN (${placeholders})`;
    params.push(...ids);
  }

  const profiles = await c.env.DB.prepare(`
    SELECT
      name, template_id, group_id, tags,
      timezone, language, proxy, notes
    FROM profiles WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT 100
  `)
    .bind(...params)
    .all<{
      name: string;
      template_id: string;
      group_id: string | null;
      tags: string;
      timezone: string;
      language: string;
      proxy: string | null;
      notes: string | null;
    }>();

  const exportData = profiles.results.map((p) => ({
    name: p.name,
    templateId: p.template_id,
    groupId: p.group_id,
    tags: safeJsonParse<string[]>(p.tags, []),
    timezone: p.timezone,
    language: p.language,
    proxy: p.proxy,
    notes: p.notes,
  }));

  return c.json({
    success: true,
    data: {
      version: '1.0',
      exportedAt: Date.now(),
      profiles: exportData,
    },
  });
});

// POST /api/v1/profiles/import - Import profiles from JSON
const importProfileSchema = z.object({
  profiles: z.array(z.object({
    name: z.string().min(1).max(100),
    templateId: z.string().regex(/^[a-z_]+$/),
    groupId: z.string().regex(/^grp_[a-zA-Z0-9]+$/).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    proxy: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  })).min(1).max(50),
});

app.post('/import', requirePermission('profiles:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = importProfileSchema.parse(body);

  const now = Date.now();
  const results: Array<{ index: number; success: boolean; id?: string; name?: string; error?: string }> = [];

  for (let i = 0; i < data.profiles.length; i++) {
    const profile = data.profiles[i];

    try {
      const newId = generateId('prf');
      const fingerprint = await generateFingerprint(profile.templateId);

      if (!fingerprint) {
        results.push({
          index: i,
          success: false,
          name: profile.name,
          error: 'Invalid template: ' + profile.templateId,
        });
        continue;
      }

      await c.env.DB.prepare(`
        INSERT INTO profiles (
          id, team_id, name, template_id, group_id, tags,
          user_agent, platform, vendor, screen_width, screen_height,
          color_depth, device_memory, hardware_concurrency,
          webgl_vendor, webgl_renderer, timezone, language,
          proxy, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newId,
        auth.teamId,
        profile.name,
        profile.templateId,
        profile.groupId || null,
        JSON.stringify(profile.tags || []),
        fingerprint.userAgent,
        fingerprint.platform,
        fingerprint.vendor,
        fingerprint.screenWidth,
        fingerprint.screenHeight,
        fingerprint.colorDepth,
        fingerprint.deviceMemory,
        fingerprint.hardwareConcurrency,
        fingerprint.webglVendor,
        fingerprint.webglRenderer,
        profile.timezone || 'America/New_York',
        profile.language || 'en-US',
        profile.proxy || null,
        profile.notes || null,
        now,
        now
      ).run();

      results.push({ index: i, success: true, id: newId, name: profile.name });
    } catch (error) {
      results.push({
        index: i,
        success: false,
        name: profile.name,
        error: error instanceof Error ? error.message : 'Failed to import',
      });
    }
  }

  const importedCount = results.filter(r => r.success).length;

  // Log audit for bulk import
  if (importedCount > 0) {
    await c.env.DB.prepare(`
      INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, 'profile.create', 'profile', ?, ?, ?, ?, ?)
    `).bind(
      generateId('log'),
      auth.teamId,
      auth.userId,
      results.find(r => r.success)?.id || '',
      JSON.stringify({ source: 'import', count: importedCount }),
      c.req.header('CF-Connecting-IP') || '',
      c.req.header('User-Agent') || '',
      now
    ).run();
  }

  return c.json({
    success: true,
    data: {
      results,
      imported: importedCount,
      failed: results.filter(r => !r.success).length,
    },
  }, 201);
});

// POST /api/v1/profiles/:id/regenerate-fingerprint - Regenerate fingerprint for a profile
app.post('/:id/regenerate-fingerprint', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  const profile = await c.env.DB.prepare(`
    SELECT id, template_id, locked_by FROM profiles WHERE id = ? AND team_id = ?
  `)
    .bind(profileId, auth.teamId)
    .first<{ id: string; template_id: string; locked_by: string | null }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  if (profile.locked_by) {
    throw errors.conflict('Cannot regenerate fingerprint while profile is in use');
  }

  // Generate new fingerprint
  const newFingerprint = await generateFingerprint(profile.template_id);
  if (!newFingerprint) {
    throw errors.badRequest('Failed to generate fingerprint for template: ' + profile.template_id);
  }
  const now = Date.now();

  await c.env.DB.prepare(`
    UPDATE profiles SET
      user_agent = ?,
      platform = ?,
      vendor = ?,
      screen_width = ?,
      screen_height = ?,
      color_depth = ?,
      device_memory = ?,
      hardware_concurrency = ?,
      webgl_vendor = ?,
      webgl_renderer = ?,
      updated_at = ?
    WHERE id = ? AND team_id = ?
  `).bind(
    newFingerprint.userAgent,
    newFingerprint.platform,
    newFingerprint.vendor,
    newFingerprint.screenWidth,
    newFingerprint.screenHeight,
    newFingerprint.colorDepth,
    newFingerprint.deviceMemory,
    newFingerprint.hardwareConcurrency,
    newFingerprint.webglVendor,
    newFingerprint.webglRenderer,
    now,
    profileId,
    auth.teamId
  ).run();

  // Log audit
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'profile.update', 'profile', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    profileId,
    JSON.stringify({ action: 'regenerate_fingerprint' }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    message: 'Fingerprint regenerated successfully',
    data: {
      userAgent: newFingerprint.userAgent,
      platform: newFingerprint.platform,
    },
  });
});

export { app as profileRoutes };
