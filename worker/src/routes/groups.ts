import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { ProfileGroup } from '../types/models';
import { errors } from '../middleware/error';
import { requirePermission } from '../middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// Helper function
function generateId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

// Schemas
const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional()
    .default('#6366f1'),
  description: z.string().max(200).optional().nullable(),
});

const updateGroupSchema = createGroupSchema.partial();

// GET /api/v1/groups - List all groups
app.get('/', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  // Get groups with profile counts
  const groups = await c.env.DB.prepare(`
    SELECT
      g.*,
      COUNT(p.id) as profile_count
    FROM profile_groups g
    LEFT JOIN profiles p ON p.group_id = g.id
    WHERE g.team_id = ?
    GROUP BY g.id
    ORDER BY g.name ASC
  `)
    .bind(auth.teamId)
    .all<ProfileGroup & { profile_count: number }>();

  return c.json({
    success: true,
    data: groups.results.map((g) => ({
      id: g.id,
      name: g.name,
      color: g.color,
      description: g.description,
      profileCount: g.profile_count,
      createdAt: g.created_at,
    })),
  });
});

// GET /api/v1/groups/:id - Get group details
app.get('/:id', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const groupId = c.req.param('id');

  const group = await c.env.DB.prepare(`
    SELECT
      g.*,
      COUNT(p.id) as profile_count
    FROM profile_groups g
    LEFT JOIN profiles p ON p.group_id = g.id
    WHERE g.id = ? AND g.team_id = ?
    GROUP BY g.id
  `)
    .bind(groupId, auth.teamId)
    .first<ProfileGroup & { profile_count: number }>();

  if (!group) {
    throw errors.notFound('Group');
  }

  return c.json({
    success: true,
    data: {
      id: group.id,
      name: group.name,
      color: group.color,
      description: group.description,
      profileCount: group.profile_count,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    },
  });
});

// POST /api/v1/groups - Create group
app.post('/', requirePermission('profiles:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = createGroupSchema.parse(body);

  // Check for duplicate name
  const existing = await c.env.DB.prepare(`
    SELECT id FROM profile_groups WHERE name = ? AND team_id = ?
  `)
    .bind(data.name, auth.teamId)
    .first();

  if (existing) {
    throw errors.conflict('A group with this name already exists');
  }

  // Check group limit (max 50 groups)
  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM profile_groups WHERE team_id = ?
  `)
    .bind(auth.teamId)
    .first<{ count: number }>();

  if ((countResult?.count || 0) >= 50) {
    throw errors.badRequest('Maximum group limit reached (50 groups)');
  }

  const now = Date.now();
  const groupId = generateId('grp');

  await c.env.DB.prepare(`
    INSERT INTO profile_groups (id, team_id, name, color, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    groupId,
    auth.teamId,
    data.name,
    data.color,
    data.description || null,
    now,
    now
  ).run();

  return c.json({
    success: true,
    data: {
      id: groupId,
      name: data.name,
      color: data.color,
      description: data.description,
      profileCount: 0,
      createdAt: now,
    },
  }, 201);
});

// PATCH /api/v1/groups/:id - Update group
app.patch('/:id', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const groupId = c.req.param('id');
  const body = await c.req.json();
  const data = updateGroupSchema.parse(body);

  // Check group exists
  const existing = await c.env.DB.prepare(`
    SELECT id FROM profile_groups WHERE id = ? AND team_id = ?
  `)
    .bind(groupId, auth.teamId)
    .first();

  if (!existing) {
    throw errors.notFound('Group');
  }

  // Check for duplicate name if name is being updated
  if (data.name) {
    const duplicate = await c.env.DB.prepare(`
      SELECT id FROM profile_groups WHERE name = ? AND team_id = ? AND id != ?
    `)
      .bind(data.name, auth.teamId, groupId)
      .first();

    if (duplicate) {
      throw errors.conflict('A group with this name already exists');
    }
  }

  // Build update query
  const updates: string[] = ['updated_at = ?'];
  const params: (string | number | null)[] = [Date.now()];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.color !== undefined) {
    updates.push('color = ?');
    params.push(data.color);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }

  params.push(groupId, auth.teamId);

  await c.env.DB.prepare(`
    UPDATE profile_groups SET ${updates.join(', ')} WHERE id = ? AND team_id = ?
  `).bind(...params).run();

  return c.json({
    success: true,
    message: 'Group updated successfully',
  });
});

// DELETE /api/v1/groups/:id - Delete group
app.delete('/:id', requirePermission('profiles:delete'), async (c) => {
  const auth = c.get('auth');
  const groupId = c.req.param('id');

  // Check group exists
  const existing = await c.env.DB.prepare(`
    SELECT id FROM profile_groups WHERE id = ? AND team_id = ?
  `)
    .bind(groupId, auth.teamId)
    .first();

  if (!existing) {
    throw errors.notFound('Group');
  }

  // Remove group_id from profiles (don't delete profiles)
  await c.env.DB.prepare(`
    UPDATE profiles SET group_id = NULL, updated_at = ? WHERE group_id = ? AND team_id = ?
  `).bind(Date.now(), groupId, auth.teamId).run();

  // Delete group
  await c.env.DB.prepare(`
    DELETE FROM profile_groups WHERE id = ? AND team_id = ?
  `).bind(groupId, auth.teamId).run();

  return c.json({
    success: true,
    message: 'Group deleted successfully',
  });
});

// POST /api/v1/groups/:id/profiles - Add profiles to group
app.post('/:id/profiles', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const groupId = c.req.param('id');
  const body = await c.req.json();
  const { profileIds } = z.object({
    profileIds: z.array(z.string()).min(1).max(50),
  }).parse(body);

  // Check group exists
  const group = await c.env.DB.prepare(`
    SELECT id FROM profile_groups WHERE id = ? AND team_id = ?
  `)
    .bind(groupId, auth.teamId)
    .first();

  if (!group) {
    throw errors.notFound('Group');
  }

  // Update profiles
  const placeholders = profileIds.map(() => '?').join(',');
  await c.env.DB.prepare(`
    UPDATE profiles
    SET group_id = ?, updated_at = ?
    WHERE id IN (${placeholders}) AND team_id = ?
  `).bind(groupId, Date.now(), ...profileIds, auth.teamId).run();

  return c.json({
    success: true,
    message: `${profileIds.length} profiles added to group`,
  });
});

// DELETE /api/v1/groups/:id/profiles - Remove profiles from group
app.delete('/:id/profiles', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const groupId = c.req.param('id');
  const body = await c.req.json();
  const { profileIds } = z.object({
    profileIds: z.array(z.string()).min(1).max(50),
  }).parse(body);

  // Update profiles to remove from group
  const placeholders = profileIds.map(() => '?').join(',');
  await c.env.DB.prepare(`
    UPDATE profiles
    SET group_id = NULL, updated_at = ?
    WHERE id IN (${placeholders}) AND team_id = ? AND group_id = ?
  `).bind(Date.now(), ...profileIds, auth.teamId, groupId).run();

  return c.json({
    success: true,
    message: `Profiles removed from group`,
  });
});

export { app as groupRoutes };
