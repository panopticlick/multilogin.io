import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Proxies API',
  description: 'Manage proxies programmatically. Add, update, test, and assign proxies to profiles via REST API. Bulk operations and connection testing included.',
  author: 'Nina Petrov',
  authorTitle: 'Infrastructure API Engineer',
  publishedAt: '2024-02-20',
  readingTime: '7 min read',
  category: 'API Reference',
  wordCount: 1000,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'proxies API',
    'proxy management API',
    'test proxy API',
    'assign proxy API',
    'proxy REST API',
    'bulk proxy operations',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/proxies-api`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function ProxiesAPIPage() {
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
            Automate proxy management. Add 100 proxies in one request. Test connections before assignment. Rotate proxies across profiles programmatically.
          </p>

          <h2>Base URL</h2>

          <p>
            All proxy endpoints use:
          </p>

          <pre><code>https://api.multilogin.io/v1/proxies</code></pre>

          <h2>List All Proxies</h2>

          <p>
            Get all proxies in your account.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>GET /v1/proxies</code></pre>

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
                  <td><code>type</code></td>
                  <td>string</td>
                  <td>Filter by type (http, socks5, socks4)</td>
                </tr>
                <tr>
                  <td><code>status</code></td>
                  <td>string</td>
                  <td>Filter by status (active, failed, testing)</td>
                </tr>
                <tr>
                  <td><code>limit</code></td>
                  <td>integer</td>
                  <td>Results per page (max: 100)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": [
    {
      "id": "prx_abc123",
      "protocol": "socks5",
      "host": "proxy.provider.com",
      "port": 1080,
      "username": "user123",
      "country": "US",
      "city": "New York",
      "status": "active",
      "last_tested": "2024-02-20T09:00:00Z",
      "assigned_profiles": 3,
      "created_at": "2024-01-10T12:00:00Z"
    }
  ]
}`}</code></pre>

          <h2>Add a Proxy</h2>

          <p>
            Add a new proxy to your account.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/proxies</code></pre>

          <p>
            <strong>Request Body:</strong>
          </p>

          <pre><code>{`{
  "protocol": "socks5",
  "host": "proxy.provider.com",
  "port": 1080,
  "username": "user123",
  "password": "pass456",
  "tags": ["residential", "us-east"]
}`}</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/proxies', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    protocol: "socks5",
    host: "residential-proxy.com",
    port: 1080,
    username: "user-session-abc123",
    password: "secret",
    tags: ["residential", "rotating"]
  })
});

const data = await response.json();`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "id": "prx_xyz789",
    "protocol": "socks5",
    "host": "residential-proxy.com",
    "port": 1080,
    "status": "testing",
    "created_at": "2024-02-20T10:30:00Z"
  }
}`}</code></pre>

          <h2>Test a Proxy</h2>

          <p>
            Test proxy connection and get details (IP, location, speed).
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/proxies/:id/test</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/proxies/prx_abc123/test', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  }
});

const data = await response.json();`}</code></pre>

          <p>
            <strong>Response (Success):</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "status": "active",
    "ip": "198.51.100.42",
    "country": "US",
    "city": "New York",
    "isp": "Verizon",
    "latency_ms": 45,
    "speed_mbps": 12.5,
    "tested_at": "2024-02-20T10:35:00Z"
  }
}`}</code></pre>

          <p>
            <strong>Response (Failure):</strong>
          </p>

          <pre><code>{`{
  "success": false,
  "data": {
    "status": "failed",
    "error": "Connection timeout",
    "tested_at": "2024-02-20T10:35:00Z"
  }
}`}</code></pre>

          <h2>Update a Proxy</h2>

          <p>
            Update proxy credentials or settings.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>PATCH /v1/proxies/:id</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`await fetch('https://api.multilogin.io/v1/proxies/prx_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: "new-username-session-xyz",
    password: "new-password",
    tags: ["residential", "rotating", "premium"]
  })
});`}</code></pre>

          <h2>Assign Proxy to Profile</h2>

          <p>
            Assign a proxy to a specific profile.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/proxies/:id/assign</code></pre>

          <p>
            <strong>Request Body:</strong>
          </p>

          <pre><code>{`{
  "profile_id": "prof_abc123"
}`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "message": "Proxy assigned to profile successfully"
}`}</code></pre>

          <h2>Bulk Add Proxies</h2>

          <p>
            Add multiple proxies in one request. Useful when importing from proxy providers.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/proxies/bulk</code></pre>

          <p>
            <strong>Request Body:</strong>
          </p>

          <pre><code>{`{
  "proxies": [
    {
      "protocol": "socks5",
      "host": "proxy1.provider.com",
      "port": 1080,
      "username": "user1",
      "password": "pass1"
    },
    {
      "protocol": "http",
      "host": "proxy2.provider.com",
      "port": 8080,
      "username": "user2",
      "password": "pass2"
    }
  ],
  "auto_test": true
}`}</code></pre>

          <p>
            <strong>Example Request:</strong>
          </p>

          <pre><code>{`const proxies = [
  { protocol: "socks5", host: "proxy1.com", port: 1080, username: "u1", password: "p1" },
  { protocol: "socks5", host: "proxy2.com", port: 1080, username: "u2", password: "p2" },
  { protocol: "socks5", host: "proxy3.com", port: 1080, username: "u3", password: "p3" }
];

