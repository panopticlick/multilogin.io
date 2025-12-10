import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Webhook } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Webhooks',
  description: 'Receive real-time notifications for profile events, proxy failures, and team changes. Configure webhook endpoints, verify signatures, and handle retries.',
  author: 'Carlos Rodriguez',
  authorTitle: 'Events Infrastructure Engineer',
  publishedAt: '2024-02-22',
  readingTime: '6 min read',
  category: 'API Reference',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'webhooks',
    'webhook events',
    'real-time notifications',
    'webhook security',
    'signature verification',
    'event payloads',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/webhooks`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function WebhooksPage() {
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
            Stop polling the API for updates. Webhooks push events to your server in real-time. Profile created? You get notified instantly. Proxy failed? You know immediately.
          </p>

          <h2>How Webhooks Work</h2>

          <p>
            When an event happens (profile launched, proxy failed, team member added), we send an HTTP POST request to your webhook URL.
          </p>

          <p>
            Your server receives the event, processes it, and responds with <code>200 OK</code>.
          </p>

          <p>
            If we don't get <code>200 OK</code>, we retry up to 3 times with exponential backoff.
          </p>

          <h2>Setting Up Webhooks</h2>

          <p>
            Configure webhooks in your dashboard: Settings → Webhooks → Add Endpoint.
          </p>

          <p>
            Or via API:
          </p>

          <pre><code>{`POST https://api.multilogin.io/v1/webhooks

{
  "url": "https://yourdomain.com/webhook",
  "events": ["profile.created", "profile.launched", "proxy.failed"],
  "secret": "whsec_your_secret_key_here"
}`}</code></pre>

          <p>
            The <code>secret</code> is used to verify webhook authenticity. Generate a random string (32+ characters).
          </p>

          <h2>Available Events</h2>

          <p>
            Subscribe to specific events or use <code>*</code> for all events.
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Trigger</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>profile.created</code></td>
                  <td>New profile created</td>
                </tr>
                <tr>
                  <td><code>profile.updated</code></td>
                  <td>Profile settings changed</td>
                </tr>
                <tr>
                  <td><code>profile.deleted</code></td>
                  <td>Profile permanently deleted</td>
                </tr>
                <tr>
                  <td><code>profile.launched</code></td>
                  <td>Browser session started</td>
                </tr>
                <tr>
                  <td><code>profile.stopped</code></td>
                  <td>Browser session ended</td>
                </tr>
                <tr>
                  <td><code>proxy.added</code></td>
                  <td>New proxy added to account</td>
                </tr>
                <tr>
                  <td><code>proxy.failed</code></td>
                  <td>Proxy connection test failed</td>
                </tr>
                <tr>
                  <td><code>proxy.assigned</code></td>
                  <td>Proxy assigned to profile</td>
                </tr>
                <tr>
                  <td><code>team.member_added</code></td>
                  <td>New team member invited</td>
                </tr>
                <tr>
                  <td><code>team.member_removed</code></td>
                  <td>Team member removed</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Webhook Payload Format</h2>

          <p>
            All webhooks follow this structure:
          </p>

          <pre><code>{`{
  "id": "evt_abc123xyz",
  "type": "profile.created",
  "created_at": "2024-02-22T10:30:00Z",
  "data": {
    "profile": {
      "id": "prof_xyz789",
      "name": "Facebook Account 1",
      "browser": "chromium",
      "fingerprint_template": "social_media",
      "created_at": "2024-02-22T10:30:00Z"
    }
  }
}`}</code></pre>

          <p>
            <strong>Field Descriptions:</strong>
          </p>

          <ul>
            <li><code>id</code> - Unique event ID (for deduplication)</li>
            <li><code>type</code> - Event type (e.g., profile.created)</li>
            <li><code>created_at</code> - When event occurred (ISO 8601)</li>
            <li><code>data</code> - Event-specific payload</li>
          </ul>

          <h2>Handling Webhooks</h2>

          <p>
            <strong>Node.js/Express Example:</strong>
          </p>

          <pre><code>{`const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post('/webhook', (req, res) => {
  // Verify signature
  const signature = req.headers['x-multilogin-signature'];
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
  const event = req.body;

  switch (event.type) {
    case 'profile.created':
      console.log('New profile:', event.data.profile.name);
      break;
    case 'proxy.failed':
      console.log('Proxy failed:', event.data.proxy.host);
      // Send alert to team
      break;
    case 'profile.launched':
      console.log('Profile launched:', event.data.profile.id);
      break;
  }

  // Respond with 200 OK
  res.status(200).send('Received');
});

app.listen(3000);`}</code></pre>

          <p>
            <strong>Python/Flask Example:</strong>
          </p>

          <pre><code>{`import os
import hmac
import hashlib
from flask import Flask, request

