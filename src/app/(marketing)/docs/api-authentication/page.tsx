import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Key } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'API Authentication',
  description: 'Authenticate with the Multilogin API. Generate API keys, make authenticated requests, handle rate limits, and implement secure token storage.',
  author: 'Rachel Kim',
  authorTitle: 'API Platform Engineer',
  publishedAt: '2024-02-15',
  readingTime: '6 min read',
  category: 'API Reference',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'API authentication',
    'API key',
    'bearer token',
    'API security',
    'rate limits',
    'REST API',
    'API requests',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/api-authentication`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function APIAuthenticationPage() {
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
            The Multilogin API lets you create profiles, launch browsers, and manage proxies programmatically. First step: authentication with API keys.
          </p>

          <h2>Generating Your API Key</h2>

          <p>
            Log into your Multilogin dashboard. Navigate to Settings → API Keys.
          </p>

          <p>
            Click "Generate New Key". Give it a name (e.g., "Production Server" or "Dev Environment").
          </p>

          <p>
            Your API key appears once. Copy it immediately. We don't show it again.
          </p>

          <p>
            Example key format:
          </p>

          <pre><code>mln_live_abc123def456ghi789jkl012mno345pqr678</code></pre>

          <p>
            Keys start with <code>mln_live_</code> for production or <code>mln_test_</code> for testing.
          </p>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Security Warning</p>
            <p className="text-sm mb-0">
              Treat API keys like passwords. Never commit them to Git. Don't share them publicly. Store in environment variables. Rotate them quarterly.
            </p>
          </Card>

          <h2>Making Authenticated Requests</h2>

          <p>
            Include your API key in the <code>Authorization</code> header using Bearer authentication.
          </p>

          <p>
            <strong>cURL Example:</strong>
          </p>

          <pre><code>{`curl https://api.multilogin.io/v1/profiles \\
  -H "Authorization: Bearer mln_live_your_api_key_here" \\
  -H "Content-Type: application/json"`}</code></pre>

          <p>
            <strong>JavaScript/Node.js Example:</strong>
          </p>

          <pre><code>{`const axios = require('axios');

const API_KEY = process.env.MULTILOGIN_API_KEY;

const client = axios.create({
  baseURL: 'https://api.multilogin.io/v1',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  }
});

async function getProfiles() {
  const response = await client.get('/profiles');
  return response.data;
}`}</code></pre>

          <p>
            <strong>Python Example:</strong>
          </p>

          <pre><code>{`import os
import requests

API_KEY = os.getenv('MULTILOGIN_API_KEY')

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.multilogin.io/v1/profiles',
    headers=headers
)

profiles = response.json()`}</code></pre>

          <h2>API Base URL</h2>

          <p>
            All API requests use this base URL:
          </p>

          <pre><code>https://api.multilogin.io/v1</code></pre>

          <p>
            Endpoints are versioned. We currently support v1. Future versions (v2, v3) will be added without breaking v1.
          </p>

          <p>
            Regional endpoints (coming soon):
          </p>

          <ul>
            <li><code>https://api-us.multilogin.io/v1</code> - US East</li>
            <li><code>https://api-eu.multilogin.io/v1</code> - Europe West</li>
            <li><code>https://api-asia.multilogin.io/v1</code> - Asia Pacific</li>
          </ul>

          <p>
            Use regional endpoints for lower latency.
          </p>

          <h2>Rate Limits</h2>

          <p>
            Rate limits prevent API abuse and ensure service stability.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Requests/Minute</th>
                  <th>Requests/Hour</th>
                  <th>Daily Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Solo</td>
                  <td>60</td>
                  <td>1,000</td>
                  <td>10,000</td>
                </tr>
                <tr>
                  <td>Team</td>
                  <td>120</td>
                  <td>3,000</td>
                  <td>50,000</td>
                </tr>
                <tr>
                  <td>Enterprise</td>
                  <td>300</td>
                  <td>10,000</td>
                  <td>Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            When you hit a limit, API returns <code>429 Too Many Requests</code>:
          </p>

          <pre><code>{`{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 23 seconds.",
  "retry_after": 23
}`}</code></pre>

          <p>
            Implement exponential backoff. Wait <code>retry_after</code> seconds before retrying.
          </p>

          <h2>Response Formats</h2>

          <p>
            All responses return JSON. Successful requests return <code>2xx</code> status codes.
          </p>

          <p>
            <strong>Success Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "id": "prof_abc123",
    "name": "My Profile",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}</code></pre>

          <p>
            <strong>Error Response:</strong>
          </p>

          <pre><code>{`{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Profile name must be between 1 and 100 characters.",
    "param": "name"
  }
}`}</code></pre>

          <p>
            Common error codes:
          </p>

          <ul>
            <li><code>unauthorized</code> - Invalid or missing API key</li>
            <li><code>forbidden</code> - API key lacks required permissions</li>
            <li><code>not_found</code> - Resource doesn't exist</li>
            <li><code>invalid_parameter</code> - Request parameter is invalid</li>
            <li><code>rate_limit_exceeded</code> - Too many requests</li>
            <li><code>internal_error</code> - Server error (we're investigating)</li>
          </ul>

          <h2>API Key Permissions</h2>

          <p>
            API keys have scoped permissions. Control what each key can do.
          </p>

          <p>
            Available scopes:
          </p>

          <ul>
            <li><code>profiles:read</code> - List and retrieve profiles</li>
            <li><code>profiles:write</code> - Create, update, delete profiles</li>
            <li><code>profiles:launch</code> - Launch and close browser sessions</li>
            <li><code>proxies:read</code> - List proxies</li>
            <li><code>proxies:write</code> - Add and update proxies</li>
            <li><code>team:read</code> - View team members</li>
            <li><code>team:write</code> - Invite and manage team members</li>
          </ul>

          <p>
            When creating a key, select only required scopes. Principle of least privilege.
          </p>

          <h2>Secure Key Storage</h2>

          <p>
            <strong>Environment Variables (Recommended):</strong>
          </p>

          <pre><code>{`# .env file (never commit this)
