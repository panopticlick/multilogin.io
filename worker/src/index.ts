import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import type { Env } from './types/env';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';

// Routes
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import { groupRoutes } from './routes/groups';
import { proxyRoutes } from './routes/proxies';
import { teamRoutes } from './routes/teams';
import { syncRoutes } from './routes/sync';
import { templateRoutes } from './routes/templates';
import { userRoutes } from './routes/users';
import healthRoutes from './routes/health';
import fingerprintAgingRoutes from './routes/fingerprint-aging';
import fingerprintPolicyRoutes from './routes/fingerprint-policy';
import timemachineRoutes from './routes/timemachine';
import scriptsRoutes from './routes/scripts';

const app = new Hono<{ Bindings: Env }>();

// Request ID middleware for tracing
app.use('*', async (c, next) => {
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  await next();
});

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.multilogin.io'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));
// CORS configuration based on environment
const getCorsOrigins = (env: Env): string[] => {
  const origins = ['https://multilogin.io', 'https://app.multilogin.io'];
  // Only allow localhost in non-production environments
  if (env.ENVIRONMENT !== 'production') {
    origins.push('http://localhost:3000', 'http://localhost:3002');
  }
  return origins;
};

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: getCorsOrigins(c.env),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Client-ID', 'X-Request-ID'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// Error handling
app.onError(errorHandler);

// Health check (no auth required)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Public routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/templates', templateRoutes);

// Protected routes (require authentication)
const protectedRoutes = new Hono<{ Bindings: Env }>();
protectedRoutes.use('*', authMiddleware);
protectedRoutes.use('*', rateLimitMiddleware);

protectedRoutes.route('/profiles', profileRoutes);
protectedRoutes.route('/groups', groupRoutes);
protectedRoutes.route('/proxies', proxyRoutes);
protectedRoutes.route('/teams', teamRoutes);
protectedRoutes.route('/sync', syncRoutes);
protectedRoutes.route('/users', userRoutes);
protectedRoutes.route('/health', healthRoutes);
protectedRoutes.route('/fingerprint', fingerprintAgingRoutes);
protectedRoutes.route('/fingerprint/policies', fingerprintPolicyRoutes);
protectedRoutes.route('/timemachine', timemachineRoutes);
protectedRoutes.route('/time-machine', timemachineRoutes);
protectedRoutes.route('/scripts', scriptsRoutes);

app.route('/api/v1', protectedRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

export default app;
