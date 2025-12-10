import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { User, APIKey } from '../types/models';
import { errors } from '../middleware/error';
import { requirePermission } from '../middleware/auth';
import { safeJsonParse } from '../lib/utils';

const app = new Hono<{ Bindings: Env }>();

// Helper functions
function generateId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

function generateAPIKey(): string {
  const random = crypto.getRandomValues(new Uint8Array(32));
  const key = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `mlx_${key}`;
}

async function hashAPIKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `pbkdf2:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [, saltHex, expectedHash] = hash.split(':');
  if (!saltHex || !expectedHash) return false;

  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex === expectedHash;
}

// Schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const createAPIKeySchema = z.object({
  name: z.string().min(1).max(50),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.number().optional().nullable(),
});

// GET /api/v1/users/me - Get current user
app.get('/me', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  const user = await c.env.DB.prepare(`
    SELECT id, email, name, image, created_at, updated_at
    FROM users WHERE id = ?
  `)
    .bind(auth.userId)
    .first<Omit<User, 'password_hash'>>();

  if (!user) {
    throw errors.notFound('User');
  }

  // Get team info
  const team = await c.env.DB.prepare(`
    SELECT t.id, t.name, t.plan, tm.role
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = ?
    LIMIT 1
  `)
    .bind(auth.userId)
    .first<{ id: string; name: string; plan: string; role: string }>();

  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      team: team
        ? {
            id: team.id,
            name: team.name,
            plan: team.plan,
            role: team.role,
          }
        : null,
      createdAt: user.created_at,
    },
  });
});

// PATCH /api/v1/users/me - Update current user
app.patch('/me', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = updateProfileSchema.parse(body);

  const updates: string[] = ['updated_at = ?'];
  const params: (string | number | null)[] = [Date.now()];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.image !== undefined) {
    updates.push('image = ?');
    params.push(data.image);
  }

  params.push(auth.userId);

  await c.env.DB.prepare(`
    UPDATE users SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();

  return c.json({
    success: true,
    message: 'Profile updated successfully',
  });
});

// POST /api/v1/users/me/change-password - Change password
app.post('/me/change-password', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = changePasswordSchema.parse(body);

  // Get current password hash
  const user = await c.env.DB.prepare(`
    SELECT password_hash FROM users WHERE id = ?
  `)
    .bind(auth.userId)
    .first<{ password_hash: string }>();

  if (!user) {
    throw errors.notFound('User');
  }

  // Verify current password
  const valid = await verifyPassword(data.currentPassword, user.password_hash);
  if (!valid) {
    throw errors.badRequest('Current password is incorrect');
  }

  // Hash new password
  const newHash = await hashPassword(data.newPassword);

  await c.env.DB.prepare(`
    UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?
  `).bind(newHash, Date.now(), auth.userId).run();

  return c.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// GET /api/v1/users/api-keys - List API keys
app.get('/api-keys', requirePermission('api_keys:read'), async (c) => {
  const auth = c.get('auth');

  const keys = await c.env.DB.prepare(`
    SELECT id, name, key_prefix, permissions, last_used_at, expires_at, created_at
    FROM api_keys
    WHERE team_id = ? AND (expires_at IS NULL OR expires_at > ?)
    ORDER BY created_at DESC
  `)
    .bind(auth.teamId, Date.now())
    .all<Omit<APIKey, 'key_hash'>>();

  return c.json({
    success: true,
    data: keys.results.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.key_prefix,
      permissions: safeJsonParse<string[]>(k.permissions, []),
      lastUsedAt: k.last_used_at,
      expiresAt: k.expires_at,
      createdAt: k.created_at,
    })),
  });
});

