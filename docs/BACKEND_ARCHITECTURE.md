# Backend Architecture - Cloudflare Workers

## Overview

The backend is a single Cloudflare Worker that handles all API requests. It's structured as a modular monolith - all code deploys together, but each feature lives in its own service file for maintainability and testability.

---

## Worker Entry Point

### `src/index.ts`

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import { proxyRoutes } from './routes/proxies';
import { teamRoutes } from './routes/teams';
import { syncRoutes } from './routes/sync';
import { templateRoutes } from './routes/templates';
import { billingRoutes } from './routes/billing';
import { webhookRoutes } from './routes/webhooks';

// Type definitions
export interface Env {
  // Bindings
  DB: D1Database;
  R2: R2Bucket;
  KV: KVNamespace;
  QUEUE: Queue;

  // Secrets
  API_SECRET: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Config
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://multilogin.io',
      'https://www.multilogin.io',
      'https://app.multilogin.io',
      'http://localhost:3000'
    ];
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
  credentials: true,
  maxAge: 86400,
}));

// Health check (no auth)
app.get('/health', (c) => c.json({
  status: 'healthy',
  timestamp: Date.now(),
  version: '1.0.0'
}));

// Public routes
app.route('/auth', authRoutes);
app.route('/webhooks', webhookRoutes);

// Protected routes (API key required)
app.use('/api/*', rateLimitMiddleware);
app.use('/api/*', authMiddleware);

app.route('/api/profiles', profileRoutes);
app.route('/api/proxies', proxyRoutes);
app.route('/api/teams', teamRoutes);
app.route('/api/sync', syncRoutes);
app.route('/api/templates', templateRoutes);
app.route('/api/billing', billingRoutes);

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

export default app;
```

---

## Directory Structure

```
apps/worker/
├── src/
│   ├── index.ts              # Entry point
│   │
│   ├── routes/               # Route handlers (thin controllers)
│   │   ├── auth.ts           # /auth/* routes
│   │   ├── profiles.ts       # /api/profiles/* routes
│   │   ├── proxies.ts        # /api/proxies/* routes
│   │   ├── teams.ts          # /api/teams/* routes
│   │   ├── sync.ts           # /api/sync/* routes
│   │   ├── templates.ts      # /api/templates/* routes
│   │   ├── billing.ts        # /api/billing/* routes
│   │   └── webhooks.ts       # /webhooks/* routes
│   │
│   ├── services/             # Business logic
│   │   ├── ProfileService.ts
│   │   ├── ProxyService.ts
│   │   ├── TeamService.ts
│   │   ├── SyncService.ts
│   │   ├── LockService.ts
│   │   ├── FingerprintService.ts
│   │   ├── AuthService.ts
│   │   ├── BillingService.ts
│   │   └── AuditService.ts
│   │
│   ├── middleware/           # Request middleware
│   │   ├── auth.ts           # API key validation
│   │   ├── rateLimit.ts      # Rate limiting
│   │   ├── validate.ts       # Request validation
│   │   └── errorHandler.ts   # Global error handling
│   │
│   ├── utils/                # Utilities
│   │   ├── crypto.ts         # Hashing, encryption
│   │   ├── validation.ts     # Zod schemas
│   │   ├── response.ts       # Response helpers
│   │   └── constants.ts      # App constants
│   │
│   └── types/                # TypeScript types
│       ├── index.ts          # Shared types
│       ├── profile.ts
│       ├── proxy.ts
│       └── team.ts
│
├── schema/                   # D1 migrations
│   ├── 0001_initial.sql
│   ├── 0002_add_proxies.sql
│   └── 0003_add_teams.sql
│
├── wrangler.toml             # Cloudflare config
├── package.json
└── tsconfig.json
```

---

## Service Layer Design

### ProfileService.ts

```typescript
import { nanoid } from 'nanoid';
import { Env } from '../index';
import { Profile, CreateProfileInput, UpdateProfileInput } from '../types/profile';
import { FingerprintService } from './FingerprintService';
import { LockService } from './LockService';
import { AuditService } from './AuditService';

export class ProfileService {
  constructor(
    private env: Env,
    private fingerprintService: FingerprintService,
    private lockService: LockService,
    private auditService: AuditService
  ) {}

