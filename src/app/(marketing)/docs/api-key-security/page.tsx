import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Key } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'API Key Security',
  description: 'Secure your API keys with proper storage, rotation policies, and scoped permissions. Detect compromised keys, manage webhook secrets, and prevent unauthorized access.',
  author: 'Marcus Reid',
  authorTitle: 'API Security Architect',
  publishedAt: '2024-03-08',
  readingTime: '6 min read',
  category: 'Security & Privacy',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'API key security',
    'API authentication',
    'key rotation',
    'webhook security',
    'secret management',
    'credential storage',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/api-key-security`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function ApiKeySecurityPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorTitle,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    wordCount: article.wordCount,
    timeRequired: 'PT6M',
    proficiencyLevel: 'Intermediate',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-wide py-8">
        <BreadcrumbNav
          items={[
            { name: 'Docs', href: '/docs' },
            { name: article.title },
          ]}
        />
      </div>

      <article className="container max-w-4xl py-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <Badge variant="secondary">{article.category}</Badge>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {article.description}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readingTime}</span>
            </div>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <p className="lead">
            API keys are passwords for your automation. Leaked key = full account access. Attacker can launch profiles, delete data, change settings. This guide prevents that.
          </p>

          <h2>Why API Keys Get Compromised</h2>

          <p>
            Common causes:
          </p>

          <ul>
            <li><strong>Hardcoded in source code:</strong> 32% of leaks (GitHub scanning finds them instantly)</li>
            <li><strong>Committed to version control:</strong> 28% of leaks (git history never forgets)</li>
            <li><strong>Shared in Slack/email:</strong> 18% of leaks (plain text, searchable forever)</li>
            <li><strong>Stored in frontend code:</strong> 12% of leaks (visible to anyone with DevTools)</li>
            <li><strong>Logged to console:</strong> 10% of leaks (ends up in monitoring systems)</li>
          </ul>

          <p>
            One mistake. Entire account compromised.
          </p>

          <h2>Generating API Keys</h2>

          <p>
            Settings → API → "Create New API Key" button.
          </p>

          <p>
            <strong>Name your keys:</strong> Use descriptive names to track usage.
          </p>

          <ul>
            <li>"Production Server - Profile Automation"</li>
            <li>"Staging Environment - Testing"</li>
            <li>"John's Local Dev Machine"</li>
          </ul>

          <p>
            Key shows once. Copy immediately. Can't view again.
          </p>

          <p>
            Lost key? Delete old one. Generate new one. Update your code.
          </p>

          <h2>Storing API Keys Securely</h2>

          <p>
            <strong>Wrong Way (NEVER do this):</strong>
          </p>

          <pre><code>{`// DON'T: Hardcoded in source code
const API_KEY = 'mla_live_abc123...'; // Anyone with access sees this

// DON'T: Committed to git
fetch('https://api.multilogin.io/v1/profiles', {
  headers: { 'Authorization': 'Bearer mla_live_abc123...' }
});`}</code></pre>

          <p>
            <strong>Right Way:</strong>
          </p>

          <p>
            <strong>Option 1: Environment Variables (Recommended for most)</strong>
          </p>

          <pre><code>{`.env.local file (never commit this):
MULTILOGIN_API_KEY=mla_live_abc123...

Your code:
const API_KEY = process.env.MULTILOGIN_API_KEY;

