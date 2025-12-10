# 部署指南

## Cloudflare 资源

已创建的资源：

### Worker API
- **名称**: multilogin-api
- **URL**: https://multilogin-api.panopticlick.workers.dev
- **环境**: production

### D1 Database
- **名称**: multilogin-db
- **UUID**: 45f371a0-ee5a-4449-9d2c-f87920c7649d
- **迁移**: 5个迁移已应用

### KV Namespace  
- **名称**: multilogin-kv
- **ID**: a865c3fe71c643d5a408faa521c3a3b3
- **用途**: Rate limiting 和 caching

### Cloudflare Pages
- **名称**: multilogin-web
- **URL**: https://multilogin-web.pages.dev
- **分支**: main

### R2 Bucket
- **状态**: 需要在 Dashboard 中启用 R2
- **名称**: multilogin-sessions (待创建)

## GitHub Secrets

已配置的 Secrets：
- `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID` - Account ID: 201945e73bc3a4f6f77de30504c0687f

## Worker Secrets

已设置的 Secrets (via `wrangler secret put`):
- `JWT_SECRET` - JWT signing secret

## 自动部署

### GitHub Actions 工作流

1. **CI 工作流** (`.github/workflows/ci.yml`)
   - 触发：Push to main, Pull requests
   - 步骤：Lint, TypeCheck, Build, E2E tests, Worker tests

2. **Deploy 工作流** (`.github/workflows/deploy.yml`)
   - 触发：Push to main
   - 步骤：
     - Deploy Worker to Cloudflare Workers
     - Build Next.js
     - Deploy to Cloudflare Pages

## 手动部署

### Worker
```bash
cd worker
npm run deploy
```

### Web (Cloudflare Pages)
```bash
npm run build
npx wrangler pages deploy .next --project-name=multilogin-web
```

## 数据库迁移

### 应用迁移到生产环境
```bash
cd worker
wrangler d1 migrations apply multilogin-db --remote
```

### 应用迁移到本地环境
```bash
cd worker
wrangler d1 migrations apply multilogin-db --local
```

## 环境变量

### Next.js (.env.local)
```env
NEXT_PUBLIC_API_URL=https://multilogin-api.panopticlick.workers.dev
AUTH_SECRET=your-secret-here
NEXTAUTH_SECRET=your-secret-here
# OAuth providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## 待完成任务

1. **自定义域名**
   - 将 multilogin.io 添加到 Cloudflare
   - 取消注释 wrangler.toml 中的 routes 配置

2. **R2 Bucket**
   - 在 Cloudflare Dashboard 中启用 R2
   - 创建 multilogin-sessions bucket
   - 取消注释 wrangler.toml 中的 R2 配置

3. **OAuth 配置**
   - 配置 Google OAuth
   - 配置 GitHub OAuth

4. **升级 Cron Triggers (付费计划)**
   - 免费版限制：3个 cron triggers
   - 如需更多定时任务，升级到付费计划

## 监控

- Worker 日志: Cloudflare Dashboard > Workers > multilogin-api > Logs
- Pages 部署: Cloudflare Dashboard > Pages > multilogin-web
- D1 Database: Cloudflare Dashboard > D1 > multilogin-db

## 链接

- GitHub 仓库: https://github.com/panopticlick/multilogin.io
- Worker URL: https://multilogin-api.panopticlick.workers.dev
- Pages URL: https://multilogin-web.pages.dev
