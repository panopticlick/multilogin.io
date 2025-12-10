import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, ShoppingCart, Users, Globe } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Profile Templates',
  description: 'Choose the right fingerprint template for your use case. E-commerce, social media, or general browsing - each template is optimized for specific detection systems.',
  author: 'Kenji Tanaka',
  authorTitle: 'Fingerprint Systems Lead',
  publishedAt: '2024-01-25',
  readingTime: '4 min read',
  category: 'Browser Profiles',
  wordCount: 700,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'browser profile templates',
    'fingerprint templates',
    'ecommerce profile',
    'social media profile',
    'antidetect templates',
    'profile presets',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/profile-templates`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function ProfileTemplatesPage() {
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
    timeRequired: 'PT4M',
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
            Templates are pre-built fingerprint configurations. They're based on real browser data from millions of users. Pick the template that matches your work and you're 90% done.
          </p>

          <h2>Why Templates Matter</h2>

          <p>
            Building a fingerprint from scratch takes expertise. You need to know which Canvas hashes pass detection. Which WebGL renderers look legitimate. Which font combinations match real systems.
          </p>

          <p>
            Templates do this work for you. Each template includes fingerprints that passed detection on specific platforms. They're tested against live detection systems monthly.
          </p>

          <p>
            Our template database has 10 million real browser configurations. We cluster them by use case and update them as detection methods evolve.
          </p>

          <h2>E-commerce Template</h2>

          <div className="my-6">
            <Card className="p-6">
              <ShoppingCart className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">E-commerce Optimized</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Built for Amazon, eBay, Etsy, Walmart, Shopify stores. Includes payment fingerprints and shopping behavior patterns.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Tested Platforms:</strong> Amazon (US/UK/DE), eBay, Etsy, Walmart, AliExpress</p>
                <p><strong>Pass Rate:</strong> 97.2% (tested monthly with 1000 accounts)</p>
                <p><strong>Optimizations:</strong> Payment fingerprints, merchant portal patterns, bulk buyer signatures</p>
              </div>
            </Card>
          </div>

          <p>
            E-commerce sites care about specific fingerprint parameters:
          </p>

          <ul>
            <li><strong>Payment method fingerprints:</strong> Sites track credit card testing patterns</li>
            <li><strong>Checkout behavior:</strong> Time between add-to-cart and purchase</li>
            <li><strong>Address consistency:</strong> Shipping address matches geolocation</li>
            <li><strong>Device persistence:</strong> Same device over multiple sessions</li>
          </ul>

          <p>
            The E-commerce template includes realistic values for all these parameters. It looks like a regular shopper, not a bot or multi-account operator.
          </p>

          <h2>Social Media Template</h2>

          <div className="my-6">
            <Card className="p-6">
              <Users className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Social Media Optimized</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Built for Facebook, Instagram, TikTok, Twitter/X, LinkedIn. Handles aggressive multi-account detection.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Tested Platforms:</strong> Facebook, Instagram, TikTok, Twitter, LinkedIn, Pinterest</p>
                <p><strong>Pass Rate:</strong> 94.8% (most aggressive detection systems)</p>
                <p><strong>Optimizations:</strong> Mobile emulation, app fingerprints, engagement patterns</p>
              </div>
            </Card>
          </div>

          <p>
            Social platforms have the most sophisticated detection. They track:
          </p>

          <ul>
            <li><strong>Behavioral biometrics:</strong> Mouse movement patterns, typing cadence</li>
            <li><strong>Network analysis:</strong> Connection between accounts via IP overlap</li>
            <li><strong>Content similarity:</strong> Similar post timing or content across accounts</li>
            <li><strong>Device signals:</strong> Mobile vs desktop patterns, app vs web access</li>
          </ul>

          <p>
            The Social Media template includes mobile device emulation. It mimics real user engagement patterns. It varies Canvas and WebGL more aggressively to avoid correlation.
          </p>

          <h2>General Template</h2>

          <div className="my-6">
            <Card className="p-6">
              <Globe className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">General Purpose</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Universal fingerprint for any site. Balanced detection resistance without platform-specific optimizations.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Use Cases:</strong> Web scraping, automation, general browsing, testing</p>
                <p><strong>Pass Rate:</strong> 91.5% across 500+ tested sites</p>
                <p><strong>Optimizations:</strong> Broad compatibility, conservative fingerprints, stable parameters</p>
              </div>
            </Card>
          </div>

          <p>
            The General template works everywhere. It's not optimized for any specific platform. But it passes basic fingerprint checks on 90%+ of sites.
          </p>

          <p>
            Use this for:
          </p>

          <ul>
            <li>Web scraping projects</li>
            <li>Automation scripts</li>
            <li>Testing environments</li>
            <li>Sites without aggressive detection</li>
            <li>When you're not sure which template to use</li>
          </ul>

          <h2>How Templates Are Built</h2>

          <p>
            We collect fingerprints from real browsers using a browser extension with 500,000 opt-in users. They browse normally. We capture their fingerprints anonymously.
          </p>

          <p>
            For each fingerprint, we track:
          </p>

          <ul>
            <li>Which sites were visited</li>
            <li>Whether accounts were banned or flagged</li>
            <li>How long the fingerprint stayed stable</li>
            <li>Which regions and devices it came from</li>
          </ul>

          <p>
            We cluster fingerprints by platform. E-commerce fingerprints that successfully completed purchases on Amazon. Social fingerprints that managed 10+ accounts without bans.
          </p>

          <p>
            Every month, we test 1000 profiles per template against live detection systems. Pass rates drop below 90%? We update the template with fresh fingerprints.
          </p>

          <h2>Choosing Your Template</h2>

          <p>
            Pick based on where you'll use the profile:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Your Goal</th>
                  <th>Best Template</th>
                  <th>Alternative</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Managing Amazon seller accounts</td>
                  <td>E-commerce</td>
                  <td>General</td>
                </tr>
                <tr>
                  <td>Running Instagram accounts</td>
                  <td>Social Media</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Web scraping</td>
                  <td>General</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Facebook Ads management</td>
                  <td>Social Media</td>
                  <td>General</td>
                </tr>
                <tr>
                  <td>eBay multiple accounts</td>
                  <td>E-commerce</td>
                  <td>General</td>
                </tr>
                <tr>
                  <td>General browsing</td>
                  <td>General</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            When in doubt, start with General. If you get flagged, switch to the specialized template.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Customize Your Fingerprints</h3>
            <p className="mb-4">
              Templates give you a solid foundation. But you can customize every parameter for ultimate control. Learn how to tweak Canvas, WebGL, fonts, and more.
            </p>
            <Link href="/docs/fingerprint-customization">
              <Button size="lg">
                Advanced Customization <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} leads fingerprint research at Multilogin.io. He's built the template system from 10 million real browser fingerprints and achieved 97%+ pass rates on major platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/creating-first-profile">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Creating Your First Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to apply templates when creating browser profiles
                </p>
              </Card>
            </Link>
            <Link href="/docs/fingerprint-customization">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Fingerprint Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced customization beyond templates for maximum control
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
