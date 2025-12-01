# Multilogin.io - Master Blueprint

## Production-Grade Multi-Browser Profile Management System

**Version:** 1.0.0
**Last Updated:** December 2024
**Classification:** Technical Blueprint

---

## Executive Summary

Multilogin.io is a cloud-synchronized multi-browser profile management system designed for professionals who need to manage multiple online identities. Think of it as "1Password for browser profiles" - where each profile is a complete, isolated browser environment with its own fingerprint, cookies, and session data.

### The Core Value Proposition

```
Traditional approach:
├── Buy expensive multi-browser software ($100+/month)
├── Data stored locally (lost if computer crashes)
├── No team collaboration
└── Complex setup, steep learning curve

Multilogin.io approach:
├── Free core features, pay for team/pro features
├── Cloud sync to Cloudflare's global edge (instant, free)
├── Real-time team collaboration with conflict resolution
└── One-click launch, zero configuration
```

---

## System Architecture Overview

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 1: PRESENTATION                              │
│                                                                              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │     Marketing Website            │  │    Web Dashboard (Next.js)      │ │
│  │     (SEO & Conversion)           │  │    (App Management)             │ │
│  │                                  │  │                                 │ │
│  │  /                 Homepage      │  │  /dashboard         Overview    │ │
│  │  /features         Features      │  │  /dashboard/profiles Profiles   │ │
│  │  /pricing          Pricing       │  │  /dashboard/proxies  Proxies    │ │
│  │  /download         Downloads     │  │  /dashboard/team     Team       │ │
│  │  /blog             SEO Content   │  │  /dashboard/settings Settings   │ │
│  │  /docs             Help Center   │  │                                 │ │
│  └──────────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 2: BUSINESS LOGIC                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     Cloudflare Worker (Edge API)                        │ │
│  │                                                                         │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │   │   Auth      │  │   Profile   │  │   Proxy     │  │   Team      │  │ │
│  │   │   Service   │  │   Service   │  │   Service   │  │   Service   │  │ │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  │                                                                         │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │   │  Fingerprint│  │   Sync      │  │   Lock      │  │   Billing   │  │ │
│  │   │  Generator  │  │   Engine    │  │   Manager   │  │   Service   │  │ │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  │                                                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 3: DATA PERSISTENCE                          │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐ │
│  │   Cloudflare D1      │  │   Cloudflare R2      │  │   Cloudflare KV   │ │
│  │   (SQL Database)     │  │   (Object Storage)   │  │   (Cache/Config)  │ │
│  │                      │  │                      │  │                   │ │
│  │  • Profiles metadata │  │  • Session data      │  │  • Rate limiting  │ │
│  │  • Team members      │  │  • Cookies (gzip)    │  │  • API keys cache │ │
│  │  • Proxy configs     │  │  • localStorage      │  │  • Feature flags  │ │
│  │  • Audit logs        │  │  • Backup snapshots  │  │  • Sessions       │ │
│  │  • Billing records   │  │                      │  │                   │ │
│  └──────────────────────┘  └──────────────────────┘  └───────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Local Client Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOCAL CLIENT (Desktop App)                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Electron Shell (Optional)                          │ │
│  │                      OR                                                  │ │
│  │                      Node.js CLI + System Tray                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         Core Services Layer                              ││
│  │                                                                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ ││
│  │  │ API Client   │  │ Profile      │  │ Proxy-Chain  │  │ Smart Sync  │ ││
│  │  │              │  │ Manager      │  │ (Auth Fwd)   │  │ Engine      │ ││
│  │  │ • Auth       │  │              │  │              │  │             │ ││
│  │  │ • REST calls │  │ • Launch     │  │ • HTTP/S     │  │ • Diff calc │ ││
│  │  │ • Retry      │  │ • Monitor    │  │ • SOCKS4/5   │  │ • Compress  │ ││
│  │  │ • Offline Q  │  │ • Cleanup    │  │ • Local port │  │ • Upload    │ ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Browser Automation Layer                          ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │                    Puppeteer-Extra + Stealth                        │ ││
│  │  │                                                                     │ ││
│  │  │  • puppeteer-extra-plugin-stealth (anti-detection)                 │ ││
│  │  │  • puppeteer-extra-plugin-user-preferences                         │ ││
│  │  │  • puppeteer-extra-plugin-user-data-dir                            │ ││
│  │  │                                                                     │ ││
│  │  │  Browser Launch Parameters:                                         │ ││
│  │  │  ┌───────────────────────────────────────────────────────────────┐ │ ││
│  │  │  │ --disable-blink-features=AutomationControlled               │ │ ││
│  │  │  │ --disable-features=IsolateOrigins,site-per-process          │ │ ││
│  │  │  │ --disable-site-isolation-trials                              │ │ ││
│  │  │  │ --user-data-dir=/tmp/profiles/{profile_id}                  │ │ ││
│  │  │  │ --proxy-server=127.0.0.1:{dynamic_port}                     │ │ ││
│  │  │  │ --window-size={width},{height}                               │ │ ││
│  │  │  │ --lang={language}                                            │ │ ││
│  │  │  └───────────────────────────────────────────────────────────────┘ │ ││
│  │  │                                                                     │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (Web Dashboard & Marketing)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ (App Router) | SSR for SEO, Server Actions, Edge-ready |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| State | Zustand + React Query | Simple state, smart data fetching |
| Forms | React Hook Form + Zod | Type-safe validation |
| Tables | TanStack Table | Virtual scrolling for 1000s of profiles |
| Auth | NextAuth.js | Multi-provider, session management |
| Analytics | Plausible/PostHog | Privacy-focused, self-hostable |
| Deployment | Cloudflare Pages | Global CDN, instant deploys |

