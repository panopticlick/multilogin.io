import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, FileText } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Audit Logs',
  description: 'Track team activity with audit logs. Monitor profile access, configuration changes, permission updates, and security events. Export logs for compliance.',
  author: 'Kevin Park',
  authorTitle: 'Compliance & Security Engineer',
  publishedAt: '2024-03-03',
  readingTime: '5 min read',
  category: 'Team & Collaboration',
  wordCount: 800,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'audit logs',
    'activity tracking',
    'compliance logging',
    'team monitoring',
    'access logs',
    'security audit',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/audit-logs`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function AuditLogsPage() {
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
    timeRequired: 'PT5M',
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
            Who launched which profile? Who changed team permissions? Who deleted that account? Audit logs answer these questions. Every action is tracked, timestamped, and attributed.
          </p>

          <h2>What Gets Logged?</h2>

          <p>
            We track every significant action in your account.
          </p>

          <p>
            <strong>Profile Actions:</strong>
          </p>

          <ul>
            <li>Profile created, updated, deleted</li>
            <li>Profile launched, stopped</li>
            <li>Profile shared with team member</li>
            <li>Profile access removed</li>
            <li>Fingerprint settings changed</li>
          </ul>

          <p>
            <strong>Team Actions:</strong>
          </p>

          <ul>
            <li>Member invited, accepted invitation</li>
            <li>Member removed from team</li>
            <li>Role changed (Member → Admin, etc.)</li>
            <li>Profile access granted or revoked</li>
          </ul>

          <p>
            <strong>Security Events:</strong>
          </p>

          <ul>
            <li>Login from new device</li>
            <li>Failed login attempts</li>
            <li>API key created or revoked</li>
            <li>Two-factor authentication enabled/disabled</li>
            <li>Password changed</li>
          </ul>

          <p>
            <strong>Configuration Changes:</strong>
          </p>

          <ul>
            <li>Proxy added, updated, or deleted</li>
            <li>Billing information updated</li>
            <li>Subscription plan changed</li>
            <li>Webhook endpoints configured</li>
          </ul>

          <h2>Accessing Audit Logs</h2>

          <p>
            Settings → Audit Logs (or Security → Audit Logs).
          </p>

          <p>
            <strong>Who can access:</strong>
          </p>

          <ul>
            <li><strong>Owner:</strong> Yes, all logs</li>
            <li><strong>Admin:</strong> Yes, all logs</li>
            <li><strong>Member:</strong> No, can't view logs</li>
            <li><strong>Viewer:</strong> No, can't view logs</li>
          </ul>

          <p>
            Only Owner and Admin roles have audit log access. This prevents team members from covering tracks.
          </p>

          <h2>Log Entry Format</h2>

          <p>
            Each log entry shows:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Description</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Timestamp</strong></td>
                  <td>When action occurred</td>
                  <td>2024-03-03 14:32:15 UTC</td>
                </tr>
                <tr>
                  <td><strong>Actor</strong></td>
                  <td>Who performed action</td>
                  <td>john@company.com</td>
                </tr>
                <tr>
                  <td><strong>Action</strong></td>
                  <td>What happened</td>
                  <td>profile.launched</td>
                </tr>
                <tr>
                  <td><strong>Resource</strong></td>
                  <td>What was affected</td>
                  <td>Profile: Facebook Account 1</td>
                </tr>
                <tr>
                  <td><strong>IP Address</strong></td>
                  <td>Source IP</td>
                  <td>192.0.2.42</td>
                </tr>
                <tr>
                  <td><strong>Device</strong></td>
                  <td>Device info</td>
                  <td>Chrome on macOS</td>
                </tr>
                <tr>
                  <td><strong>Result</strong></td>
                  <td>Success or failure</td>
                  <td>Success</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Example log entry:</strong>
          </p>

          <blockquote>
            <p>
              <strong>2024-03-03 14:32:15 UTC</strong><br />
              <strong>john@company.com</strong> launched <strong>Profile: Facebook Account 1</strong><br />
              From: 192.0.2.42 (New York, US)<br />
              Device: Chrome 120 on macOS 14<br />
              Result: Success
            </p>
          </blockquote>

          <h2>Filtering Logs</h2>

          <p>
            Use filters to find specific activities.
          </p>

          <p>
            <strong>Filter by Actor:</strong> See everything one person did.
          </p>

          <p>
            <strong>Filter by Action:</strong> Find all profile launches, all deletions, all permission changes.
          </p>

          <p>
            <strong>Filter by Resource:</strong> Track history of specific profile.
          </p>

          <p>
            <strong>Filter by Date Range:</strong> Last 24 hours, last 7 days, last 30 days, custom range.
          </p>

          <p>
            <strong>Filter by Result:</strong> Show only failed actions (security monitoring).
          </p>

          <p>
            Example filters:
          </p>

          <ul>
            <li>"Show all actions by alice@company.com in last 7 days"</li>
            <li>"Show all failed login attempts"</li>
            <li>"Show all profile deletions this month"</li>
            <li>"Show all actions on Profile ID prof_abc123"</li>
          </ul>

          <h2>Exporting Logs</h2>

          <p>
            Export logs for compliance, reporting, or external analysis.
          </p>

          <p>
            Audit Logs page → "Export" button → Choose format:
          </p>

          <ul>
            <li><strong>CSV:</strong> Open in Excel, Google Sheets</li>
            <li><strong>JSON:</strong> Import into SIEM tools (Splunk, Datadog)</li>
            <li><strong>PDF:</strong> Share with auditors or management</li>
          </ul>

          <p>
            Exports include all visible logs after filters. Max 10,000 entries per export.
          </p>

          <p>
            For full history or automated exports, use the API:
          </p>

          <pre><code>{`GET https://api.multilogin.io/v1/audit-logs?from=2024-01-01&to=2024-03-03&limit=1000`}</code></pre>

          <h2>Retention Policy</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Retention Period</th>
                  <th>Export Access</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Solo</td>
                  <td>30 days</td>
                  <td>CSV only</td>
                </tr>
                <tr>
                  <td>Team</td>
                  <td>90 days</td>
                  <td>CSV, JSON</td>
                </tr>
                <tr>
                  <td>Enterprise</td>
                  <td>1 year</td>
                  <td>CSV, JSON, PDF, API</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Older logs are automatically deleted. Export important logs before they expire.
          </p>

          <h2>Common Use Cases</h2>

          <p>
            <strong>Security Incident Investigation:</strong>
          </p>

          <p>
            Profile got banned? Check audit logs to see who launched it, when, from which IP. Identify the problem and prevent recurrence.
          </p>

          <p>
            <strong>Compliance Audits:</strong>
          </p>

          <p>
            Export all logs for date range. Show auditors exactly who accessed what data and when. Demonstrate access controls and activity monitoring.
          </p>

          <p>
            <strong>Team Performance Tracking:</strong>
          </p>

          <p>
            Filter by team member to see their activity. How many profiles did they launch? Are they following procedures?
          </p>

          <p>
            <strong>Unauthorized Access Detection:</strong>
          </p>

          <p>
            Set up alerts for suspicious patterns:
          </p>

          <ul>
            <li>Logins from unusual locations</li>
            <li>Profile access outside business hours</li>
            <li>Multiple failed login attempts</li>
            <li>Bulk profile deletions</li>
          </ul>

          <h2>API Access</h2>

          <p>
            Programmatically retrieve audit logs via API.
          </p>

          <p>
            <strong>Endpoint:</strong>
          </p>

          <pre><code>GET /v1/audit-logs</code></pre>

          <p>
            <strong>Query Parameters:</strong>
          </p>

          <ul>
            <li><code>from</code> - Start date (ISO 8601)</li>
            <li><code>to</code> - End date (ISO 8601)</li>
            <li><code>actor</code> - Filter by user email</li>
            <li><code>action</code> - Filter by action type</li>
            <li><code>resource_id</code> - Filter by resource (profile, proxy, etc.)</li>
            <li><code>limit</code> - Results per page (max: 1000)</li>
          </ul>

          <p>
            <strong>Example request:</strong>
          </p>

          <pre><code>{`const response = await fetch('https://api.multilogin.io/v1/audit-logs?from=2024-03-01&action=profile.deleted', {
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  }
});`}</code></pre>

          <h2>Best Practices</h2>

          <ul>
            <li><strong>Review weekly:</strong> Check logs every week for unusual activity</li>
            <li><strong>Export monthly:</strong> Archive logs for long-term retention</li>
            <li><strong>Monitor failures:</strong> Failed logins and actions indicate problems</li>
            <li><strong>Train team:</strong> Inform team that all actions are logged</li>
            <li><strong>Set up alerts:</strong> Use webhooks to get notified of critical events</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Secure Your Account</h3>
            <p className="mb-4">
              Team collaboration configured. Audit logs tracking activity. Now strengthen security with data encryption, two-factor authentication, and API key management.
            </p>
            <Link href="/docs/data-encryption">
              <Button size="lg">
                Security & Privacy <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} designs compliance systems at Multilogin.io. He's built audit logging infrastructure processing 10M+ events daily with SOC 2 and GDPR compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/roles-permissions">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Roles & Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Understand who can access audit logs
                </p>
              </Card>
            </Link>
            <Link href="/docs/data-encryption">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Data Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how we protect your data and logs
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
