# 前端部署方案

## 问题说明

Cloudflare Pages 目前无法部署 Next.js 16 应用，原因：
- `@cloudflare/next-on-pages` 适配器仅支持 Next.js 14.3.0 到 15.5.2
- Next.js 16 不支持 static export（因为应用使用了 API 路由和服务端功能）

## 推荐方案：部署到 Vercel

Vercel 是 Next.js 的官方托管平台，原生支持 Next.js 16。

### 步骤 1: 安装 Vercel CLI

```bash
npm i -g vercel
```

### 步骤 2: 登录 Vercel

```bash
vercel login
```

### 步骤 3: 配置环境变量

创建 `.env.production` 文件：

```env
NEXT_PUBLIC_API_URL=https://multilogin-api.panopticlick.workers.dev
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app

# OAuth (可选)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 步骤 4: 部署

```bash
# 首次部署
vercel

# 生产部署
vercel --prod
```

### 步骤 5: 在 Vercel Dashboard 配置环境变量

访问 https://vercel.com/dashboard 添加环境变量：
- `NEXT_PUBLIC_API_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- OAuth 配置（如需要）

## 方案 2: 降级到 Next.js 15

如果必须使用 Cloudflare Pages：

```bash
npm install next@15.5.2 react@19 react-dom@19
npm install --save-dev @cloudflare/next-on-pages
```

然后按照 [@cloudflare/next-on-pages 文档](https://github.com/cloudflare/next-on-pages) 配置。

**注意**: 这会失去 Next.js 16 的新功能。

## 方案 3: 混合部署（当前推荐）

- **API**: Cloudflare Workers ✅ 已部署
- **前端**: Vercel (Next.js 16)

这种方案的优势：
- ✅ 使用 Next.js 16 最新功能
- ✅ API 在 Cloudflare Workers（低延迟、全球分布）
- ✅ 前端在 Vercel（最佳 Next.js 支持）
- ✅ 独立扩展前后端

### 配置 CORS

由于前后端分离，需要在 Worker 中配置 CORS：

编辑 `worker/src/index.ts`，添加 CORS 头：

```typescript
app.use('*', async (c, next) => {
  // CORS for Vercel frontend
  c.res.headers.set('Access-Control-Allow-Origin', 'https://your-vercel-domain.vercel.app');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
});
```

## 自动部署设置

### Vercel 自动部署

1. 在 Vercel Dashboard 导入 GitHub 仓库
2. 选择 Next.js 框架
3. 设置构建命令: `npm run build`
4. 设置输出目录: `.next`
5. 添加环境变量
6. 每次推送到 main 分支自动部署

### GitHub Actions (可选)

创建 `.github/workflows/deploy-vercel.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

需要在 GitHub Secrets 中添加 `VERCEL_TOKEN`。

## 未来计划

当 `@cloudflare/next-on-pages` 更新支持 Next.js 16 时，可以迁移回 Cloudflare Pages：

1. 安装最新版 `@cloudflare/next-on-pages`
2. 按照官方文档配置
3. 取消注释 `.github/workflows/deploy.yml` 中的 `deploy-web` 作业
4. 推送代码自动部署

## 监控状态

追踪 @cloudflare/next-on-pages 支持 Next.js 16 的进展：
- GitHub Issue: https://github.com/cloudflare/next-on-pages/issues
- 订阅 Release: https://github.com/cloudflare/next-on-pages/releases
