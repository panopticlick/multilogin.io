# Multilogin.io

Cloud-synchronized browser profile management platform built with Next.js 16 and Cloudflare Workers.

## Architecture

- **Next.js 16 Web App** (`src/`) - Marketing site and dashboard
- **Cloudflare Worker API** (`worker/`) - Hono-based backend with D1/R2/KV
- **Desktop Client** (`packages/client/`) - Puppeteer-based CLI for launching browser profiles

## Features

- 🔒 **Free Forever** - No paywalls, no subscriptions
- 🌐 **Browser Profiles** - Manage multiple isolated browser sessions
- 🔐 **End-to-End Encryption** - Proxy passwords encrypted with AES-256-GCM
- 🌍 **Proxy Management** - HTTP, SOCKS5, rotating proxies
- 👥 **Team Collaboration** - Share profiles with team members
- 📊 **Time Machine** - Profile snapshot and restore
- 🤖 **API Access** - RESTful API with authentication
- 📜 **Audit Logs** - Track all profile and team activities

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Cloudflare account

### Installation

```bash
# Install dependencies
npm install
cd worker && npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Start worker dev server
cd worker && npm run dev
```

## Deployment

Deployment is automated via GitHub Actions when pushing to `main` branch.

### GitHub Secrets Required

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers and Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Manual Deployment

```bash
# Deploy Worker
cd worker
npm run deploy

# Deploy Web to Cloudflare Pages
npm run build
npx wrangler pages deploy .next --project-name=multilogin-web
```

## License

All rights reserved.
