# Security & Compliance

## Security Philosophy

Security isn't a feature. It's a foundation. Every line of code assumes:
1. User input is malicious
2. Networks are compromised
3. Databases will be breached
4. Employees make mistakes

Build defenses accordingly.

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 1: EDGE (Cloudflare)                         │
│  • DDoS protection (automatic)                                               │
│  • WAF rules (OWASP Top 10)                                                  │
│  • Bot management                                                            │
│  • Rate limiting                                                             │
│  • SSL/TLS termination                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 2: APPLICATION                               │
│  • Input validation (Zod schemas)                                            │
│  • Authentication (API keys, JWT)                                            │
│  • Authorization (RBAC)                                                      │
│  • CORS configuration                                                        │
│  • Security headers                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 3: DATA                                      │
│  • Encryption at rest (D1, R2)                                               │
│  • Encryption in transit (TLS 1.3)                                           │
│  • API key hashing (SHA-256)                                                 │
│  • Password hashing (bcrypt)                                                 │
│  • PII minimization                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Security

### API Key Management

**Key Generation:**
```typescript
// Secure key generation
function generateAPIKey(): string {
  const prefix = 'mk_live_';
  const randomBytes = crypto.getRandomValues(new Uint8Array(28));
  const randomPart = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return prefix + randomPart; // 64 chars total
}

// Key hashing for storage
async function hashAPIKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

**Key Display:**
- Show full key only once at creation
- Store only SHA-256 hash in database
- Store first 8 chars as `token_prefix` for identification
- Never log or expose full keys

**Key Rotation:**
- Encourage regular rotation (90 days)
- Allow multiple active keys per user
- Provide key revocation
- Grace period for old keys (optional)

### Password Security

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- No common passwords (check against list)

**Hashing:**
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Session Management

**JWT Configuration:**
```typescript
const JWT_CONFIG = {
  algorithm: 'HS256',
  expiresIn: '7d',
  issuer: 'multilogin.io'
};

// Payload structure
interface JWTPayload {
  sub: string;      // User ID
  teamId: string;   // Team ID
  role: string;     // User role
  iat: number;      // Issued at
  exp: number;      // Expiration
}
```

**Session Security:**
- HTTP-only cookies (no JS access)
- Secure flag (HTTPS only)
- SameSite=Lax (CSRF protection)
- 7-day expiration with sliding window
- Logout invalidates all sessions (optional)

---

## Authorization (RBAC)

### Role Hierarchy

```
owner
  └── admin
        └── member
              └── viewer
```

### Permission Matrix

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| profiles:read | ✓ | ✓ | ✓ | ✓ |
| profiles:create | ✓ | ✓ | ✓ | ✗ |
| profiles:update | ✓ | ✓ | ✓ | ✗ |
| profiles:delete | ✓ | ✓ | ✗ | ✗ |
| profiles:launch | ✓ | ✓ | ✓ | ✗ |
| team:read | ✓ | ✓ | ✓ | ✓ |
| team:manage | ✓ | ✓ | ✗ | ✗ |
| team:delete | ✓ | ✗ | ✗ | ✗ |
| api-keys:create | ✓ | ✓ | ✗ | ✗ |

### Implementation

```typescript
// middleware/authorize.ts
type Permission =
  | 'profiles:read' | 'profiles:create' | 'profiles:update'
  | 'profiles:delete' | 'profiles:launch'
  | 'team:read' | 'team:manage' | 'team:delete'
  | 'api-keys:create';

const rolePermissions: Record<string, Permission[]> = {
  owner: ['*'], // All permissions
  admin: [
    'profiles:read', 'profiles:create', 'profiles:update',
    'profiles:delete', 'profiles:launch',
    'team:read', 'team:manage',
    'api-keys:create'
  ],
  member: [
    'profiles:read', 'profiles:create', 'profiles:update',
    'profiles:launch',
    'team:read'
  ],
  viewer: [
    'profiles:read',
    'team:read'
  ]
};

function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

export function authorize(permission: Permission) {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth');

    if (!hasPermission(auth.role, permission)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
  };
}
```

---

## Input Validation

### Validation Strategy

All input is validated using Zod schemas before processing.

```typescript
import { z } from 'zod';

// Profile creation schema
const createProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters in name'),

  templateId: z.string()
    .regex(/^[a-z_]+$/, 'Invalid template ID'),

  groupId: z.string()
    .regex(/^grp_[a-zA-Z0-9]+$/)
    .optional(),

  tags: z.array(z.string().max(50))
    .max(10)
    .optional(),

  timezone: z.string()
    .regex(/^[A-Za-z_\/]+$/)
    .optional(),

  proxy: z.string()
    .max(500)
    .optional()
    .refine(
      (val) => !val || /^(http|https|socks[45]):\/\//.test(val),
      'Invalid proxy format'
    )
});