// POST /api/v1/users/api-keys - Create API key
app.post('/api-keys', requirePermission('api_keys:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = createAPIKeySchema.parse(body);

  const apiKey = generateAPIKey();
  const keyHash = await hashAPIKey(apiKey);
  const keyId = generateId('key');
  const now = Date.now();

  await c.env.DB.prepare(`
    INSERT INTO api_keys (id, team_id, name, key_hash, key_prefix, permissions, created_by, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    keyId,
    auth.teamId,
    data.name,
    keyHash,
    apiKey.substring(0, 12), // Store prefix for identification
    JSON.stringify(data.permissions || []),
    auth.userId,
    data.expiresAt || null,
    now
  ).run();

  // Log audit
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'api_key.create', 'api_key', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    keyId,
    JSON.stringify({ name: data.name }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    data: {
      id: keyId,
      name: data.name,
      key: apiKey, // Only returned once!
      keyPrefix: apiKey.substring(0, 12),
      permissions: data.permissions || [],
      expiresAt: data.expiresAt,
      createdAt: now,
    },
    message: 'API key created. Save this key - it will not be shown again.',
  }, 201);
});

// DELETE /api/v1/users/api-keys/:keyId - Revoke API key
app.delete('/api-keys/:keyId', requirePermission('api_keys:delete'), async (c) => {
  const auth = c.get('auth');
  const keyId = c.req.param('keyId');

  const key = await c.env.DB.prepare(`
    SELECT id FROM api_keys WHERE id = ? AND team_id = ?
  `)
    .bind(keyId, auth.teamId)
    .first();

  if (!key) {
    throw errors.notFound('API key');
  }

  await c.env.DB.prepare(`
    DELETE FROM api_keys WHERE id = ? AND team_id = ?
  `).bind(keyId, auth.teamId).run();

  // Log audit
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'api_key.revoke', 'api_key', ?, '{}', ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    keyId,
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    Date.now()
  ).run();

  return c.json({
    success: true,
    message: 'API key revoked',
  });
});

// GET /api/v1/users/activity - Get user activity log (admin/owner only)
app.get('/activity', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');

  // Only admin and owner can view full audit logs
  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw errors.forbidden('Only team admins can view the full activity log');
  }

  const query = c.req.query();
  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '50', 10), 100);
  const offset = (page - 1) * limit;

  // Optional filters
  const userId = query.userId;
  const action = query.action;

  let whereClause = 'al.team_id = ?';
  const params: (string | number)[] = [auth.teamId];

  if (userId) {
    whereClause += ' AND al.user_id = ?';
    params.push(userId);
  }

  if (action) {
    whereClause += ' AND al.action LIKE ?';
    params.push(`${action}%`);
  }

  const logs = await c.env.DB.prepare(`
    SELECT
      al.id,
      al.user_id,
      al.action,
      al.target_type,
      al.target_id,
      al.details,
      al.ip_address,
      al.created_at,
      u.name as user_name,
      u.email as user_email,
      u.image as user_image
    FROM audit_logs al
    JOIN users u ON u.id = al.user_id
    WHERE ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `)
    .bind(...params, limit, offset)
    .all();

  const total = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM audit_logs al WHERE ${whereClause}
  `)
    .bind(...params)
    .first<{ count: number }>();

  return c.json({
    success: true,
    data: {
      items: logs.results.map((log) => ({
        ...log,
        details: typeof log.details === 'string' ? safeJsonParse(log.details, {}) : log.details,
      })),
      total: total?.count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((total?.count || 0) / limit),
    },
  });
});

// DELETE /api/v1/users/me - Delete account
app.delete('/me', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  // Check if user is team owner
  if (auth.role === 'owner') {
    // Check if they're the only team member
    const memberCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM team_members WHERE team_id = ?
    `)
      .bind(auth.teamId)
      .first<{ count: number }>();

    if ((memberCount?.count || 0) > 1) {
      throw errors.badRequest(
        'Cannot delete account while you are owner of a team with other members. Transfer ownership first.'
      );
    }

    // Delete team and all associated data
    await c.env.DB.batch([
      c.env.DB.prepare(`DELETE FROM profiles WHERE team_id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM profile_groups WHERE team_id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM proxies WHERE team_id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM api_keys WHERE team_id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM audit_logs WHERE team_id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM teams WHERE id = ?`).bind(auth.teamId),
      c.env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(auth.userId),
    ]);
  } else {
    // Just remove from team and delete user
    await c.env.DB.batch([
      c.env.DB.prepare(`DELETE FROM team_members WHERE user_id = ?`).bind(auth.userId),
      c.env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(auth.userId),
    ]);
  }

  return c.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

export { app as userRoutes };
