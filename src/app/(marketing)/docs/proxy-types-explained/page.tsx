import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Home, Server, Smartphone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Proxy Types Explained',
  description: 'Complete guide to residential, datacenter, mobile, and ISP proxies. Compare speed, detection rates, pricing, and use cases for each proxy type.',
  author: 'Dmitry Volkov',
  authorTitle: 'Proxy Infrastructure Architect',
  publishedAt: '2024-02-08',
  readingTime: '7 min read',
  category: 'Proxy Integration',
  wordCount: 1100,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'proxy types',
    'residential proxy',
    'datacenter proxy',
    'mobile proxy',
    'ISP proxy',
    'proxy comparison',
    'proxy detection',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/proxy-types-explained`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function ProxyTypesExplainedPage() {
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
    timeRequired: 'PT7M',
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
            Not all proxies are equal. Residential proxies pass detection but cost more. Datacenter proxies are fast but get blocked. Mobile proxies are undetectable but expensive. Here's how to choose.
          </p>

          <h2>Quick Comparison</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Proxy Type</th>
                  <th>Speed</th>
                  <th>Detection Rate</th>
                  <th>Price/GB</th>
                  <th>Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Residential</td>
                  <td>Medium</td>
                  <td>Low (2-5%)</td>
                  <td>$5-15</td>
                  <td>Account management</td>
                </tr>
                <tr>
                  <td>Datacenter</td>
                  <td>Fast</td>
                  <td>High (30-40%)</td>
                  <td>$0.50-2</td>
                  <td>Testing, low-risk scraping</td>
                </tr>
                <tr>
                  <td>Mobile</td>
                  <td>Slow</td>
                  <td>Very Low (&lt;1%)</td>
                  <td>$15-30</td>
                  <td>Social media, high-risk accounts</td>
                </tr>
                <tr>
                  <td>ISP</td>
                  <td>Fast</td>
                  <td>Low (3-7%)</td>
                  <td>$3-8</td>
                  <td>Static IP needs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Residential Proxies</h2>

          <div className="my-6">
            <Card className="p-6">
              <Home className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Residential Proxies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                IPs assigned to real homes by ISPs. Look like genuine residential users. Hardest to detect.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Detection Rate:</strong> 2-5% (very low)</p>
                <p><strong>Speed:</strong> 5-15 Mbps average</p>
                <p><strong>Pricing:</strong> $5-15 per GB bandwidth</p>
              </div>
            </Card>
          </div>

          <p>
            <strong>How They Work:</strong>
          </p>

          <p>
            Proxy providers partner with homeowners or use peer-to-peer networks. Your traffic routes through real residential internet connections. Comcast, AT&T, Verizon IPs.
          </p>

          <p>
            Sites see a normal home user. Not a datacenter or bot.
          </p>

          <p>
            <strong>Advantages:</strong>
          </p>

          <ul>
            <li>Low detection rates - sites trust residential IPs</li>
            <li>Huge IP pool - millions of IPs available</li>
            <li>Geographic targeting - choose specific cities or countries</li>
            <li>ISP diversity - rotate across multiple internet providers</li>
          </ul>

          <p>
            <strong>Disadvantages:</strong>
          </p>

          <ul>
            <li>Expensive - 10-30x more costly than datacenter</li>
            <li>Slower speeds - limited by home internet bandwidth</li>
            <li>Less stable - homeowners can disconnect, causing IP changes</li>
            <li>Bandwidth-based pricing - pay per GB instead of flat rate</li>
          </ul>

          <p>
            <strong>Use Cases:</strong>
          </p>

          <ul>
            <li>E-commerce account management (Amazon, eBay sellers)</li>
            <li>Social media marketing (Facebook, Instagram accounts)</li>
            <li>Ad verification and monitoring</li>
            <li>Price scraping on strict sites</li>
            <li>Any platform with aggressive bot detection</li>
          </ul>

          <h2>Datacenter Proxies</h2>

          <div className="my-6">
            <Card className="p-6">
              <Server className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Datacenter Proxies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                IPs from cloud providers and data centers. Fast and cheap but easily detected by major platforms.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Detection Rate:</strong> 30-40% (high)</p>
                <p><strong>Speed:</strong> 100-1000 Mbps (very fast)</p>
                <p><strong>Pricing:</strong> $0.50-2 per GB or $50-200/month flat</p>
              </div>
            </Card>
          </div>

          <p>
            <strong>How They Work:</strong>
          </p>

          <p>
            Proxy companies run servers in AWS, Google Cloud, DigitalOcean. You get IPs from these datacenters.
          </p>

          <p>
            Sites see datacenter IPs in their logs. Red flag for most platforms.
          </p>

          <p>
            <strong>Advantages:</strong>
          </p>

          <ul>
            <li>Blazing fast - gigabit speeds common</li>
            <li>Cheap - flat monthly rates or low per-GB cost</li>
            <li>Stable - no random disconnects</li>
            <li>Unlimited bandwidth options</li>
            <li>Multiple subnets available</li>
          </ul>

          <p>
            <strong>Disadvantages:</strong>
          </p>

          <ul>
            <li>Easily detected - ASN databases list datacenter ranges</li>
            <li>Often blocked - Amazon, Facebook, Instagram block datacenter IPs</li>
            <li>Shared IPs - others abuse the same IP ranges</li>
            <li>Not legitimate - sites know these aren't real users</li>
          </ul>

          <p>
            <strong>Use Cases:</strong>
          </p>

          <ul>
            <li>Testing and development</li>
            <li>Low-security web scraping</li>
            <li>Price monitoring on permissive sites</li>
            <li>Bypassing geo-restrictions (but not bot detection)</li>
            <li>Internal tools and automation</li>
          </ul>

          <p>
            <strong>When to Avoid:</strong>
          </p>

          <p>
            Don't use datacenter proxies for account management. Amazon bans datacenter IPs on sight. Facebook flags them immediately. Instagram blocks 90%+ of datacenter traffic.
          </p>

          <h2>Mobile Proxies</h2>

          <div className="my-6">
            <Card className="p-6">
              <Smartphone className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Mobile Proxies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                IPs from mobile carriers (4G/5G). Most trusted by platforms. Nearly impossible to detect or block.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Detection Rate:</strong> &lt;1% (virtually undetectable)</p>
                <p><strong>Speed:</strong> 5-50 Mbps (varies by signal)</p>
                <p><strong>Pricing:</strong> $15-30 per GB or $300-1000/month per SIM</p>
              </div>
            </Card>
          </div>

          <p>
            <strong>How They Work:</strong>
          </p>

          <p>
            Proxy providers operate farms of mobile devices with real SIM cards. AT&T, Verizon, T-Mobile connections. Your traffic routes through actual smartphones.
          </p>

          <p>
            Platforms can't block mobile IPs. Doing so would ban millions of legitimate users.
          </p>

          <p>
            <strong>Advantages:</strong>
          </p>

          <ul>
            <li>Undetectable - platforms trust mobile carrier IPs</li>
            <li>Carrier-grade NAT - multiple users share same IP legitimately</li>
            <li>Perfect for social media - mobile app fingerprints</li>
            <li>Dynamic IPs - change IPs by toggling airplane mode</li>
            <li>Won't get blacklisted - too risky for platforms to block</li>
          </ul>

          <p>
            <strong>Disadvantages:</strong>
          </p>

          <ul>
            <li>Expensive - 3-6x cost of residential proxies</li>
            <li>Slow and unstable - depends on cell signal strength</li>
            <li>Limited IP pool - fewer carriers than residential ISPs</li>
            <li>Carrier restrictions - some carriers detect and block proxy usage</li>
          </ul>

          <p>
            <strong>Use Cases:</strong>
          </p>

          <ul>
            <li>High-value social media accounts (Facebook, Instagram, TikTok)</li>
            <li>Platforms with advanced bot detection</li>
            <li>Mobile app automation</li>
            <li>When residential proxies get detected</li>
            <li>Accounts worth protecting at any cost</li>
          </ul>

          <h2>ISP Proxies (Static Residential)</h2>

          <p>
            Hybrid between residential and datacenter. IPs hosted in datacenters but registered to residential ISPs.
          </p>

          <p>
            <strong>How They Work:</strong>
          </p>

          <p>
            Proxy companies rent IP address blocks from residential ISPs. Host servers in datacenters using these residential IPs.
          </p>

          <p>
            You get datacenter speed with residential trust.
          </p>

          <p>
            <strong>Advantages:</strong>
          </p>

          <ul>
            <li>Fast like datacenter - 100-1000 Mbps</li>
            <li>Trusted like residential - ISP-assigned IPs</li>
            <li>Static IPs - same IP for months</li>
            <li>Cheaper than residential - $3-8 per GB</li>
          </ul>

          <p>
            <strong>Disadvantages:</strong>
          </p>

          <ul>
            <li>Smaller IP pools - limited availability</li>
            <li>Medium detection rate - some platforms detect them</li>
            <li>Not truly residential - advanced detection can spot them</li>
          </ul>

          <p>
            <strong>Use Cases:</strong>
          </p>

          <ul>
            <li>Long-term account management needing static IPs</li>
            <li>Platforms that ban frequent IP changes</li>
            <li>When you need speed + moderate trust</li>
            <li>Budget alternative to full residential</li>
          </ul>

          <h2>Choosing the Right Proxy Type</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Your Situation</th>
                  <th>Best Proxy Type</th>
                  <th>Alternative</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Managing 10+ Amazon seller accounts</td>
                  <td>Residential</td>
                  <td>ISP</td>
                </tr>
                <tr>
                  <td>Running Instagram influencer accounts</td>
                  <td>Mobile</td>
                  <td>Residential</td>
                </tr>
                <tr>
                  <td>Scraping product prices</td>
                  <td>Datacenter</td>
                  <td>Residential</td>
                </tr>
                <tr>
                  <td>Facebook Ads management</td>
                  <td>Residential</td>
                  <td>Mobile</td>
                </tr>
                <tr>
                  <td>Testing your own website</td>
                  <td>Datacenter</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>High-value accounts (&gt;$10k/month revenue)</td>
                  <td>Mobile</td>
                  <td>Residential</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            General rule: Match proxy cost to account value. $100/month account? Use residential. $10k/month account? Use mobile.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Master Rotating Proxies</h3>
            <p className="mb-4">
              Now you understand proxy types. Next, learn how rotating proxies work. Session-based vs time-based rotation, sticky sessions, and rotation strategies.
            </p>
            <Link href="/docs/rotating-proxies">
              <Button size="lg">
                Rotating Proxies Guide <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} designs proxy infrastructure for Multilogin.io. He's tested 50+ proxy providers and optimized detection rates across residential, datacenter, and mobile networks.
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
                  Learn how to configure and add proxies to your profiles
                </p>
              </Card>
            </Link>
            <Link href="/docs/rotating-proxies">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Rotating Proxies</h3>
                <p className="text-sm text-muted-foreground">
                  Configure proxy rotation for scraping and automation
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