// Validate in route handler
const validated = createProfileSchema.safeParse(await c.req.json());
if (!validated.success) {
  return c.json({ error: 'Validation failed', details: validated.error }, 400);
}
```

### SQL Injection Prevention

Always use parameterized queries:

```typescript
// GOOD - Parameterized query
const result = await db.prepare(`
  SELECT * FROM profiles WHERE team_id = ? AND name LIKE ?
`).bind(teamId, `%${search}%`).all();

// BAD - String concatenation (NEVER DO THIS)
const result = await db.prepare(`
  SELECT * FROM profiles WHERE team_id = '${teamId}'
`).all();
```

### XSS Prevention

- All user content is escaped before rendering
- React automatically escapes JSX
- Use `dangerouslySetInnerHTML` only when absolutely necessary
- CSP headers prevent inline script execution

---

## Data Protection

### Encryption

**At Rest:**
- Cloudflare D1: Encrypted by default
- Cloudflare R2: Encrypted by default
- Cloudflare KV: Encrypted by default

**In Transit:**
- TLS 1.3 for all connections
- HSTS enabled
- Certificate transparency

**Sensitive Data:**
- Passwords: bcrypt hashed
- API keys: SHA-256 hashed
- Session cookies: AES-256 encrypted (by NextAuth)
- Proxy credentials: Encrypted in database

```typescript
// Encrypting proxy credentials before storage
async function encryptProxy(proxy: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(proxy)
  );
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}
```

### Data Minimization

- Collect only necessary data
- No tracking cookies (use Plausible)
- No selling/sharing of user data
- Auto-delete inactive data (retention policy)

### Audit Trail

All sensitive operations are logged:

```typescript
interface AuditEntry {
  id: string;
  timestamp: number;
  team_id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  ip_address: string;
  user_agent: string;
  details: object;
}

// Actions logged:
// - profile.create, profile.update, profile.delete
// - profile.launch, profile.sync
// - team.invite, team.remove, team.role_change
// - api-key.create, api-key.revoke
// - settings.update
// - billing.subscribe, billing.cancel
```

---

## Security Headers

### Implementation

```typescript
// middleware/securityHeaders.ts
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next();

    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https://api.stripe.com; " +
      "frame-src https://js.stripe.com;"
    );
  };
}
```

### Header Explanation

| Header | Purpose |
|--------|---------|
| X-Content-Type-Options | Prevents MIME sniffing |
| X-Frame-Options | Prevents clickjacking |
| X-XSS-Protection | Legacy XSS filter |
| Referrer-Policy | Controls referrer info |
| Permissions-Policy | Disables browser features |
| HSTS | Enforces HTTPS |
| CSP | Prevents XSS and data injection |

---

## Rate Limiting

### Configuration

```typescript
const RATE_LIMITS = {
  // Per API key
  api: {
    free: { requests: 30, window: 60 },    // 30 req/min
    pro: { requests: 100, window: 60 },    // 100 req/min
    team: { requests: 300, window: 60 },   // 300 req/min
  },

  // Per IP (for auth endpoints)
  auth: {
    login: { requests: 5, window: 300 },   // 5 attempts/5 min
    register: { requests: 3, window: 3600 }, // 3/hour
    passwordReset: { requests: 3, window: 3600 }
  }
};
```

### Implementation

```typescript
// Using Cloudflare KV for rate limiting
async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  const bucket = Math.floor(Date.now() / (window * 1000));
  const kvKey = `ratelimit:${key}:${bucket}`;

  const current = parseInt(await kv.get(kvKey) || '0');

  if (current >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(kvKey, String(current + 1), { expirationTtl: window * 2 });

  return { allowed: true, remaining: limit - current - 1 };
}
```

---

## Vulnerability Management

### OWASP Top 10 Checklist

| Vulnerability | Status | Mitigation |
|---------------|--------|------------|
| A01 - Broken Access Control | ✓ | RBAC, authorization middleware |
| A02 - Cryptographic Failures | ✓ | bcrypt, SHA-256, TLS 1.3 |
| A03 - Injection | ✓ | Parameterized queries, Zod |
| A04 - Insecure Design | ✓ | Threat modeling, code review |
| A05 - Security Misconfiguration | ✓ | Security headers, minimal exposure |
| A06 - Vulnerable Components | ✓ | Dependabot, regular updates |
| A07 - Authentication Failures | ✓ | Strong passwords, rate limiting |
| A08 - Data Integrity Failures | ✓ | Input validation, checksums |
| A09 - Logging Failures | ✓ | Comprehensive audit logging |
| A10 - SSRF | ✓ | URL validation, whitelist |

### Dependency Security

```yaml
# .github/workflows/security.yml
name: Security Scan
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high

  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: github/codeql-action/init@v2
        with:
          languages: typescript
      - uses: github/codeql-action/analyze@v2
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P1 | Critical | 15 min | Data breach, total outage |
| P2 | High | 1 hour | Auth bypass, partial outage |
| P3 | Medium | 4 hours | Minor security issue |
| P4 | Low | 24 hours | Security improvement |