  async list(teamId: string, options?: {
    groupId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'name' | 'last_active' | 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<{ profiles: Profile[]; total: number }> {
    const {
      groupId,
      search,
      limit = 50,
      offset = 0,
      orderBy = 'last_active',
      order = 'desc'
    } = options || {};

    let query = `
      SELECT * FROM profiles
      WHERE team_id = ?
    `;
    const params: any[] = [teamId];

    if (groupId) {
      query += ` AND group_id = ?`;
      params.push(groupId);
    }

    if (search) {
      query += ` AND (name LIKE ? OR tags LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await this.env.DB.prepare(countQuery).bind(...params).first();
    const total = countResult?.count || 0;

    // Add ordering and pagination
    query += ` ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await this.env.DB.prepare(query).bind(...params).all();

    return {
      profiles: results as Profile[],
      total
    };
  }

  async get(id: string, teamId: string): Promise<Profile | null> {
    const profile = await this.env.DB.prepare(`
      SELECT * FROM profiles WHERE id = ? AND team_id = ?
    `).bind(id, teamId).first();

    return profile as Profile | null;
  }

  async create(teamId: string, userId: string, input: CreateProfileInput): Promise<Profile> {
    const id = nanoid(12);

    // Generate consistent fingerprint from template
    const fingerprint = await this.fingerprintService.generate(input.templateId);

    const profile: Profile = {
      id,
      name: input.name,
      group_id: input.groupId || null,
      tags: JSON.stringify(input.tags || []),
      team_id: teamId,
      owner_id: userId,

      // Fingerprint
      template_id: input.templateId,
      user_agent: fingerprint.userAgent,
      platform: fingerprint.platform,
      vendor: fingerprint.vendor,
      screen_width: fingerprint.screen.width,
      screen_height: fingerprint.screen.height,
      color_depth: fingerprint.colorDepth,
      device_memory: fingerprint.deviceMemory,
      hardware_concurrency: fingerprint.hardwareConcurrency,
      webgl_vendor: fingerprint.webgl.vendor,
      webgl_renderer: fingerprint.webgl.renderer,
      timezone: input.timezone || fingerprint.timezone,
      language: input.language || fingerprint.language,

      // Network
      proxy_id: input.proxyId || null,
      proxy: input.proxy || '',

      // Locking
      locked_by: null,
      locked_at: null,

      // Metadata
      created_at: Date.now(),
      last_active: Date.now(),
      launch_count: 0,
      notes: input.notes || ''
    };

    await this.env.DB.prepare(`
      INSERT INTO profiles (
        id, name, group_id, tags, team_id, owner_id,
        template_id, user_agent, platform, vendor,
        screen_width, screen_height, color_depth,
        device_memory, hardware_concurrency,
        webgl_vendor, webgl_renderer, timezone, language,
        proxy_id, proxy, locked_by, locked_at,
        created_at, last_active, launch_count, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      profile.id, profile.name, profile.group_id, profile.tags,
      profile.team_id, profile.owner_id, profile.template_id,
      profile.user_agent, profile.platform, profile.vendor,
      profile.screen_width, profile.screen_height, profile.color_depth,
      profile.device_memory, profile.hardware_concurrency,
      profile.webgl_vendor, profile.webgl_renderer, profile.timezone,
      profile.language, profile.proxy_id, profile.proxy,
      profile.locked_by, profile.locked_at, profile.created_at,
      profile.last_active, profile.launch_count, profile.notes
    ).run();

    // Log audit
    await this.auditService.log({
      teamId,
      userId,
      action: 'profile.create',
      targetType: 'profile',
      targetId: id,
      targetName: profile.name,
      details: { templateId: input.templateId }
    });

    return profile;
  }

  async update(id: string, teamId: string, userId: string, input: UpdateProfileInput): Promise<Profile> {
    const existing = await this.get(id, teamId);
    if (!existing) {
      throw new Error('Profile not found');
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }
    if (input.groupId !== undefined) {
      updates.push('group_id = ?');
      params.push(input.groupId);
    }
    if (input.tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(input.tags));
    }
    if (input.timezone !== undefined) {
      updates.push('timezone = ?');
      params.push(input.timezone);
    }
    if (input.language !== undefined) {
      updates.push('language = ?');
      params.push(input.language);
    }
    if (input.proxyId !== undefined) {
      updates.push('proxy_id = ?');
      params.push(input.proxyId);
    }
    if (input.proxy !== undefined) {
      updates.push('proxy = ?');
      params.push(input.proxy);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes);
    }

    if (updates.length === 0) {
      return existing;
    }

    params.push(id, teamId);

    await this.env.DB.prepare(`
      UPDATE profiles SET ${updates.join(', ')}
      WHERE id = ? AND team_id = ?
    `).bind(...params).run();

    // Log audit
    await this.auditService.log({
      teamId,
      userId,
      action: 'profile.update',
      targetType: 'profile',
      targetId: id,
      targetName: existing.name,
      details: input
    });

    return this.get(id, teamId) as Promise<Profile>;
  }

  async delete(id: string, teamId: string, userId: string): Promise<void> {
    const profile = await this.get(id, teamId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Delete from D1
    await this.env.DB.prepare(`
      DELETE FROM profiles WHERE id = ? AND team_id = ?
    `).bind(id, teamId).run();

    // Delete session data from R2
    try {
      await this.env.R2.delete(`sessions/${id}/cookies.gz`);
      await this.env.R2.delete(`sessions/${id}/localStorage.gz`);
    } catch (e) {
      // Ignore R2 errors - data may not exist
    }

    // Log audit
    await this.auditService.log({
      teamId,
      userId,
      action: 'profile.delete',
      targetType: 'profile',
      targetId: id,
      targetName: profile.name
    });
  }

  async launch(id: string, teamId: string, userId: string, clientId: string): Promise<{
    profile: Profile;
    sessionData: any;
    lockAcquired: boolean;
  }> {
    const profile = await this.get(id, teamId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Try to acquire lock
    const lockResult = await this.lockService.acquire(id, clientId);
    if (!lockResult.acquired) {
      throw new Error(`Profile is in use by another session. Last active: ${lockResult.lastActive}`);
    }

    // Get session data from R2
    let sessionData = { cookies: [], localStorage: {} };
    try {
      const cookiesObj = await this.env.R2.get(`sessions/${id}/cookies.gz`);
      if (cookiesObj) {
        const decompressed = await this.decompress(await cookiesObj.arrayBuffer());
        sessionData.cookies = JSON.parse(decompressed);
      }

      const localStorageObj = await this.env.R2.get(`sessions/${id}/localStorage.gz`);
      if (localStorageObj) {
        const decompressed = await this.decompress(await localStorageObj.arrayBuffer());
        sessionData.localStorage = JSON.parse(decompressed);
      }
    } catch (e) {
      // First launch - no session data yet
    }

    // Update last_active and launch_count
    await this.env.DB.prepare(`
      UPDATE profiles
      SET last_active = ?, launch_count = launch_count + 1
      WHERE id = ?
    `).bind(Date.now(), id).run();

    // Log audit
    await this.auditService.log({
      teamId,
      userId,
      action: 'profile.launch',
      targetType: 'profile',
      targetId: id,
      targetName: profile.name,
      details: { clientId }
    });

    return {
      profile,
      sessionData,
      lockAcquired: true
    };
  }

  private async decompress(data: ArrayBuffer): Promise<string> {
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(data));
    writer.close();
    return new Response(ds.readable).text();
  }
}
```

### LockService.ts

```typescript
import { Env } from '../index';

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds

export class LockService {
  constructor(private env: Env) {}

  async acquire(profileId: string, clientId: string): Promise<{
    acquired: boolean;
    lastActive?: string;
  }> {
    const profile = await this.env.DB.prepare(`
      SELECT locked_by, locked_at FROM profiles WHERE id = ?
    `).bind(profileId).first();

    if (!profile) {
      throw new Error('Profile not found');
    }

    const now = Date.now();

    // Case 1: Not locked
    if (!profile.locked_by) {
      await this.setLock(profileId, clientId, now);
      return { acquired: true };
    }

    // Case 2: Same client already has lock (refresh)
    if (profile.locked_by === clientId) {
      await this.setLock(profileId, clientId, now);
      return { acquired: true };
    }

    // Case 3: Lock is stale (no heartbeat for 5+ minutes)
    const lockAge = now - (profile.locked_at as number);
    if (lockAge > LOCK_TIMEOUT_MS) {
      await this.setLock(profileId, clientId, now);
      return { acquired: true };
    }

    // Case 4: Lock is active - deny
    return {
      acquired: false,
      lastActive: new Date(profile.locked_at as number).toISOString()
    };
  }

  async release(profileId: string, clientId: string): Promise<boolean> {
    const result = await this.env.DB.prepare(`
      UPDATE profiles
      SET locked_by = NULL, locked_at = NULL
      WHERE id = ? AND locked_by = ?
    `).bind(profileId, clientId).run();

    return result.meta.changes > 0;
  }

  async heartbeat(profileId: string, clientId: string): Promise<boolean> {
    const result = await this.env.DB.prepare(`
      UPDATE profiles
      SET locked_at = ?
      WHERE id = ? AND locked_by = ?
    `).bind(Date.now(), profileId, clientId).run();

    return result.meta.changes > 0;
  }

  async forceRelease(profileId: string): Promise<void> {
    await this.env.DB.prepare(`
      UPDATE profiles
      SET locked_by = NULL, locked_at = NULL
      WHERE id = ?
    `).bind(profileId).run();
  }

  private async setLock(profileId: string, clientId: string, timestamp: number): Promise<void> {
    await this.env.DB.prepare(`
      UPDATE profiles
      SET locked_by = ?, locked_at = ?
      WHERE id = ?
    `).bind(clientId, timestamp, profileId).run();
  }
}
```

### SyncService.ts

```typescript
import { Env } from '../index';
import { createHash } from 'crypto';
import { AuditService } from './AuditService';

export class SyncService {
  constructor(
    private env: Env,
    private auditService: AuditService
  ) {}

  async sync(profileId: string, teamId: string, userId: string, data: {
    cookies: any[];
    localStorage: Record<string, string>;
    clientHash?: string;
  }): Promise<{
    synced: boolean;
    skipped: boolean;
    hash: string;
  }> {
    // Verify profile exists and belongs to team
    const profile = await this.env.DB.prepare(`
      SELECT id, name FROM profiles WHERE id = ? AND team_id = ?
    `).bind(profileId, teamId).first();

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Calculate hash of new data
    const dataString = JSON.stringify({
      cookies: data.cookies,
      localStorage: data.localStorage
    });
    const newHash = createHash('md5').update(dataString).digest('hex');

    // Smart sync: skip if data unchanged
    if (data.clientHash && data.clientHash === newHash) {
      return {
        synced: false,
        skipped: true,
        hash: newHash
      };
    }

    // Compress and upload cookies
    const cookiesCompressed = await this.compress(JSON.stringify(data.cookies));
    await this.env.R2.put(
      `sessions/${profileId}/cookies.gz`,
      cookiesCompressed,
      {
        httpMetadata: {
          contentType: 'application/json',
          contentEncoding: 'gzip'
        }
      }
    );

    // Compress and upload localStorage
    const localStorageCompressed = await this.compress(JSON.stringify(data.localStorage));
    await this.env.R2.put(
      `sessions/${profileId}/localStorage.gz`,
      localStorageCompressed,
      {
        httpMetadata: {
          contentType: 'application/json',
          contentEncoding: 'gzip'
        }
      }
    );

    // Update last_active
    await this.env.DB.prepare(`
      UPDATE profiles SET last_active = ? WHERE id = ?
    `).bind(Date.now(), profileId).run();

    // Log sync (optional - can be high volume)
    // Only log significant syncs, not heartbeats

    return {
      synced: true,
      skipped: false,
      hash: newHash
    };
  }

  async getSessionData(profileId: string): Promise<{
    cookies: any[];
    localStorage: Record<string, string>;
  }> {
    let cookies: any[] = [];
    let localStorage: Record<string, string> = {};

    try {
      const cookiesObj = await this.env.R2.get(`sessions/${profileId}/cookies.gz`);
      if (cookiesObj) {
        const decompressed = await this.decompress(await cookiesObj.arrayBuffer());
        cookies = JSON.parse(decompressed);
      }
    } catch (e) {
      // No cookies yet
    }

    try {
      const localStorageObj = await this.env.R2.get(`sessions/${profileId}/localStorage.gz`);
      if (localStorageObj) {
        const decompressed = await this.decompress(await localStorageObj.arrayBuffer());
        localStorage = JSON.parse(decompressed);
      }
    } catch (e) {
      // No localStorage yet
    }

    return { cookies, localStorage };
  }

  private async compress(data: string): Promise<ArrayBuffer> {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(data));
    writer.close();
    return new Response(cs.readable).arrayBuffer();
  }

  private async decompress(data: ArrayBuffer): Promise<string> {
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(data));
    writer.close();
    return new Response(ds.readable).text();
  }
}
```

### FingerprintService.ts

```typescript
import { Env } from '../index';
import fingerprintTemplates from '../data/fingerprint-templates.json';

interface FingerprintTemplate {
  os: string;
  browser: string;
  userAgents: string[];
  platform: string;
  vendor: string;
  screens: Array<{ width: number; height: number }>;
  colorDepth: number;
  deviceMemory: number[];
  hardwareConcurrency: number[];
  fonts: string[];
  webglVendor: string;
  webglRenderer: string[];
  languages: string[];
  timezones: string[];
}

export interface GeneratedFingerprint {
  templateId: string;
  userAgent: string;
  platform: string;
  vendor: string;
  screen: { width: number; height: number };
  colorDepth: number;
  deviceMemory: number;
  hardwareConcurrency: number;
  fonts: string[];
  webgl: { vendor: string; renderer: string };
  language: string;
  timezone: string;
}

export class FingerprintService {
  private templates: Record<string, FingerprintTemplate>;

  constructor(private env: Env) {
    this.templates = fingerprintTemplates.templates;
  }

  getAvailableTemplates(): Array<{
    id: string;
    name: string;
    os: string;
    browser: string;
  }> {
    return Object.entries(this.templates).map(([id, template]) => ({
      id,
      name: `${template.os} ${template.browser}`,
      os: template.os,
      browser: template.browser
    }));
  }

  async generate(templateId: string): Promise<GeneratedFingerprint> {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Randomly select one value from each array
    const userAgent = this.pickRandom(template.userAgents);
    const screen = this.pickRandom(template.screens);
    const deviceMemory = this.pickRandom(template.deviceMemory);
    const hardwareConcurrency = this.pickRandom(template.hardwareConcurrency);
    const webglRenderer = this.pickRandom(template.webglRenderer);
    const language = this.pickRandom(template.languages);
    const timezone = this.pickRandom(template.timezones);

    return {
      templateId,
      userAgent,
      platform: template.platform,
      vendor: template.vendor,
      screen,
      colorDepth: template.colorDepth,
      deviceMemory,
      hardwareConcurrency,
      fonts: template.fonts,
      webgl: {
        vendor: template.webglVendor,
        renderer: webglRenderer
      },
      language,
      timezone
    };
  }

  validateConsistency(fingerprint: GeneratedFingerprint): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Windows checks
    if (fingerprint.userAgent.includes('Windows')) {
      if (fingerprint.platform !== 'Win32') {
        errors.push('Windows UA requires Win32 platform');
      }
    }

    // Mac checks
    if (fingerprint.userAgent.includes('Macintosh')) {
      if (fingerprint.platform !== 'MacIntel') {
        errors.push('Mac UA requires MacIntel platform');
      }
    }

    // Chrome checks
    if (fingerprint.userAgent.includes('Chrome')) {
      if (fingerprint.vendor !== 'Google Inc.') {
        errors.push('Chrome UA requires Google Inc. vendor');
      }
    }

    // Safari checks
    if (fingerprint.userAgent.includes('Safari') && !fingerprint.userAgent.includes('Chrome')) {
      if (fingerprint.vendor !== 'Apple Computer, Inc.') {
        errors.push('Safari UA requires Apple vendor');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
```

---

## Middleware

### auth.ts

```typescript
import { Context, Next } from 'hono';
import { Env } from '../index';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  // Hash the token for lookup
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Look up API key
  const apiKey = await c.env.DB.prepare(`
    SELECT * FROM api_keys
    WHERE token_hash = ? AND is_active = 1
  `).bind(tokenHash).first();

  if (!apiKey) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Check rate limit (using KV)
  const rateLimitKey = `ratelimit:${apiKey.id}:${Math.floor(Date.now() / 60000)}`;
  const currentCount = parseInt(await c.env.KV.get(rateLimitKey) || '0');

  if (currentCount >= (apiKey.rate_limit || 100)) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }

  await c.env.KV.put(rateLimitKey, String(currentCount + 1), { expirationTtl: 120 });

  // Attach auth context
  c.set('auth', {
    apiKeyId: apiKey.id,
    teamId: apiKey.team_id,
    userId: apiKey.user_id,
    scopes: JSON.parse(apiKey.scopes || '["*"]')
  });

  // Update last_used
  await c.env.DB.prepare(`
    UPDATE api_keys SET last_used = ? WHERE id = ?
  `).bind(Date.now(), apiKey.id).run();

  await next();
}
```

### validate.ts

```typescript
import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';

export function validate<T>(schema: ZodSchema<T>, target: 'body' | 'query' | 'param' = 'body') {
  return async (c: Context, next: Next) => {
    let data: unknown;

    switch (target) {
      case 'body':
        data = await c.req.json();
        break;
      case 'query':
        data = c.req.query();
        break;
      case 'param':
        data = c.req.param();
        break;
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        details: result.error.flatten()
      }, 400);
    }

    c.set('validated', result.data);
    await next();
  };
}
```

---

## Route Handlers

### profiles.ts

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';
import { ProfileService } from '../services/ProfileService';
import { FingerprintService } from '../services/FingerprintService';
import { LockService } from '../services/LockService';
import { AuditService } from '../services/AuditService';
import { validate } from '../middleware/validate';

const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string(),
  groupId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  proxyId: z.string().optional(),
  proxy: z.string().optional(),
  notes: z.string().max(1000).optional()
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  groupId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  proxyId: z.string().nullable().optional(),
  proxy: z.string().optional(),
  notes: z.string().max(1000).optional()
});

const listQuerySchema = z.object({
  groupId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  orderBy: z.enum(['name', 'last_active', 'created_at']).default('last_active'),
  order: z.enum(['asc', 'desc']).default('desc')
});

export const profileRoutes = new Hono<{ Bindings: Env }>();

// Initialize services
const getServices = (env: Env) => {
  const fingerprintService = new FingerprintService(env);
  const lockService = new LockService(env);
  const auditService = new AuditService(env);
  const profileService = new ProfileService(env, fingerprintService, lockService, auditService);
  return { profileService, lockService };
};

// List profiles
profileRoutes.get('/', validate(listQuerySchema, 'query'), async (c) => {
  const auth = c.get('auth');
  const query = c.get('validated');
  const { profileService } = getServices(c.env);

  const result = await profileService.list(auth.teamId, query);

  return c.json(result);
});

// Get single profile
profileRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const { profileService } = getServices(c.env);

  const profile = await profileService.get(id, auth.teamId);

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json(profile);
});

// Create profile
profileRoutes.post('/', validate(createProfileSchema), async (c) => {
  const auth = c.get('auth');
  const input = c.get('validated');
  const { profileService } = getServices(c.env);

  const profile = await profileService.create(auth.teamId, auth.userId, input);

  return c.json(profile, 201);
});

// Update profile
profileRoutes.put('/:id', validate(updateProfileSchema), async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const input = c.get('validated');
  const { profileService } = getServices(c.env);

  try {
    const profile = await profileService.update(id, auth.teamId, auth.userId, input);
    return c.json(profile);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 404);
  }
});

