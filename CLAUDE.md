# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multilogin.io is a cloud-synchronized browser profile management platform:
- **Next.js 16 Web App** (`src/`) - Marketing site and dashboard
- **Cloudflare Worker API** (`worker/`) - Hono-based backend with D1/R2/KV
- **Desktop Client** (`packages/client/`) - Puppeteer-based CLI for launching browser profiles

## Commands

### Web Application (root)
```bash
npm run dev                    # Dev server on :3000
npm run build                  # Production build
npm run lint                   # ESLint
npm run test:e2e               # All E2E tests
npx playwright test tests/e2e/time-machine.spec.ts  # Single test file
```

### Cloudflare Worker (`worker/`)
```bash
cd worker
npm run dev                    # Local dev server (:8787)
npm run deploy                 # Deploy to Cloudflare
npm run deploy:staging         # Deploy to staging
npm run db:migrate             # Apply D1 migrations (remote)
npm run db:migrate:local       # Apply D1 migrations (local)
npm run db:studio              # Open D1 Studio UI
npm run test                   # Vitest unit tests
npx vitest run tests/services/fingerprint-policy.test.ts  # Single test
```

### Desktop Client (`packages/client/`)
```bash
cd packages/client
npm run dev                    # Watch mode with tsx
npm run build                  # Build with tsup
npm run typecheck              # Type check only
npm run pkg:mac                # Build macOS binary
npm run pkg:all                # Build all platform binaries
```

## Architecture

### Route Groups (Next.js App Router)
- `(marketing)/` - Public pages (/, /features, /pricing, /blog, /docs)
- `(auth)/` - Auth flows (/login, /register, /forgot-password)
- `(dashboard)/` - Protected dashboard (/dashboard/profiles, /proxies, /team, etc.)

### API Routes (`worker/src/`)
Public routes (no auth): `/api/v1/auth/*`, `/api/v1/templates/*`, `/health`
Protected routes: `/api/v1/profiles`, `/groups`, `/proxies`, `/teams`, `/sync`, `/users`, `/fingerprint/*`, `/timemachine`, `/scripts`

Worker bindings (from `wrangler.toml`):
- `DB` - D1 database
- `R2` - Session storage bucket
- `KV` - Rate limiting and cache

### State Management
- **Server state**: TanStack Query
- **Client state**: Zustand (`src/store/`)
- **Auth**: NextAuth.js v5 beta with JWT strategy (`src/lib/auth.ts`)

### Styling
- Tailwind CSS 4 with theme tokens in `tailwind.config.ts`
- CSS variables in `src/app/globals.css`
- Extend via `@apply`, avoid hardcoded hex values

## Code Conventions

- TypeScript strict mode
- `@/*` path alias → `./src/*`
- Server components by default; `'use client'` only when needed
- PascalCase for components/hooks, camelCase for utilities
- Commit format: `type(scope): description` (scopes: web, api, client, docs)

## Testing

**E2E** (Playwright): `tests/e2e/*.spec.ts` - test server runs on `127.0.0.1:3100`
**Worker unit tests** (Vitest): `worker/tests/` - mock D1 bindings, co-locate with services

## Environment Variables

### Next.js (`.env.local`)
- `NEXT_PUBLIC_API_URL` - Worker API endpoint
- `AUTH_SECRET`, `NEXTAUTH_SECRET` - NextAuth secrets
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - OAuth

### Worker (`wrangler secret put`)
- `JWT_SECRET` - JWT signing
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Billing
