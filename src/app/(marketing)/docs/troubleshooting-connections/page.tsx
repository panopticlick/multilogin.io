import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, AlertCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Troubleshooting Proxy Connections',
  description: 'Fix common proxy connection errors. Authentication failures, timeouts, DNS issues, and slow speeds. Step-by-step diagnostics and solutions.',
  author: 'Thomas Anderson',
  authorTitle: 'Technical Support Lead',
  publishedAt: '2024-02-12',
  readingTime: '5 min read',
  category: 'Proxy Integration',
  wordCount: 800,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'proxy troubleshooting',
    'proxy errors',
    'authentication failed',
    'proxy timeout',
    'connection refused',
    'proxy not working',
    'fix proxy issues',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/troubleshooting-connections`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function TroubleshootingConnectionsPage() {
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
    timeRequired: 'PT5M',
    proficiencyLevel: 'Beginner',
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
            Proxy connection errors are frustrating. Wrong credentials. Timeouts. Slow speeds. Here's how to diagnose and fix the most common issues.
          </p>

          <h2>Error: "Authentication Failed"</h2>

          <p>
            <strong>What it means:</strong> Your proxy username or password is wrong.
          </p>

          <p>
            <strong>Common causes:</strong>
          </p>

          <ul>
            <li>Typo in username or password</li>
            <li>Copy-paste included extra spaces</li>
            <li>Username format is wrong (missing session ID or country code)</li>
            <li>Proxy provider changed credentials</li>
            <li>Subscription expired</li>
          </ul>

          <p>
            <strong>Solutions:</strong>
          </p>

          <ol>
            <li><strong>Check credentials:</strong> Log into your proxy provider dashboard. Copy credentials fresh. Don't type manually.</li>
            <li><strong>Trim whitespace:</strong> Paste into text editor first. Remove any leading/trailing spaces. Then paste into Multilogin.</li>
            <li><strong>Verify format:</strong> Some providers require specific username formats like "username-session-123" or "username-country-us". Check documentation.</li>
            <li><strong>Test in browser:</strong> Set proxy in Chrome/Firefox system settings. Try browsing. If that fails, issue is with proxy provider.</li>
            <li><strong>Check subscription:</strong> Verify your proxy plan hasn't expired. Check bandwidth limits.</li>
          </ol>

          <h2>Error: "Connection Timeout"</h2>

          <p>
            <strong>What it means:</strong> Couldn't reach the proxy server within timeout period.
          </p>

          <p>
            <strong>Common causes:</strong>
          </p>

          <ul>
            <li>Wrong host or port</li>
            <li>Proxy server is down</li>
            <li>Your firewall blocking connection</li>
            <li>ISP blocking proxy ports</li>
            <li>Network connectivity issues</li>
          </ul>

          <p>
            <strong>Solutions:</strong>
          </p>

          <ol>
            <li><strong>Verify host/port:</strong> Double-check proxy host and port from provider dashboard. Common ports: 8080 (HTTP), 1080 (SOCKS5), 22225 (Bright Data).</li>
            <li><strong>Test connectivity:</strong> Open terminal/command prompt. Run: <code>telnet proxy-host port</code>. If connection fails, proxy is unreachable.</li>
            <li><strong>Check firewall:</strong> Temporarily disable firewall. Test connection. If works, add Multilogin to firewall whitelist.</li>
            <li><strong>Try different protocol:</strong> If SOCKS5 times out, try HTTP. Some networks block SOCKS traffic.</li>
            <li><strong>Contact provider:</strong> Proxy server might be down. Check provider status page or support.</li>
          </ol>

          <h2>Error: "Connection Refused"</h2>

          <p>
            <strong>What it means:</strong> Proxy server actively rejected your connection.
          </p>

          <p>
            <strong>Common causes:</strong>
          </p>

          <ul>
            <li>Wrong proxy type (using HTTP endpoint with SOCKS5 protocol)</li>
            <li>IP whitelist not configured</li>
            <li>Proxy provider blocked your IP</li>
            <li>Port is closed</li>
          </ul>

          <p>
            <strong>Solutions:</strong>
          </p>

          <ol>
            <li><strong>Match protocol to endpoint:</strong> If provider gives HTTP endpoint, use HTTP protocol in Multilogin. If SOCKS5 endpoint, use SOCKS5 protocol.</li>
            <li><strong>Check IP whitelist:</strong> Some providers require you to whitelist your IP address. Log into provider dashboard → Settings → Whitelist your current IP.</li>
            <li><strong>Verify port:</strong> Common mistake: using port 1080 for HTTP proxy or 8080 for SOCKS5. Match port to protocol.</li>
          </ol>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Error Message</th>
                  <th>Most Likely Cause</th>
                  <th>Quick Fix</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Authentication Failed</td>
                  <td>Wrong credentials</td>
                  <td>Re-copy from provider dashboard</td>
                </tr>
                <tr>
                  <td>Connection Timeout</td>
                  <td>Wrong host/port</td>
                  <td>Verify host and port spelling</td>
                </tr>
                <tr>
                  <td>Connection Refused</td>
                  <td>Wrong protocol</td>
                  <td>Match protocol to endpoint type</td>
                </tr>
                <tr>
                  <td>DNS Resolution Failed</td>
                  <td>Wrong hostname</td>
                  <td>Check for typos in host field</td>
                </tr>
                <tr>
                  <td>Proxy Error 407</td>
                  <td>Authentication required</td>
                  <td>Add username and password</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Proxy Works But Sites Detect It</h2>

          <p>
            Connection successful but accounts get banned or CAPTCHAs appear constantly.
          </p>

          <p>
            <strong>Causes:</strong>
          </p>

          <ul>
            <li>Using datacenter proxies on strict platforms</li>
            <li>Proxy IP is blacklisted</li>
            <li>Too many users sharing same IP</li>
            <li>Geolocation mismatch with browser fingerprint</li>
          </ul>

          <p>
            <strong>Solutions:</strong>
          </p>

          <ol>
            <li><strong>Switch to residential:</strong> If using datacenter proxies, upgrade to residential. Facebook, Amazon, Instagram block most datacenter IPs.</li>
            <li><strong>Test IP reputation:</strong> Visit ipqualityscore.com. Enter your proxy IP. Check fraud score. Score above 75 = bad IP.</li>
            <li><strong>Match geolocation:</strong> Profile Settings → Geolocation. Set coordinates to match proxy IP location. Visit ipinfo.io with your proxy to find coordinates.</li>
            <li><strong>Rotate proxies:</strong> If using static proxy, switch to rotating. Spread activity across multiple IPs.</li>
          </ol>

          <h2>Extremely Slow Loading Speeds</h2>

          <p>
            Pages take 10-30 seconds to load. Constant loading spinners.
          </p>

          <p>
            <strong>Causes:</strong>
          </p>

          <ul>
            <li>Residential proxies are naturally slower (normal)</li>
            <li>Overloaded proxy server</li>
            <li>High latency to proxy location</li>
            <li>Bandwidth throttling</li>
          </ul>

          <p>
            <strong>Solutions:</strong>
          </p>

          <ol>
            <li><strong>Set expectations:</strong> Residential proxies are 2-3x slower than datacenter. 3-5 second load times are normal.</li>
            <li><strong>Choose closer location:</strong> Use proxies geographically closer to you. US East instead of Europe if you're in New York.</li>
            <li><strong>Test different times:</strong> Proxy networks get congested during peak hours (9am-5pm EST). Test at off-peak times.</li>
            <li><strong>Upgrade plan:</strong> Budget residential proxies oversell bandwidth. Premium providers (Bright Data, Oxylabs) have better speed.</li>
          </ol>

          <h2>DNS Resolution Failed</h2>

          <p>
            Error says can't resolve proxy hostname.
          </p>

          <p>
            <strong>Causes:</strong>
          </p>

          <ul>
            <li>Typo in proxy host</li>
            <li>DNS server issues</li>
            <li>Proxy hostname changed</li>
          </ul>

          <p>
            <strong>Solutions:</strong>
          </p>

          <ol>
            <li><strong>Check spelling:</strong> Verify every character in hostname. Common mistake: "proxy.provider.com" vs "proxies.provider.com".</li>
            <li><strong>Use IP address:</strong> If hostname fails, ask provider for IP address directly. Use that instead of hostname.</li>
            <li><strong>Change DNS:</strong> Switch your system DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare). Test again.</li>
          </ol>

          <h2>Diagnostic Checklist</h2>

          <p>
            Work through this checklist to systematically diagnose proxy issues:
          </p>

          <ol>
            <li>✅ Credentials are correct (no typos, no extra spaces)</li>
            <li>✅ Host and port match provider documentation</li>
            <li>✅ Protocol matches endpoint type (HTTP vs SOCKS5)</li>
            <li>✅ Subscription is active and not expired</li>
            <li>✅ Bandwidth limit not exceeded</li>
            <li>✅ IP whitelist configured (if required)</li>
            <li>✅ Firewall allows proxy connection</li>
            <li>✅ Proxy provider status page shows "operational"</li>
            <li>✅ Geolocation matches proxy IP location</li>
            <li>✅ Using residential proxies for strict platforms</li>
          </ol>

          <p>
            If all checkboxes pass and proxy still fails, contact your proxy provider support. Issue is likely on their end.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Master the API</h3>
            <p className="mb-4">
              Proxy configuration mastered. Now automate everything with the Multilogin API. Create profiles, launch browsers, and manage proxies programmatically.
            </p>
            <Link href="/docs/api-authentication">
              <Button size="lg">
                API Authentication <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} leads technical support at Multilogin.io. He's resolved 10,000+ proxy connection issues and built the diagnostic tools that identify 90% of problems automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/adding-proxies">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Adding Proxies</h3>
                <p className="text-sm text-muted-foreground">
                  Learn the basics of proxy configuration
                </p>
              </Card>
            </Link>
            <Link href="/docs/proxy-types-explained">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Proxy Types Explained</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the right proxy type for your needs
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
