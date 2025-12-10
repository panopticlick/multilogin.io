import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Smartphone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Two-Factor Authentication',
  description: 'Protect your account with 2FA. Setup authenticator apps, generate backup codes, and recover access if you lose your device. TOTP and SMS options available.',
  author: 'Tyler Johnson',
  authorTitle: 'Identity & Access Management Lead',
  publishedAt: '2024-03-07',
  readingTime: '5 min read',
  category: 'Security & Privacy',
  wordCount: 800,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'two-factor authentication',
    '2FA',
    'TOTP',
    'authenticator app',
    'backup codes',
    'account security',
    'multi-factor authentication',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/two-factor-authentication`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function TwoFactorAuthenticationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Install Authenticator App',
        text: 'Download Google Authenticator, Authy, or 1Password on your phone.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Scan QR Code',
        text: 'Open Security Settings, enable 2FA, scan QR code with app.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Save Backup Codes',
        text: 'Download and securely store backup codes for account recovery.',
      },
    ],
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
            Password alone isn't enough. If someone gets your password (phishing, data breach, keylogger), they own your account. Two-factor authentication stops them cold.
          </p>

          <h2>How 2FA Works</h2>

          <p>
            Login requires two things:
          </p>

          <ol>
            <li><strong>Something you know:</strong> Your password</li>
            <li><strong>Something you have:</strong> Your phone (authenticator app) or phone number (SMS)</li>
          </ol>

          <p>
            Attacker with your password still can't log in without your phone. 99.9% of account takeovers blocked.
          </p>

          <h2>Choosing a 2FA Method</h2>

          <p>
            We support two methods:
          </p>

          <p>
            <strong>TOTP (Time-Based One-Time Password) - Recommended</strong>
          </p>

          <ul>
            <li>Uses authenticator app (Google Authenticator, Authy, 1Password)</li>
            <li>Generates 6-digit codes that change every 30 seconds</li>
            <li>Works offline (no internet needed)</li>
            <li>Most secure option</li>
          </ul>

          <p>
            <strong>SMS (Text Message)</strong>
          </p>

          <ul>
            <li>Sends 6-digit code to your phone number</li>
            <li>Requires cell signal or WiFi calling</li>
            <li>Vulnerable to SIM swap attacks</li>
            <li>Better than nothing but not recommended</li>
          </ul>

          <p>
            Use TOTP unless you absolutely can't install an authenticator app.
          </p>

          <h2>Setting Up TOTP (Authenticator App)</h2>

          <p>
            <strong>Step 1: Install Authenticator App</strong>
          </p>

          <p>
            Recommended apps:
          </p>

          <ul>
            <li><strong>Google Authenticator:</strong> Free, simple, works offline</li>
            <li><strong>Authy:</strong> Free, cloud backup, multi-device</li>
            <li><strong>1Password:</strong> Paid, integrates with password manager</li>
            <li><strong>Microsoft Authenticator:</strong> Free, push notifications</li>
          </ul>

          <p>
            Download from App Store or Google Play.
          </p>

          <p>
            <strong>Step 2: Enable 2FA in Multilogin</strong>
          </p>

          <p>
            Settings → Security → Two-Factor Authentication → "Enable 2FA" button.
          </p>

          <p>
            You'll see a QR code and a manual setup key.
          </p>

          <p>
            <strong>Step 3: Scan QR Code</strong>
          </p>

          <p>
            Open your authenticator app → Add account → Scan QR code → Point camera at screen.
          </p>

          <p>
            The app shows "Multilogin.io" with a 6-digit code that changes every 30 seconds.
          </p>

          <p>
            Can't scan? Use manual setup key instead. Copy the long alphanumeric string and paste into your app.
          </p>

          <p>
            <strong>Step 4: Verify Setup</strong>
          </p>

          <p>
            Enter the 6-digit code from your app. Click "Verify and Enable."
          </p>

          <p>
            If code works, 2FA is enabled. If not, check:
          </p>

          <ul>
            <li>Clock on phone is accurate (TOTP is time-based)</li>
            <li>You're entering the code quickly (expires in 30 seconds)</li>
            <li>You scanned the correct QR code</li>
          </ul>

          <p>
            <strong>Step 5: Save Backup Codes</strong>
          </p>

          <p>
            Download 10 backup codes. Each code is single-use. Store somewhere safe (password manager, encrypted file, physical safe).
          </p>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Critical</p>
            <p className="text-sm mb-0">
              Save backup codes NOW. If you lose your phone, backup codes are the only way to access your account. Without them, you're permanently locked out.
            </p>
          </Card>

          <h2>Setting Up SMS</h2>

          <p>
            Settings → Security → Two-Factor Authentication → Select "SMS" → Enter phone number.
          </p>

          <p>
            We send a verification code to your number. Enter code to verify.
          </p>

          <p>
            After setup, login sends SMS with 6-digit code. Enter code to complete login.
          </p>

          <p>
            <strong>SMS Limitations:</strong>
          </p>

          <ul>
            <li>SIM swap attacks can intercept codes</li>
            <li>Doesn't work in areas with no cell service</li>
            <li>SMS delivery can be delayed (minutes)</li>
            <li>International SMS may fail</li>
          </ul>

          <h2>Logging In with 2FA</h2>

          <p>
            <strong>Login Flow:</strong>
          </p>

          <ol>
            <li>Enter email and password</li>
            <li>System prompts for 6-digit code</li>
            <li>Open authenticator app → Get current code</li>
            <li>Enter code (must be done within 30 seconds)</li>
            <li>Check "Trust this device for 30 days" if it's your personal computer</li>
            <li>Click "Verify"</li>
          </ol>

          <p>
            Trusted devices don't ask for 2FA code for 30 days. Public computers should never be trusted.
          </p>

          <h2>Using Backup Codes</h2>

          <p>
            Phone lost or broken? Use backup codes.
          </p>

          <p>
            Login normally → Enter backup code instead of authenticator code.
          </p>

          <p>
            Each backup code works once. After using 5 codes, generate new set: Settings → Security → 2FA → "Regenerate Backup Codes."
          </p>

          <h2>Account Recovery</h2>

          <p>
            Lost phone AND lost backup codes? You're in trouble.
          </p>

          <p>
            <strong>Recovery Options:</strong>
          </p>

          <ol>
            <li><strong>Contact Support:</strong> Email support@multilogin.io with account proof (payment receipts, old profile names, API keys). We verify identity manually. Takes 3-5 business days.</li>
            <li><strong>Security Questions (if enabled):</strong> Answer 3 security questions to disable 2FA.</li>
          </ol>

          <p>
            <strong>Prevention:</strong>
          </p>

          <ul>
            <li>Store backup codes in password manager</li>
            <li>Use Authy with cloud backup (syncs to multiple devices)</li>
            <li>Enable security questions as backup recovery method</li>
            <li>Note down your setup key (can re-add to new phone)</li>
          </ul>

          <h2>Disabling 2FA</h2>

          <p>
            Settings → Security → 2FA → "Disable Two-Factor Authentication" button.
          </p>

          <p>
            Enter current password and 2FA code to confirm.
          </p>

          <p>
            <strong>When to disable:</strong>
          </p>

          <ul>
            <li>Switching to different authenticator app</li>
            <li>Replacing lost phone</li>
            <li>Account transfer</li>
          </ul>

          <p>
            Re-enable immediately after resolving the issue.
          </p>

          <h2>2FA for Team Members</h2>

          <p>
            <strong>Owner can enforce 2FA:</strong> Settings → Team → Security Policies → "Require 2FA for all members."
          </p>

          <p>
            Team members get 7 days to enable 2FA. After deadline, they're locked out until they enable it.
          </p>

          <p>
            Strongly recommended for:
          </p>

          <ul>
            <li>Teams handling sensitive client data</li>
            <li>Compliance requirements (SOC 2, ISO 27001)</li>
            <li>High-value accounts (&gt;$10k monthly revenue)</li>
          </ul>

          <h2>Best Practices</h2>

          <ul>
            <li><strong>Use TOTP, not SMS</strong></li>
            <li><strong>Store backup codes in password manager</strong></li>
            <li><strong>Don't trust public computers</strong></li>
            <li><strong>Enable 2FA on email account too</strong> (attacker with email access can reset passwords)</li>
            <li><strong>Use different authenticator from email</strong> (diversify risk)</li>
            <li><strong>Test backup codes annually</strong> (make sure they work)</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Secure Your API Keys</h3>
            <p className="mb-4">
              Account protected with 2FA. Now secure your API keys, webhook secrets, and automation credentials with proper key management and rotation policies.
            </p>
            <Link href="/docs/api-key-security">
              <Button size="lg">
                API Key Security <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} builds authentication systems at Multilogin.io. He's implemented 2FA for 50,000+ accounts and reduced account takeovers by 99.7%.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/data-encryption">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Data Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how we protect your data with encryption
                </p>
              </Card>
            </Link>
            <Link href="/docs/api-key-security">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">API Key Security</h3>
                <p className="text-sm text-muted-foreground">
                  Secure your API keys and automation access
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
