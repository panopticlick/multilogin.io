import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Database, RefreshCw } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Session Management',
  description: 'Manage browser sessions, cookies, local storage, and profile data. Learn session persistence, data synchronization, and cleanup strategies.',
  author: 'Priya Sharma',
  authorTitle: 'Data Systems Engineer',
  publishedAt: '2024-01-30',
  readingTime: '6 min read',
  category: 'Browser Profiles',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'session management',
    'cookie management',
    'local storage',
    'browser cache',
    'session persistence',
    'profile data',
    'data synchronization',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/session-management`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function SessionManagementPage() {
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
            Sessions persist across browser restarts. Your cookies, local storage, and browsing data stay intact. Here's how to manage it properly.
          </p>

          <h2>How Profile Data Persists</h2>

          <p>
            Each profile stores data in its own isolated directory. No cross-contamination between profiles.
          </p>

          <p>
            Stored data includes:
          </p>

          <ul>
            <li><strong>Cookies:</strong> Authentication tokens, preferences, tracking cookies</li>
            <li><strong>Local Storage:</strong> Key-value data stored by websites</li>
            <li><strong>Session Storage:</strong> Temporary data cleared on browser close</li>
            <li><strong>IndexedDB:</strong> Large structured data (databases)</li>
            <li><strong>Cache:</strong> Images, scripts, stylesheets for faster loading</li>
            <li><strong>Service Workers:</strong> Background scripts for offline functionality</li>
            <li><strong>Extensions:</strong> Installed extensions and their data</li>
            <li><strong>Bookmarks & History:</strong> Your browsing records</li>
          </ul>

          <p>
            Default storage location per OS:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Default Path</th>
                  <th>Average Size</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Windows</td>
                  <td>C:\Users\[Name]\AppData\Roaming\Multilogin\Profiles</td>
                  <td>100-500MB</td>
                </tr>
                <tr>
                  <td>macOS</td>
                  <td>~/Library/Application Support/Multilogin/Profiles</td>
                  <td>100-500MB</td>
                </tr>
                <tr>
                  <td>Linux</td>
                  <td>~/.config/multilogin/profiles</td>
                  <td>100-500MB</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Cookie Management</h2>

          <p>
            Cookies are the most important session data. They store login tokens, preferences, and tracking info.
          </p>

          <p>
            <strong>Viewing Cookies:</strong> Right-click in your profile browser → Inspect → Application tab → Cookies. You'll see all cookies for the current site.
          </p>

          <p>
            <strong>Exporting Cookies:</strong> Profile Settings → Data Management → Export Cookies. Saves as JSON. Useful for backing up logged-in sessions.
          </p>

          <p>
            <strong>Importing Cookies:</strong> Profile Settings → Data Management → Import Cookies. Load saved cookies to restore sessions without re-logging in.
          </p>

          <p>
            Cookie types:
          </p>

          <ul>
            <li><strong>Session Cookies:</strong> Expire when you close the browser. Temporary.</li>
            <li><strong>Persistent Cookies:</strong> Have expiration dates (days, months, years). Stay after browser closes.</li>
            <li><strong>HttpOnly Cookies:</strong> Not accessible via JavaScript. Used for authentication to prevent XSS.</li>
            <li><strong>Secure Cookies:</strong> Only sent over HTTPS. Can't be intercepted on HTTP.</li>
          </ul>

          <p>
            Sites use cookies to track device persistence. If you clear cookies between sessions, sites see you as a new device. That triggers account verification or flags.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
            <p className="text-sm mb-0">
              Don't clear cookies unless absolutely necessary. Sites track cookie age. Fresh cookies every session look suspicious. Keep cookies persistent for established accounts.
            </p>
          </Card>

          <h2>Local Storage and IndexedDB</h2>

          <p>
            Local Storage is key-value storage. Sites use it for preferences, cached data, and sometimes tracking.
          </p>

          <p>
            View it: Inspect → Application tab → Local Storage. You'll see data organized by domain.
          </p>

          <p>
            IndexedDB is more powerful. It's a full database in your browser. Sites use it for offline functionality, large datasets, and complex state.
          </p>

          <p>
            Both persist between sessions automatically. You don't need to manage them manually unless:
          </p>

          <ul>
            <li>A site breaks due to corrupted data (clear and reload)</li>
            <li>You're testing from a fresh state (clear to simulate new user)</li>
            <li>You're migrating profiles between machines (export and import)</li>
          </ul>

          <h2>Cache Management</h2>

          <p>
            The cache stores images, scripts, and styles. It makes sites load faster on repeat visits.
          </p>

          <p>
            Cache size grows over time. A heavily-used profile can accumulate 200-500MB of cached data.
          </p>

          <p>
            <strong>Manual Cache Clear:</strong> Profile Settings → Data Management → Clear Cache. Frees up disk space. Doesn't affect cookies or login sessions.
          </p>

          <p>
            <strong>Automatic Cache Management:</strong> Enable "Auto-clear cache on exit" in profile settings. Keeps disk usage low. Slightly slower initial page loads.
          </p>

          <p>
            Don't clear cache too aggressively. Sites track cache patterns. If you always load fresh images (no cache hits), you look like a bot.
          </p>

          <h2>Cloud Sync for Team Profiles</h2>

          <p>
            Team and Enterprise plans include cloud sync. Your profile data syncs across machines.
          </p>

          <p>
            How it works:
          </p>

          <ol>
            <li>You make changes in a profile (login, save bookmarks, install extension)</li>
            <li>Data syncs to cloud on browser close (encrypted)</li>
            <li>Other team members get updates next time they launch the profile</li>
            <li>Conflicts are resolved automatically (last-write-wins)</li>
          </ol>

          <p>
            What syncs:
          </p>

          <ul>
            <li>Cookies and local storage</li>
            <li>Bookmarks and history</li>
            <li>Installed extensions</li>
            <li>Form autofill data</li>
            <li>Open tabs (if enabled)</li>
          </ul>

          <p>
            What doesn't sync:
          </p>

          <ul>
            <li>Cache (too large, always fresh)</li>
            <li>Downloads folder</li>
            <li>Temporary files</li>
          </ul>

          <p>
            Sync happens automatically. You can force sync: Profile Settings → Cloud Sync → Sync Now. Takes 2-10 seconds depending on data size.
          </p>

          <h2>Profile Data Backup</h2>

          <p>
            Back up critical profiles. Hardware fails. Accounts get lost.
          </p>

          <p>
            <strong>Full Profile Backup:</strong> Profile Settings → Backup → Export Full Profile. Creates a .zip with all data. Usually 100-500MB per profile.
          </p>

          <p>
            Store backups securely. They contain:
          </p>

          <ul>
            <li>Login cookies (anyone with the backup can access your accounts)</li>
            <li>Saved passwords (if browser password manager is used)</li>
            <li>Payment autofill data</li>
            <li>Browsing history</li>
          </ul>

          <p>
            Encrypt backups with 7-Zip or VeraCrypt. Use strong passwords. Don't store backups in Dropbox or Google Drive unencrypted.
          </p>

          <h2>Session Cleanup Strategies</h2>

          <p>
            Clean sessions periodically to prevent data bloat and reduce fingerprinting surface.
          </p>

          <p>
            <strong>Conservative (Recommended):</strong>
          </p>

          <ul>
            <li>Keep cookies forever</li>
            <li>Clear cache monthly</li>
            <li>Keep history for 30 days</li>
            <li>Backup profiles monthly</li>
          </ul>

          <p>
            <strong>Aggressive (Privacy-Focused):</strong>
          </p>

          <ul>
            <li>Clear cache on exit</li>
            <li>Keep cookies for critical sites only</li>
            <li>Clear history weekly</li>
            <li>Rotate profiles quarterly</li>
          </ul>

          <p>
            <strong>Paranoid (Maximum Security):</strong>
          </p>

          <ul>
            <li>Clear everything on exit</li>
            <li>Don't persist any data</li>
            <li>Re-login every session</li>
            <li>Delete profiles after use</li>
          </ul>

          <p>
            Pick based on your risk tolerance. E-commerce sellers should use Conservative. Privacy researchers should use Aggressive.
          </p>

          <h2>Troubleshooting Session Issues</h2>

          <p>
            <strong>Logged out after profile restart:</strong> Cookies were cleared. Check profile settings → Data Management → "Clear cookies on exit" is disabled.
          </p>

          <p>
            <strong>Site says "Please enable cookies":</strong> Cookie blocking is too aggressive. Disable third-party cookie blocking for that site.
          </p>

          <p>
            <strong>Profile data not syncing:</strong> Check cloud sync status in profile settings. Verify your subscription includes sync. Force sync manually.
          </p>

          <p>
            <strong>Profile growing too large:</strong> Clear cache and old history. Export and re-import to compact database.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Organize with Profile Groups</h3>
            <p className="mb-4">
              Managing 10+ profiles? Use profile groups to organize by client, project, or platform. Tags, folders, and bulk operations make scaling easy.
            </p>
            <Link href="/docs/profile-groups">
              <Button size="lg">
                Profile Groups <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} architected Multilogin's profile data system. She's optimized storage for 500,000+ profiles and built the cloud sync infrastructure handling 10TB of encrypted profile data.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/profile-groups">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Profile Groups</h3>
                <p className="text-sm text-muted-foreground">
                  Organize multiple profiles with tags, folders, and bulk operations
                </p>
              </Card>
            </Link>
            <Link href="/docs/creating-first-profile">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Creating Your First Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Start here if you haven't created any profiles yet
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
