import type { Context, Next } from 'hono';
import type { Env, AuthContext } from '../types/env';

// Single global rate limit (requests per minute)
const RATE_LIMIT = 300;

// Get rate limit key
function getRateLimitKey(auth: AuthContext): string {
  return `ratelimit:${auth.apiKeyId || auth.userId}`;
}

export async function rateLimitMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const auth = c.get('auth');
  const limit = RATE_LIMIT;
  const window = 60; // 1 minute window
  const bucket = Math.floor(Date.now() / (window * 1000));
  const key = `${getRateLimitKey(auth)}:${bucket}`;

  // Get current count from KV
  const currentStr = await c.env.KV.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;

  // Set rate limit headers
  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(Math.max(0, limit - current - 1)));
  c.header('X-RateLimit-Reset', String((bucket + 1) * window));

  if (current >= limit) {
    return c.json(
      {
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${limit} requests per minute.`,
        retryAfter: (bucket + 1) * window - Math.floor(Date.now() / 1000),
      },
      429
    );
  }

  // Increment counter
  await c.env.KV.put(key, String(current + 1), { expirationTtl: window * 2 });

  await next();
}

// Stricter rate limiting for sensitive operations
export async function strictRateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  maxRequests: number,
  windowSeconds: number
) {
  const auth = c.get('auth');
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `strict:${getRateLimitKey(auth)}:${bucket}`;

  const currentStr = await c.env.KV.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;

  if (current >= maxRequests) {
    return {
      limited: true,
      retryAfter: (bucket + 1) * windowSeconds - Math.floor(Date.now() / 1000),
    };
  }

  await c.env.KV.put(key, String(current + 1), { expirationTtl: windowSeconds * 2 });

  return { limited: false };
}

// IP-based rate limiting for auth endpoints
export async function ipRateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  action: string,
  maxRequests: number,
  windowSeconds: number
) {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `ip:${action}:${ip}:${bucket}`;

  const currentStr = await c.env.KV.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;

  if (current >= maxRequests) {
    return {
      limited: true,
      retryAfter: (bucket + 1) * windowSeconds - Math.floor(Date.now() / 1000),
    };
  }

  await c.env.KV.put(key, String(current + 1), { expirationTtl: windowSeconds * 2 });

  return { limited: false };
}
