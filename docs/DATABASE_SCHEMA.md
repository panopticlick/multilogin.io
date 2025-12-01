# Database Schema - Cloudflare D1 & R2

## Overview

Data is stored across three Cloudflare services:

| Service | Purpose | Data Type |
|---------|---------|-----------|
| **D1** | Structured metadata | Profiles, users, teams, proxies |
| **R2** | Binary/large data | Session data (cookies, localStorage) |
| **KV** | Cache & ephemeral | Rate limits, sessions, feature flags |

---

## D1 Schema

### Entity Relationship Diagram

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│      users        │      │      teams        │      │    team_members   │
├───────────────────┤      ├───────────────────┤      ├───────────────────┤
│ id (PK)           │──┐   │ id (PK)           │──┬──▶│ team_id (FK)      │
│ email             │  │   │ name              │  │   │ user_id (FK)      │
│ password_hash     │  │   │ owner_id (FK)─────│──┘   │ role              │
│ name              │  └──▶│ plan_type         │      │ permissions       │
│ avatar_url        │      │ settings          │      │ group_access      │
│ created_at        │      │ created_at        │      │ joined_at         │
│ last_login        │      └───────────────────┘      └───────────────────┘
└───────────────────┘                │
                                     │
┌───────────────────┐      ┌─────────┴─────────┐      ┌───────────────────┐
│     api_keys      │      │     profiles      │      │      groups       │
├───────────────────┤      ├───────────────────┤      ├───────────────────┤
│ id (PK)           │      │ id (PK)           │◀────▶│ id (PK)           │
│ user_id (FK)      │      │ name              │      │ team_id (FK)      │
│ team_id (FK)      │      │ team_id (FK)──────│──────│ name              │
│ token_hash        │      │ owner_id (FK)     │      │ description       │
│ name              │      │ group_id (FK)─────│──────│ color             │
│ scopes            │      │ template_id       │      │ created_at        │
│ is_active         │      │ [fingerprint...]  │      └───────────────────┘
│ last_used         │      │ [network...]      │
│ created_at        │      │ [locking...]      │      ┌───────────────────┐
│ expires_at        │      │ [metadata...]     │      │   proxy_pools     │
└───────────────────┘      └───────────────────┘      ├───────────────────┤
                                     │                │ id (PK)           │
┌───────────────────┐                │                │ team_id (FK)      │
│    audit_logs     │                │                │ name              │
├───────────────────┤                │                │ type              │
│ id (PK)           │      ┌─────────┴─────────┐      │ assignment        │
│ team_id (FK)      │      │     proxies       │      │ created_at        │
│ user_id (FK)      │      ├───────────────────┤      └───────────────────┘
│ action            │      │ id (PK)           │                │
│ target_type       │      │ pool_id (FK)──────│────────────────┘
│ target_id         │      │ team_id (FK)      │
│ target_name       │      │ protocol          │
│ details           │      │ host              │
│ ip_address        │      │ port              │
│ client_id         │      │ username          │
│ timestamp         │      │ password          │
└───────────────────┘      │ status            │
                           │ latency_ms        │
                           │ created_at        │
                           └───────────────────┘
```

---

## Complete SQL Schema

### Migration 0001: Initial Schema

```sql
-- Migration: 0001_initial_schema.sql
-- Description: Creates core tables for users, teams, and profiles

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,  -- NULL for OAuth users
    name TEXT NOT NULL,
    avatar_url TEXT,

    -- Email verification
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    email_verification_expires INTEGER,

    -- Password reset
    password_reset_token TEXT,
    password_reset_expires INTEGER,

    -- 2FA
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    last_login INTEGER,
    is_active INTEGER DEFAULT 1
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verification ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;