### Backend (Cloudflare Workers)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Cloudflare Workers | Edge deployment, 0ms cold start |
| Database | Cloudflare D1 | SQLite at edge, ACID transactions |
| Storage | Cloudflare R2 | S3-compatible, zero egress fees |
| Cache | Cloudflare KV | Global key-value, <50ms reads |
| Queue | Cloudflare Queues | Async processing, retries |
| Cron | Cloudflare Cron Triggers | Scheduled tasks |

### Desktop Client

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20 LTS | Stable, Puppeteer-compatible |
| Browser | Puppeteer-Extra | Chromium automation + plugins |
| Anti-detect | puppeteer-extra-plugin-stealth | Essential for profile isolation |
| Proxy | proxy-chain | Auth proxy forwarding |
| Packaging | pkg or electron-builder | Single executable distribution |

---

## Core Features Breakdown

### 1. Profile Management (The Heart)

```
Profile = {
  identity: {
    id: UUID,
    name: "Amazon Store #1",
    group_id: "amazon-stores",
    tags: ["amazon", "usa", "main-seller"]
  },

  fingerprint: {
    template: "windows_chrome_desktop",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    platform: "Win32",
    screen: { width: 1920, height: 1080 },
    webgl: { vendor: "Google Inc.", renderer: "ANGLE..." },
    timezone: "America/New_York",
    language: "en-US",
    fonts: ["Arial", "Calibri", ...]
  },

  network: {
    proxy_id: "proxy-pool-usa-residential",  // Reference to proxy pool
    // OR
    proxy: "socks5://user:pass@1.2.3.4:1080"  // Direct config
  },

  session: {
    cookies_r2_key: "sessions/{profile_id}/cookies.gz",
    localStorage_r2_key: "sessions/{profile_id}/localStorage.gz",
    last_sync: 1701234567890,
    sync_hash: "a1b2c3d4..."
  },

  access: {
    owner_id: "user_123",
    team_id: "team_456",
    permissions: ["read", "launch", "edit"],  // For shared profiles
    locked_by: null,
    locked_at: null
  },

  metadata: {
    created_at: 1700000000000,
    last_active: 1701234567890,
    launch_count: 42,
    notes: "Main seller account, handle with care"
  }
}
```

### 2. Proxy Management (Resource Pool)

```
ProxyPool = {
  id: "proxy-pool-usa-residential",
  name: "USA Residential Pool",
  type: "rotating",  // "rotating" | "sticky" | "static"

  proxies: [
    {
      id: "proxy_1",
      protocol: "socks5",
      host: "us.smartproxy.com",
      port: 10000,
      username: "user123",
      password: "pass456",

      // Health monitoring
      status: "healthy",  // "healthy" | "degraded" | "offline"
      latency_ms: 45,
      last_check: 1701234567890,

      // Usage tracking
      profiles_using: ["profile_1", "profile_2"],
      bandwidth_used_mb: 1234
    }
  ],

  assignment_strategy: "round-robin",  // "round-robin" | "least-used" | "random" | "sticky"

  team_id: "team_456",
  created_at: 1700000000000
}
```

