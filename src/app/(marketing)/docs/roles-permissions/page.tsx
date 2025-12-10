import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Shield } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Roles & Permissions',
  description: 'Complete guide to role-based access control. Owner, Admin, Member, and Viewer roles. Permission matrices for profiles, proxies, and team management.',
  author: 'Robert Wilson',
  authorTitle: 'Security & Access Control Lead',
  publishedAt: '2024-02-27',
  readingTime: '7 min read',
  category: 'Team & Collaboration',
  wordCount: 1000,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'roles and permissions',
    'RBAC',
    'access control',
    'user roles',
    'team permissions',
    'owner admin member',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/roles-permissions`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function RolesPermissionsPage() {
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
            Control who can do what. Four roles with different permissions. Owner has full control. Viewers can only watch. Members and Admins sit in between.
          </p>

          <h2>Role Overview</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Profile Access</th>
                  <th>Team Management</th>
                  <th>Billing</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Owner</strong></td>
                  <td>All profiles</td>
                  <td>Full control</td>
                  <td>Full control</td>
                </tr>
                <tr>
                  <td><strong>Admin</strong></td>
                  <td>All profiles</td>
                  <td>Invite, remove members</td>
                  <td>View only</td>
                </tr>
                <tr>
                  <td><strong>Member</strong></td>
                  <td>Assigned profiles only</td>
                  <td>View team</td>
                  <td>No access</td>
                </tr>
                <tr>
                  <td><strong>Viewer</strong></td>
                  <td>Read-only</td>
                  <td>View team</td>
                  <td>No access</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Owner Role</h2>

          <p>
            The account creator. Has unrestricted access to everything.
          </p>

          <p>
            <strong>Unique privileges:</strong>
          </p>

          <ul>
            <li>Transfer ownership to another team member</li>
            <li>Delete the entire account</li>
            <li>Cannot be removed by anyone (including themselves without transferring ownership first)</li>
          </ul>

          <p>
            <strong>Use case:</strong> CEO, founder, or account owner.
          </p>

          <h2>Admin Role</h2>

          <p>Day-to-day account management for the workspace.</p>

          <p>
            <strong>Can do:</strong>
          </p>

          <ul>
            <li>Create, edit, delete all profiles</li>
            <li>Launch any browser session</li>
            <li>Add and manage proxies</li>
            <li>Invite new team members</li>
            <li>Remove team members (except Owner)</li>
            <li>Change member roles (except Owner)</li>
            <li>View audit logs</li>
            <li>Configure API keys</li>
            <li>Set up webhooks</li>
          </ul>

          <p>
            <strong>Cannot do:</strong>
          </p>

          <ul>
            <li>Delete the account</li>
            <li>Transfer ownership</li>
            <li>Remove the Owner</li>
          </ul>

          <p>
            <strong>Use case:</strong> Team leads, department managers, operations directors.
          </p>

          <h2>Member Role</h2>

          <p>
            Standard user. Can manage profiles they're assigned to.
          </p>

          <p>
            <strong>Can do:</strong>
          </p>

          <ul>
            <li>View and edit assigned profiles</li>
            <li>Launch assigned profiles</li>
            <li>Create new profiles (assigned to them automatically)</li>
            <li>Delete profiles they created</li>
            <li>Add proxies for their profiles</li>
            <li>View team member list</li>
          </ul>

          <p>
            <strong>Cannot do:</strong>
          </p>

          <ul>
            <li>Access profiles not assigned to them</li>
            <li>Invite or remove team members</li>
            <li>Change anyone's role</li>
            <li>View audit logs</li>
            <li>Configure API keys or webhooks</li>
          </ul>

          <p>
            <strong>Use case:</strong> Account managers, social media specialists, e-commerce operators.
          </p>

          <h2>Viewer Role</h2>

          <p>
            Read-only access. Can see everything but can't change anything.
          </p>

          <p>
            <strong>Can do:</strong>
          </p>

          <ul>
            <li>View all profiles (but can't edit)</li>
            <li>See profile configurations</li>
            <li>View team member list</li>
            <li>See proxy list</li>
          </ul>

          <p>
            <strong>Cannot do:</strong>
          </p>

          <ul>
            <li>Launch profiles</li>
            <li>Create or edit profiles</li>
            <li>Add or modify proxies</li>
            <li>Invite team members</li>
            <li>Change any settings</li>
          </ul>

          <p>
            <strong>Use case:</strong> Stakeholders, clients, auditors, quality assurance.
          </p>

          <h2>Permission Matrix: Profiles</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Owner</th>
                  <th>Admin</th>
                  <th>Member</th>
                  <th>Viewer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>View all profiles</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>View assigned profiles</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Create profiles</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Edit any profile</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Edit assigned profiles</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Delete any profile</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Launch profiles</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Export profile data</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Permission Matrix: Team Management</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Owner</th>
                  <th>Admin</th>
                  <th>Member</th>
                  <th>Viewer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>View team members</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Invite members</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Remove members</td>
                  <td>✅</td>
                  <td>✅*</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Change member roles</td>
                  <td>✅</td>
                  <td>✅*</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Transfer ownership</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>View audit logs</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            * Admin can't remove or demote the Owner
          </p>

          <h2>Permission Matrix: API & Automation</h2>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Owner</th>
                  <th>Admin</th>
                  <th>Member</th>
                  <th>Viewer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Create API keys</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>View API keys</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Revoke API keys</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Configure webhooks</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td>Use API (with key)</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Changing Roles</h2>

          <p>
            Owner and Admin can change member roles.
          </p>

          <p>
            Settings → Team → Click member → "Change Role" dropdown.
          </p>

          <p>
            Role changes take effect immediately. Active browser sessions continue but new permissions apply to new actions.
          </p>

          <p>
            <strong>Promotion considerations:</strong>
          </p>

          <ul>
            <li><strong>Member → Admin:</strong> Gains access to all profiles and team management</li>
            <li><strong>Viewer → Member:</strong> Can now launch profiles and make changes</li>
            <li><strong>Member → Viewer:</strong> Loses ability to launch or edit profiles</li>
          </ul>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Best Practice</p>
            <p className="text-sm mb-0">
              Start team members as Members with limited profile access. Promote to Admin only when they need full team management. Keep the Viewer role for external stakeholders.
            </p>
          </Card>

          <h2>Profile-Level Permissions</h2>

          <p>
            Beyond roles, you can control profile access per member.
          </p>

          <p>
            <strong>For Members and Viewers:</strong>
          </p>

          <p>
            Profile → Settings → Sharing → Add team member.
          </p>

          <p>
            Choose permission level:
          </p>

          <ul>
            <li><strong>Full Access:</strong> Can launch, edit, and delete</li>
            <li><strong>Launch Only:</strong> Can launch browser but can't edit settings</li>
            <li><strong>View Only:</strong> Can see configuration but can't launch or edit</li>
          </ul>

          <p>
            Admins and Owner always have full access to all profiles regardless of sharing settings.
          </p>

          <h2>Transferring Ownership</h2>

          <p>
            Only the Owner can transfer ownership. This is permanent and cannot be undone without the new Owner transferring back.
          </p>

          <p>
            Settings → Team → "Transfer Ownership" button.
          </p>

          <ol>
            <li>Select new Owner from team member list</li>
            <li>Type "TRANSFER OWNERSHIP" to confirm</li>
            <li>Click "Transfer"</li>
          </ol>

          <p>
            After transfer:
          </p>

          <ul>
            <li>New Owner gets full control</li>
            <li>Old Owner becomes Admin</li>
            <li>Billing transfers to new Owner</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Share Profiles with Team</h3>
            <p className="mb-4">
              Roles configured. Now learn how to share specific profiles with team members, set profile-level permissions, and manage collaborative access.
            </p>
            <Link href="/docs/sharing-profiles">
              <Button size="lg">
                Sharing Profiles <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} designs access control systems at Multilogin.io. He's implemented RBAC for 10,000+ teams with 0 permission escalation incidents.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/inviting-team-members">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Inviting Team Members</h3>
                <p className="text-sm text-muted-foreground">
                  Add team members before assigning roles
                </p>
              </Card>
            </Link>
            <Link href="/docs/audit-logs">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Audit Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Track what team members do with audit logs
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
