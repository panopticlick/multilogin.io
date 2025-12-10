import type { Context, Next } from 'hono';
import type { Env, AuthContext } from '../types/env';

// JWT verification using Web Crypto API
async function verifyJWT(token: string, secret: string): Promise<{ sub: string; teamId: string; role: string } | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureData = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
      c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify('HMAC', key, signature, signatureData);
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

// Hash API key for comparison
async function hashAPIKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  const apiKeyHeader = c.req.header('X-API-Key');

  let auth: AuthContext | null = null;

  // Try JWT Bearer token first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token, c.env.JWT_SECRET);

    if (payload) {
      // Get user's team and role from database
      const member = await c.env.DB.prepare(`
        SELECT tm.team_id, tm.role
        FROM team_members tm
        JOIN teams t ON t.id = tm.team_id
        WHERE tm.user_id = ?
        LIMIT 1
      `)
        .bind(payload.sub)
        .first<{ team_id: string; role: string }>();

      if (member) {
        auth = {
          userId: payload.sub,
          teamId: member.team_id,
          role: member.role as AuthContext['role'],
          plan: 'free',
        };
      }
    }
  }

  // Try API Key
  if (!auth && apiKeyHeader) {
    const tokenHash = await hashAPIKey(apiKeyHeader);
    const tokenPrefix = apiKeyHeader.slice(0, 12);

    const apiKey = await c.env.DB.prepare(`
      SELECT ak.id, ak.user_id, ak.team_id, tm.role
      FROM api_keys ak
      JOIN team_members tm ON tm.user_id = ak.user_id AND tm.team_id = ak.team_id
      WHERE ak.token_prefix = ? AND ak.token_hash = ?
        AND (ak.expires_at IS NULL OR ak.expires_at > ?)
    `)
      .bind(tokenPrefix, tokenHash, Date.now())
      .first<{
        id: string;
        user_id: string;
        team_id: string;
        role: string;
      }>();

    if (apiKey) {
      // Update last used timestamp
      await c.env.DB.prepare(`
        UPDATE api_keys SET last_used = ? WHERE id = ?
      `)
        .bind(Date.now(), apiKey.id)
        .run();

        auth = {
          userId: apiKey.user_id,
          teamId: apiKey.team_id,
          role: apiKey.role as AuthContext['role'],
          plan: 'free',
          apiKeyId: apiKey.id,
        };
      }
  }

  if (!auth) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Valid authentication required',
      },
      401
    );
  }

  c.set('auth', auth);
  await next();
}

// Permission checking helper
export type Permission =
  | 'profiles:read'
  | 'profiles:create'
  | 'profiles:update'
  | 'profiles:delete'
  | 'profiles:launch'
  | 'proxies:read'
  | 'proxies:create'
  | 'proxies:update'
  | 'proxies:delete'
  | 'team:read'
  | 'team:manage'
  | 'team:update'
  | 'team:invite'
  | 'team:delete'
  | 'api-keys:create'
  | 'api_keys:read'
  | 'api_keys:create'
  | 'api_keys:delete';

const rolePermissions: Record<string, Permission[]> = {
  owner: ['*'] as unknown as Permission[],
  admin: [
    'profiles:read',
    'profiles:create',
    'profiles:update',
    'profiles:delete',
    'profiles:launch',
    'proxies:read',
    'proxies:create',
    'proxies:update',
    'proxies:delete',
    'team:read',
    'team:manage',
    'api-keys:create',
  ],
  member: [
    'profiles:read',
    'profiles:create',
    'profiles:update',
    'profiles:launch',
    'proxies:read',
    'team:read',
  ],
  viewer: ['profiles:read', 'proxies:read', 'team:read'],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return (permissions as string[]).includes('*') || permissions.includes(permission);
}

export function requirePermission(permission: Permission) {
  return async (c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> => {
    const auth = c.get('auth');

    if (!hasPermission(auth.role, permission)) {
      return c.json(
        {
          success: false,
          error: 'Forbidden',
          message: `You do not have permission to ${permission}`,
        },
        403
      );
    }

    await next();
  };
}
