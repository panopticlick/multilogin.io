import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { errors } from '../middleware/error';
import { ipRateLimitMiddleware } from '../middleware/rateLimit';

const app = new Hono<{ Bindings: Env }>();

// Schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Generate ID
function generateId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

// Hash password using Web Crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `pbkdf2:${saltHex}:${hashHex}`;
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [, saltHex, expectedHash] = hash.split(':');
  if (!saltHex || !expectedHash) return false;

  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex === expectedHash;
}

// Generate JWT
async function generateJWT(
  payload: { sub: string; teamId: string; role: string },
  secret: string,
  expiresIn: number = 7 * 24 * 60 * 60 // 7 days
): Promise<string> {
  const encoder = new TextEncoder();

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
    iss: 'multilogin.io',
  };

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(fullPayload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// POST /api/v1/auth/register
app.post('/register', async (c) => {
  // IP rate limiting
  const rateLimit = await ipRateLimitMiddleware(c, 'register', 3, 3600);
  if (rateLimit.limited) {
    return c.json(
      {
        success: false,
        error: 'Too many registration attempts',
        retryAfter: rateLimit.retryAfter,
      },
      429
    );
  }

  const body = await c.req.json();
  const data = registerSchema.parse(body);

  // Check if email exists
  const existing = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`)
    .bind(data.email.toLowerCase())
    .first();

  if (existing) {
    throw errors.conflict('Email already registered');
  }

  const now = Date.now();
  const userId = generateId('usr');
  const teamId = generateId('team');
  const passwordHash = await hashPassword(data.password);

  // Create user, team, and team membership in a transaction
  await c.env.DB.batch([
    c.env.DB.prepare(`
      INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, data.email.toLowerCase(), data.name, passwordHash, now, now),

    c.env.DB.prepare(`
      INSERT INTO teams (id, name, plan, owner_id, created_at, updated_at)
      VALUES (?, ?, 'free', ?, ?, ?)
    `).bind(teamId, `${data.name}'s Team`, userId, now, now),

    c.env.DB.prepare(`
      INSERT INTO team_members (id, team_id, user_id, role, joined_at)
      VALUES (?, ?, ?, 'owner', ?)
    `).bind(generateId('tm'), teamId, userId, now),
  ]);

  // Generate JWT
  const token = await generateJWT({ sub: userId, teamId, role: 'owner' }, c.env.JWT_SECRET);

  return c.json({
    success: true,
    data: {
      user: {
        id: userId,
        email: data.email.toLowerCase(),
        name: data.name,
      },
      team: {
        id: teamId,
        name: `${data.name}'s Team`,
        plan: 'free',
      },
      token,
    },
  });
});

// POST /api/v1/auth/login
app.post('/login', async (c) => {
  // IP rate limiting
  const rateLimit = await ipRateLimitMiddleware(c, 'login', 5, 300);
  if (rateLimit.limited) {
    return c.json(
      {
        success: false,
        error: 'Too many login attempts',
        retryAfter: rateLimit.retryAfter,
      },
      429
    );
  }

  const body = await c.req.json();
  const data = loginSchema.parse(body);

  // Find user
  const user = await c.env.DB.prepare(`
    SELECT id, email, name, password_hash, image
    FROM users WHERE email = ?
  `)
    .bind(data.email.toLowerCase())
    .first<{ id: string; email: string; name: string; password_hash: string; image: string }>();

  if (!user || !user.password_hash) {
    throw errors.unauthorized('Invalid email or password');
  }

  // Verify password
  const valid = await verifyPassword(data.password, user.password_hash);
  if (!valid) {
    throw errors.unauthorized('Invalid email or password');
  }

  // Get team membership
  const member = await c.env.DB.prepare(`
    SELECT tm.team_id, tm.role, t.name as team_name, t.plan
    FROM team_members tm
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.user_id = ?
    LIMIT 1
  `)
    .bind(user.id)
    .first<{ team_id: string; role: string; team_name: string; plan: string }>();

  if (!member) {
    throw errors.serverError('User has no team membership');
  }

  // Generate JWT
  const token = await generateJWT(
    { sub: user.id, teamId: member.team_id, role: member.role },
    c.env.JWT_SECRET
  );

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      team: {
        id: member.team_id,
        name: member.team_name,
        plan: 'free',
        role: member.role,
      },
      token,
    },
  });
});

// POST /api/v1/auth/create-reset-token (internal use by Next.js API)
app.post('/create-reset-token', async (c) => {
  const body = await c.req.json();
  const { email, token, expiresAt } = body;

  if (!email || !token || !expiresAt) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }

  // Find user
  const user = await c.env.DB.prepare(`SELECT id, name FROM users WHERE email = ?`)
    .bind(email.toLowerCase())
    .first<{ id: string; name: string }>();

  if (!user) {
    // Return success but with no name to prevent enumeration
    return c.json({ success: true, data: {} });
  }

  // Store reset token in KV with expiration
  await c.env.KV.put(
    `password_reset:${token}`,
    JSON.stringify({ userId: user.id, email: email.toLowerCase() }),
    { expirationTtl: 3600 } // 1 hour TTL
  );

  return c.json({
    success: true,
    data: { name: user.name },
  });
});

// POST /api/v1/auth/forgot-password
app.post('/forgot-password', async (c) => {
  const rateLimit = await ipRateLimitMiddleware(c, 'forgot-password', 3, 3600);
  if (rateLimit.limited) {
    return c.json(
      {
        success: false,
        error: 'Too many requests',
        retryAfter: rateLimit.retryAfter,
      },
      429
    );
  }

  const body = await c.req.json();
  forgotPasswordSchema.parse(body);

  // Always return success to prevent email enumeration
  return c.json({
    success: true,
    message: 'If an account exists with that email, a password reset link will be sent.',
  });
});

