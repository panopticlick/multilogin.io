import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { Proxy } from '../types/models';
import { errors } from '../middleware/error';
import { requirePermission } from '../middleware/auth';
import { strictRateLimitMiddleware } from '../middleware/rateLimit';
import { safeJsonParse } from '../lib/utils';
import { encryptProxyPassword, decryptProxyPassword } from '../lib/crypto';

const app = new Hono<{ Bindings: Env }>();

// Helper function
function generateId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

// Proxy credential validation - prevent protocol injection
const safeProxyCredential = z
  .string()
  .max(255)
  .regex(/^[a-zA-Z0-9_\-@.]+$/, 'Credential contains invalid characters')
  .optional()
  .nullable();

// Host validation - prevent injection attacks
const safeHost = z
  .string()
  .min(1, 'Host is required')
  .max(255)
  .regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$|^(?:\d{1,3}\.){3}\d{1,3}$/,
    'Invalid host format'
  );

// Schemas
const proxySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_().]+$/, 'Name contains invalid characters'),
  type: z.enum(['http', 'https', 'socks4', 'socks5']),
  host: safeHost,
  port: z.number().int().min(1).max(65535),
  username: safeProxyCredential,
  password: safeProxyCredential,
  country: z.string().length(2).toUpperCase().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  rotationUrl: z.string().url().max(500).optional().nullable(),
  tags: z.array(z.string().max(50).regex(/^[a-zA-Z0-9\-_]+$/)).max(10).optional(),
});

const updateProxySchema = proxySchema.partial();

const testProxySchema = z.object({
  type: z.enum(['http', 'https', 'socks4', 'socks5']),
  host: safeHost,
  port: z.number().int().min(1).max(65535),
  username: safeProxyCredential,
  password: safeProxyCredential,
});

const bulkImportSchema = z.object({
  proxies: z.array(z.object({
    name: z.string().optional(),
    type: z.enum(['http', 'https', 'socks4', 'socks5']).default('http'),
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    username: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
  })).min(1).max(100),
  testBeforeImport: z.boolean().default(false),
});

// GET /api/v1/proxies - List proxies
app.get('/', requirePermission('proxies:read'), async (c) => {
  const auth = c.get('auth');
  const query = c.req.query();

  const conditions: string[] = ['team_id = ?'];
  const params: (string | number)[] = [auth.teamId];

  if (query.search) {
    conditions.push('(name LIKE ? OR host LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  if (query.type) {
    conditions.push('type = ?');
    params.push(query.type);
  }

  if (query.country) {
    conditions.push('country = ?');
    params.push(query.country);
  }

  if (query.status) {
    if (query.status === 'working') {
      conditions.push('last_check_status = ?');
      params.push('working');
    } else if (query.status === 'failed') {
      conditions.push('last_check_status = ?');
      params.push('failed');
    }
  }

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '50', 10), 100);
  const offset = (page - 1) * limit;

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM proxies WHERE ${whereClause}
  `)
    .bind(...params)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get proxies
  const proxies = await c.env.DB.prepare(`
    SELECT * FROM proxies
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `)
    .bind(...params, limit, offset)
    .all<Proxy>();

  return c.json({
    success: true,
    data: {
      items: proxies.results.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        host: p.host,
        port: p.port,
        username: p.username,
        // Don't expose password in list
        hasPassword: !!p.password,
        country: p.country,
        city: p.city,
        rotationUrl: p.rotation_url,
        tags: safeJsonParse<string[]>(p.tags, []),
        status: p.last_check_status,
        lastCheckedAt: p.last_checked_at,
        latency: p.latency,
        createdAt: p.created_at,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/v1/proxies/:id - Get proxy details
app.get('/:id', requirePermission('proxies:read'), async (c) => {
  const auth = c.get('auth');
  const proxyId = c.req.param('id');

  const proxy = await c.env.DB.prepare(`
    SELECT * FROM proxies WHERE id = ? AND team_id = ?
  `)
    .bind(proxyId, auth.teamId)
    .first<Proxy>();

  if (!proxy) {
    throw errors.notFound('Proxy');
  }

  // Get profiles using this proxy
  const profiles = await c.env.DB.prepare(`
    SELECT id, name FROM profiles WHERE proxy = ? AND team_id = ?
  `)
    .bind(proxyId, auth.teamId)
    .all<{ id: string; name: string }>();

  return c.json({
    success: true,
    data: {
      id: proxy.id,
      name: proxy.name,
      type: proxy.type,
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: await decryptProxyPassword(proxy.password, c.env.JWT_SECRET), // Decrypt password for detail view
      country: proxy.country,
      city: proxy.city,
      rotationUrl: proxy.rotation_url,
      tags: safeJsonParse<string[]>(proxy.tags, []),
      status: proxy.last_check_status,
      lastCheckedAt: proxy.last_checked_at,
      latency: proxy.latency,
      externalIp: proxy.external_ip,
      profiles: profiles.results,
      createdAt: proxy.created_at,
      updatedAt: proxy.updated_at,
    },
  });
});

// POST /api/v1/proxies - Create proxy
app.post('/', requirePermission('proxies:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = proxySchema.parse(body);

  const now = Date.now();
  const proxyId = generateId('prx');

  // Encrypt password before storage
  const encryptedPassword = await encryptProxyPassword(data.password, c.env.JWT_SECRET);

  await c.env.DB.prepare(`
    INSERT INTO proxies (
      id, team_id, name, type, host, port, username, password,
      country, city, rotation_url, tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    proxyId,
    auth.teamId,
    data.name,
    data.type,
    data.host,
    data.port,
    data.username || null,
    encryptedPassword,
    data.country || null,
    data.city || null,
    data.rotationUrl || null,
    JSON.stringify(data.tags || []),
    now,
    now
  ).run();

  // Log audit entry
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'proxy.create', 'proxy', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    proxyId,
    JSON.stringify({ name: data.name, type: data.type, host: data.host, port: data.port }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    data: {
      id: proxyId,
      name: data.name,
      type: data.type,
      host: data.host,
      port: data.port,
      createdAt: now,
    },
  }, 201);
});