### Response Procedure

1. **Identify** - Detect and classify the incident
2. **Contain** - Limit damage (revoke keys, block IPs)
3. **Eradicate** - Remove the threat
4. **Recover** - Restore normal operations
5. **Learn** - Post-mortem and improvements

### Contact Points

```
Security Issues: security@multilogin.io
Bug Bounty: (to be set up)
Emergency: [phone number]
```

---

## GDPR Compliance

### Data Subject Rights

| Right | Implementation |
|-------|----------------|
| Right to Access | Export all user data via settings |
| Right to Rectification | Edit profile and settings |
| Right to Erasure | Account deletion (30-day grace) |
| Right to Portability | JSON export of all data |
| Right to Object | Unsubscribe from marketing |

### Data Processing

**Lawful Basis:**
- Contract: Processing needed to provide service
- Legitimate Interest: Analytics, security
- Consent: Marketing emails

**Data Retention:**

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Account data | Active + 30 days | Service provision |
| Profile data | Active + 30 days | Service provision |
| Session data | 90 days inactive | User experience |
| Audit logs | 90 days | Security |
| Billing records | 7 years | Legal requirement |
| Marketing consent | Until withdrawn | Compliance |

### Privacy Policy Requirements

- [ ] Identity of controller
- [ ] Contact details (DPO if applicable)
- [ ] Purpose of processing
- [ ] Legal basis
- [ ] Recipients of data
- [ ] International transfers
- [ ] Retention periods
- [ ] User rights
- [ ] Right to complain
- [ ] Whether data is statutory/contractual
- [ ] Automated decision-making info

---

## Third-Party Security

### Service Providers

| Provider | Data Access | Security |
|----------|-------------|----------|
| Cloudflare | Request metadata | SOC 2, ISO 27001 |
| Stripe | Payment data | PCI DSS Level 1 |
| Plausible | Anonymized analytics | EU-hosted, GDPR compliant |
| GitHub | Source code | SOC 2 |

### Vendor Assessment Checklist

- [ ] SOC 2 Type II report
- [ ] Security documentation
- [ ] Data processing agreement
- [ ] GDPR compliance
- [ ] Incident notification clause
- [ ] Sub-processor list

---

## Security Testing

### Regular Testing

| Test Type | Frequency | Tool/Method |
|-----------|-----------|-------------|
| Dependency audit | Daily | npm audit, Dependabot |
| Static analysis | On commit | ESLint security rules |
| SAST | Weekly | CodeQL |
| DAST | Monthly | OWASP ZAP |
| Penetration test | Annually | External firm |

### Pre-Release Checklist

- [ ] No high/critical vulnerabilities
- [ ] All security tests pass
- [ ] No sensitive data in logs
- [ ] No hardcoded credentials
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Error messages don't leak info

---

## Security Monitoring

### Alerts

| Event | Action |
|-------|--------|
| Failed login spike | Alert + temp IP block |
| Rate limit exceeded | Log + potential block |
| API key abuse | Alert + key revocation |
| Unusual data access | Alert + investigation |
| New admin created | Alert to owner |

### Logging

```typescript
// Sensitive action logging
function logSecurityEvent(event: {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  userId?: string;
  ip: string;
  details: object;
}) {
  // Log to Cloudflare Logpush or external service
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event
  }));
}

// Example usage
logSecurityEvent({
  type: 'login_failed',
  severity: 'warning',
  ip: request.headers.get('CF-Connecting-IP'),
  details: { email: 'user@example.com', reason: 'invalid_password' }
});
```

---

## Employee Security

### Access Control

- Principle of least privilege
- MFA required for all admin access
- Regular access reviews (quarterly)
- Immediate revocation on departure

### Training

- Security awareness training (annual)
- Phishing simulation (quarterly)
- Incident response drill (annual)

### Development Security

- No production data in development
- Secrets in environment variables
- Code review required for merges
- No committing of credentials

---

## Summary Checklist

### Before Launch

- [ ] All auth flows tested
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Input validation complete
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protection active
- [ ] Passwords properly hashed
- [ ] API keys hashed
- [ ] Audit logging enabled
- [ ] Error messages sanitized
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified
- [ ] Penetration test completed
- [ ] Incident response plan ready

### Ongoing

- [ ] Monitor security alerts
- [ ] Review audit logs
- [ ] Update dependencies
- [ ] Rotate secrets
- [ ] Review access permissions
- [ ] Test backups
- [ ] Update documentation

---

Security is never done. It's a continuous process of improvement. Stay vigilant.
