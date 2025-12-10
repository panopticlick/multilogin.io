# Repository Guidelines

## Project Structure & Module Organization
The Next.js app lives in `src/app` with routed groups such as `(marketing)`, `(dashboard)`, and `(auth)`—scope new screens to the segment whose layout they need. Shared UI, hooks, state, and utilities stay in `src/components`, `src/hooks`, `src/store`, and `src/lib`, imported through the `@/` alias in `tsconfig.json`. Cloudflare Worker logic (Hono routes, middleware, and D1 migrations) is isolated in `worker/`, while the desktop/CLI wrapper lives in `packages/client` and compiles to `dist`.

## Build, Test, and Development Commands
- `npm run dev` / `npm run build` / `npm run start` – start the App Router dev server, build, and serve the compiled app.
- `npm run lint` – run the Next + Core Web Vitals ESLint suite.
- `cd worker && npm run dev | deploy | db:migrate` – invoke Wrangler locally, deploy, or apply SQL from `worker/migrations`.
- `cd packages/client && npm run dev | build | typecheck | pkg:mac` – work on the CLI, bundle with `tsup`, and emit binaries via the `pkg:*` scripts.

## Coding Style & Naming Conventions
Use TypeScript with strict mode and keep files server-side unless they begin with `'use client'`. Components and hooks follow `PascalCase` file names, shared utilities stay camelCase. Tailwind tokens in `tailwind.config.ts` (variables like `--primary`) provide theming—extend via `@apply` in `src/app/globals.css` instead of custom hex codes. Run `npm run lint` before pushing; worker code also uses `npm run format` to enforce Prettier.

## Testing Guidelines
Docs prescribe Vitest for both worker services and UI utilities (`docs/BACKEND_ARCHITECTURE.md`). Co-locate specs under `tests/` or `__tests__` (e.g., `worker/tests/services/ProfileService.test.ts`) and mock D1 bindings. Target >80% coverage on services, add hook/component specs with Vitest + React Testing Library, and justify any gaps in the PR.

## Commit & Pull Request Guidelines
Follow the `type(scope): description` convention from `docs/DEVELOPMENT_ROADMAP.md`, using scopes like `web`, `api`, `client`, or `docs` (e.g., `feat(api): add proxy rotation caps`). Branch from `develop`, keep diffs small, and raise PRs with passing tests, clean TypeScript, lint results, and updated docs. Link issues and attach UI screenshots or terminal captures when behavior changes.

## Security & Configuration Tips
Store Next.js secrets in `.env.local` and Cloudflare tokens with `wrangler secret put` as shown in `worker/wrangler.toml`. Rotate `API_SECRET`, `JWT_SECRET`, and Stripe keys when debugging in shared sandboxes. Before syncing schema changes, run `wrangler d1 migrations apply multilogin-db --local` and note new env vars in the appropriate doc.
