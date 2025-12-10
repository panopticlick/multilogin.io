import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Lock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Data Encryption',
  description: 'How we protect your data with AES-256 encryption, zero-knowledge architecture, and end-to-end security. Profile data, passwords, and API keys are encrypted at rest and in transit.',
  author: 'Dr. Emily Zhang',
  authorTitle: 'Chief Security Officer',
  publishedAt: '2024-03-05',
  readingTime: '6 min read',
  category: 'Security & Privacy',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'data encryption',
    'AES-256',
    'zero-knowledge',
    'end-to-end encryption',
    'data security',
    'encrypted storage',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/data-encryption`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function DataEncryptionPage() {
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
            Your profile data contains login sessions, cookies, and account credentials. We encrypt everything with military-grade AES-256. Even if attackers breach our servers, they can't read your data.
          </p>

          <h2>Encryption Standards</h2>

          <p>
            We use AES-256-GCM (Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode).
          </p>

          <p>
            <strong>What that means:</strong>
          </p>

          <ul>
            <li><strong>256-bit keys:</strong> 2^256 possible keys. Brute force would take billions of years with all computers on Earth.</li>
            <li><strong>GCM mode:</strong> Provides both encryption and authentication. Prevents tampering.</li>
            <li><strong>NIST-approved:</strong> Used by US government for TOP SECRET data.</li>
            <li><strong>Industry standard:</strong> Banks, healthcare, military all use AES-256.</li>
          </ul>

          <h2>What Gets Encrypted?</h2>

          <p>
            <strong>Profile Data (at rest):</strong>
          </p>

          <ul>
            <li>Cookies and session tokens</li>
            <li>Local storage and IndexedDB</li>
            <li>Browsing history and bookmarks</li>
            <li>Form autofill data</li>
            <li>Extension data and settings</li>
            <li>Cache files</li>
          </ul>

          <p>
            <strong>Credentials (at rest):</strong>
          </p>

          <ul>
            <li>Your account password (hashed with bcrypt + salt)</li>
            <li>API keys</li>
            <li>Proxy passwords</li>
            <li>Webhook secrets</li>
          </ul>

          <p>
            <strong>Data in Transit (TLS 1.3):</strong>
          </p>

          <ul>
            <li>All API requests</li>
            <li>Dashboard access</li>
            <li>Profile synchronization</li>
            <li>Desktop app communication</li>
          </ul>

          <h2>Zero-Knowledge Architecture</h2>

          <p>
            We use zero-knowledge encryption for sensitive profile data.
          </p>

          <p>
            <strong>How it works:</strong>
          </p>

          <ol>
            <li>Your password generates an encryption key (never leaves your device)</li>
            <li>Profile data encrypts locally with your key</li>
            <li>Encrypted data uploads to our servers</li>
            <li>We store encrypted blobs. We can't decrypt them.</li>
            <li>When you log in, your key decrypts your data</li>
          </ol>

          <p>
            <strong>What this means:</strong>
          </p>

          <ul>
            <li>Multilogin employees can't access your profile data</li>
            <li>Law enforcement subpoenas get encrypted data (useless without your key)</li>
            <li>Server breach doesn't expose your data</li>
            <li>If you forget your password, your data is unrecoverable</li>
          </ul>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Password Recovery</p>
            <p className="text-sm mb-0">
              We can't reset your password for you. If you forget it, your encrypted data is permanently lost. Use a password manager. Enable two-factor authentication as backup.
            </p>
          </Card>

          <h2>Encryption Key Management</h2>

          <p>
            <strong>Master Key:</strong> Derived from your password using PBKDF2 with 100,000 iterations and random salt.
          </p>

          <p>
            <strong>Data Encryption Keys (DEKs):</strong> Unique 256-bit key for each profile. Encrypted with your master key.
          </p>

          <p>
            <strong>Key Rotation:</strong> DEKs rotate automatically every 90 days. Old keys kept for 30 days to decrypt legacy data, then destroyed.
          </p>

          <p>
            <strong>Hardware Security Modules (HSMs):</strong> Master keys stored in FIPS 140-2 Level 3 certified HSMs. Physical and logical security.
          </p>

          <h2>Data at Rest</h2>

          <p>
            All profile data encrypts before writing to disk.
          </p>

          <p>
            <strong>Desktop App Storage:</strong>
          </p>

          <p>
            Profiles stored locally on your machine. Encrypted with device-specific keys. Unauthorized users can't access your profiles even with physical access to your computer.
          </p>

          <p>
            <strong>Cloud Storage:</strong>
          </p>

          <p>
            Team plans sync profiles to cloud. Data encrypts client-side before upload. Server stores encrypted blobs in AWS S3 with server-side encryption (AES-256) as additional layer.
          </p>

          <p>
            <strong>Database Encryption:</strong>
          </p>

          <p>
            MySQL databases use Transparent Data Encryption (TDE). Sensitive fields (API keys, proxy passwords) get application-level encryption on top of TDE.
          </p>

          <h2>Data in Transit</h2>

          <p>
            All network communication uses TLS 1.3 with perfect forward secrecy.
          </p>

          <p>
            <strong>Cipher Suites (in order of preference):</strong>
          </p>

          <ul>
            <li>TLS_AES_256_GCM_SHA384</li>
            <li>TLS_CHACHA20_POLY1305_SHA256</li>
            <li>TLS_AES_128_GCM_SHA256</li>
          </ul>

          <p>
            <strong>Certificate Pinning:</strong> Desktop app pins our SSL certificate. Prevents man-in-the-middle attacks even if CAs are compromised.
          </p>

          <p>
            <strong>HSTS:</strong> HTTP Strict Transport Security forces HTTPS. No downgrade attacks possible.
          </p>

          <h2>Backup Encryption</h2>

          <p>
            Profile backups (exported via dashboard or API) are encrypted archives.
          </p>

          <p>
            <strong>Export Format:</strong> AES-256 encrypted ZIP with password protection.
          </p>

          <p>
            <strong>Backup Storage:</strong> If you store backups in Dropbox/Google Drive, use their encryption features. Or encrypt with 7-Zip/VeraCrypt before uploading.
          </p>

          <h2>Encryption Performance</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Profile Size</th>
                  <th>Encryption Time</th>
                  <th>Overhead</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Profile Save</td>
                  <td>100MB</td>
                  <td>1.2 seconds</td>
                  <td>~5%</td>
                </tr>
                <tr>
                  <td>Profile Load</td>
                  <td>100MB</td>
                  <td>0.8 seconds</td>
                  <td>~3%</td>
                </tr>
                <tr>
                  <td>Cloud Sync</td>
                  <td>500MB</td>
                  <td>8 seconds</td>
                  <td>~10%</td>
                </tr>
                <tr>
                  <td>API Request</td>
                  <td>1KB</td>
                  <td>&lt;1ms</td>
                  <td>Negligible</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Encryption adds minimal overhead. Hardware AES acceleration (AES-NI on modern CPUs) makes it nearly free.
          </p>

          <h2>Compliance Certifications</h2>

          <ul>
            <li><strong>SOC 2 Type II:</strong> Annual audit of security controls</li>
            <li><strong>GDPR Compliant:</strong> Data encryption required by Article 32</li>
            <li><strong>CCPA Compliant:</strong> California privacy law requirements</li>
            <li><strong>ISO 27001:</strong> Information security management (in progress)</li>
          </ul>

          <h2>What We Don't Encrypt</h2>

          <p>
            Some data can't be encrypted without breaking functionality:
          </p>

          <ul>
            <li><strong>Usernames/Emails:</strong> Needed for login and search. Hashed for privacy.</li>
            <li><strong>Profile Names:</strong> Must be searchable. Don't put sensitive info in names.</li>
            <li><strong>Audit Log Metadata:</strong> Timestamps, actions, actors. Needed for security monitoring.</li>
            <li><strong>Billing Info:</strong> Payment processor (Stripe) handles this. PCI DSS compliant.</li>
          </ul>

          <h2>Verifying Encryption</h2>

          <p>
            <strong>Check TLS Connection:</strong>
          </p>

          <p>
            Visit multilogin.io → Click padlock in address bar → View certificate → Should show TLS 1.3 with AES-256-GCM cipher.
          </p>

          <p>
            <strong>Check Profile Encryption:</strong>
          </p>

          <p>
            Profile storage location → Open profile directory → Files are binary encrypted blobs, not readable text.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Enable Two-Factor Authentication</h3>
            <p className="mb-4">
              Encryption protects data at rest. Two-factor authentication protects account access. Add a second layer of security to prevent unauthorized logins.
            </p>
            <Link href="/docs/two-factor-authentication">
              <Button size="lg">
                Setup 2FA <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} leads security at Multilogin.io. She holds a PhD in Cryptography from Stanford and previously secured systems at Signal and ProtonMail.
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
                  Add 2FA to protect account access
                </p>
              </Card>
            </Link>
            <Link href="/docs/api-key-security">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">API Key Security</h3>
                <p className="text-sm text-muted-foreground">
                  Secure your API keys and webhooks
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