MULTILOGIN_API_KEY=mln_live_your_key_here

# Load in Node.js
require('dotenv').config();
const apiKey = process.env.MULTILOGIN_API_KEY;

# Load in Python
import os
api_key = os.getenv('MULTILOGIN_API_KEY')`}</code></pre>

          <p>
            <strong>Secret Management Services:</strong>
          </p>

          <ul>
            <li>AWS Secrets Manager</li>
            <li>Google Cloud Secret Manager</li>
            <li>HashiCorp Vault</li>
            <li>1Password CLI</li>
          </ul>

          <p>
            <strong>Never Store Keys In:</strong>
          </p>

          <ul>
            <li>Source code</li>
            <li>Git repositories</li>
            <li>Public documentation</li>
            <li>Client-side JavaScript</li>
            <li>Log files</li>
            <li>Error messages</li>
          </ul>

          <h2>Testing Your Authentication</h2>

          <p>
            Test your API key with a simple request:
          </p>

          <pre><code>{`curl https://api.multilogin.io/v1/auth/verify \\
  -H "Authorization: Bearer mln_live_your_key_here"`}</code></pre>

          <p>
            Success response:
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "account_id": "acc_xyz789",
    "plan": "Team",
    "scopes": ["profiles:read", "profiles:write", "profiles:launch"]
  }
}`}</code></pre>

          <p>
            Failure response (401 Unauthorized):
          </p>

          <pre><code>{`{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Invalid API key"
  }
}`}</code></pre>

          <h2>Key Rotation</h2>

          <p>
            Rotate API keys quarterly or after security incidents.
          </p>

          <p>
            Process:
          </p>

          <ol>
            <li>Generate new API key in dashboard</li>
            <li>Update environment variables in all systems</li>
            <li>Deploy updated configurations</li>
            <li>Test with new key</li>
            <li>Revoke old key after 24-hour grace period</li>
          </ol>

          <p>
            Old keys remain valid for 24 hours after new key is activated. This prevents service disruption during rotation.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Use the Profiles API</h3>
            <p className="mb-4">
              Authentication configured. Now create, update, and manage browser profiles programmatically with the Profiles API.
            </p>
            <Link href="/docs/profiles-api">
              <Button size="lg">
                Profiles API Reference <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} designs API infrastructure at Multilogin.io. She's built authentication systems handling 1M+ API requests daily with 99.99% uptime.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/profiles-api">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Profiles API</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage browser profiles via API
                </p>
              </Card>
            </Link>
            <Link href="/docs/proxies-api">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Proxies API</h3>
                <p className="text-sm text-muted-foreground">
                  Configure and manage proxies programmatically
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