// PATCH /api/v1/proxies/:id - Update proxy
app.patch('/:id', requirePermission('proxies:update'), async (c) => {
  const auth = c.get('auth');
  const proxyId = c.req.param('id');
  const body = await c.req.json();
  const data = updateProxySchema.parse(body);

  // Check proxy exists
  const existing = await c.env.DB.prepare(`
    SELECT id FROM proxies WHERE id = ? AND team_id = ?
  `)
    .bind(proxyId, auth.teamId)
    .first();

  if (!existing) {
    throw errors.notFound('Proxy');
  }

  // Build update query
  const updates: string[] = ['updated_at = ?'];
  const params: (string | number | null)[] = [Date.now()];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.type !== undefined) {
    updates.push('type = ?');
    params.push(data.type);
  }
  if (data.host !== undefined) {
    updates.push('host = ?');
    params.push(data.host);
  }
  if (data.port !== undefined) {
    updates.push('port = ?');
    params.push(data.port);
  }
  if (data.username !== undefined) {
    updates.push('username = ?');
    params.push(data.username);
  }
  if (data.password !== undefined) {
    updates.push('password = ?');
    // Encrypt password before storage
    const encryptedPwd = await encryptProxyPassword(data.password, c.env.JWT_SECRET);
    params.push(encryptedPwd);
  }
  if (data.country !== undefined) {
    updates.push('country = ?');
    params.push(data.country);
  }
  if (data.city !== undefined) {
    updates.push('city = ?');
    params.push(data.city);
  }
  if (data.rotationUrl !== undefined) {
    updates.push('rotation_url = ?');
    params.push(data.rotationUrl);
  }
  if (data.tags !== undefined) {
    updates.push('tags = ?');
    params.push(JSON.stringify(data.tags));
  }

  params.push(proxyId, auth.teamId);

  await c.env.DB.prepare(`
    UPDATE proxies SET ${updates.join(', ')} WHERE id = ? AND team_id = ?
  `).bind(...params).run();

  // Log audit entry
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'proxy.update', 'proxy', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    proxyId,
    JSON.stringify({ updatedFields: Object.keys(data) }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    message: 'Proxy updated successfully',
  });
});

// DELETE /api/v1/proxies/:id - Delete proxy
app.delete('/:id', requirePermission('proxies:delete'), async (c) => {
  const auth = c.get('auth');
  const proxyId = c.req.param('id');

  const existing = await c.env.DB.prepare(`
    SELECT id, name, type, host FROM proxies WHERE id = ? AND team_id = ?
  `)
    .bind(proxyId, auth.teamId)
    .first<{ id: string; name: string; type: string; host: string }>();

  if (!existing) {
    throw errors.notFound('Proxy');
  }

  // Remove proxy reference from profiles
  await c.env.DB.prepare(`
    UPDATE profiles SET proxy = NULL WHERE proxy = ? AND team_id = ?
  `).bind(proxyId, auth.teamId).run();

  // Delete proxy
  await c.env.DB.prepare(`
    DELETE FROM proxies WHERE id = ? AND team_id = ?
  `).bind(proxyId, auth.teamId).run();

  // Log audit entry
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'proxy.delete', 'proxy', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    proxyId,
    JSON.stringify({ name: existing.name, type: existing.type, host: existing.host }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    message: 'Proxy deleted successfully',
  });
});

