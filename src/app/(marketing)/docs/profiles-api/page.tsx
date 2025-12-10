import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Code2 } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Profiles API',
  description: 'Complete Profiles API reference. Create, list, update, delete, and launch browser profiles programmatically. Full REST API endpoints with code examples.',
  author: 'David Martinez',
  authorTitle: 'API Documentation Lead',
  publishedAt: '2024-02-18',
  readingTime: '8 min read',
  category: 'API Reference',
  wordCount: 1200,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'profiles API',
    'REST API',
    'browser automation API',
    'create profile API',
    'launch browser API',
    'profile management API',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/profiles-api`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function ProfilesAPIPage() {
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
    timeRequired: 'PT8M',
    proficiencyLevel: 'Advanced',
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
            Automate profile management with the Profiles API. Create hundreds of profiles in seconds. Launch browsers programmatically. Integrate Multilogin into your workflow.
          </p>

          <h2>Base URL and Authentication</h2>

          <p>
            All profile endpoints use this base URL:
          </p>

          <pre><code>https://api.multilogin.io/v1/profiles</code></pre>

          <p>
            Include your API key in the <code>Authorization</code> header. See <Link href="/docs/api-authentication">API Authentication</Link> for details.
          </p>

          <h2>List All Profiles</h2>

          <p>
            Retrieve all profiles in your account.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>GET /v1/profiles</code></pre>

          <p>
            <strong>Query Parameters:</strong>
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>limit</code></td>
                  <td>integer</td>
                  <td>Number of results per page (default: 50, max: 100)</td>
                </tr>
                <tr>
                  <td><code>offset</code></td>
                  <td>integer</td>
                  <td>Pagination offset (default: 0)</td>
                </tr>
                <tr>
                  <td><code>tags</code></td>
                  <td>string</td>
                  <td>Filter by tags (comma-separated: "facebook,active")</td>
                </tr>
                <tr>
                  <td><code>sort</code></td>
                  <td>string</td>
                  <td>Sort field (created_at, updated_at, name)</td>
                </tr>
                <tr>
                  <td><code>order</code></td>
                  <td>string</td>
                  <td>Sort direction (asc, desc)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/profiles?limit=10&tags=facebook', {
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": [
    {
      "id": "prof_abc123",
      "name": "Facebook Account 1",
      "browser": "chromium",
      "fingerprint_template": "social_media",
      "proxy": {
        "protocol": "socks5",
        "host": "proxy.provider.com",
        "port": 1080
      },
      "tags": ["facebook", "active"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-02-01T14:22:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}`}</code></pre>

          <h2>Create a Profile</h2>

          <p>
            Create a new browser profile with specified configuration.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/profiles</code></pre>

          <p>
            <strong>Request Body:</strong>
          </p>

          <pre><code>{`{
  "name": "Amazon Seller Account 1",
  "browser": "chromium",
  "fingerprint_template": "ecommerce",
  "os": "windows",
  "screen_resolution": "1920x1080",
  "timezone": "America/New_York",
  "geolocation": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "proxy": {
    "protocol": "socks5",
    "host": "proxy.provider.com",
    "port": 1080,
    "username": "user123",
    "password": "pass456"
  },
  "tags": ["amazon", "seller", "us-east"]
}`}</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/profiles', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Instagram Influencer 1",
    browser: "chromium",
    fingerprint_template: "social_media",
    os: "macos",
    proxy: {
      protocol: "socks5",
      host: "mobile-proxy.com",
      port: 1080
    },
    tags: ["instagram", "influencer"]
  })
});