### 3. Team Collaboration

```
Team = {
  id: "team_456",
  name: "E-commerce Operations",
  owner_id: "user_123",

  members: [
    {
      user_id: "user_124",
      email: "alice@company.com",
      role: "admin",
      permissions: ["*"],
      joined_at: 1700000000000
    },
    {
      user_id: "user_125",
      email: "bob@company.com",
      role: "member",
      permissions: ["profiles:read", "profiles:launch"],
      group_access: ["amazon-stores"],  // Only access specific groups
      joined_at: 1700100000000
    }
  ],

  settings: {
    default_proxy_pool: "proxy-pool-usa-residential",
    require_2fa: true,
    audit_retention_days: 90
  },

  plan: {
    type: "team",
    profiles_limit: 100,
    members_limit: 10,
    storage_gb: 10
  }
}
```

### 4. Audit & Activity Log

```
AuditEntry = {
  id: UUID,
  timestamp: 1701234567890,

  actor: {
    user_id: "user_124",
    email: "alice@company.com",
    ip: "1.2.3.4",
    client_id: "abc123..."
  },

  action: "profile.launch",  // See action taxonomy below

  target: {
    type: "profile",
    id: "profile_789",
    name: "Amazon Store #1"
  },

  details: {
    proxy_used: "proxy_1",
    duration_minutes: 45,
    cookies_synced: true
  },

  team_id: "team_456"
}

// Action Taxonomy:
// profile.create, profile.update, profile.delete, profile.launch, profile.stop
// profile.sync, profile.lock, profile.unlock, profile.export, profile.import
// proxy.create, proxy.update, proxy.delete, proxy.check
// team.invite, team.remove, team.role_change
// settings.update, billing.subscribe, billing.cancel
```

---

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Authentication Layers                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: Web Dashboard (NextAuth.js)                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Email/Password → bcrypt hash → D1 users table                          ││
│  │  OAuth (Google, GitHub) → Account linking                                ││
│  │  Magic Links → Email verification                                        ││
│  │                                                                          ││
│  │  Session: HTTP-only cookie, 7-day expiry, sliding window               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  LAYER 2: API Authentication (Bearer Token)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  API Key: 64-char hex string, scoped to team                            ││
│  │  Format: "mk_live_" + 56 random hex chars                               ││
│  │                                                                          ││
│  │  Header: Authorization: Bearer mk_live_abc123...                        ││
│  │                                                                          ││
│  │  Validation:                                                             ││
│  │  1. Parse Bearer token                                                   ││
│  │  2. Hash with SHA-256                                                    ││
│  │  3. Lookup in D1 api_keys table                                         ││
│  │  4. Check: is_active, team_id, scopes, rate_limit                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  LAYER 3: Desktop Client Authentication                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  First Run: User enters API key → stored in secure local config         ││
│  │  Validation: Every API call includes Bearer token                        ││
│  │  Client ID: SHA-256(hostname + username) for lock tracking              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Security Measures

| Measure | Implementation | Protection Against |
|---------|----------------|-------------------|
| Rate Limiting | Cloudflare + KV counters | DDoS, brute force |
| API Key Hashing | SHA-256 before storage | Database leak |
| Session Encryption | AES-256 for R2 data | Data breach |
| HTTPS Everywhere | Cloudflare SSL | MITM |
| CORS | Strict origin whitelist | Cross-site attacks |
| Input Validation | Zod schemas | Injection attacks |
| Audit Logging | All actions logged | Compliance, forensics |
| 2FA | TOTP for team plans | Account takeover |

---

## Pricing Model

### Tier Structure

| Feature | Free | Pro ($12/mo) | Team ($29/mo) |
|---------|------|--------------|---------------|
| Profiles | 5 | 50 | 200 |
| Cloud Sync | Yes | Yes | Yes |
| Proxy Pool | No | Yes (10) | Yes (50) |
| Team Members | No | No | 5 |
| API Access | No | Yes | Yes |
| Priority Support | No | Email | Chat |
| Custom Fingerprints | No | No | Yes |
| Audit Log | No | 7 days | 90 days |
| Storage | 100MB | 2GB | 10GB |

