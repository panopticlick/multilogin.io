import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, RefreshCw } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Rotating Proxies',
  description: 'Configure proxy rotation strategies. Session-based rotation, time-based rotation, sticky sessions, and IP pool management for scraping and automation.',
  author: 'Lisa Rodriguez',
  authorTitle: 'Automation Systems Engineer',
  publishedAt: '2024-02-10',
  readingTime: '6 min read',
  category: 'Proxy Integration',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'rotating proxies',
    'proxy rotation',
    'sticky sessions',
    'session-based rotation',
    'time-based rotation',
    'IP rotation',
    'proxy pool management',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/rotating-proxies`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function RotatingProxiesPage() {
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
            Static proxies work for account management. Rotating proxies work for scraping. The IP changes automatically to avoid rate limits and bans. Here's how to configure rotation.
          </p>

          <h2>What Are Rotating Proxies?</h2>

          <p>
            Regular proxies give you one IP address. Rotating proxies give you access to a pool of IPs that cycle automatically.
          </p>

          <p>
            Each request can use a different IP. Or you can stick to one IP for a session then rotate.
          </p>

          <p>
            This prevents:
          </p>

          <ul>
            <li>Rate limiting (sites limit requests per IP)</li>
            <li>IP bans (scraping too fast from one IP)</li>
            <li>Connection tracking (sites correlate activity by IP)</li>
            <li>Geographic blocks (rotate through different regions)</li>
          </ul>

          <h2>Rotation Methods</h2>

          <p>
            Two main rotation strategies: session-based and time-based.
          </p>

          <h3>Session-Based Rotation</h3>

          <p>
            You get one IP for the entire browser session. Close the browser. Reopen. New IP.
          </p>

          <p>
            <strong>How it works:</strong>
          </p>

          <ol>
            <li>Launch profile → Proxy assigns IP from pool</li>
            <li>All requests during session use that IP</li>
            <li>Close profile → IP returned to pool</li>
            <li>Launch again → New IP assigned</li>
          </ol>

          <p>
            <strong>Advantages:</strong>
          </p>

          <ul>
            <li>Session consistency - same IP throughout session</li>
            <li>No mid-session IP changes that break logins</li>
            <li>Sites see normal user behavior</li>
            <li>Perfect for account management</li>
          </ul>

          <p>
            <strong>Use cases:</strong>
          </p>

          <ul>
            <li>Managing social media accounts</li>
            <li>E-commerce seller accounts</li>
            <li>Ad account management</li>
            <li>Any platform tracking device persistence</li>
          </ul>

          <p>
            This is the default mode for most residential proxy providers.
          </p>

          <h3>Time-Based Rotation</h3>

          <p>
            IP changes every X minutes while browser stays open.
          </p>

          <p>
            <strong>Common intervals:</strong>
          </p>

          <ul>
            <li><strong>5 minutes:</strong> Aggressive rotation for fast scraping</li>
            <li><strong>10 minutes:</strong> Balanced for moderate scraping</li>
            <li><strong>30 minutes:</strong> Conservative for account work</li>
          </ul>

          <p>
            <strong>Advantages:</strong>
          </p>

          <ul>
            <li>Can scrape for hours without IP bans</li>
            <li>Distribute load across many IPs</li>
            <li>Bypass hourly rate limits</li>
          </ul>

          <p>
            <strong>Disadvantages:</strong>
          </p>

          <ul>
            <li>Mid-session IP changes break some sites</li>
            <li>Logged-in sessions might get kicked</li>
            <li>Sites detect suspicious IP hopping</li>
          </ul>

          <p>
            <strong>Use cases:</strong>
          </p>

          <ul>
            <li>Price monitoring across thousands of pages</li>
            <li>Large-scale web scraping</li>
            <li>Data extraction projects</li>
            <li>Bypassing strict rate limits</li>
          </ul>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Warning</p>
            <p className="text-sm mb-0">
              Don't use time-based rotation for account management. Frequent IP changes flag accounts. E-commerce platforms and social media ban accounts that hop IPs mid-session.
            </p>
          </Card>

          <h2>Sticky Sessions</h2>

          <p>
            Sticky sessions keep the same IP for a set duration even with time-based rotation.
          </p>

          <p>
            Example: 10-minute sticky sessions.
          </p>

          <ol>
            <li>First request → Get IP 1.2.3.4</li>
            <li>All requests for next 10 minutes use 1.2.3.4</li>
            <li>After 10 minutes → Rotate to new IP 5.6.7.8</li>
            <li>Next 10 minutes all use 5.6.7.8</li>
          </ol>

          <p>
            <strong>Implementation:</strong>
          </p>

          <p>
            Most residential proxy providers use session IDs in the username:
          </p>

          <pre><code>username: your-username-session-abc123{'\n'}password: your-password</code></pre>

          <p>
            Same session ID = same IP. Change session ID = rotate to new IP.
          </p>

          <p>
            To force rotation:
          </p>

          <ul>
            <li>Change session ID in username</li>
            <li>Or wait for timeout period</li>
          </ul>

          <h2>Configuring Rotation in Multilogin</h2>

          <p>
            Rotation happens at the proxy provider level, not in Multilogin. We just route traffic through your proxy.
          </p>

          <p>
            <strong>For session-based rotation:</strong>
          </p>

          <ol>
            <li>Use provider's rotating residential endpoint</li>
            <li>Don't include session ID in username</li>
            <li>Each profile launch gets a random IP</li>
          </ol>

          <p>
            Example: Bright Data rotating endpoint:
          </p>

          <pre><code>Protocol: HTTP{'\n'}Host: brd.superproxy.io{'\n'}Port: 22225{'\n'}Username: brd-customer-yourID{'\n'}Password: yourPassword</code></pre>

          <p>
            <strong>For sticky sessions:</strong>
          </p>

          <ol>
            <li>Add session ID to proxy username</li>
            <li>Multilogin remembers proxy config per profile</li>
            <li>Same profile = same session ID = same IP (until timeout)</li>
          </ol>

          <p>
            Example with 30-minute sticky session:
          </p>

          <pre><code>Username: brd-customer-yourID-session-profile001{'\n'}Password: yourPassword</code></pre>

          <p>
            Each profile gets a unique session ID. Profile 1 uses "profile001", Profile 2 uses "profile002".
          </p>

          <h2>IP Pool Management</h2>

          <p>
            Residential proxy pools typically have millions of IPs. But you can narrow the pool:
          </p>

          <p>
            <strong>Geographic Filtering:</strong>
          </p>

          <pre><code>Username: user-country-us{'\n'}Username: user-country-us-city-newyork</code></pre>

          <p>
            <strong>ISP Filtering:</strong>
          </p>

          <pre><code>Username: user-carrier-verizon</code></pre>

          <p>
            <strong>ASN Targeting:</strong>
          </p>

          <pre><code>Username: user-asn-7922</code></pre>

          <p>
            Check your proxy provider's documentation for exact syntax.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Rotation Strategy</th>
                  <th>Best For</th>
                  <th>IP Persistence</th>
                  <th>Bandwidth Usage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Session-based</td>
                  <td>Account management</td>
                  <td>Entire session</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>5-min sticky</td>
                  <td>Fast scraping</td>
                  <td>5 minutes</td>
                  <td>High</td>
                </tr>
                <tr>
                  <td>10-min sticky</td>
                  <td>Balanced scraping</td>
                  <td>10 minutes</td>
                  <td>Medium</td>
                </tr>
                <tr>
                  <td>30-min sticky</td>
                  <td>Light automation</td>
                  <td>30 minutes</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>Per-request rotation</td>
                  <td>Massive scraping</td>
                  <td>Single request</td>
                  <td>Very high</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Monitoring Rotation</h2>

          <p>
            Check if rotation is working:
          </p>

          <ol>
            <li>Launch profile → Visit whatismyipaddress.com → Note IP</li>
            <li>Close profile → Relaunch → Visit again → Check if IP changed</li>
            <li>If IP same = not rotating, check proxy config</li>
            <li>If IP changed = rotation working</li>
          </ol>

          <p>
            Your proxy provider dashboard shows:
          </p>

          <ul>
            <li>Number of unique IPs used</li>
            <li>Current active sessions</li>
            <li>IP rotation statistics</li>
            <li>Bandwidth per IP</li>
          </ul>

          <h2>Rotation Best Practices</h2>

          <p>
            <strong>For account management:</strong>
          </p>

          <ul>
            <li>Use session-based rotation only</li>
            <li>One profile = one proxy = one IP per session</li>
            <li>Don't rotate IPs mid-session</li>
            <li>Keep same IP for days/weeks if possible</li>
          </ul>

          <p>
            <strong>For web scraping:</strong>
          </p>

          <ul>
            <li>Start with 10-minute sticky sessions</li>
            <li>Reduce to 5 minutes if hitting rate limits</li>
            <li>Increase to 30 minutes if getting "suspicious activity" blocks</li>
            <li>Monitor ban rates and adjust</li>
          </ul>

          <p>
            <strong>For automation:</strong>
          </p>

          <ul>
            <li>Match rotation to site's rate limit window</li>
            <li>If limit is 100 req/hour, rotate every 30-60 minutes</li>
            <li>If limit is 1000 req/day, session-based is fine</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Troubleshoot Connection Issues</h3>
            <p className="mb-4">
              Proxy rotation set up but connections failing? Learn how to diagnose and fix common proxy errors, authentication issues, and performance problems.
            </p>
            <Link href="/docs/troubleshooting-connections">
              <Button size="lg">
                Troubleshooting Guide <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} designs automation systems at Multilogin.io. She's built proxy rotation strategies for 10,000+ scraping projects and optimized rotation intervals for minimal detection.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/proxy-types-explained">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Proxy Types Explained</h3>
                <p className="text-sm text-muted-foreground">
                  Understand which proxy types support rotation
                </p>
              </Card>
            </Link>
            <Link href="/docs/troubleshooting-connections">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Troubleshooting Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Fix proxy rotation and connection errors
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
