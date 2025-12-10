import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Network } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Adding Proxies',
  description: 'Step-by-step guide to adding proxies to browser profiles. HTTP, HTTPS, SOCKS5 configuration, authentication, and connection testing.',
  author: 'Omar Hassan',
  authorTitle: 'Network Infrastructure Lead',
  publishedAt: '2024-02-05',
  readingTime: '5 min read',
  category: 'Proxy Integration',
  wordCount: 800,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'add proxy',
    'proxy configuration',
    'http proxy setup',
    'socks5 proxy',
    'proxy authentication',
    'test proxy connection',
    'proxy settings',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/adding-proxies`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function AddingProxiesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    totalTime: 'PT3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open Profile Settings',
        text: 'Open the profile editor and navigate to the Proxy section.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter Proxy Details',
        text: 'Input proxy protocol, host, port, and authentication credentials.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Test Connection',
        text: 'Click Test Connection to verify proxy is working correctly.',
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
            Every profile needs a proxy. Fingerprints hide identity. Proxies hide location. Together they create complete anonymity. Here's how to add them.
          </p>

          <h2>Why Proxies Are Required</h2>

          <p>
            You can create perfect fingerprints. Sites still see your real IP address. That links all your profiles together.
          </p>

          <p>
            Your IP reveals:
          </p>

          <ul>
            <li><strong>Geographic location:</strong> City-level accuracy</li>
            <li><strong>ISP identity:</strong> Residential, datacenter, mobile</li>
            <li><strong>Account correlation:</strong> Multiple accounts from same IP = instant red flag</li>
            <li><strong>Session tracking:</strong> Sites track IP across visits</li>
          </ul>

          <p>
            Use a unique proxy for each profile. Or rotating residential proxies that change IPs automatically.
          </p>

          <h2>Where to Get Proxies</h2>

          <p>
            Don't use free proxies. They're slow, unreliable, and often honeypots collecting your data.
          </p>

          <p>
            Recommended proxy providers:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Best For</th>
                  <th>Price Range</th>
                  <th>Detection Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bright Data</td>
                  <td>Enterprise, high-volume</td>
                  <td>$12.75/GB</td>
                  <td>Very Low (1-2%)</td>
                </tr>
                <tr>
                  <td>Smartproxy</td>
                  <td>Budget-friendly, testing</td>
                  <td>$8.50/GB</td>
                  <td>Low (3-5%)</td>
                </tr>
                <tr>
                  <td>Oxylabs</td>
                  <td>Web scraping, automation</td>
                  <td>$15/GB</td>
                  <td>Very Low (1-2%)</td>
                </tr>
                <tr>
                  <td>NetNut</td>
                  <td>Social media management</td>
                  <td>$10/GB</td>
                  <td>Low (2-4%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            All provide residential IPs, authentication, and dashboard management. Pick based on your budget and detection tolerance.
          </p>

          <h2>Adding a Proxy to Your Profile</h2>

          <p>
            Open your profile editor. Scroll to the Proxy section.
          </p>

          <p>
            You'll see proxy configuration fields:
          </p>

          <p>
            <strong>1. Protocol</strong>
          </p>

          <p>
            Choose your proxy type:
          </p>

          <ul>
            <li><strong>HTTP:</strong> Basic web traffic. Fast. Least secure.</li>
            <li><strong>HTTPS:</strong> Encrypted web traffic. More secure than HTTP.</li>
            <li><strong>SOCKS5:</strong> Fastest. Supports all traffic types. Most compatible.</li>
            <li><strong>SOCKS4:</strong> Legacy. Only use if SOCKS5 doesn't work.</li>
          </ul>

          <p>
            Use SOCKS5 unless your provider only supports HTTP/HTTPS.
          </p>

          <p>
            <strong>2. Host and Port</strong>
          </p>

          <p>
            Your proxy provider gives you these. Format:
          </p>

          <ul>
            <li><strong>Host:</strong> proxy.provider.com or 123.45.67.89 (IP address)</li>
            <li><strong>Port:</strong> Usually 8080 for HTTP, 1080 for SOCKS5</li>
          </ul>

          <p>
            Example: proxy.brightdata.com:22225
          </p>

          <p>
            <strong>3. Username and Password (if required)</strong>
          </p>

          <p>
            Most residential proxies require authentication. Your provider gives you credentials.
          </p>

          <p>
            Format varies:
          </p>

          <ul>
            <li><strong>Simple:</strong> username: johndoe, password: secretpass</li>
            <li><strong>With session ID:</strong> username: johndoe-session-abc123, password: secretpass</li>
            <li><strong>With country code:</strong> username: johndoe-country-us, password: secretpass</li>
          </ul>

          <p>
            Check your provider's documentation for exact format.
          </p>

          <p>
            <strong>4. Test Connection</strong>
          </p>

          <p>
            Click "Test Connection" button. We send a request through your proxy.
          </p>

          <p>
            Success: Green checkmark. Shows your proxy IP and location.
          </p>

          <p>
            Failure: Red X. Shows error message:
          </p>

          <ul>
            <li><strong>"Connection refused":</strong> Wrong host or port</li>
            <li><strong>"Authentication failed":</strong> Wrong username or password</li>
            <li><strong>"Timeout":</strong> Proxy is slow or down</li>
            <li><strong>"Proxy error":</strong> Proxy provider issue</li>
          </ul>

          <p>
            Fix the error and test again.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
            <p className="text-sm mb-0">
              Save proxy credentials in your password manager. Don't type them manually each time. One typo and your proxy fails.
            </p>
          </Card>

          <h2>Bulk Proxy Assignment</h2>

          <p>
            Adding proxies to 50 profiles one-by-one? No thanks.
          </p>

          <p>
            Bulk proxy import:
          </p>

          <ol>
            <li>Dashboard → Profiles → Select multiple profiles</li>
            <li>Right-click → "Bulk Operations" → "Assign Proxies"</li>
            <li>Upload proxy list (CSV or TXT format)</li>
            <li>Format: protocol://username:password@host:port</li>
            <li>Click "Assign" - proxies distributed across selected profiles</li>
          </ol>

          <p>
            Example CSV:
          </p>

          <pre><code>socks5://user1:pass1@proxy1.provider.com:1080{'\n'}socks5://user2:pass2@proxy2.provider.com:1080{'\n'}http://user3:pass3@proxy3.provider.com:8080</code></pre>

          <p>
            First proxy goes to first profile. Second to second. And so on.
          </p>

          <h2>Proxy Rotation Settings</h2>

          <p>
            Some providers offer rotating proxies. The IP changes automatically.
          </p>

          <p>
            Two rotation modes:
          </p>

          <p>
            <strong>Session-Based Rotation:</strong> IP changes per browser session. Launch profile = new IP. Close and reopen = different IP.
          </p>

          <p>
            <strong>Time-Based Rotation:</strong> IP changes every X minutes (5, 10, 30). Profile stays open but IP rotates.
          </p>

          <p>
            Session-based is safer for account management. Time-based is better for scraping.
          </p>

          <p>
            Configure rotation in your proxy provider dashboard, not in Multilogin. We just route traffic through the proxy.
          </p>

          <h2>Matching Geolocation to Proxy</h2>

          <p>
            Critical: Browser geolocation must match proxy location.
          </p>

          <p>
            Proxy in Dallas? Set browser geolocation to Dallas coordinates. Proxy in London? Set geolocation to London.
          </p>

          <p>
            Mismatches trigger fraud detection. Sites compare IP geolocation with browser geolocation API.
          </p>

          <p>
            Find coordinates:
          </p>

          <ol>
            <li>Visit ipinfo.io</li>
            <li>Enter your proxy IP</li>
            <li>Copy lat/long coordinates</li>
            <li>Paste into profile geolocation settings</li>
          </ol>

          <h2>Common Proxy Issues</h2>

          <p>
            <strong>Proxy works but sites detect it:</strong> You're using datacenter proxies. Switch to residential. Datacenter IPs are blacklisted on most platforms.
          </p>

          <p>
            <strong>Slow loading speeds:</strong> Residential proxies are slower. Expect 2-3x longer load times. That's normal. Use datacenter for speed (but higher detection).
          </p>

          <p>
            <strong>Proxy stops working after days:</strong> Rotating residential IPs expired. Check your proxy provider bandwidth usage. Re-authenticate if needed.
          </p>

          <p>
            <strong>Can't access certain sites:</strong> Proxy IP is banned. Change to a different proxy or provider. Some sites ban entire proxy networks.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Learn Proxy Types</h3>
            <p className="mb-4">
              Now you know how to add proxies. Next, learn the difference between residential, datacenter, and mobile proxies. When to use each type and their trade-offs.
            </p>
            <Link href="/docs/proxy-types-explained">
              <Button size="lg">
                Proxy Types Explained <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} manages proxy infrastructure at Multilogin.io. He's integrated 20+ proxy providers and optimized connection routing for 100,000+ concurrent proxy sessions.
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
                  Understand residential, datacenter, and mobile proxies
                </p>
              </Card>
            </Link>
            <Link href="/docs/troubleshooting-connections">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Troubleshooting Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Fix common proxy connection issues and errors
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