const data = await response.json();`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "id": "prof_xyz789",
    "name": "Instagram Influencer 1",
    "browser": "chromium",
    "fingerprint_template": "social_media",
    "status": "active",
    "created_at": "2024-02-18T09:15:00Z"
  }
}`}</code></pre>

          <h2>Get a Profile</h2>

          <p>
            Retrieve details of a specific profile.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>GET /v1/profiles/:id</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/profiles/prof_abc123', {
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  }
});`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "id": "prof_abc123",
    "name": "Facebook Account 1",
    "browser": "chromium",
    "fingerprint_template": "social_media",
    "os": "windows",
    "screen_resolution": "1920x1080",
    "timezone": "America/New_York",
    "geolocation": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "proxy": {
      "protocol": "socks5",
      "host": "proxy.provider.com",
      "port": 1080,
      "username": "user123"
    },
    "tags": ["facebook", "active"],
    "status": "active",
    "last_launched": "2024-02-18T08:00:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-18T08:00:00Z"
  }
}`}</code></pre>

          <h2>Update a Profile</h2>

          <p>
            Update existing profile configuration. Only include fields you want to change.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>PATCH /v1/profiles/:id</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/profiles/prof_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Facebook Account 1 (Updated)",
    tags: ["facebook", "active", "high-priority"],
    proxy: {
      host: "new-proxy.provider.com"
    }
  })
});`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "id": "prof_abc123",
    "name": "Facebook Account 1 (Updated)",
    "updated_at": "2024-02-18T10:45:00Z"
  }
}`}</code></pre>

          <h2>Delete a Profile</h2>

          <p>
            Permanently delete a profile. This cannot be undone.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>DELETE /v1/profiles/:id</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/profiles/prof_abc123', {
  method: 'DELETE',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  }
});`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "message": "Profile deleted successfully"
}`}</code></pre>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Warning</p>
            <p className="text-sm mb-0">
              Deleting a profile removes all associated data: cookies, local storage, history, bookmarks. This action cannot be reversed. Consider archiving instead.
            </p>
          </Card>

          <h2>Launch a Profile</h2>

          <p>
            Launch a browser session for a profile. Returns WebSocket URL for browser control.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/profiles/:id/launch</code></pre>

          <p>
            <strong>Request Body (Optional):</strong>
          </p>

          <pre><code>{`{
  "headless": false,
  "window_size": "1920x1080",
  "args": ["--disable-blink-features=AutomationControlled"]
}`}</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/profiles/prof_abc123/launch', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    headless: false
  })
});

const data = await response.json();
const wsUrl = data.data.ws_url;

// Connect with Puppeteer or Playwright
const browser = await puppeteer.connect({
  browserWSEndpoint: wsUrl
});`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "session_id": "sess_def456",
    "ws_url": "ws://localhost:54321/devtools/browser/abc-123-def-456",
    "http_url": "http://localhost:54321",
    "status": "running"
  }
}`}</code></pre>

          <h2>Stop a Profile</h2>

          <p>
            Close a running browser session.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/profiles/:id/stop</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`await fetch('https://api.multilogin.io/v1/profiles/prof_abc123/stop', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  }
});`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "message": "Profile session stopped successfully"
}`}</code></pre>

          <h2>Bulk Operations</h2>

          <p>
            Create multiple profiles in a single request.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/profiles/bulk</code></pre>

          <p>
            <strong>Request Body:</strong>
          </p>

          <pre><code>{`{
  "profiles": [
    {
      "name": "Facebook Account 1",
      "browser": "chromium",
      "fingerprint_template": "social_media"
    },
    {
      "name": "Facebook Account 2",
      "browser": "chromium",
      "fingerprint_template": "social_media"
    }
  ]
}`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "profiles": [
      {"id": "prof_aaa111", "name": "Facebook Account 1"},
      {"id": "prof_bbb222", "name": "Facebook Account 2"}
    ]
  }
}`}</code></pre>

          <h2>Error Handling</h2>

          <p>
            API returns standard HTTP status codes:
          </p>

          <ul>
            <li><code>200</code> - Success</li>
            <li><code>201</code> - Created</li>
            <li><code>400</code> - Bad Request (invalid parameters)</li>
            <li><code>401</code> - Unauthorized (invalid API key)</li>
            <li><code>403</code> - Forbidden (insufficient permissions)</li>
            <li><code>404</code> - Not Found (profile doesn't exist)</li>
            <li><code>429</code> - Rate Limit Exceeded</li>
            <li><code>500</code> - Internal Server Error</li>
          </ul>

          <p>
            Error response format:
          </p>

          <pre><code>{`{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid fingerprint template",
    "param": "fingerprint_template",
    "valid_values": ["ecommerce", "social_media", "general"]
  }
}`}</code></pre>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Manage Proxies via API</h3>
            <p className="mb-4">
              Profile automation configured. Now manage proxies programmatically. Add, update, test, and rotate proxies through the Proxies API.
            </p>
            <Link href="/docs/proxies-api">
              <Button size="lg">
                Proxies API Reference <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} writes API documentation at Multilogin.io. He's documented 50+ API endpoints and improved developer onboarding time from 2 hours to 20 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/api-authentication">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">API Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Set up authentication before using the Profiles API
                </p>
              </Card>
            </Link>
            <Link href="/docs/webhooks">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Receive real-time notifications when profiles are created or launched
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