-- ============================================
-- OAUTH ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,  -- 'google', 'github', etc.
    provider_account_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_user ON oauth_accounts(user_id);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL REFERENCES users(id),

    -- Subscription
    plan_type TEXT NOT NULL DEFAULT 'free',  -- 'free', 'pro', 'team', 'enterprise'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'active',  -- 'active', 'past_due', 'canceled'

    -- Limits (overridden by plan)
    profiles_limit INTEGER NOT NULL DEFAULT 5,
    members_limit INTEGER NOT NULL DEFAULT 1,
    storage_limit_mb INTEGER NOT NULL DEFAULT 100,

    -- Usage tracking
    profiles_count INTEGER NOT NULL DEFAULT 0,
    storage_used_mb INTEGER NOT NULL DEFAULT 0,

    -- Settings (JSON)
    settings TEXT DEFAULT '{}',

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_teams_owner ON teams(owner_id);
CREATE INDEX idx_teams_stripe ON teams(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role TEXT NOT NULL DEFAULT 'member',  -- 'owner', 'admin', 'member', 'viewer'
    permissions TEXT DEFAULT '["profiles:read", "profiles:launch"]',  -- JSON array

    -- Access control
    group_access TEXT,  -- NULL = all groups, JSON array of group IDs

    -- Invitation
    invited_by TEXT REFERENCES users(id),
    invited_at INTEGER,
    joined_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================
-- GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',  -- Hex color for UI
    icon TEXT,  -- Icon name

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

    UNIQUE(team_id, name)
);

CREATE INDEX idx_groups_team ON groups(team_id);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,

    -- Ownership
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    group_id TEXT REFERENCES groups(id) ON DELETE SET NULL,

    -- Tags (JSON array)
    tags TEXT DEFAULT '[]',

    -- Fingerprint (from template)
    template_id TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    platform TEXT NOT NULL,
    vendor TEXT NOT NULL,
    screen_width INTEGER NOT NULL,
    screen_height INTEGER NOT NULL,
    color_depth INTEGER NOT NULL DEFAULT 24,
    device_memory INTEGER NOT NULL DEFAULT 8,
    hardware_concurrency INTEGER NOT NULL DEFAULT 8,
    webgl_vendor TEXT,
    webgl_renderer TEXT,
    timezone TEXT DEFAULT 'America/New_York',
    language TEXT DEFAULT 'en-US',
    fonts TEXT,  -- JSON array

    -- Network
    proxy_id TEXT REFERENCES proxies(id) ON DELETE SET NULL,
    proxy TEXT DEFAULT '',  -- Direct proxy string (fallback)

    -- Session locking
    locked_by TEXT,  -- Client ID
    locked_at INTEGER,

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    last_active INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    launch_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT ''
);

CREATE INDEX idx_profiles_team ON profiles(team_id);
CREATE INDEX idx_profiles_group ON profiles(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX idx_profiles_last_active ON profiles(last_active DESC);
CREATE INDEX idx_profiles_locked ON profiles(locked_by, locked_at) WHERE locked_by IS NOT NULL;
CREATE INDEX idx_profiles_name_search ON profiles(name COLLATE NOCASE);

-- ============================================
-- API KEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,  -- SHA-256 hash of the token
    token_prefix TEXT NOT NULL,  -- First 8 chars for identification

    -- Permissions
    scopes TEXT DEFAULT '["*"]',  -- JSON array of allowed scopes

    -- Rate limiting
    rate_limit INTEGER DEFAULT 100,  -- Requests per minute

    -- Status
    is_active INTEGER DEFAULT 1,
    last_used INTEGER,

    -- Lifecycle
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    expires_at INTEGER  -- NULL = never expires
);

CREATE INDEX idx_api_keys_token ON api_keys(token_hash);
CREATE INDEX idx_api_keys_team ON api_keys(team_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,

    -- Action details
    action TEXT NOT NULL,  -- e.g., 'profile.create', 'profile.launch'
    target_type TEXT NOT NULL,  -- 'profile', 'proxy', 'team', 'member'
    target_id TEXT,
    target_name TEXT,

    -- Context
    details TEXT,  -- JSON object with additional info
    ip_address TEXT,
    user_agent TEXT,
    client_id TEXT,

    -- Timestamp
    timestamp INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_audit_team_time ON audit_logs(team_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, timestamp DESC);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);