### Revenue Model

```
Year 1 Projections (Conservative):
├── Free users: 5,000 (100 MAU conversion rate from SEO)
├── Pro conversions: 5% = 250 users × $12 = $3,000/mo
├── Team conversions: 1% = 50 teams × $29 = $1,450/mo
├── Monthly Revenue: $4,450
└── Annual Revenue: $53,400

Year 1 Costs:
├── Cloudflare Workers: $5/mo (included in Pro plan)
├── D1: Free tier sufficient
├── R2: ~$15/mo at scale (0.015/GB/mo)
├── Domain + Email: $50/year
├── Development time: Your time
└── Total Monthly Cost: ~$20

Gross Margin: 99%+ (SaaS dream)
```

---

## Development Philosophy

### Principles

1. **Edge-First**: Everything runs at the edge. No cold starts, global presence.

2. **Profile = Asset**: Every design decision prioritizes profile integrity and quick access.

3. **Graceful Degradation**: Offline-capable client, queue failed syncs for retry.

4. **Security by Default**: Never trust client data, validate everything server-side.

5. **Modular Services**: Each feature is a separate service file, testable in isolation.

---

## Document Map

This blueprint is supported by detailed specifications:

| Document | Purpose |
|----------|---------|
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | Worker structure, services, routing |
| [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | Next.js setup, layouts, components |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | D1 tables, R2 structure, migrations |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | Full API reference, OpenAPI style |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | UI component specs for dashboard |
| [ROUTING_SITEMAP.md](./ROUTING_SITEMAP.md) | Complete URL structure |
| [SEO_CONTENT_STRATEGY.md](./SEO_CONTENT_STRATEGY.md) | Content plan, keyword strategy |
| [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | Phase-by-phase implementation |
| [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) | Security measures, GDPR |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Optimization techniques |

---

## Quick Start for Developers

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/your-org/multilogin.io.git
cd multilogin.io

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Cloudflare credentials

# Start development
npm run dev          # Next.js frontend on :3000
npm run worker:dev   # Worker on :8787
```

### Project Structure

```
multilogin.io/
├── apps/
│   ├── web/                 # Next.js application
│   │   ├── app/
│   │   │   ├── (marketing)/ # Public pages (/, /features, /pricing)
│   │   │   ├── (auth)/      # /login, /register
│   │   │   ├── dashboard/   # Protected app routes
│   │   │   └── api/         # API routes (NextAuth, webhooks)
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, API client
│   │   └── styles/          # Global styles
│   │
│   └── worker/              # Cloudflare Worker
│       ├── src/
│       │   ├── index.ts     # Entry point, router
│       │   ├── services/    # Business logic
│       │   ├── middleware/  # Auth, validation, logging
│       │   └── utils/       # Helpers
│       ├── schema/          # D1 migrations
│       └── wrangler.toml    # Cloudflare config
│
├── packages/
│   ├── client/              # Desktop client (Node.js/Electron)
│   ├── shared/              # Shared types, constants
│   └── ui/                  # Shared UI components (optional)
│
├── docs/                    # Technical documentation
└── scripts/                 # Build, deploy scripts
```

---

## Success Metrics

### Technical KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Latency (p95) | <100ms | Cloudflare Analytics |
| Sync Success Rate | >99.5% | Custom logging |
| Profile Launch Time | <3s | Client telemetry |
| Detection Rate | <5% | Manual testing |
| Uptime | 99.9% | Cloudflare Status |

### Business KPIs

| Metric | Target (Month 6) | Measurement |
|--------|------------------|-------------|
| Monthly Active Users | 1,000 | Analytics |
| Free → Pro Conversion | 5% | Stripe |
| Pro → Team Conversion | 15% | Stripe |
| Monthly Churn | <5% | Stripe |
| NPS | >50 | Survey |

---

## Next Steps

1. **Read** [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for the implementation timeline
2. **Setup** your development environment following the Quick Start guide
3. **Start** with Phase 1: Core Backend (see roadmap)
4. **Join** the discussion in GitHub Issues for questions

---

*This document is the source of truth for Multilogin.io architecture. All other documentation should align with the principles and structures defined here.*
