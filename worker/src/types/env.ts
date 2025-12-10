// Cloudflare Worker Environment Bindings
export interface Env {
  // D1 Database
  DB: D1Database;

  // R2 Storage
  R2: R2Bucket;

  // KV Namespace
  KV: KVNamespace;

  // Secrets (set via wrangler secret)
  JWT_SECRET: string;
  INTERNAL_WEBHOOK_SECRET?: string;

  // Environment info
  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

export type Plan = 'free';

// Auth context added to requests
export interface AuthContext {
  userId: string;
  teamId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  plan: Plan;
  apiKeyId?: string;
}

// Hono types
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}
