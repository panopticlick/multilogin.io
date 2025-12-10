import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, UserPlus } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Inviting Team Members',
  description: 'Add team members to your Multilogin account. Send invitations, set roles, manage pending invites, and control access to profiles and resources.',
  author: 'Jessica Chen',
  authorTitle: 'Collaboration Systems Lead',
  publishedAt: '2024-02-25',
  readingTime: '5 min read',
  category: 'Team & Collaboration',
  wordCount: 700,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'invite team members',
    'team collaboration',
    'user management',
    'team invitations',
    'multilogin team',
    'add users',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/inviting-team-members`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function InvitingTeamMembersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    totalTime: 'PT3M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open Team Settings',
        text: 'Navigate to Settings → Team in your dashboard.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Send Invitation',
        text: 'Click Invite Member, enter email and select role.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Member Accepts',
        text: 'Team member receives email and accepts invitation.',
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
            Team plans support multiple users. Share profiles. Collaborate on accounts. Control who can do what. Here's how to invite your team.
          </p>

          <h2>Who Can Invite Members?</h2>

          <p>
            Only Owners and Admins can invite new team members.
          </p>

          <ul>
            <li><strong>Owner:</strong> Account creator. Full control. Can't be removed.</li>
            <li><strong>Admin:</strong> Can invite members, manage roles, access all profiles.</li>
            <li><strong>Member:</strong> Can't invite others. Access only to assigned profiles.</li>
            <li><strong>Viewer:</strong> Read-only access. Can't modify anything.</li>
          </ul>

          <p>
            See <Link href="/docs/roles-permissions">Roles & Permissions</Link> for detailed breakdown.
          </p>

          <h2>Sending an Invitation</h2>

          <p>
            Dashboard → Settings → Team → "Invite Member" button.
          </p>

          <p>
            <strong>Step 1: Enter Email</strong>
          </p>

          <p>
            Type the email address. They don't need a Multilogin account yet. We'll create one when they accept.
          </p>

          <p>
            <strong>Step 2: Select Role</strong>
          </p>

          <p>
            Choose initial role:
          </p>

          <ul>
            <li><strong>Admin:</strong> For team leads who need full access</li>
            <li><strong>Member:</strong> For operators who manage specific profiles</li>
            <li><strong>Viewer:</strong> For stakeholders who need read-only visibility</li>
          </ul>

          <p>
            You can change roles later.
          </p>

          <p>
            <strong>Step 3: Assign Profiles (Optional)</strong>
          </p>

          <p>
            Select which profiles this member can access. Skip this if they should access everything (Admins) or nothing yet (assign later).
          </p>

          <p>
            <strong>Step 4: Send Invitation</strong>
          </p>

          <p>
            Click "Send Invite." They receive an email with activation link.
          </p>

          <h2>Invitation Email</h2>

          <p>
            The invited person gets an email:
          </p>

          <blockquote>
            <p>
              Subject: You've been invited to join [Your Company] on Multilogin.io
            </p>
            <p>
              [Your Name] has invited you to collaborate on Multilogin.io.
            </p>
            <p>
              Role: Member<br />
              Access: 5 profiles
            </p>
            <p>
              [Accept Invitation Button]
            </p>
            <p>
              This invitation expires in 7 days.
            </p>
          </blockquote>

          <p>
            Invitation link is valid for 7 days. After that, it expires and you need to resend.
          </p>

          <h2>Accepting an Invitation</h2>

          <p>
            Recipient clicks "Accept Invitation" in email.
          </p>

          <p>
            <strong>If they have a Multilogin account:</strong>
          </p>

          <ol>
            <li>Log in with existing credentials</li>
            <li>Confirm joining the team</li>
            <li>Get immediate access</li>
          </ol>

          <p>
            <strong>If they don't have an account:</strong>
          </p>

          <ol>
            <li>Create new account (email, password)</li>
            <li>Verify email address</li>
            <li>Automatically join the team</li>
          </ol>

          <p>
            After accepting, they see your team workspace when they log in. They can switch between personal and team workspaces using the workspace selector in top-left.
          </p>

          <h2>Managing Pending Invitations</h2>

          <p>
            View all sent invitations: Settings → Team → "Pending Invites" tab.
          </p>

          <p>
            You'll see:
          </p>

          <ul>
            <li>Email address</li>
            <li>Role assigned</li>
            <li>Sent date</li>
            <li>Expiration date</li>
            <li>Status (pending, expired)</li>
          </ul>

          <p>
            <strong>Resend Invitation:</strong> Click "Resend" to send another email with fresh link. Previous link becomes invalid.
          </p>

          <p>
            <strong>Cancel Invitation:</strong> Click "Cancel" to revoke invitation. Link becomes invalid immediately.
          </p>

          <h2>Bulk Invitations</h2>

          <p>
            Inviting 10+ people? Use bulk invite.
          </p>

          <p>
            Settings → Team → "Bulk Invite" → Upload CSV.
          </p>

          <p>
            CSV format:
          </p>

          <pre><code>{`email,role,profile_ids
john@company.com,member,"prof_abc123,prof_def456"
jane@company.com,admin,
mike@company.com,member,"prof_abc123"`}</code></pre>

          <p>
            First row is header. Leave <code>profile_ids</code> empty for no initial profile access.
          </p>

          <p>
            Upload CSV. We send invitations to all emails. You get a summary:
          </p>

          <ul>
            <li>10 invitations sent</li>
            <li>2 failed (invalid email format)</li>
          </ul>

          <h2>Team Size Limits</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Team Members</th>
                  <th>Cost per Extra Seat</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Solo</td>
                  <td>1 (you)</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Team</td>
                  <td>5 included</td>
                  <td>$20/month</td>
                </tr>
                <tr>
                  <td>Enterprise</td>
                  <td>Unlimited</td>
                  <td>Included</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Need more seats on Team plan? Settings → Billing → "Add Team Members." Charged monthly at $20/seat.
          </p>

          <h2>Common Issues</h2>

          <p>
            <strong>Invitation email not received:</strong>
          </p>

          <ul>
            <li>Check spam folder</li>
            <li>Verify email address spelling</li>
            <li>Try different email (work vs personal)</li>
            <li>Whitelist <code>@multilogin.io</code> in email settings</li>
          </ul>

          <p>
            <strong>Can't accept invitation:</strong>
          </p>

          <ul>
            <li>Link expired (valid 7 days) - ask for resend</li>
            <li>Already member of another team - leave other team first</li>
            <li>Email mismatch - must use exact email from invitation</li>
          </ul>

          <p>
            <strong>"Maximum team members reached":</strong>
          </p>

          <ul>
            <li>Upgrade to larger Team plan</li>
            <li>Or remove inactive members</li>
            <li>Or upgrade to Enterprise for unlimited</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Configure Roles & Permissions</h3>
            <p className="mb-4">
              Team members invited. Now configure what each role can do. Control profile access, proxy management, and more.
            </p>
            <Link href="/docs/roles-permissions">
              <Button size="lg">
                Roles & Permissions <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} builds collaboration features at Multilogin.io. She's designed team invitation flows used by 5,000+ teams managing 100,000+ shared profiles.
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
                  Understand what each role can and can't do
                </p>
              </Card>
            </Link>
            <Link href="/docs/sharing-profiles">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Sharing Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  Share specific profiles with team members
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