// Delete profile
profileRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const { profileService } = getServices(c.env);

  try {
    await profileService.delete(id, auth.teamId, auth.userId);
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 404);
  }
});

// Launch profile (get config + session data + acquire lock)
profileRoutes.post('/:id/launch', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const clientId = c.req.header('X-Client-ID');
  const { profileService } = getServices(c.env);

  if (!clientId) {
    return c.json({ error: 'X-Client-ID header required' }, 400);
  }

  try {
    const result = await profileService.launch(id, auth.teamId, auth.userId, clientId);
    return c.json(result);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 409);
  }
});

// Heartbeat (keep lock alive)
profileRoutes.post('/:id/heartbeat', async (c) => {
  const id = c.req.param('id');
  const clientId = c.req.header('X-Client-ID');
  const { lockService } = getServices(c.env);

  if (!clientId) {
    return c.json({ error: 'X-Client-ID header required' }, 400);
  }

  const success = await lockService.heartbeat(id, clientId);

  if (!success) {
    return c.json({ error: 'Lock not found or expired' }, 409);
  }

  return c.json({ success: true });
});

// Release lock
profileRoutes.post('/:id/release', async (c) => {
  const id = c.req.param('id');
  const clientId = c.req.header('X-Client-ID');
  const { lockService } = getServices(c.env);

  if (!clientId) {
    return c.json({ error: 'X-Client-ID header required' }, 400);
  }

  const success = await lockService.release(id, clientId);

  return c.json({ success });
});
```

---

## Wrangler Configuration

### wrangler.toml

```toml
name = "multilogin-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Environment-specific configs
[env.production]
name = "multilogin-api"
routes = [
  { pattern = "api.multilogin.io", zone_name = "multilogin.io" }
]