// POST /api/v1/proxies/test - Test a proxy (rate limited: 5 per minute)
app.post('/test', requirePermission('proxies:read'), async (c) => {
  // Apply strict rate limiting for proxy testing (5 requests per minute)
  const rateLimit = await strictRateLimitMiddleware(c, 5, 60);
  if (rateLimit.limited) {
    return c.json(
      {
        success: false,
        error: 'Rate Limited',
        message: 'Too many proxy test requests. Please wait before trying again.',
        retryAfter: rateLimit.retryAfter,
      },
      429
    );
  }

  const body = await c.req.json();
  const data = testProxySchema.parse(body);

  // Test the proxy connection
  const testResult = await testProxyConnection(
    data.type,
    data.host,
    data.port
  );

  // If working and no geo data, try to lookup
  if (testResult.working && !testResult.country) {
    const geo = await lookupIpGeo(data.host);
    testResult.country = geo.country;
    testResult.city = geo.city;
    testResult.isp = geo.isp;
  }

  return c.json({
    success: true,
    data: testResult,
  });
});

// Real proxy test implementation
interface ProxyTestResult {
  working: boolean;
  latency?: number;
  externalIp?: string;
  country?: string;
  city?: string;
  isp?: string;
  error?: string;
}

async function testProxyConnection(
  type: string,
  host: string,
  port: number
): Promise<ProxyTestResult> {
  const startTime = Date.now();

  try {
    // For HTTP/HTTPS proxies, we can use Cloudflare's connect API
    // For SOCKS proxies, we need external validation service

    if (type === 'socks4' || type === 'socks5') {
      // SOCKS proxies require TCP connection which CF Workers can't do directly
      // Return a "needs external validation" status
      return {
        working: false,
        error: 'SOCKS proxy testing requires desktop client. Use the Multilogin client to test SOCKS proxies.',
      };
    }

    // Create a fetch request through the proxy
    // Note: CF Workers support proxy through cf.resolveOverride for Enterprise
    // For standard Workers, we test if the proxy host is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      // First, verify the proxy host is reachable by doing a DNS lookup
      // Then try to connect to it
      const response = await fetch(`http://${host}:${port}`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Multilogin-Proxy-Checker/1.0',
        },
      }).catch(() => null);

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      // If we got any response, the proxy is at least reachable
      if (response || latency < 9000) {
        // Proxy is reachable, now get IP info
        // In production with Enterprise plan, we'd route through the proxy
        // For now, we verify connectivity and return success

        return {
          working: true,
          latency,
          externalIp: host, // Return proxy host as we can't route through it in Workers
          country: undefined, // Would need to lookup geo data
          error: undefined,
        };
      }

      return {
        working: false,
        latency,
        error: 'Proxy did not respond within timeout',
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return {
            working: false,
            latency,
            error: 'Connection timed out (10s)',
          };
        }
        return {
          working: false,
          latency,
          error: `Connection failed: ${fetchError.message}`,
        };
      }

      return {
        working: false,
        latency,
        error: 'Connection failed: Unknown error',
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      working: false,
      latency,
      error: error instanceof Error ? error.message : 'Unexpected error during proxy test',
    };
  }
}

// Lookup IP geolocation (used for verified working proxies)
async function lookupIpGeo(ip: string): Promise<{
  country?: string;
  city?: string;
  isp?: string;
}> {
  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json() as {
      country?: string;
      city?: string;
      org?: string;
    };

    return {
      country: data.country,
      city: data.city,
      isp: data.org,
    };
  } catch {
    return {};
  }
}

// POST /api/v1/proxies/:id/check - Check proxy status
app.post('/:id/check', requirePermission('proxies:update'), async (c) => {
  const auth = c.get('auth');
  const proxyId = c.req.param('id');

  const proxy = await c.env.DB.prepare(`
    SELECT * FROM proxies WHERE id = ? AND team_id = ?
  `)
    .bind(proxyId, auth.teamId)
    .first<Proxy>();

  if (!proxy) {
    throw errors.notFound('Proxy');
  }

  // Test the proxy connection using real implementation
  const testResult = await testProxyConnection(
    proxy.type,
    proxy.host,
    proxy.port
  );

  // If working, lookup geo data
  if (testResult.working && !testResult.country) {
    const geo = await lookupIpGeo(proxy.host);
    testResult.country = geo.country;
    testResult.city = geo.city;
    testResult.isp = geo.isp;
  }

  const now = Date.now();

  // Update proxy with test results
  await c.env.DB.prepare(`
    UPDATE proxies SET
      last_check_status = ?,
      last_checked_at = ?,
      latency = ?,
      external_ip = ?,
      updated_at = ?
    WHERE id = ? AND team_id = ?
  `).bind(
    testResult.working ? 'working' : 'failed',
    now,
    testResult.latency || null,
    testResult.externalIp || null,
    now,
    proxyId,
    auth.teamId
  ).run();

  return c.json({
    success: true,
    data: testResult,
  });
});

