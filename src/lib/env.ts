// Environment variable validation for Next.js app

import { z } from 'zod';

const envSchema = z.object({
  // Public environment variables
  NEXT_PUBLIC_API_URL: z.string().url().optional().default('https://api.multilogin.io'),

  // Server-only environment variables
  AUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // OAuth providers (optional, only required if OAuth is used)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email configuration
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional().default('noreply@multilogin.io'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);

    // In development, just warn. In production, throw.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables. Check server logs.');
    }
  }

  return parsed.data ?? ({} as Env);
}

// Validate on module load
export const env = validateEnv();

// Helper to check if auth is properly configured
export function isAuthConfigured(): boolean {
  return !!(env.AUTH_SECRET || env.NEXTAUTH_SECRET);
}

// Helper to check if OAuth providers are configured
export function isGoogleOAuthConfigured(): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function isGitHubOAuthConfigured(): boolean {
  return !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

// Helper to check if email is configured
export function isEmailConfigured(): boolean {
  return !!env.RESEND_API_KEY;
}