[env.staging]
name = "multilogin-api-staging"
routes = [
  { pattern = "api-staging.multilogin.io", zone_name = "multilogin.io" }
]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "multilogin"
database_id = "xxx-xxx-xxx"  # Get from `wrangler d1 create multilogin`

# R2 Bucket
[[r2_buckets]]
binding = "R2"
bucket_name = "multilogin-sessions"

# KV Namespace
[[kv_namespaces]]
binding = "KV"
id = "xxx"  # Get from `wrangler kv:namespace create KV`

# Queue (for async processing)
[[queues.producers]]
binding = "QUEUE"
queue = "multilogin-tasks"

[[queues.consumers]]
queue = "multilogin-tasks"
max_batch_size = 10
max_retries = 3

# Environment variables
[vars]
ENVIRONMENT = "development"

# Secrets (set via `wrangler secret put`)
# API_SECRET
# JWT_SECRET
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET

# Build
[build]
command = "npm run build"

# Triggers
[triggers]
crons = [
  "0 */6 * * *"  # Run every 6 hours (cleanup stale locks)
]
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/services/ProfileService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileService } from '../../src/services/ProfileService';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = {
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
            first: vi.fn().mockResolvedValue(null),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } })
          })
        })
      },
      R2: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined)
      }
    };

    service = new ProfileService(
      mockEnv,
      new FingerprintService(mockEnv),
      new LockService(mockEnv),
      new AuditService(mockEnv)
    );
  });

  it('should list profiles with pagination', async () => {
    const mockProfiles = [
      { id: '1', name: 'Profile 1' },
      { id: '2', name: 'Profile 2' }
    ];

    mockEnv.DB.prepare().bind().all.mockResolvedValue({ results: mockProfiles });
    mockEnv.DB.prepare().bind().first.mockResolvedValue({ count: 2 });

    const result = await service.list('team-123', { limit: 10, offset: 0 });

    expect(result.profiles).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  // ... more tests
});
```

### Integration Tests (Miniflare)

```typescript
// tests/integration/profiles.test.ts
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Profile API', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should return 401 without auth', async () => {
    const resp = await worker.fetch('/api/profiles');
    expect(resp.status).toBe(401);
  });

  it('should list profiles with valid auth', async () => {
    const resp = await worker.fetch('/api/profiles', {
      headers: {
        'Authorization': 'Bearer test-api-key'
      }
    });
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty('profiles');
    expect(data).toHaveProperty('total');
  });
});
```

---

## Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-worker.yml
name: Deploy Worker

on:
  push:
    branches: [main]
    paths:
      - 'apps/worker/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: apps/worker

      - name: Run tests
        run: npm test
        working-directory: apps/worker

      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: apps/worker
          command: deploy --env production
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold start | <10ms | Cloudflare dashboard |
| API latency (p50) | <50ms | Custom logging |
| API latency (p95) | <150ms | Custom logging |
| Throughput | >10k req/s | Load testing |
| Error rate | <0.1% | Cloudflare dashboard |

---

## Next Steps

1. Set up D1 database with migrations (`DATABASE_SCHEMA.md`)
2. Implement full API specification (`API_SPECIFICATION.md`)
3. Add Stripe integration for billing
4. Set up monitoring and alerting