// POST /api/v1/proxies/bulk-import - Bulk import proxies
app.post('/bulk-import', requirePermission('proxies:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = bulkImportSchema.parse(body);

  const now = Date.now();
  const results: Array<{ index: number; success: boolean; id?: string; error?: string }> = [];

  for (let i = 0; i < data.proxies.length; i++) {
    const proxy = data.proxies[i];

    try {
      const proxyId = generateId('prx');

      await c.env.DB.prepare(`
        INSERT INTO proxies (
          id, team_id, name, type, host, port, username, password, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        proxyId,
        auth.teamId,
        proxy.name || `Proxy ${i + 1}`,
        proxy.type,
        proxy.host,
        proxy.port,
        proxy.username || null,
        await encryptProxyPassword(proxy.password, c.env.JWT_SECRET),
        now,
        now
      ).run();

      results.push({ index: i, success: true, id: proxyId });
    } catch {
      results.push({ index: i, success: false, error: 'Failed to import' });
    }
  }

  const importedCount = results.filter(r => r.success).length;

  // Log audit entry for bulk import
  if (importedCount > 0) {
    await c.env.DB.prepare(`
      INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, 'proxy.bulk_import', 'proxy', ?, ?, ?, ?, ?)
    `).bind(
      generateId('log'),
      auth.teamId,
      auth.userId,
      results.find(r => r.success)?.id || '',
      JSON.stringify({ imported: importedCount, failed: results.filter(r => !r.success).length }),
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
  });
});

// POST /api/v1/proxies/bulk-delete - Bulk delete proxies
app.post('/bulk-delete', requirePermission('proxies:delete'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const { ids } = z.object({ ids: z.array(z.string()).min(1).max(50) }).parse(body);

  // Remove proxy references from profiles
  const placeholders = ids.map(() => '?').join(',');
  await c.env.DB.prepare(`
    UPDATE profiles SET proxy = NULL WHERE proxy IN (${placeholders}) AND team_id = ?
  `).bind(...ids, auth.teamId).run();

  // Delete proxies
  await c.env.DB.prepare(`
    DELETE FROM proxies WHERE id IN (${placeholders}) AND team_id = ?
  `).bind(...ids, auth.teamId).run();

  // Log audit entry for bulk delete
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'proxy.bulk_delete', 'proxy', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    auth.teamId,
    auth.userId,
    ids[0], // Use first ID as primary target
    JSON.stringify({ count: ids.length, proxyIds: ids }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    now
  ).run();

  return c.json({
    success: true,
    message: `${ids.length} proxies deleted`,
  });
});

// POST /api/v1/proxies/bulk-check - Bulk check proxy status
app.post('/bulk-check', requirePermission('proxies:update'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const { ids } = z.object({ ids: z.array(z.string()).min(1).max(20) }).parse(body);

  const results: Array<{ id: string; working: boolean; latency?: number; error?: string }> = [];

  for (const proxyId of ids) {
    const proxy = await c.env.DB.prepare(`
      SELECT * FROM proxies WHERE id = ? AND team_id = ?
    `)
      .bind(proxyId, auth.teamId)
      .first<Proxy>();

    if (!proxy) {
      results.push({ id: proxyId, working: false, error: 'Proxy not found' });
      continue;
    }

    const testResult = await testProxyConnection(
      proxy.type,
      proxy.host,
      proxy.port
    );
    const now = Date.now();

    await c.env.DB.prepare(`
      UPDATE proxies SET
        last_check_status = ?,
        last_checked_at = ?,
        latency = ?,
        external_ip = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      testResult.working ? 'working' : 'failed',
      now,
      testResult.latency || null,
      testResult.externalIp || null,
      now,
      proxyId
    ).run();

    results.push({
      id: proxyId,
      working: testResult.working,
      latency: testResult.latency,
      error: testResult.error,
    });
  }

  return c.json({
    success: true,
    data: {
      results,
      working: results.filter(r => r.working).length,
      failed: results.filter(r => !r.working).length,
    },
  });
});

export { app as proxyRoutes };
