import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Clock, User, Shield, Globe, Fingerprint } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Creating Your First Profile',
  description: 'Master browser profile creation with fingerprint templates, geolocation settings, and proxy configuration. Build undetectable profiles in minutes.',
  author: 'Jordan Chen',
  authorTitle: 'Security Engineer',
  publishedAt: '2024-01-18',
  readingTime: '6 min read',
  category: 'Getting Started',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'create browser profile',
    'fingerprint template',
    'browser fingerprinting',
    'antidetect profile setup',
    'proxy configuration',
    'geolocation settings',
    'profile isolation',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/creating-first-profile`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function CreatingFirstProfilePage() {
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
            A browser profile is a complete identity. It has its own fingerprint, cookies, local storage, and browsing history. Creating a solid profile means sites can't link your accounts together.
          </p>

          <h2>Understanding Profile Templates</h2>

          <p>
            Templates are pre-configured fingerprint sets. They're built from real browser data collected from millions of users.
          </p>

          <p>
            We offer three main templates:
          </p>

          <div className="grid gap-4 my-6 sm:grid-cols-3">
            <Card className="p-6">
              <Shield className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">E-commerce</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for Amazon, eBay, Etsy. Includes payment fingerprints and shopping behavior patterns.
              </p>
            </Card>
            <Card className="p-6">
              <Globe className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Social Media</h3>
              <p className="text-sm text-muted-foreground">
                Built for Facebook, Instagram, TikTok. Handles aggressive detection systems.
              </p>
            </Card>
            <Card className="p-6">
              <Fingerprint className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">General</h3>
              <p className="text-sm text-muted-foreground">
                Universal fingerprint for any site. Balanced detection resistance.
              </p>
            </Card>
          </div>

          <p>
            Each template randomizes 47 fingerprint parameters. Canvas hash gets a unique signature. WebGL renderer matches real GPU models. Font list matches common system configurations.
          </p>

          <h2>Choosing Your Browser Type</h2>

          <p>
            You get two choices: Chromium or Firefox.
          </p>

          <p>
            <strong>Chromium:</strong> Works with 99% of sites. Better performance. Smaller memory footprint. Use this unless you have a specific reason not to.
          </p>

          <p>
            <strong>Firefox:</strong> Better for privacy-focused work. Some sites have weaker detection on Firefox. Uses more RAM. Less common in fingerprint databases.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Chromium</th>
                  <th>Firefox</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Site Compatibility</td>
                  <td>99%</td>
                  <td>95%</td>
                </tr>
                <tr>
                  <td>Memory Usage</td>
                  <td>300-400MB</td>
                  <td>400-600MB</td>
                </tr>
                <tr>
                  <td>Detection Resistance</td>
                  <td>High</td>
                  <td>Very High</td>
                </tr>
                <tr>
                  <td>Extension Support</td>
                  <td>Chrome Web Store</td>
                  <td>Firefox Add-ons</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Operating System Settings</h2>

          <p>
            Pick the OS that matches your real system. Mismatches trigger red flags.
          </p>

          <p>
            If you're on Mac, pick macOS. If you're on Windows, pick Windows. Don't try to fake it. Sites check system fonts, API availability, and hardware acceleration support.
          </p>

          <p>
            Example: Windows systems have Segoe UI font. Macs have San Francisco. If you claim to be Windows but load with San Francisco, you're flagged.
          </p>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Critical</p>
            <p className="text-sm mb-0">
              OS selection affects 23 fingerprint parameters. Screen resolution, color depth, timezone format, keyboard layout - they all must match your OS. Use the same OS as your physical machine.
            </p>
          </Card>

          <h2>Screen Resolution and Display Settings</h2>

          <p>
            Use common resolutions. Don't pick exotic sizes like 1367x921. That's weird.
          </p>

          <p>
            Safe resolutions:
          </p>

          <ul>
            <li><strong>1920x1080:</strong> Most common desktop resolution (35% of users)</li>
            <li><strong>1366x768:</strong> Standard laptop resolution (22% of users)</li>
            <li><strong>2560x1440:</strong> High-end desktop (12% of users)</li>
            <li><strong>3840x2160:</strong> 4K displays (8% of users)</li>
          </ul>

          <p>
            Your resolution should match your proxy location's typical device. New York proxies? Use 1920x1080 or 2560x1440. Rural area? 1366x768 is more believable.
          </p>

          <h2>Geolocation Configuration</h2>

          <p>
            Set geolocation to match your proxy IP location. This is non-negotiable.
          </p>

          <p>
            If your proxy is in Dallas, Texas, set coordinates to Dallas. Sites compare your IP geolocation with browser geolocation. Mismatches are instant red flags.
          </p>

          <p>
            You can find coordinates from your proxy provider. Or use IP geolocation tools like ipinfo.io. Enter your proxy IP and grab the lat/long.
          </p>

          <h2>Timezone and Language</h2>

          <p>
            Timezone must match your geolocation. Dallas uses America/Chicago (UTC-6). London uses Europe/London (UTC+0).
          </p>

          <p>
            Language should match too. US proxies? Use en-US. UK proxies? Use en-GB. German proxies? Use de-DE.
          </p>

          <p>
            Don't overthink this. Match everything to your proxy location and you're good.
          </p>

          <h2>WebRTC and IP Leak Protection</h2>

          <p>
            WebRTC can leak your real IP even when using a proxy. We disable it by default.
          </p>

          <p>
            If you need WebRTC for video calls, enable "Altered WebRTC" mode. This routes WebRTC traffic through your proxy and replaces your local IP with a proxy-matched IP.
          </p>

          <p>
            Test for leaks at browserleaks.com/webrtc. Your proxy IP should show. Not your real IP.
          </p>

          <h2>Proxy Integration</h2>

          <p>
            Every profile needs a proxy. Fingerprints hide identity. Proxies hide location. You need both.
          </p>

          <p>
            Add your proxy in the Proxy section. Protocol (HTTP/SOCKS5), host, port, username, password.
          </p>

          <p>
            Test the connection before saving. Green checkmark means good. Red X means check your credentials.
          </p>

          <p>
            Don't share proxies across profiles unless they're rotating residential proxies. Static proxies should be 1:1 with profiles.
          </p>

          <h2>Saving and Launching</h2>

          <p>
            Hit "Create Profile." Takes 3 seconds to generate fingerprint and save settings.
          </p>

          <p>
            Click "Launch Profile" to open the browser. First launch takes 5-7 seconds. Subsequent launches take 2-3 seconds.
          </p>

          <p>
            Verify your setup:
          </p>

          <ol>
            <li>Check fingerprint at pixelscan.net - should show unique Canvas/WebGL</li>
            <li>Check IP at whatismyipaddress.com - should show proxy IP</li>
            <li>Check timezone and language - should match proxy location</li>
          </ol>

          <p>
            If all three pass, you're operational.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Master Fingerprints Next</h3>
            <p className="mb-4">
              Now that you can create profiles, learn how fingerprints actually work under the hood. Understand Canvas, WebGL, fonts, and the 47 parameters that make you unique.
            </p>
            <Link href="/docs/understanding-fingerprints">
              <Button size="lg">
                Understanding Fingerprints <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} builds anti-detection systems at Multilogin.io. He's analyzed 500,000+ browser fingerprints and designed the template system that passes detection on 98% of platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/quick-start">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Quick Start Guide</h3>
                <p className="text-sm text-muted-foreground">
                  New to Multilogin? Start here for account setup and first profile creation
                </p>
              </Card>
            </Link>
            <Link href="/docs/understanding-fingerprints">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Understanding Fingerprints</h3>
                <p className="text-sm text-muted-foreground">
                  Deep dive into browser fingerprinting technology and detection methods
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
