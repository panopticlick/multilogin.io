import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import {
  BookOpen,
  Rocket,
  Settings,
  Shield,
  Globe,
  Code,
  Users,
  Zap,
  ArrowRight,
  Search,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation | Multilogin.io',
  description:
    'Learn how to use Multilogin.io with our comprehensive documentation. Get started quickly with guides, API references, and best practices.',
};

const categories = [
  {
    title: 'Getting Started',
    description: 'Start here if you are new to Multilogin.io',
    icon: Rocket,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    articles: [
      { title: 'Quick Start Guide', href: '/docs/quick-start', time: '5 min' },
      { title: 'Creating Your First Profile', href: '/docs/creating-first-profile', time: '5 min' },
      { title: 'Understanding Browser Fingerprints', href: '/docs/understanding-fingerprints', time: '6 min' },
      { title: 'Installing the Desktop App', href: '/docs/installing-desktop-app', time: '4 min' },
    ],
  },
  {
    title: 'Browser Profiles',
    description: 'Learn how to create and manage browser profiles',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    articles: [
      { title: 'Profile Templates', href: '/docs/profile-templates', time: '4 min' },
      { title: 'Fingerprint Customization', href: '/docs/fingerprint-customization', time: '7 min' },
      { title: 'Session Management', href: '/docs/session-management', time: '5 min' },
      { title: 'Organizing with Profile Groups', href: '/docs/profile-groups', time: '4 min' },
    ],
  },
  {
    title: 'Proxy Integration',
    description: 'Configure and manage proxy connections',
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    articles: [
      { title: 'Adding Proxies', href: '/docs/adding-proxies', time: '4 min' },
      { title: 'Proxy Types Explained', href: '/docs/proxy-types-explained', time: '6 min' },
      { title: 'Rotating Proxies', href: '/docs/rotating-proxies', time: '5 min' },
      { title: 'Troubleshooting Proxy Connections', href: '/docs/troubleshooting-connections', time: '4 min' },
    ],
  },
  {
    title: 'API Reference',
    description: 'Integrate Multilogin.io into your workflows',
    icon: Code,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    articles: [
      { title: 'API Authentication', href: '/docs/api-authentication', time: '5 min' },
      { title: 'Profiles API', href: '/docs/profiles-api', time: '6 min' },
      { title: 'Proxies API', href: '/docs/proxies-api', time: '5 min' },
      { title: 'Webhooks', href: '/docs/webhooks', time: '5 min' },
    ],
  },
  {
    title: 'Team & Collaboration',
    description: 'Work together with your team',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    articles: [
      { title: 'Inviting Team Members', href: '/docs/inviting-team-members', time: '4 min' },
      { title: 'Roles & Permissions', href: '/docs/roles-permissions', time: '5 min' },
      { title: 'Sharing Profiles', href: '/docs/sharing-profiles', time: '6 min' },
      { title: 'Audit Logs', href: '/docs/audit-logs', time: '5 min' },
    ],
  },
  {
    title: 'Security & Privacy',
    description: 'Keep your data safe and secure',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    articles: [
      { title: 'Data Encryption', href: '/docs/data-encryption', time: '6 min' },
      { title: 'Two-Factor Authentication', href: '/docs/two-factor-authentication', time: '5 min' },
      { title: 'API Key Security', href: '/docs/api-key-security', time: '6 min' },
      { title: 'Compliance & Certifications', href: '/docs/compliance', time: '7 min' },
    ],
  },
];

const popularArticles = [
  { title: 'Quick Start Guide', href: '/docs/quick-start', category: 'Getting Started' },
  { title: 'Understanding Browser Fingerprints', href: '/docs/understanding-fingerprints', category: 'Getting Started' },
  { title: 'API Authentication', href: '/docs/api-authentication', category: 'API Reference' },
  { title: 'Proxy Types Explained', href: '/docs/proxy-types-explained', category: 'Proxy Integration' },
];

