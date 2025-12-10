import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, FolderTree, Tags } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Profile Groups',
  description: 'Organize browser profiles with folders, tags, and bulk operations. Manage 100+ profiles efficiently with smart grouping and filtering.',
  author: 'Michael Zhang',
  authorTitle: 'Product Designer',
  publishedAt: '2024-02-02',
  readingTime: '5 min read',
  category: 'Browser Profiles',
  wordCount: 800,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'profile groups',
    'profile organization',
    'profile tags',
    'profile folders',
    'bulk operations',
    'profile management',
    'organize profiles',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/profile-groups`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function ProfileGroupsPage() {
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
            Managing 3 profiles is easy. Managing 50 is chaos without organization. Profile groups, folders, and tags keep you sane when scaling.
          </p>

          <h2>Why Organization Matters</h2>

          <p>
            Users start with 3-5 profiles. Then scale to 20. Then 50. Then 100+.
          </p>

          <p>
            Without organization, you waste time:
          </p>

          <ul>
            <li>Scrolling through profile lists to find the right one</li>
            <li>Forgetting which profile is for which account</li>
            <li>Accidentally launching the wrong profile</li>
            <li>Losing track of proxy assignments</li>
            <li>Unable to update settings in bulk</li>
          </ul>

          <p>
            Groups solve this. Organize by client, platform, campaign, or any structure that matches your workflow.
          </p>

          <h2>Creating Folders</h2>

          <p>
            Folders are hierarchical. Like file system folders.
          </p>

          <p>
            Example structure for an agency:
          </p>

          <pre><code>
📁 Client A
  📁 Social Media
    🌐 Facebook Account 1
    🌐 Facebook Account 2
    🌐 Instagram Account 1
  📁 E-commerce
    🌐 Amazon Seller Account
    🌐 eBay Account

📁 Client B
  📁 Ads Management
    🌐 Google Ads Profile
    🌐 Facebook Ads Profile
  📁 Analytics
    🌐 GA4 Profile
          </code></pre>

          <p>
            Create a folder: Dashboard → Right-click sidebar → "New Folder". Name it. Done.
          </p>

          <p>
            Move profiles: Drag and drop into folders. Or right-click profile → "Move to Folder."
          </p>

          <p>
            Folders can nest up to 5 levels deep. Don't go deeper. It gets confusing.
          </p>

          <h2>Using Tags</h2>

          <p>
            Tags are flexible. One profile can have multiple tags. Folders can't do that.
          </p>

          <p>
            Example tagging scheme:
          </p>

          <ul>
            <li><strong>Platform tags:</strong> facebook, instagram, amazon, ebay</li>
            <li><strong>Status tags:</strong> active, paused, warming-up, banned</li>
            <li><strong>Region tags:</strong> us-east, eu-west, asia-pacific</li>
            <li><strong>Client tags:</strong> client-acme, client-globex</li>
            <li><strong>Purpose tags:</strong> testing, production, backup</li>
          </ul>

          <p>
            A profile can be tagged: facebook, active, us-east, client-acme, production.
          </p>

          <p>
            Add tags: Profile → Settings → Tags → Add Tag. Type tag name. Hit enter. Autocompletes from existing tags.
          </p>

          <p>
            Filter by tags: Dashboard → Tags dropdown → Select tags. Shows only matching profiles. Combine multiple tags with AND/OR logic.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Tag Best Practices</p>
            <p className="text-sm mb-0">
              Use consistent tag naming. All lowercase. Hyphens instead of spaces. "client-acme" not "Client Acme". Makes filtering reliable.
            </p>
          </Card>

          <h2>Color Coding</h2>

          <p>
            Visual identification. Assign colors to profiles.
          </p>

          <p>
            Common color schemes:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Meaning</th>
                  <th>Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🟢 Green</td>
                  <td>Active, healthy</td>
                  <td>Production profiles in good standing</td>
                </tr>
                <tr>
                  <td>🟡 Yellow</td>
                  <td>Warning, attention needed</td>
                  <td>Profiles with flagged accounts or expiring proxies</td>
                </tr>
                <tr>
                  <td>🔴 Red</td>
                  <td>Banned, suspended</td>
                  <td>Accounts that got banned or profiles to avoid</td>
                </tr>
                <tr>
                  <td>🔵 Blue</td>
                  <td>Testing, development</td>
                  <td>Non-production profiles for testing</td>
                </tr>
                <tr>
                  <td>🟣 Purple</td>
                  <td>VIP, high-value</td>
                  <td>Client's most important accounts</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Set color: Right-click profile → "Set Color" → Pick from palette.
          </p>

          <p>
            Color shows in profile list, launch buttons, and tab indicators. Makes profile identification instant.
          </p>

          <h2>Smart Views and Filters</h2>

          <p>
            Smart views are saved filters. Like smart playlists.
          </p>

          <p>
            Create a smart view:
          </p>

          <ol>
            <li>Apply filters (tags, folders, colors, date ranges)</li>
            <li>Click "Save View" at top right</li>
            <li>Name it (e.g., "Active Facebook Profiles")</li>
            <li>View appears in sidebar</li>
          </ol>

          <p>
            Useful smart views:
          </p>

          <ul>
            <li>"Profiles to check today" - Profiles tagged "daily-check"</li>
            <li>"Expiring proxies" - Proxies expiring in next 7 days</li>
            <li>"High-value accounts" - Profiles tagged "vip" or colored purple</li>
            <li>"Recently used" - Profiles launched in last 24 hours</li>
            <li>"Inactive profiles" - Not launched in 30+ days</li>
          </ul>

          <h2>Bulk Operations</h2>

          <p>
            Update 50 profiles at once. Don't do it manually.
          </p>

          <p>
            Select multiple profiles: Hold Cmd/Ctrl and click. Or click first, hold Shift, click last to select range.
          </p>

          <p>
            Bulk actions available:
          </p>

          <ul>
            <li><strong>Update proxies:</strong> Change proxy settings across all selected</li>
            <li><strong>Change fingerprint template:</strong> Switch from General to E-commerce</li>
            <li><strong>Apply tags:</strong> Tag 20 profiles with "client-newco" at once</li>
            <li><strong>Export data:</strong> Backup multiple profiles simultaneously</li>
            <li><strong>Delete profiles:</strong> Remove test profiles in bulk</li>
            <li><strong>Update user agent:</strong> Bump Chrome version across all profiles</li>
          </ul>

          <p>
            Right-click selected profiles → "Bulk Operations" → Choose action.
          </p>

          <p>
            Changes apply immediately. No undo. Be careful with bulk delete.
          </p>

          <h2>Search and Quick Launch</h2>

          <p>
            Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows). Opens quick search.
          </p>

          <p>
            Type profile name, tag, or folder. Results filter as you type. Hit Enter to launch.
          </p>

          <p>
            You never need to scroll profile lists. Quick search is faster.
          </p>

          <p>
            Search supports:
          </p>

          <ul>
            <li>Profile names (partial matches)</li>
            <li>Tags (prefix with "#": #facebook)</li>
            <li>Folders (prefix with "/": /client-a)</li>
            <li>Colors (type color name: "red", "green")</li>
            <li>Proxy IPs (finds profiles using specific proxy)</li>
          </ul>

          <h2>Profile Naming Conventions</h2>

          <p>
            Good names make organization easier. Bad names create confusion.
          </p>

          <p>
            <strong>Good naming patterns:</strong>
          </p>

          <ul>
            <li>"ClientName - Platform - Account" → "Acme - Facebook - Account 1"</li>
            <li>"Platform - Purpose - ID" → "Instagram - Ads - 001"</li>
            <li>"Region - Platform - Date" → "US-East - Amazon - 2024-01"</li>
          </ul>

          <p>
            <strong>Bad naming patterns:</strong>
          </p>

          <ul>
            <li>"Profile 1", "Profile 2" (meaningless)</li>
            <li>"Test", "New", "Final" (vague)</li>
            <li>"asdfasdf" (seriously?)</li>
          </ul>

          <p>
            Consistent naming makes search work. You can type "acme" and find all Acme client profiles.
          </p>

          <h2>Exporting and Sharing Groups</h2>

          <p>
            Team plans let you share folder structures and smart views.
          </p>

          <p>
            Export folder structure: Right-click folder → "Export Structure" → Save as JSON. Share with team members.
          </p>

          <p>
            Import folder structure: Dashboard → Import → Load JSON. Recreates entire folder hierarchy. Doesn't include actual profiles (those stay private unless explicitly shared).
          </p>

          <p>
            Useful when onboarding team members. They get your organizational structure without your profile data.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Master Proxy Integration</h3>
            <p className="mb-4">
              Your profiles are organized. Now learn how to configure proxies for each profile. HTTP, SOCKS5, rotating residential proxies, and troubleshooting.
            </p>
            <Link href="/docs/adding-proxies">
              <Button size="lg">
                Adding Proxies <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} designed Multilogin's profile management interface. He's studied how users organize 100+ profiles and built the tagging, filtering, and bulk operations systems that scale to 1000+ profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/session-management">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Session Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage cookies, local storage, and persistent data across profiles
                </p>
              </Card>
            </Link>
            <Link href="/docs/adding-proxies">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Adding Proxies</h3>
                <p className="text-sm text-muted-foreground">
                  Configure proxies for each profile and group proxy assignments
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
