import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Share2 } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Sharing Profiles',
  description: 'Share browser profiles with team members. Control access levels, manage permissions, sync data across collaborators, and handle concurrent sessions.',
  author: 'Amanda Foster',
  authorTitle: 'Collaboration Engineer',
  publishedAt: '2024-03-01',
  readingTime: '6 min read',
  category: 'Team & Collaboration',
  wordCount: 900,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'share browser profiles',
    'profile sharing',
    'team collaboration',
    'shared profiles',
    'profile access control',
    'collaborative browsing',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/sharing-profiles`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function SharingProfilesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open Profile Settings',
        text: 'Navigate to profile and open sharing settings.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Add Team Member',
        text: 'Select team member and set permission level.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Save Changes',
        text: 'Team member gets immediate access to the profile.',
      },
    ],
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
            Multiple people managing the same account? Share profiles instead of passing credentials. Team members get their own access with controlled permissions.
          </p>

          <h2>Why Share Profiles?</h2>

          <p>
            Without sharing, everyone creates their own profiles for the same account. That causes problems:
          </p>

          <ul>
            <li>Multiple browser fingerprints for one account (red flag)</li>
            <li>Different IPs logging into same account (suspended)</li>
            <li>No coordination on who's working when</li>
            <li>Lost cookies and sessions when someone else logs in</li>
          </ul>

          <p>
            Shared profiles solve this. One profile. Multiple authorized users. Synced data. Coordinated access.
          </p>

          <h2>How to Share a Profile</h2>

          <p>
            Profile → Settings → Sharing → "Add Team Member" button.
          </p>

          <p>
            <strong>Step 1: Select Member</strong>
          </p>

          <p>
            Choose from your team members. Only Members and Viewers need explicit sharing. Admins and Owner already have access to all profiles.
          </p>

          <p>
            <strong>Step 2: Set Permission Level</strong>
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Can View</th>
                  <th>Can Launch</th>
                  <th>Can Edit</th>
                  <th>Can Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Full Access</strong></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td><strong>Launch Only</strong></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><strong>View Only</strong></td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Recommended permissions:</strong>
          </p>

          <ul>
            <li><strong>Full Access:</strong> Trusted team members who configure accounts</li>
            <li><strong>Launch Only:</strong> Operators who just need to use the browser</li>
            <li><strong>View Only:</strong> Supervisors who monitor but don't operate</li>
          </ul>

          <p>
            <strong>Step 3: Save</strong>
          </p>

          <p>
            Click "Share". The team member sees the profile in their dashboard immediately. No email notification.
          </p>

          <h2>Data Synchronization</h2>

          <p>
            Shared profiles sync data across all users automatically.
          </p>

          <p>
            <strong>What syncs:</strong>
          </p>

          <ul>
            <li>Cookies (login sessions persist)</li>
            <li>Local storage</li>
            <li>Session storage</li>
            <li>Bookmarks</li>
            <li>History</li>
            <li>Extension data</li>
            <li>Form autofill</li>
          </ul>

          <p>
            <strong>How it works:</strong>
          </p>

          <ol>
            <li>Alice launches shared profile, logs into Facebook</li>
            <li>Alice closes profile → Data syncs to cloud</li>
            <li>Bob launches same profile → Gets Alice's logged-in session</li>
            <li>Bob posts update, closes profile → Data syncs</li>
            <li>Alice relaunches → Sees Bob's post in history</li>
          </ol>

          <p>
            Sync happens on profile close. Takes 2-5 seconds depending on data size.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
            <p className="text-sm mb-0">
              Close profiles when done. Don't leave them running overnight. This ensures your changes sync to team members and reduces memory usage.
            </p>
          </Card>

          <h2>Concurrent Access</h2>

          <p>
            What happens when two people launch the same profile?
          </p>

          <p>
            <strong>Desktop App Behavior:</strong>
          </p>

          <p>
            First person to launch gets access. Second person sees:
          </p>

          <blockquote>
            <p>
              "Profile is currently in use by Alice Chen. Launch anyway?"
            </p>
          </blockquote>

          <p>
            Options:
          </p>

          <ul>
            <li><strong>Wait:</strong> Notification when Alice closes</li>
            <li><strong>Launch Anyway:</strong> Forces Alice's session to close (she gets warning)</li>
            <li><strong>View Only:</strong> See what Alice is doing in real-time (observer mode)</li>
          </ul>

          <p>
            <strong>Best practice:</strong> Coordinate launches. Use Slack/Discord to say "Taking Facebook profile now."
          </p>

          <h2>Managing Shared Access</h2>

          <p>
            Profile → Settings → Sharing → View all shared users.
          </p>

          <p>
            You'll see:
          </p>

          <ul>
            <li>Team member name</li>
            <li>Permission level</li>
            <li>Last launched timestamp</li>
            <li>Currently using? (Yes/No)</li>
          </ul>

          <p>
            <strong>Change permissions:</strong> Click member → Change dropdown → Save.
          </p>

          <p>
            <strong>Remove access:</strong> Click "Remove" → Confirm. They lose access immediately.
          </p>

          <h2>Bulk Sharing</h2>

          <p>
            Share one profile with 10 team members? Don't add them one-by-one.
          </p>

          <p>
            Profile → Settings → Sharing → "Bulk Add" button → Select multiple members → Set permission → Share.
          </p>

          <p>
            All selected members get the same permission level.
          </p>

          <h2>Shared Profile Notifications</h2>

          <p>
            Enable notifications to know when shared profiles are in use.
          </p>

          <p>
            Settings → Notifications → "Shared Profile Activity" → Enable.
          </p>

          <p>
            Get notified when:
          </p>

          <ul>
            <li>Someone launches a profile you're using</li>
            <li>Your shared profile has been idle for 30+ minutes</li>
            <li>Profile permissions changed</li>
            <li>Profile was deleted by another user</li>
          </ul>

          <h2>Conflict Resolution</h2>

          <p>
            <strong>What if two people edit at the same time?</strong>
          </p>

          <p>
            Rare, but possible:
          </p>

          <ol>
            <li>Alice and Bob both launch profile</li>
            <li>Alice saves bookmark "Site A"</li>
            <li>Bob saves bookmark "Site B"</li>
            <li>Both close at same time</li>
          </ol>

          <p>
            Last-close-wins. Bob closed last, so his bookmark saves. Alice's disappears.
          </p>

          <p>
            <strong>Prevention:</strong> Don't launch same profile simultaneously. Coordinate access.
          </p>

          <h2>Sharing with External Clients</h2>

          <p>
            Client needs to see your work but shouldn't edit profiles?
          </p>

          <p>
            <strong>Option 1: Viewer Role</strong>
          </p>

          <p>
            Invite them as Viewer. Share profiles with View Only permission. They can see everything but can't launch or change anything.
          </p>

          <p>
            <strong>Option 2: Screen Recording</strong>
          </p>

          <p>
            Use Loom or similar. Record browser session. Share video link. No Multilogin access needed.
          </p>

          <p>
            <strong>Option 3: Screenshots</strong>
          </p>

          <p>
            Take screenshots of profile activity. Share via Slack/email. Simple but not real-time.
          </p>

          <h2>Revoking Access</h2>

          <p>
            Team member left? Revoke their profile access.
          </p>

          <p>
            <strong>Option 1: Remove from individual profiles</strong>
          </p>

          <p>
            Go to each shared profile → Settings → Sharing → Remove their access.
          </p>

          <p>
            <strong>Option 2: Remove from team</strong>
          </p>

          <p>
            Settings → Team → Remove member. This automatically removes their access to all shared profiles.
          </p>

          <p>
            Their active sessions close immediately. Data they modified before removal stays.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Track Team Activity</h3>
            <p className="mb-4">
              Profiles shared. Now monitor what team members do. Audit logs track every action: profile launches, edits, deletions, and permission changes.
            </p>
            <Link href="/docs/audit-logs">
              <Button size="lg">
                Audit Logs <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} builds collaboration features at Multilogin.io. She's designed profile sharing systems used by 3,000+ teams managing 50,000+ shared profiles daily.
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
                  Understand role-based access before sharing profiles
                </p>
              </Card>
            </Link>
            <Link href="/docs/session-management">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Session Management</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how data syncs across shared profiles
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
