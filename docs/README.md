# Multilogin.io Documentation

## Production-Grade Multi-Browser Profile Management System

This documentation provides complete technical specifications for building Multilogin.io - a cloud-synchronized browser profile management platform.

---

## Quick Start

**New to the project?** Start here:

1. Read [BLUEPRINT.md](./BLUEPRINT.md) - Understand the big picture
2. Read [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - See the implementation plan
3. Set up your environment (see below)
4. Start building Phase 1

---

## Document Index

### Architecture & Design

| Document | Description |
|----------|-------------|
| [BLUEPRINT.md](./BLUEPRINT.md) | **Master architecture document** - system overview, tech stack, core features, pricing model |
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | Cloudflare Worker structure, services, middleware, testing |
| [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | Next.js 14 setup, layouts, state management, API client |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | D1 tables, R2 structure, KV usage, migrations |

### Specifications

| Document | Description |
|----------|-------------|
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | Complete API reference - all endpoints, request/response formats |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | UI component specs - design system, shadcn/ui components |
| [ROUTING_SITEMAP.md](./ROUTING_SITEMAP.md) | URL structure - marketing site, dashboard, auth flows |

### Strategy & Planning

| Document | Description |
|----------|-------------|
| [SEO_CONTENT_STRATEGY.md](./SEO_CONTENT_STRATEGY.md) | Keyword strategy, content pillars, E-E-A-T, conversion |
| [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | 12-week phased implementation with daily tasks |
| [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) | Security measures, OWASP, GDPR compliance |

### Reference

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Optimization techniques for production (original doc) |

---

## Technology Stack Summary

### Backend (Cloudflare)

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Cache:** Cloudflare KV
- **Framework:** Hono

### Frontend (Next.js)

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + TanStack Query
- **Deployment:** Cloudflare Pages

### Desktop Client

- **Runtime:** Node.js 20
- **Browser:** Puppeteer-Extra + Stealth
- **Proxy:** proxy-chain

---

## Project Structure

```
multilogin.io/
├── apps/
│   ├── web/                 # Next.js application
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities, API client
│   │
│   └── worker/             # Cloudflare Worker
│       ├── src/            # Worker source code
│       ├── schema/         # D1 migrations
│       └── wrangler.toml   # Cloudflare config
│
├── packages/
│   ├── client/             # Desktop client
│   └── shared/             # Shared types
│
├── docs/                   # This documentation
│
└── scripts/                # Build scripts
```

---

## Development Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Core Backend | Weeks 1-2 |
| 2 | Web Dashboard | Weeks 3-4 |
| 3 | Desktop Client | Weeks 5-6 |
| 4 | Team Features | Weeks 7-8 |
| 5 | Marketing & Launch | Weeks 9-10 |
| 6 | Polish & Scale | Weeks 11-12 |

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for detailed daily tasks.

---

## Key Concepts

### Profile = Asset

A profile represents a complete browser identity:
- Unique fingerprint (user agent, screen, WebGL, etc.)
- Session data (cookies, localStorage)
- Proxy configuration
- Metadata (name, tags, notes)

### Cloud Sync

Unlike competitors, Multilogin.io syncs everything to the cloud:
- Profiles sync across devices
- Teams share profiles in real-time
- No data loss if computer crashes

### Locking

When someone launches a profile, it's locked:
- Prevents concurrent access
- Heartbeat keeps lock alive
- Auto-releases after 5 minutes of inactivity

---

## Environment Setup

### Prerequisites

- Node.js 20 LTS
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/multilogin.io.git
cd multilogin.io

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development servers
npm run dev:web      # Next.js on :3000
npm run dev:worker   # Worker on :8787
```

### Cloudflare Setup

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create multilogin

# Create R2 bucket
wrangler r2 bucket create multilogin-sessions

# Create KV namespace
wrangler kv:namespace create KV

# Update wrangler.toml with IDs

# Run migrations
wrangler d1 migrations apply multilogin --local
```

---

## Contributing

### Code Style

- TypeScript strict mode
- ESLint with Airbnb config
- Prettier for formatting
- Conventional commits

### PR Requirements

- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Reviewed by one person

### Branch Strategy

```
main           # Production
└── develop    # Integration
    ├── feature/xxx
    └── fix/xxx
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/multilogin.io/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/multilogin.io/discussions)
- **Email:** support@multilogin.io

---

## License

This project is proprietary software. See LICENSE file for details.

---

*Documentation last updated: December 2024*
