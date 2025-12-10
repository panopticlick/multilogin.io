import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Tag,
  Share2,
  ChevronRight,
} from 'lucide-react';

// Mock documentation content - in a real app, this would come from a CMS or markdown files
const docContent: Record<string, {
  title: string;
  description: string;
  category: string;
  content: string;
  lastUpdated: string;
  readTime: string;
  tags: string[];
  relatedArticles?: Array<{ title: string; href: string }>;
}> = {
  'api': {
    title: 'API Documentation',
    description: 'Complete reference for the Multilogin.io REST API',
    category: 'API Reference',
    content: `
# API Documentation

Welcome to the Multilogin.io API documentation. Our RESTful API allows you to programmatically manage browser profiles, proxies, and automation workflows.

## Base URL

\`\`\`
https://api.multilogin.io/v1
\`\`\`

## Authentication

All API requests require authentication using an API key. You can generate API keys from your dashboard.

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.multilogin.io/v1/profiles
\`\`\`

## Rate Limits

- **Free Plan:** 100 requests/hour
- **Pro Plan:** 1,000 requests/hour
- **Team Plan:** 5,000 requests/hour
- **Enterprise:** Custom limits

## Endpoints

### Profiles

- \`GET /profiles\` - List all profiles
- \`POST /profiles\` - Create a new profile
- \`GET /profiles/:id\` - Get profile details
- \`PATCH /profiles/:id\` - Update a profile
- \`DELETE /profiles/:id\` - Delete a profile

### Proxies

- \`GET /proxies\` - List all proxies
- \`POST /proxies\` - Add a new proxy
- \`GET /proxies/:id\` - Get proxy details
- \`DELETE /proxies/:id\` - Delete a proxy

## Error Handling

The API uses standard HTTP status codes:

- \`200\` - Success
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`404\` - Not Found
- \`429\` - Too Many Requests
- \`500\` - Internal Server Error
    `,
    lastUpdated: 'November 28, 2024',
    readTime: '10 min',
    tags: ['API', 'REST', 'Authentication'],
    relatedArticles: [
      { title: 'API Authentication', href: '/docs/api/auth' },
      { title: 'Profiles API', href: '/docs/api/profiles' },
      { title: 'Webhooks', href: '/docs/api/webhooks' },
    ],
  },
  'api/auth': {
    title: 'API Authentication',
    description: 'Learn how to authenticate with the Multilogin.io API',
    category: 'API Reference',
    content: `
# API Authentication

Learn how to securely authenticate your API requests.

## Generating API Keys

1. Go to Dashboard → Settings → API Keys
2. Click "Create New API Key"
3. Give your key a descriptive name
4. Copy the key (it will only be shown once)

## Using API Keys

Include your API key in the Authorization header:

\`\`\`bash
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Security Best Practices

1. **Never commit API keys** to version control
2. **Rotate keys regularly** for enhanced security
3. **Use environment variables** to store keys
4. **Revoke unused keys** immediately
5. **Use different keys** for different environments

## Example Request

\`\`\`javascript
const response = await fetch('https://api.multilogin.io/v1/profiles', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
\`\`\`
    `,
    lastUpdated: 'November 28, 2024',
    readTime: '3 min',
    tags: ['API', 'Authentication', 'Security'],
    relatedArticles: [
      { title: 'API Documentation', href: '/docs/api' },
      { title: 'API Key Security', href: '/docs/api-security' },
    ],
  },
  'api/profiles': {
    title: 'Profiles API',
    description: 'Manage browser profiles programmatically',
    category: 'API Reference',
    content: `
# Profiles API

The Profiles API allows you to create, read, update, and delete browser profiles.

## List Profiles

\`\`\`bash
GET /v1/profiles
\`\`\`

**Query Parameters:**
- \`limit\` (number) - Number of results (default: 50)
- \`offset\` (number) - Pagination offset (default: 0)
- \`groupId\` (string) - Filter by group
- \`status\` (string) - Filter by status (available, in_use, locked)

## Create Profile

\`\`\`bash
POST /v1/profiles
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "My Profile",
  "templateId": "chrome_120_windows",
  "proxyId": "proxy_123",
  "groupId": "group_456"
}
\`\`\`

## Get Profile

\`\`\`bash
GET /v1/profiles/:id
\`\`\`

## Update Profile

\`\`\`bash
PATCH /v1/profiles/:id
\`\`\`

## Delete Profile

\`\`\`bash
DELETE /v1/profiles/:id
\`\`\`
    `,
    lastUpdated: 'November 28, 2024',
    readTime: '8 min',
    tags: ['API', 'Profiles', 'CRUD'],
  },
  'quick-start': {
    title: 'Quick Start Guide',
    description: 'Get started with Multilogin.io in 5 minutes',
    category: 'Getting Started',
    content: `
# Quick Start Guide

Welcome to Multilogin.io! This guide will help you create your first browser profile in just a few minutes.

## Step 1: Create an Account

1. Go to [multilogin.io/register](/register)
2. Sign up with your email
3. Verify your email address

## Step 2: Create Your First Profile

1. Click "Create Profile" in the dashboard
2. Choose a browser template (Chrome, Firefox, Edge)
3. Give your profile a name
4. Click "Create"

## Step 3: Add a Proxy (Optional)

1. Go to the Proxies tab
2. Click "Add Proxy"
3. Enter your proxy details
4. Assign it to your profile

## Step 4: Launch Your Profile

1. Find your profile in the list
2. Click the "Launch" button
3. Your isolated browser will open

That's it! You now have a fully isolated browser profile with its own fingerprint.

## Next Steps

- Learn about [fingerprint customization](/docs/customization)
- Set up [team collaboration](/docs/team-invite)
- Explore the [API](/docs/api)
    `,
    lastUpdated: 'November 28, 2024',
    readTime: '5 min',
    tags: ['Getting Started', 'Tutorial', 'Beginner'],
  },
};

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const docKey = slug.join('/');
  const doc = docContent[docKey];

  if (!doc) {
    return {
      title: 'Not Found | Multilogin.io Docs',
    };
  }

  return {
    title: `${doc.title} | Multilogin.io Docs`,
    description: doc.description,
  };
}

