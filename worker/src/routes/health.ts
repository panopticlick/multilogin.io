/**
 * Health Check API Routes
 *
 * Endpoints for profile health monitoring
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { requirePermission } from '../middleware/auth';
import { performFullHealthCheck, checkProxyHealth, checkIPReputation } from '../services/health';
import { errors } from '../middleware/error';

const app = new Hono<{ Bindings: Env }>();

// GET /api/v1/health/profile/:id - Get health status for a profile
app.get('/profile/:id', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  // Check cache first
  const cached = await c.env.KV.get(`health:${profileId}`);
  if (cached) {
    const health = JSON.parse(cached);
    return c.json({
      success: true,
      data: health,
      cached: true,
    });
  }

  // Perform fresh check
  try {
    const health = await performFullHealthCheck(c.env, profileId, auth.teamId);
    return c.json({
      success: true,
      data: health,
      cached: false,
    });
  } catch {
    throw errors.notFound('Profile');
  }
});

// POST /api/v1/health/profile/:id/check - Trigger manual health check
app.post('/profile/:id/check', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  // Single rate limit for manual checks (per hour)
  const limit = 60;

  if (limit > 0) {
    const key = `health_check:${auth.teamId}:${Math.floor(Date.now() / 3600000)}`;
    const current = parseInt(await c.env.KV.get(key) || '0');

    if (current >= limit) {
      return c.json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Maximum ${limit} manual health checks per hour.`,
        retryAfter: 3600 - (Math.floor(Date.now() / 1000) % 3600),
      }, 429);
    }

    await c.env.KV.put(key, String(current + 1), { expirationTtl: 3600 });
  }

  // Perform health check
  try {
    const health = await performFullHealthCheck(c.env, profileId, auth.teamId);
    return c.json({
      success: true,
      data: health,
    });
  } catch {
    throw errors.notFound('Profile');
  }
});

// GET /api/v1/health/profiles - Get health status for all profiles
app.get('/profiles', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  // Get all profiles with health status
  const profiles = await c.env.DB.prepare(`
    SELECT id, name, health_status, health_score, health_checked_at
    FROM profiles
    WHERE team_id = ?
    ORDER BY health_score ASC, name ASC
  `).bind(auth.teamId).all<{
    id: string;
    name: string;
    health_status: string | null;
    health_score: number | null;
    health_checked_at: number | null;
  }>();

  // Aggregate stats
  const stats = {
    total: profiles.results?.length || 0,
    healthy: 0,
    warning: 0,
    critical: 0,
    unchecked: 0,
  };

  for (const profile of profiles.results || []) {
    switch (profile.health_status) {
      case 'healthy':
        stats.healthy++;
        break;
      case 'warning':
        stats.warning++;
        break;
      case 'critical':
        stats.critical++;
        break;
      default:
        stats.unchecked++;
    }
  }

  return c.json({
    success: true,
    data: {
      profiles: profiles.results || [],
      stats,
    },
  });
});

// POST /api/v1/health/proxy/test - Test a proxy configuration
app.post('/proxy/test', requirePermission('proxies:read'), async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    protocol: z.enum(['http', 'https', 'socks4', 'socks5']),
    host: z.string().min(1),
    port: z.number().min(1).max(65535),
    username: z.string().optional(),
    password: z.string().optional(),
  });

  const proxy = schema.parse(body);

  const result = await checkProxyHealth(proxy);

  // If proxy works, also check IP reputation
  let ipReputation = null;
  if (result.status !== 'failed' && result.externalIp) {
    ipReputation = await checkIPReputation(result.externalIp);
  }

  return c.json({
    success: true,
    data: {
      proxy: result,
      ipReputation,
    },
  });
});

// GET /api/v1/health/ip/:ip - Check IP reputation
app.get('/ip/:ip', requirePermission('proxies:read'), async (c) => {
  const ip = c.req.param('ip');

  // Validate IP format
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    throw errors.badRequest('Invalid IP address format');
  }

  const result = await checkIPReputation(ip);

  return c.json({
    success: true,
    data: result,
  });
});

export default app;