const response = await fetch('https://api.multilogin.io/v1/proxies/bulk', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    proxies: proxies,
    auto_test: true
  })
});`}</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "created": 3,
    "failed": 0,
    "proxies": [
      {"id": "prx_aaa111", "status": "testing"},
      {"id": "prx_bbb222", "status": "testing"},
      {"id": "prx_ccc333", "status": "active"}
    ]
  }
}`}</code></pre>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Auto-Test Feature</p>
            <p className="text-sm mb-0">
              Set <code>auto_test: true</code> to automatically test all proxies after creation. Failed proxies get marked but still added to your account for later retry.
            </p>
          </Card>

          <h2>Bulk Assign Proxies</h2>

          <p>
            Distribute proxies across multiple profiles. One proxy per profile.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>POST /v1/proxies/bulk-assign</code></pre>

          <p>
            <strong>Request Body:</strong>
          </p>

          <pre><code>{`{
  "proxy_ids": ["prx_aaa111", "prx_bbb222", "prx_ccc333"],
  "profile_ids": ["prof_111", "prof_222", "prof_333"]
}`}</code></pre>

          <p>
            First proxy goes to first profile. Second to second. And so on.
          </p>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "assigned": 3,
    "assignments": [
      {"profile_id": "prof_111", "proxy_id": "prx_aaa111"},
      {"profile_id": "prof_222", "proxy_id": "prx_bbb222"},
      {"profile_id": "prof_333", "proxy_id": "prx_ccc333"}
    ]
  }
}`}</code></pre>

          <h2>Get Proxy Stats</h2>

          <p>
            Get usage statistics for a proxy.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>GET /v1/proxies/:id/stats</code></pre>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "data": {
    "id": "prx_abc123",
    "assigned_profiles": 5,
    "total_requests": 12847,
    "bandwidth_used_mb": 2341,
    "uptime_percentage": 99.2,
    "avg_latency_ms": 52,
    "success_rate": 98.5,
    "last_used": "2024-02-20T09:45:00Z"
  }
}`}</code></pre>

          <h2>Delete a Proxy</h2>

          <p>
            Remove a proxy from your account.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>DELETE /v1/proxies/:id</code></pre>

          <p>
            If proxy is assigned to profiles, they'll lose proxy connection. Unassign first.
          </p>

          <p>
            <strong>Response:</strong>
          </p>

          <pre><code>{`{
  "success": true,
  "message": "Proxy deleted successfully"
}`}</code></pre>

          <h2>Common Use Cases</h2>

          <p>
            <strong>Import proxies from CSV:</strong>
          </p>

          <pre><code>{`const fs = require('fs');
const csv = require('csv-parser');

const proxies = [];

fs.createReadStream('proxies.csv')
  .pipe(csv())
  .on('data', (row) => {
    proxies.push({
      protocol: row.protocol,
      host: row.host,
      port: parseInt(row.port),
      username: row.username,
      password: row.password
    });
  })
  .on('end', async () => {
    // Bulk add all proxies
    const response = await fetch('https://api.multilogin.io/v1/proxies/bulk', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proxies: proxies,
        auto_test: true
      })
    });
  });`}</code></pre>

          <p>
            <strong>Rotate proxies across profiles:</strong>
          </p>

          <pre><code>{`// Get all proxies
const proxiesRes = await fetch('https://api.multilogin.io/v1/proxies?status=active');
const proxies = await proxiesRes.json();

// Get all profiles
const profilesRes = await fetch('https://api.multilogin.io/v1/profiles');
const profiles = await profilesRes.json();

// Assign proxies in round-robin
for (let i = 0; i < profiles.data.length; i++) {
  const profile = profiles.data[i];
  const proxy = proxies.data[i % proxies.data.length];

  await fetch(\`https://api.multilogin.io/v1/proxies/\${proxy.id}/assign\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profile_id: profile.id })
  });
}`}</code></pre>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Set Up Webhooks</h3>
            <p className="mb-4">
              Get notified when proxy tests fail or profiles are launched. Configure webhooks for real-time events instead of polling the API.
            </p>
            <Link href="/docs/webhooks">
              <Button size="lg">
                Webhooks Guide <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} builds proxy infrastructure APIs at Multilogin.io. She's optimized proxy testing to 100ms latency and handles 50,000+ proxy assignments daily.
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
                  Combine proxy management with profile automation
                </p>
              </Card>
            </Link>
            <Link href="/docs/adding-proxies">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Adding Proxies</h3>
                <p className="text-sm text-muted-foreground">
                  Manual proxy configuration via UI
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