// POST /api/v1/auth/reset-password
app.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const data = resetPasswordSchema.parse(body);

  // Verify token from KV
  const tokenData = await c.env.KV.get(`password_reset:${data.token}`);
  if (!tokenData) {
    return c.json(
      { success: false, error: 'Invalid or expired reset token' },
      400
    );
  }

  const { userId, email } = JSON.parse(tokenData);

  // Hash new password
  const passwordHash = await hashPassword(data.password);

  // Update user password
  await c.env.DB.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`)
    .bind(passwordHash, Date.now(), userId)
    .run();

  // Delete used token
  await c.env.KV.delete(`password_reset:${data.token}`);

  // Log the action
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, 'system', ?, 'password.reset', 'user', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    userId,
    userId,
    JSON.stringify({ email }),
    c.req.header('CF-Connecting-IP') || 'unknown',
    c.req.header('User-Agent') || 'unknown',
    Date.now()
  ).run();

  return c.json({
    success: true,
    message: 'Password reset successfully',
  });
});

// POST /api/v1/auth/oauth - Handle OAuth user registration/login
const oauthSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  image: z.string().optional(),
  provider: z.enum(['google', 'github']),
  providerAccountId: z.string().min(1, 'Provider account ID is required'),
});

app.post('/oauth', async (c) => {
  const body = await c.req.json();
  const data = oauthSchema.parse(body);

  const now = Date.now();
  const email = data.email.toLowerCase();

  // Check if user exists with this email
  let user = await c.env.DB.prepare(`
    SELECT u.id, u.email, u.name, u.image, u.email_verified
    FROM users u
    WHERE u.email = ?
  `)
    .bind(email)
    .first<{ id: string; email: string; name: string; image: string; email_verified: number }>();

  // Check if OAuth account is already linked
  const existingAccount = await c.env.DB.prepare(`
    SELECT id, user_id FROM accounts
    WHERE provider = ? AND provider_account_id = ?
  `)
    .bind(data.provider, data.providerAccountId)
    .first<{ id: string; user_id: string }>();

  if (existingAccount) {
    // Account exists, get the user
    user = await c.env.DB.prepare(`
      SELECT id, email, name, image FROM users WHERE id = ?
    `)
      .bind(existingAccount.user_id)
      .first<{ id: string; email: string; name: string; image: string }>();
  } else if (user) {
    // User exists but OAuth account not linked, link it
    const accountId = generateId('acc');
    await c.env.DB.prepare(`
      INSERT INTO accounts (id, user_id, type, provider, provider_account_id, created_at)
      VALUES (?, ?, 'oauth', ?, ?, ?)
    `).bind(accountId, user.id, data.provider, data.providerAccountId, now).run();

    // Mark email as verified since OAuth provider verified it
    if (!user.email_verified) {
      await c.env.DB.prepare(`UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?`)
        .bind(now, user.id)
        .run();
    }
  } else {
    // New user - create user, team, membership, and link account
    const userId = generateId('usr');
    const teamId = generateId('team');
    const accountId = generateId('acc');

    await c.env.DB.batch([
      // Create user (no password for OAuth users)
      c.env.DB.prepare(`
        INSERT INTO users (id, email, name, image, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `).bind(userId, email, data.name, data.image || null, now, now),

      // Create team
      c.env.DB.prepare(`
        INSERT INTO teams (id, name, plan, owner_id, created_at, updated_at)
        VALUES (?, ?, 'free', ?, ?, ?)
      `).bind(teamId, `${data.name}'s Team`, userId, now, now),

      // Create team membership
      c.env.DB.prepare(`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (?, ?, ?, 'owner', ?)
      `).bind(generateId('tm'), teamId, userId, now),

      // Link OAuth account
      c.env.DB.prepare(`
        INSERT INTO accounts (id, user_id, type, provider, provider_account_id, created_at)
        VALUES (?, ?, 'oauth', ?, ?, ?)
      `).bind(accountId, userId, data.provider, data.providerAccountId, now),
    ]);

    user = { id: userId, email, name: data.name, image: data.image || '' };
  }

  if (!user) {
    throw errors.serverError('Failed to create or find user');
  }

  // Get team membership
  const member = await c.env.DB.prepare(`
    SELECT tm.team_id, tm.role, t.name as team_name, t.plan
    FROM team_members tm
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.user_id = ?
    LIMIT 1
  `)
    .bind(user.id)
    .first<{ team_id: string; role: string; team_name: string; plan: string }>();

  if (!member) {
    throw errors.serverError('User has no team membership');
  }

  // Generate JWT
  const token = await generateJWT(
    { sub: user.id, teamId: member.team_id, role: member.role },
    c.env.JWT_SECRET
  );

  // Log the OAuth sign in
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'auth.oauth_login', 'user', ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    member.team_id,
    user.id,
    user.id,
    JSON.stringify({ provider: data.provider }),
    c.req.header('CF-Connecting-IP') || 'unknown',
    c.req.header('User-Agent') || 'unknown',
    now
  ).run();

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      team: {
        id: member.team_id,
        name: member.team_name,
        plan: 'free',
        role: member.role,
      },
      token,
    },
  });
});

// GET /api/v1/auth/me (requires auth - for verifying token)
app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw errors.unauthorized();
  }

  // This will be handled by auth middleware in protected routes
  // For now, return unauthorized
  return c.json({ success: false, error: 'Use /api/v1/users/me for authenticated requests' }, 400);
});

export { app as authRoutes };