-- Partition audit logs by month (D1 doesn't support partitioning, so we use a cleanup trigger)
-- Audit logs older than retention period will be deleted by a scheduled job
```

### Migration 0002: Proxies Schema

```sql
-- Migration: 0002_proxies_schema.sql
-- Description: Creates proxy pool and proxy tables

-- ============================================
-- PROXY POOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS proxy_pools (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,

    -- Pool configuration
    type TEXT NOT NULL DEFAULT 'static',  -- 'static', 'rotating', 'sticky'
    assignment_strategy TEXT DEFAULT 'round-robin',  -- 'round-robin', 'least-used', 'random', 'sticky'

    -- Sticky session config
    sticky_duration_minutes INTEGER DEFAULT 30,

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

    UNIQUE(team_id, name)
);

CREATE INDEX idx_proxy_pools_team ON proxy_pools(team_id);

-- ============================================
-- PROXIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS proxies (
    id TEXT PRIMARY KEY,
    pool_id TEXT REFERENCES proxy_pools(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Connection details
    name TEXT,
    protocol TEXT NOT NULL DEFAULT 'http',  -- 'http', 'https', 'socks4', 'socks5'
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT,
    password TEXT,

    -- Health monitoring
    status TEXT DEFAULT 'unknown',  -- 'healthy', 'degraded', 'offline', 'unknown'
    latency_ms INTEGER,
    last_check INTEGER,
    check_error TEXT,

    -- Usage tracking
    profiles_using TEXT DEFAULT '[]',  -- JSON array of profile IDs
    bandwidth_used_bytes INTEGER DEFAULT 0,
    request_count INTEGER DEFAULT 0,

    -- Location info (for display)
    country_code TEXT,
    city TEXT,
    isp TEXT,

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

    UNIQUE(team_id, host, port)
);

CREATE INDEX idx_proxies_pool ON proxies(pool_id) WHERE pool_id IS NOT NULL;
CREATE INDEX idx_proxies_team ON proxies(team_id);
CREATE INDEX idx_proxies_status ON proxies(status);
```

### Migration 0003: Invitations & Sessions

```sql
-- Migration: 0003_invitations_sessions.sql
-- Description: Team invitations and session management

-- ============================================
-- TEAM INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_invitations (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    permissions TEXT DEFAULT '["profiles:read", "profiles:launch"]',

    -- Token for accepting invitation
    token TEXT NOT NULL UNIQUE,

    -- Sender
    invited_by TEXT NOT NULL REFERENCES users(id),

    -- Status
    status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'expired', 'revoked'

    -- Lifecycle
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    expires_at INTEGER NOT NULL,
    accepted_at INTEGER,

    UNIQUE(team_id, email)
);

CREATE INDEX idx_invitations_token ON team_invitations(token);
CREATE INDEX idx_invitations_email ON team_invitations(email);
CREATE INDEX idx_invitations_status ON team_invitations(status, expires_at);

-- ============================================
-- USER SESSIONS TABLE (for NextAuth)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,

    -- Device info
    device_name TEXT,
    device_type TEXT,  -- 'desktop', 'mobile', 'tablet'
    ip_address TEXT,
    user_agent TEXT,

    -- Lifecycle
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    expires_at INTEGER NOT NULL,
    last_active INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- VERIFICATION TOKENS TABLE (for NextAuth)
-- ============================================
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires INTEGER NOT NULL,

    PRIMARY KEY (identifier, token)
);

CREATE INDEX idx_verification_expires ON verification_tokens(expires);
```

### Migration 0004: Billing Tables

```sql
-- Migration: 0004_billing.sql
-- Description: Billing and subscription tracking

-- ============================================
-- BILLING EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_events (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Event type
    event_type TEXT NOT NULL,  -- 'subscription.created', 'invoice.paid', etc.
    stripe_event_id TEXT UNIQUE,

    -- Amount
    amount_cents INTEGER,
    currency TEXT DEFAULT 'usd',

    -- Details
    description TEXT,
    metadata TEXT,  -- JSON

    -- Timestamp
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_billing_team ON billing_events(team_id, created_at DESC);
CREATE INDEX idx_billing_stripe ON billing_events(stripe_event_id) WHERE stripe_event_id IS NOT NULL;

-- ============================================
-- USAGE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_records (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Usage period
    period_start INTEGER NOT NULL,
    period_end INTEGER NOT NULL,

    -- Metrics
    profiles_created INTEGER DEFAULT 0,
    profiles_deleted INTEGER DEFAULT 0,
    launches INTEGER DEFAULT 0,
    syncs INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    storage_bytes INTEGER DEFAULT 0,

    -- Metadata
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_usage_team_period ON usage_records(team_id, period_start DESC);
```

---

## R2 Object Structure

### Session Data

```
multilogin-sessions/                    # R2 Bucket
├── sessions/
│   ├── {profile_id}/
│   │   ├── cookies.gz                  # Compressed JSON array
│   │   ├── localStorage.gz             # Compressed JSON object
│   │   └── metadata.json               # Sync metadata
│   └── ...
├── backups/
│   ├── {team_id}/
│   │   ├── {date}/
│   │   │   └── export.zip              # Full team backup
│   │   └── ...
│   └── ...
└── imports/
    ├── {import_id}/
    │   ├── data.zip                    # Uploaded import file
    │   └── status.json                 # Import progress
    └── ...
```

### Cookie Object Structure

```typescript
interface CookieData {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Lax' | 'Strict' | 'None';
}

// Stored as gzipped JSON array
[
  {
    "name": "session_id",
    "value": "abc123",
    "domain": ".facebook.com",
    "path": "/",
    "expires": 1735689600000,
    "httpOnly": true,
    "secure": true,
    "sameSite": "Lax"
  },
  // ... more cookies
]
```

### localStorage Object Structure

```typescript
// Stored as gzipped JSON object
{
  "https://www.facebook.com": {
    "key1": "value1",
    "key2": "value2"
  },
  "https://www.google.com": {
    "preferences": "{\"theme\":\"dark\"}"
  }
}
```

### Metadata Object

```typescript
// sessions/{profile_id}/metadata.json
{
  "lastSync": 1701234567890,
  "syncHash": "a1b2c3d4e5f6...",
  "cookieCount": 45,
  "localStorageKeys": 12,
  "compressedSize": 4567,
  "clientId": "abc123",
  "clientVersion": "1.0.0"
}
```

---

## KV Namespace Structure

### Rate Limiting

```
ratelimit:{api_key_id}:{minute_bucket} = count
TTL: 120 seconds

Example:
ratelimit:key_abc123:29835412 = "47"
```

### Session Cache

```
session:{session_token} = JSON user object
TTL: 7 days

Example:
session:eyJhbGciOiJIUzI1N... = {"id":"user_123","email":"user@example.com",...}
```

### Feature Flags

```
feature:{flag_name} = JSON config
No TTL (permanent)

Example:
feature:new_dashboard = {"enabled":true,"rollout":0.5,"excludeTeams":["team_123"]}
```

### Lock Cache (Optional - for faster reads)

```
lock:{profile_id} = JSON lock info
TTL: 5 minutes

Example:
lock:profile_abc = {"lockedBy":"client_xyz","lockedAt":1701234567890}
```

---

## Indexing Strategy

### Query Patterns and Indexes

| Query Pattern | Index | Notes |
|--------------|-------|-------|
| List profiles by team | `idx_profiles_team` | Primary access pattern |
| List profiles by group | `idx_profiles_group` | Filtered views |
| Sort by last_active | `idx_profiles_last_active` | Default sort |
| Check profile lock | `idx_profiles_locked` | Quick lock checks |
| Search by name | `idx_profiles_name_search` | Case-insensitive |
| Audit by team + time | `idx_audit_team_time` | Activity log |
| Audit by action | `idx_audit_action` | Filter by action type |

### Query Examples

```sql
-- List profiles for team, sorted by last active
SELECT * FROM profiles
WHERE team_id = ?
ORDER BY last_active DESC
LIMIT 50 OFFSET 0;

-- Search profiles by name
SELECT * FROM profiles
WHERE team_id = ?
  AND name LIKE '%' || ? || '%' COLLATE NOCASE
ORDER BY last_active DESC;

-- Get profile with lock info
SELECT
  p.*,
  CASE
    WHEN p.locked_by IS NOT NULL
      AND p.locked_at > (unixepoch() * 1000) - 300000
    THEN 1
    ELSE 0
  END as is_locked
FROM profiles p
WHERE p.id = ?;

-- List available profiles (not locked or lock expired)
SELECT * FROM profiles
WHERE team_id = ?
  AND (
    locked_by IS NULL
    OR locked_at < (unixepoch() * 1000) - 300000
  );

-- Get team usage stats
SELECT
  COUNT(*) as total_profiles,
  SUM(CASE WHEN locked_by IS NOT NULL THEN 1 ELSE 0 END) as active_profiles,
  SUM(launch_count) as total_launches,
  MAX(last_active) as last_activity
FROM profiles
WHERE team_id = ?;

-- Audit log with pagination
SELECT
  a.*,
  u.name as user_name,
  u.email as user_email
FROM audit_logs a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.team_id = ?
  AND a.timestamp < ?
ORDER BY a.timestamp DESC
LIMIT 50;
```

---

## Data Retention & Cleanup

### Retention Policies

| Data Type | Free Plan | Pro Plan | Team Plan |
|-----------|-----------|----------|-----------|
| Profiles | Unlimited | Unlimited | Unlimited |
| Session Data | 30 days inactive | 90 days | 365 days |
| Audit Logs | 7 days | 30 days | 90 days |
| Backups | None | 7 days | 30 days |

### Cleanup Cron Job

```typescript
// Scheduled to run every 6 hours
export async function cleanupTask(env: Env) {
  const now = Date.now();

  // 1. Clean up expired session locks
  await env.DB.prepare(`
    UPDATE profiles
    SET locked_by = NULL, locked_at = NULL
    WHERE locked_at < ?
  `).bind(now - 5 * 60 * 1000).run();

  // 2. Delete expired invitations
  await env.DB.prepare(`
    DELETE FROM team_invitations
    WHERE status = 'pending' AND expires_at < ?
  `).bind(now).run();

  // 3. Delete expired sessions
  await env.DB.prepare(`
    DELETE FROM sessions
    WHERE expires_at < ?
  `).bind(now).run();

  // 4. Delete old audit logs (based on team plan)
  await env.DB.prepare(`
    DELETE FROM audit_logs
    WHERE timestamp < ?
      AND team_id IN (
        SELECT id FROM teams WHERE plan_type = 'free'
      )
  `).bind(now - 7 * 24 * 60 * 60 * 1000).run();

  // 5. Clean up orphaned R2 session data
  // (profiles deleted but R2 data remains)
  const orphanedSessions = await findOrphanedR2Sessions(env);
  for (const key of orphanedSessions) {
    await env.R2.delete(key);
  }
}
```

---

## Migration Commands

### Development

```bash
# Create new migration
wrangler d1 migrations create multilogin "add_feature_x"

# Apply migrations locally
wrangler d1 migrations apply multilogin --local

# Apply migrations to production
wrangler d1 migrations apply multilogin --env production
```

### Seeding Test Data

```typescript
// scripts/seed.ts
import { nanoid } from 'nanoid';

export async function seedTestData(db: D1Database) {
  // Create test user
  const userId = nanoid(12);
  await db.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
  `).bind(
    userId,
    'test@example.com',
    await hashPassword('password123'),
    'Test User'
  ).run();

  // Create test team
  const teamId = nanoid(12);
  await db.prepare(`
    INSERT INTO teams (id, name, owner_id, plan_type, profiles_limit)
    VALUES (?, ?, ?, ?, ?)
  `).bind(teamId, 'Test Team', userId, 'pro', 50).run();

  // Add user to team
  await db.prepare(`
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (?, ?, ?)
  `).bind(teamId, userId, 'owner').run();

  // Create test profiles
  for (let i = 0; i < 10; i++) {
    await db.prepare(`
      INSERT INTO profiles (
        id, name, team_id, owner_id, template_id,
        user_agent, platform, vendor, screen_width, screen_height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      nanoid(12),
      `Test Profile ${i + 1}`,
      teamId,
      userId,
      'windows_chrome_desktop',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
      'Win32',
      'Google Inc.',
      1920,
      1080
    ).run();
  }

  console.log('Seed data created successfully');
}
```

---

## Backup Strategy

### Automated Backups

```typescript
// Scheduled weekly for team/enterprise plans
export async function backupTeam(teamId: string, env: Env) {
  // 1. Export all profiles
  const profiles = await env.DB.prepare(`
    SELECT * FROM profiles WHERE team_id = ?
  `).bind(teamId).all();

  // 2. Export all proxies
  const proxies = await env.DB.prepare(`
    SELECT * FROM proxies WHERE team_id = ?
  `).bind(teamId).all();

  // 3. Export session data from R2
  const sessionKeys = [];
  for (const profile of profiles.results) {
    const cookies = await env.R2.get(`sessions/${profile.id}/cookies.gz`);
    const localStorage = await env.R2.get(`sessions/${profile.id}/localStorage.gz`);
    sessionKeys.push({
      profileId: profile.id,
      cookies: cookies ? await cookies.arrayBuffer() : null,
      localStorage: localStorage ? await localStorage.arrayBuffer() : null
    });
  }

  // 4. Create backup archive
  const backup = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    teamId,
    profiles: profiles.results,
    proxies: proxies.results,
    sessions: sessionKeys
  };

  // 5. Upload to R2
  const date = new Date().toISOString().split('T')[0];
  await env.R2.put(
    `backups/${teamId}/${date}/export.json`,
    JSON.stringify(backup),
    {
      httpMetadata: {
        contentType: 'application/json'
      }
    }
  );
}
```

---

## Performance Considerations

### D1 Limits

| Limit | Value | Mitigation |
|-------|-------|------------|
| Max rows per query | 5 million | Pagination required |
| Max database size | 2 GB | Monitor and alert |
| Max bound parameters | 100 | Batch operations |
| Max query time | 30 seconds | Optimize queries |

### Optimization Tips

1. **Always use prepared statements** - D1 caches query plans
2. **Limit SELECT columns** - Don't SELECT * in production
3. **Use covering indexes** - Include all needed columns
4. **Batch writes** - Use transactions for multiple inserts
5. **Paginate results** - Never return unbounded result sets

### Example: Batch Insert

```typescript
async function batchInsertProfiles(profiles: Profile[], env: Env) {
  const batchSize = 50;

  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);

    const stmt = env.DB.prepare(`
      INSERT INTO profiles (id, name, team_id, owner_id, ...)
      VALUES ${batch.map(() => '(?, ?, ?, ?, ...)').join(', ')}
    `);

    const params = batch.flatMap(p => [p.id, p.name, p.team_id, p.owner_id, ...]);
    await stmt.bind(...params).run();
  }
}
```

---

## Next Steps

1. Create fingerprint templates JSON (`/data/fingerprint-templates.json`)
2. Set up D1 database and run migrations
3. Configure R2 bucket with lifecycle rules
4. Implement API endpoints (`API_SPECIFICATION.md`)