app = Flask(__name__)
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET')

@app.route('/webhook', methods=['POST'])
def webhook():
    # Verify signature
    signature = request.headers.get('X-Multilogin-Signature')
    payload = request.get_data()

    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if signature != expected_signature:
        return 'Invalid signature', 401

    # Process event
    event = request.get_json()

    if event['type'] == 'profile.created':
        print(f"New profile: {event['data']['profile']['name']}")
    elif event['type'] == 'proxy.failed':
        print(f"Proxy failed: {event['data']['proxy']['host']}")

    return 'Received', 200

if __name__ == '__main__':
    app.run(port=3000)`}</code></pre>

          <h2>Signature Verification</h2>

          <p>
            Always verify webhook signatures. This prevents unauthorized requests.
          </p>

          <p>
            We include <code>X-Multilogin-Signature</code> header with each webhook:
          </p>

          <pre><code>X-Multilogin-Signature: abc123def456...</code></pre>

          <p>
            Compute expected signature:
          </p>

          <ol>
            <li>Get raw request body (JSON string, no parsing)</li>
            <li>Compute HMAC-SHA256 using your webhook secret</li>
            <li>Compare with signature header</li>
            <li>Reject if they don't match</li>
          </ol>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ Security Critical</p>
            <p className="text-sm mb-0">
              Never skip signature verification. Without it, anyone can send fake webhooks to your endpoint. Use constant-time comparison to prevent timing attacks.
            </p>
          </Card>

          <h2>Retry Logic</h2>

          <p>
            If your endpoint returns non-200 status or times out, we retry:
          </p>

          <ul>
            <li><strong>Attempt 1:</strong> Immediate delivery</li>
            <li><strong>Attempt 2:</strong> 5 seconds later</li>
            <li><strong>Attempt 3:</strong> 25 seconds later</li>
            <li><strong>Attempt 4:</strong> 125 seconds later (final)</li>
          </ul>

          <p>
            After 4 failed attempts, we mark the webhook as failed and stop retrying.
          </p>

          <p>
            Failed webhooks are logged in your dashboard: Settings → Webhooks → Failed Deliveries.
          </p>

          <h2>Idempotency</h2>

          <p>
            Webhooks can be delivered more than once. Handle duplicates gracefully.
          </p>

          <p>
            Use <code>event.id</code> to track processed events:
          </p>

          <pre><code>{`const processedEvents = new Set();

app.post('/webhook', (req, res) => {
  const event = req.body;

  // Check if already processed
  if (processedEvents.has(event.id)) {
    return res.status(200).send('Already processed');
  }

  // Process event
  processEvent(event);

  // Mark as processed
  processedEvents.add(event.id);

  res.status(200).send('Received');
});`}</code></pre>

          <p>
            In production, use a database or Redis to track processed event IDs.
          </p>

          <h2>Testing Webhooks</h2>

          <p>
            Test webhook integration before going live.
          </p>

          <p>
            <strong>Use webhook.site for testing:</strong>
          </p>

          <ol>
            <li>Visit webhook.site → Copy your unique URL</li>
            <li>Add URL as webhook endpoint in Multilogin dashboard</li>
            <li>Trigger an event (create a profile)</li>
            <li>Check webhook.site to see the payload</li>
          </ol>

          <p>
            <strong>Send test webhooks via API:</strong>
          </p>

          <pre><code>{`POST https://api.multilogin.io/v1/webhooks/:id/test

{
  "event_type": "profile.created"
}`}</code></pre>

          <p>
            This sends a sample webhook to your endpoint for testing.
          </p>

          <h2>Best Practices</h2>

          <ul>
            <li><strong>Respond quickly:</strong> Return 200 OK within 5 seconds. Do heavy processing async.</li>
            <li><strong>Use HTTPS:</strong> Webhook URLs must use HTTPS in production.</li>
            <li><strong>Handle duplicates:</strong> Track event IDs to prevent double-processing.</li>
            <li><strong>Log everything:</strong> Log all received webhooks for debugging.</li>
            <li><strong>Monitor failures:</strong> Alert when webhooks fail repeatedly.</li>
            <li><strong>Rotate secrets:</strong> Change webhook secrets quarterly.</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Collaborate with Your Team</h3>
            <p className="mb-4">
              API and webhooks set up. Now learn how to invite team members, manage roles and permissions, and share profiles across your organization.
            </p>
            <Link href="/docs/inviting-team-members">
              <Button size="lg">
                Team Collaboration <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} builds event infrastructure at Multilogin.io. He's designed webhook systems delivering 500,000+ events daily with 99.98% reliability.
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
                  Events reference profile IDs from the Profiles API
                </p>
              </Card>
            </Link>
            <Link href="/docs/api-authentication">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">API Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Webhook endpoints use the same authentication
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