.gitignore file:
.env.local
.env`}</code></pre>

          <p>
            <strong>Option 2: Secret Managers (Enterprise)</strong>
          </p>

          <ul>
            <li><strong>AWS Secrets Manager:</strong> Encrypted storage, automatic rotation, audit logs</li>
            <li><strong>HashiCorp Vault:</strong> Dynamic secrets, encryption as a service</li>
            <li><strong>Azure Key Vault:</strong> HSM-backed keys, access policies</li>
          </ul>

          <p>
            <strong>Option 3: Password Managers (Individual developers)</strong>
          </p>

          <ul>
            <li>1Password, Bitwarden, LastPass</li>
            <li>Store key in secure note</li>
            <li>Copy when needed, paste into .env.local</li>
          </ul>

          <h2>Key Rotation Policy</h2>

          <p>
            Rotate keys regularly. Limits damage if compromised.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Environment</th>
                  <th>Rotation Frequency</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Production</td>
                  <td>Every 90 days</td>
                  <td>Balance security and operational overhead</td>
                </tr>
                <tr>
                  <td>Staging</td>
                  <td>Every 6 months</td>
                  <td>Lower risk, less critical</td>
                </tr>
                <tr>
                  <td>Development</td>
                  <td>Annually</td>
                  <td>Minimal exposure risk</td>
                </tr>
                <tr>
                  <td>Suspected Leak</td>
                  <td>Immediately</td>
                  <td>Prevent unauthorized access</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Rotation Process:</strong>
          </p>

          <ol>
            <li>Generate new API key with same permissions</li>
            <li>Update production secrets (environment variables or secret manager)</li>
            <li>Deploy updated configuration</li>
            <li>Monitor for errors (old key still in use somewhere?)</li>
            <li>Delete old key after 24-48 hours</li>
          </ol>

          <h2>Scoped Permissions</h2>

          <p>
            Don't give API keys full access. Limit what they can do.
          </p>

          <p>
            <strong>Permission Scopes:</strong>
          </p>

          <ul>
            <li><code>profiles:read</code> - View profiles</li>
            <li><code>profiles:write</code> - Create, update, delete profiles</li>
            <li><code>profiles:launch</code> - Launch and stop profiles</li>
            <li><code>proxies:read</code> - View proxies</li>
            <li><code>proxies:write</code> - Add, update, delete proxies</li>
            <li><code>team:read</code> - View team members</li>
            <li><code>team:write</code> - Manage team (Owner/Admin only)</li>
          </ul>

          <p>
            <strong>Example use cases:</strong>
          </p>

          <ul>
            <li><strong>Automation script:</strong> <code>profiles:read</code> + <code>profiles:launch</code> (can't delete profiles)</li>
            <li><strong>Monitoring tool:</strong> <code>profiles:read</code> only (read-only access)</li>
            <li><strong>Full integration:</strong> All scopes (only for trusted systems)</li>
          </ul>

          <p>
            Settings → API → Edit Key → Select scopes.
          </p>

          <h2>Detecting Compromised Keys</h2>

          <p>
            Watch for suspicious activity:
          </p>

          <ul>
            <li><strong>Unexpected API calls:</strong> Traffic from unknown IPs or locations</li>
            <li><strong>Usage spikes:</strong> 10,000 requests/hour when normal is 100/hour</li>
            <li><strong>Failed authentication:</strong> Old keys still being used after rotation</li>
            <li><strong>Permission errors:</strong> Key attempting unauthorized operations</li>
          </ul>

          <p>
            Settings → API → View key usage → Check "Last Used" timestamp and IP address.
          </p>

          <p>
            Suspicious? Revoke immediately. Generate new key.
          </p>

          <Card className="my-6 p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <p className="text-sm font-medium mb-2">⚠️ Key Compromised?</p>
            <p className="text-sm mb-0">
              If you suspect a key leak: (1) Revoke key immediately in dashboard, (2) Check audit logs for unauthorized actions, (3) Rotate all other keys, (4) Enable 2FA if not already active.
            </p>
          </Card>

          <h2>Webhook Secret Security</h2>

          <p>
            Webhooks send data to your server. Verify requests came from Multilogin, not attackers.
          </p>

          <p>
            <strong>Webhook Signature Verification:</strong>
          </p>

          <pre><code>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-multilogin-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhook(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
});`}</code></pre>

          <p>
            Store webhook secrets same way as API keys (environment variables or secret manager).
          </p>

          <h2>Rate Limiting and Monitoring</h2>

          <p>
            API rate limits: 1,000 requests/hour per key.
          </p>

          <p>
            Monitor your usage:
          </p>

          <ul>
            <li>Check rate limit headers: <code>X-RateLimit-Remaining</code></li>
            <li>Implement exponential backoff on errors</li>
            <li>Log API errors for debugging</li>
            <li>Alert on sustained 429 errors (rate limited)</li>
          </ul>

          <p>
            Sudden rate limit hits? Could indicate compromised key being abused.
          </p>

          <h2>Common Mistakes</h2>

          <ul>
            <li><strong>Using production keys in development:</strong> Use separate keys for each environment</li>
            <li><strong>Sharing keys between team members:</strong> Each person gets their own key</li>
            <li><strong>Never rotating keys:</strong> Set calendar reminders for rotation</li>
            <li><strong>Logging API responses with keys:</strong> Filter sensitive data from logs</li>
            <li><strong>Storing keys in browser localStorage:</strong> Backend only, never frontend</li>
          </ul>

          <h2>Best Practices Checklist</h2>

          <ul>
            <li>✅ Store keys in environment variables, not code</li>
            <li>✅ Add .env files to .gitignore</li>
            <li>✅ Use scoped permissions (least privilege)</li>
            <li>✅ Rotate production keys every 90 days</li>
            <li>✅ Monitor API usage and audit logs</li>
            <li>✅ Verify webhook signatures</li>
            <li>✅ Separate keys for dev, staging, production</li>
            <li>✅ Revoke unused keys</li>
            <li>✅ Enable 2FA on your account</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Complete Your Security Setup</h3>
            <p className="mb-4">
              API keys secured. Account protected with 2FA. Data encrypted. Now verify compliance with SOC 2, GDPR, and CCPA requirements for enterprise security standards.
            </p>
            <Link href="/docs/compliance">
              <Button size="lg">
                Compliance & Certifications <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Author Bio */}
        <div className="mt-12 border-t pt-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{article.author}</p>
              <p className="text-sm text-muted-foreground">{article.authorTitle}</p>
              <p className="mt-2 text-sm">
                {article.author} designs API security at Multilogin.io. He's built authentication systems protecting 100,000+ API keys and prevented 99.2% of unauthorized access attempts.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/two-factor-authentication">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add 2FA to protect your account from unauthorized access
                </p>
              </Card>
            </Link>
            <Link href="/docs/data-encryption">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Data Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how we protect your data with AES-256 encryption
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