export default function DocsPage() {
  // JSON-LD Structured Data for Documentation Listing
  const allArticles = categories.flatMap((category) =>
    category.articles.map((article) => ({
      ...article,
      category: category.title,
    }))
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Multilogin.io Documentation',
    description: 'Learn how to use Multilogin.io with our comprehensive documentation. Get started quickly with guides, API references, and best practices.',
    url: `${siteConfig.url}/docs`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    hasPart: allArticles.map((article) => ({
      '@type': 'TechArticle',
      headline: article.title,
      url: `${siteConfig.url}${article.href}`,
      articleSection: article.category,
      timeRequired: article.time,
    })),
  };

  /*
   * Templates for individual documentation pages (to be used in /docs/[...slug]/page.tsx):
   *
   * For How-To Guides (step-by-step tutorials):
   * const howToJsonLd = {
   *   '@context': 'https://schema.org',
   *   '@type': 'HowTo',
   *   name: 'How to Create Your First Browser Profile',
   *   description: 'Step-by-step guide to creating and configuring your first browser profile.',
   *   image: `${siteConfig.url}/docs/images/first-profile.jpg`,
   *   totalTime: 'PT5M', // ISO 8601 duration (PT5M = 5 minutes)
   *   step: [
   *     {
   *       '@type': 'HowToStep',
   *       name: 'Step 1: Open Profile Manager',
   *       text: 'Navigate to the Profiles section in your dashboard.',
   *       url: `${siteConfig.url}/docs/first-profile#step-1`,
   *     },
   *     {
   *       '@type': 'HowToStep',
   *       name: 'Step 2: Click Create New Profile',
   *       text: 'Click the "Create New Profile" button in the top right corner.',
   *       url: `${siteConfig.url}/docs/first-profile#step-2`,
   *     },
   *     // Add more steps as needed
   *   ],
   * };
   *
   * For Technical Reference Articles:
   * const techArticleJsonLd = {
   *   '@context': 'https://schema.org',
   *   '@type': 'TechArticle',
   *   headline: 'Understanding Browser Fingerprints',
   *   description: 'Comprehensive guide to browser fingerprinting technology and how Multilogin.io protects your privacy.',
   *   image: `${siteConfig.url}/docs/images/fingerprints.jpg`,
   *   datePublished: '2024-11-28T00:00:00Z',
   *   dateModified: '2024-11-28T00:00:00Z',
   *   author: {
   *     '@type': 'Organization',
   *     name: siteConfig.name,
   *   },
   *   publisher: {
   *     '@type': 'Organization',
   *     name: siteConfig.name,
   *     logo: {
   *       '@type': 'ImageObject',
   *       url: `${siteConfig.url}/logo.png`,
   *     },
   *   },
   *   articleSection: 'Getting Started',
   *   dependencies: 'Multilogin.io account',
   *   proficiencyLevel: 'Beginner',
   * };
   */

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={[{ name: 'Documentation' }]} />

      <div className="container py-16 lg:py-24">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Documentation
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Learn how to use Multilogin.io
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Everything you need to know about managing browser profiles, fingerprints,
          and proxies. Get started quickly with our comprehensive guides.
        </p>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documentation..."
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Popular Articles */}
      <div className="mb-16">
        <h2 className="text-lg font-semibold mb-4">Popular Articles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularArticles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group rounded-lg border p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <Badge variant="secondary" className="mb-2 text-xs">
                {article.category}
              </Badge>
              <p className="font-medium group-hover:text-primary transition-colors">
                {article.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`rounded-lg p-2.5 ${category.bgColor}`}>
                  <Icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div>
                  <h2 className="font-semibold">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article.href}>
                    <Link
                      href={article.href}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors group"
                    >
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {article.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.time}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* API Quick Reference */}
      <div className="mt-16">
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">API Quick Reference</h2>
                <p className="text-muted-foreground">
                  Integrate Multilogin.io into your automation workflows with our
                  comprehensive REST API.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/docs/api"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View API Docs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://api.multilogin.io"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                API Reference
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Can&apos;t find what you&apos;re looking for? Our support team is here to help.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="mailto:support@multilogin.io"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Contact Support
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Help Center
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
