import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Clock, User } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Quick Start Guide',
  description: 'Get up and running with Multilogin.io in 5 minutes. Create your first browser profile, add proxies, and start browsing securely.',
  author: 'Alex Rivera',
  authorTitle: 'Product Lead',
  publishedAt: '2024-01-15',
  readingTime: '5 min read',
  category: 'Getting Started',
  wordCount: 1000,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'multilogin quick start',
    'browser profile tutorial',
    'antidetect browser setup',
    'how to use multilogin',
    'browser fingerprint guide',
    'proxy setup tutorial',
    'account management guide',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/quick-start`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function QuickStartPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Your Account',
        text: 'Sign up for Multilogin.io with your email. Verify your email address and choose your plan.',
        url: `${siteConfig.url}/docs/quick-start#step-1`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Download the Desktop App',
        text: 'Download and install the Multilogin desktop application for your operating system.',
        url: `${siteConfig.url}/docs/quick-start#step-2`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Create Your First Profile',
        text: 'Click Create Profile, choose a template, and configure your browser fingerprint settings.',
        url: `${siteConfig.url}/docs/quick-start#step-3`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Add a Proxy',
        text: 'Configure your proxy settings to route traffic through your chosen IP address.',
        url: `${siteConfig.url}/docs/quick-start#step-4`,
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Start Browsing',
        text: 'Launch your profile and start browsing with complete fingerprint isolation.',
        url: `${siteConfig.url}/docs/quick-start#step-5`,
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
            You can start using Multilogin.io in under 5 minutes. This guide walks you through account creation, profile setup, and your first secure browsing session.
          </p>

          <h2 id="step-1">Step 1: Create Your Account</h2>

          <p>
            Head to multilogin.io. Click the big button that says "Start Free Trial."
          </p>

          <p>
            Enter your email. Choose a strong password. You'll get a verification email. Click the link. Done.
          </p>

          <p>
            Now pick your plan. Start with Solo if you're testing. Pick Team if you need to share profiles. Enterprise if you're managing 50+ accounts.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
            <p className="text-sm mb-0">
              The free trial includes 3 profiles. That's enough to test fingerprint isolation and proxy integration. No credit card required.
            </p>
          </Card>

          <h2 id="step-2">Step 2: Download the Desktop App</h2>

          <p>
            After signup, you'll see a download page. Pick your operating system:
          </p>

          <ul>
            <li><strong>Windows:</strong> Supports Windows 10 and 11</li>
            <li><strong>macOS:</strong> Supports macOS 11+ (Intel and Apple Silicon)</li>
            <li><strong>Linux:</strong> Supports Ubuntu 20.04+ and Debian-based distros</li>
          </ul>

          <p>
            The installer is about 200MB. Download takes 1-2 minutes on decent internet.
          </p>

          <p>
            Run the installer. Click through the prompts. The app installs in 30 seconds.
          </p>

          <p>
            Open the app. Log in with your email and password. You'll see an empty dashboard.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Minimum RAM</th>
                  <th>Disk Space</th>
                  <th>Browser Engine</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Windows</td>
                  <td>4GB</td>
                  <td>2GB</td>
                  <td>Chromium 120+</td>
                </tr>
                <tr>
                  <td>macOS</td>
                  <td>4GB</td>
                  <td>2GB</td>
                  <td>Chromium 120+</td>
                </tr>
                <tr>
                  <td>Linux</td>
                  <td>4GB</td>
                  <td>2GB</td>
                  <td>Chromium 120+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="step-3">Step 3: Create Your First Profile</h2>

          <p>
            Click "Create Profile" in the top right. You'll see a setup wizard.
          </p>

          <p>
            <strong>Profile Name:</strong> Give it a name. Something like "Amazon Seller 1" or "Facebook Account A."
          </p>

          <p>
            <strong>Browser Type:</strong> Pick Chromium. It's the most compatible. Firefox works too but some sites detect it.
          </p>

          <p>
            <strong>Fingerprint Template:</strong> Choose based on your needs:
          </p>

          <ul>
            <li><strong>E-commerce:</strong> Amazon, eBay, Etsy detection patterns</li>
            <li><strong>Social Media:</strong> Facebook, Instagram, TikTok patterns</li>
            <li><strong>General:</strong> Generic anti-detection for any site</li>
          </ul>

          <p>
            The template sets your Canvas hash, WebGL renderer, screen resolution, timezone, and 47 other fingerprint parameters.
          </p>

          <p>
            <strong>Operating System:</strong> Match the OS you're actually using. Don't pick Windows if you're on Mac. Sites check for mismatches.
          </p>

          <p>
            <strong>Geolocation:</strong> Set to match your proxy location. If your proxy is in New York, set geolocation to New York. Mismatches trigger fraud detection.
          </p>

          <p>
            Click "Create Profile." The app generates your fingerprint. Takes 3 seconds.
          </p>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Important</p>
            <p className="text-sm mb-0">
              Each profile is completely isolated. Cookies, cache, local storage - nothing leaks between profiles. That's the whole point.
            </p>
          </Card>

          <h2 id="step-4">Step 4: Add a Proxy</h2>

          <p>
            Browser fingerprints hide your identity. Proxies hide your IP. You need both.
          </p>

          <p>
            Click the profile you just created. Click "Edit Profile." Scroll to the Proxy section.
          </p>

          <p>
            Enter your proxy details:
          </p>

          <ul>
            <li><strong>Protocol:</strong> HTTP, HTTPS, or SOCKS5 (SOCKS5 is fastest)</li>
            <li><strong>Host:</strong> Your proxy IP or hostname</li>
            <li><strong>Port:</strong> Usually 8080 for HTTP or 1080 for SOCKS5</li>
            <li><strong>Username/Password:</strong> If your proxy requires authentication</li>
          </ul>

          <p>
            Don't have a proxy? Get one from:
          </p>

          <ul>
            <li><strong>Bright Data:</strong> Premium residential proxies, 99.9% uptime</li>
            <li><strong>Smartproxy:</strong> Budget-friendly, good for testing</li>
            <li><strong>Oxylabs:</strong> Enterprise-grade, great for scraping</li>
          </ul>

          <p>
            Click "Test Connection." The app sends a request through your proxy. If it works, you'll see a green checkmark. If not, double-check your credentials.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Proxy Type</th>
                  <th>Speed</th>
                  <th>Detection Rate</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Residential</td>
                  <td>Medium</td>
                  <td>Low (2-5%)</td>
                  <td>$5-15/GB</td>
                </tr>
                <tr>
                  <td>Datacenter</td>
                  <td>Fast</td>
                  <td>High (30-40%)</td>
                  <td>$0.50-2/GB</td>
                </tr>
                <tr>
                  <td>Mobile</td>
                  <td>Slow</td>
                  <td>Very Low (&lt;1%)</td>
                  <td>$15-30/GB</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="step-5">Step 5: Start Browsing</h2>

          <p>
            Click "Launch Profile." The browser opens in 2-3 seconds.
          </p>

          <p>
            It looks like Chrome. That's intentional. All your bookmarks and extensions work. But under the hood, your fingerprint is completely different.
          </p>

          <p>
            Visit a fingerprint testing site like pixelscan.net or browserleaks.com. Check your Canvas hash, WebGL data, and timezone. They should match your profile settings.
          </p>

          <p>
            Visit whatismyipaddress.com. Your IP should match your proxy location. Not your real location.
          </p>

          <p>
            If both checks pass, you're golden. Your profile is working.
          </p>

          <h2>What to Do Next</h2>

          <p>
            Now that your first profile works, here's what most users do:
          </p>

          <ol>
            <li><strong>Create more profiles:</strong> One for each account you manage</li>
            <li><strong>Organize profiles:</strong> Use tags and folders to stay organized</li>
            <li><strong>Set up team access:</strong> Invite team members if you're on Team or Enterprise</li>
            <li><strong>Configure automation:</strong> Use the API to launch profiles programmatically</li>
            <li><strong>Enable 2FA:</strong> Add two-factor authentication for account security</li>
          </ol>

          <h2>Common First-Time Issues</h2>

          <p>
            <strong>Profile won't launch:</strong> Check your RAM usage. Each profile uses 200-500MB. Close other apps if you're maxed out.
          </p>

          <p>
            <strong>Proxy connection fails:</strong> Verify your proxy isn't expired. Most proxies rotate IPs every 10-30 minutes. Re-test the connection.
          </p>

          <p>
            <strong>Site detects multiple accounts:</strong> Make sure cookies are cleared between logins. Use different fingerprint templates for each profile.
          </p>

          <p>
            <strong>Slow loading speeds:</strong> Residential proxies are slower than datacenter. Expect 2-3x slower page loads. That's normal.
          </p>

          <h2>Getting Help</h2>

          <p>
            If you're stuck, we have live chat support. Click the chat icon in the bottom right of the dashboard. Average response time is under 2 minutes.
          </p>

          <p>
            For technical questions, check our docs. We have 24 guides covering every feature. Search works great.
          </p>

          <p>
            For support or deployment questions, email sales@multilogin.io. We respond within 4 hours during business hours.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Ready to Scale Up?</h3>
            <p className="mb-4">
              You've created your first profile. Now learn how to customize fingerprints, automate profile creation, and manage team access.
            </p>
            <Link href="/docs">
              <Button size="lg">
                Explore All Guides <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} leads product development at Multilogin.io. He's built onboarding systems used by 10,000+ users and reduced time-to-first-profile from 15 minutes to under 5 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/creating-first-profile">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Creating Your First Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Deep dive into profile creation with advanced fingerprint customization
                </p>
              </Card>
            </Link>
            <Link href="/docs/understanding-fingerprints">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Understanding Fingerprints</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how browser fingerprints work and why they matter
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