export default async function DocArticlePage({ params }: DocPageProps) {
  const { slug } = await params;
  const docKey = slug.join('/');
  const doc = docContent[docKey];

  if (!doc) {
    notFound();
  }

  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Documentation
          </Link>
          {slug.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className={index === slug.length - 1 ? 'text-foreground' : ''}>
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </span>
            </div>
          ))}
        </nav>

        {/* Back Button */}
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documentation
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {doc.category}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{doc.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{doc.description}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{doc.readTime} read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Last updated: {doc.lastUpdated}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {doc.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Article Content */}
        <Card className="p-8 mb-8">
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: doc.content
                .split('\n')
                .map(line => {
                  // Convert markdown-style headings
                  if (line.startsWith('# ')) {
                    return `<h1>${line.slice(2)}</h1>`;
                  }
                  if (line.startsWith('## ')) {
                    return `<h2>${line.slice(3)}</h2>`;
                  }
                  if (line.startsWith('### ')) {
                    return `<h3>${line.slice(4)}</h3>`;
                  }
                  // Convert code blocks
                  if (line.startsWith('```')) {
                    const lang = line.slice(3);
                    return lang ? `<pre><code class="language-${lang}">` : '</code></pre>';
                  }
                  // Convert inline code
                  line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
                  // Convert bold
                  line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                  // Convert lists
                  if (line.match(/^[-*]\s/)) {
                    return `<li>${line.slice(2)}</li>`;
                  }
                  if (line.match(/^\d+\.\s/)) {
                    return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
                  }
                  return line ? `<p>${line}</p>` : '';
                })
                .join('\n')
            }}
          />
        </Card>

        {/* Related Articles */}
        {doc.relatedArticles && doc.relatedArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doc.relatedArticles.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group rounded-lg border p-4 hover:border-primary hover:shadow-md transition-all"
                >
                  <p className="font-medium group-hover:text-primary transition-colors flex items-center justify-between">
                    {article.title}
                    <ChevronRight className="h-4 w-4" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <Card className="p-6 bg-muted/50">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Was this page helpful?</h3>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button variant="outline" size="sm">
                Yes, it was helpful
              </Button>
              <Button variant="outline" size="sm">
                No, needs improvement
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Generate static params for known documentation pages
export function generateStaticParams() {
  return Object.keys(docContent).map((key) => ({
    slug: key.split('/'),
  }));
}
