# Routing & Sitemap - Complete URL Structure

## Overview

The application has two distinct route groups:

1. **Marketing Site** - Public pages for SEO, conversion, and brand building
2. **Web Application** - Protected dashboard for profile management

---

## Complete Sitemap

```
multilogin.io/
│
├── MARKETING SITE (Public)
│   ├── /                              # Homepage
│   ├── /features                      # Features overview
│   ├── /pricing                       # Pricing plans
│   ├── /download                      # Download desktop client
│   ├── /blog                          # Blog listing
│   │   └── /blog/[slug]              # Individual blog post
│   ├── /docs                          # Documentation home
│   │   └── /docs/[...slug]           # Documentation pages
│   ├── /changelog                     # Product changelog
│   ├── /about                         # About us
│   ├── /contact                       # Contact page
│   ├── /legal
│   │   ├── /legal/privacy            # Privacy policy
│   │   ├── /legal/terms              # Terms of service
│   │   └── /legal/gdpr               # GDPR compliance
│   └── /affiliate                     # Affiliate program
│
├── AUTH PAGES
│   ├── /login                         # Sign in
│   ├── /register                      # Sign up
│   ├── /forgot-password              # Password reset request
│   ├── /reset-password               # Password reset form
│   ├── /verify-email                 # Email verification
│   └── /invite/[token]               # Team invite acceptance
│
└── DASHBOARD (Protected)
    ├── /dashboard                     # Overview/home
    ├── /dashboard/profiles            # Profile list
    │   ├── /dashboard/profiles/new   # Create profile
    │   └── /dashboard/profiles/[id]  # Profile detail
    │       └── /dashboard/profiles/[id]/edit
    ├── /dashboard/groups              # Group management
    │   └── /dashboard/groups/[id]    # Group detail
    ├── /dashboard/proxies             # Proxy management
    │   ├── /dashboard/proxies/pools  # Proxy pools
    │   │   └── /dashboard/proxies/pools/[id]
    │   └── /dashboard/proxies/import # Import proxies
    ├── /dashboard/team                # Team overview
    │   ├── /dashboard/team/members   # Team members
    │   ├── /dashboard/team/activity  # Activity log
    │   ├── /dashboard/team/invite    # Invite member
    │   └── /dashboard/team/roles     # Role management
    ├── /dashboard/automation          # Automation (future)
    ├── /dashboard/billing             # Billing & subscription
    │   └── /dashboard/billing/invoices
    ├── /dashboard/settings            # Account settings
    │   ├── /dashboard/settings/profile
    │   ├── /dashboard/settings/security
    │   ├── /dashboard/settings/api-keys
    │   └── /dashboard/settings/notifications
    └── /dashboard/integrity           # Browser integrity check
```

---

## Marketing Site Routes

### `/` - Homepage

**Purpose:** Convert visitors, establish trust, explain value proposition

**Sections:**
1. Hero with main CTA
2. Key features overview
3. How it works (3 steps)
4. Pricing preview
5. Testimonials/Social proof
6. FAQ
7. Final CTA

**SEO:**
- Title: "Multilogin.io - Free Multi-Browser Profile Manager with Cloud Sync"
- Description: "Manage multiple browser profiles with free cloud sync. Perfect for teams, affiliates, and e-commerce sellers. No detection, instant sync."
- Keywords: multi-browser, antidetect, browser profiles, fingerprint, cloud sync

---

### `/features` - Features Page

**Purpose:** Detailed feature breakdown for consideration stage

**Sections:**
1. Feature hero
2. Core features grid
   - Cloud Sync
   - Fingerprint Templates
   - Team Collaboration
   - Proxy Management
   - Session Persistence
   - API Access
3. Feature comparison table (vs competitors)
4. Integration possibilities
5. Security features
6. CTA

**SEO:**
- Title: "Features - Cloud-Synced Browser Profiles | Multilogin.io"
- Description: "Explore powerful features: cloud sync, fingerprint templates, team collaboration, proxy management. Compare with competitors."

---

### `/pricing` - Pricing Page

**Purpose:** Clear pricing, encourage upgrade

**Sections:**
1. Plan comparison table
2. Feature breakdown per plan
3. FAQ about billing
4. Enterprise contact form
5. Money-back guarantee

**SEO:**
- Title: "Pricing Plans - Free, Pro & Team | Multilogin.io"
- Description: "Start free with 5 profiles. Upgrade to Pro ($12/mo) or Team ($29/mo) for more profiles, proxy pools, and team features."

---

### `/download` - Download Page

**Purpose:** Get users to download the desktop client

**Sections:**
1. Download buttons (Windows, Mac, Linux)
2. System requirements
3. Installation guide
4. Quick start tutorial
5. Troubleshooting FAQ

**SEO:**
- Title: "Download - Desktop Client for Windows, Mac & Linux | Multilogin.io"
- Description: "Download the free Multilogin desktop client. Available for Windows, macOS, and Linux. Easy setup, instant cloud sync."

---

### `/blog` - Blog Listing

**Purpose:** SEO traffic, education, thought leadership

**Categories:**
- Tutorials
- Use Cases
- Product Updates
- Industry News

**SEO:**
- Title: "Blog - Tips, Tutorials & Updates | Multilogin.io"
- Description: "Learn multi-account management, affiliate marketing tips, e-commerce strategies, and stay updated on product news."

---

### `/blog/[slug]` - Blog Post

**Dynamic route for individual blog posts**

**Template:**
1. Title & metadata
2. Featured image
3. Content (MDX)
4. Related posts
5. CTA
6. Comments (optional)

---

### `/docs` - Documentation

**Purpose:** Help users succeed, reduce support load

**Structure:**
```
/docs
├── Getting Started
│   ├── Introduction
│   ├── Quick Start
│   └── First Profile
├── Profiles
│   ├── Creating Profiles
│   ├── Fingerprint Templates
│   ├── Managing Sessions
│   └── Import/Export
├── Proxies
│   ├── Adding Proxies
│   ├── Proxy Pools
│   └── Troubleshooting
├── Teams
│   ├── Inviting Members
│   ├── Roles & Permissions
│   └── Activity Logs
├── API
│   ├── Authentication
│   ├── Endpoints
│   └── Examples
└── Troubleshooting
    ├── Common Issues
    └── Contact Support
```

---

## Auth Routes

### `/login`

**Components:**
- Email/password form
- Social login buttons (Google, GitHub)
- "Forgot password" link
- "Create account" link
- Remember me checkbox

### `/register`

**Components:**
- Email/password form
- Name field
- Social signup buttons
- Terms acceptance checkbox
- Email verification note

### `/forgot-password`

**Components:**
- Email input
- Submit button
- Success message
- Back to login link

### `/reset-password?token=xxx`

**Components:**
- New password input
- Confirm password input
- Submit button
- Password requirements

### `/verify-email?token=xxx`

**Components:**
- Verification status
- Resend email button
- Continue to dashboard button

### `/invite/[token]`

**Components:**
- Team info display
- Accept/decline buttons
- Login/register form (if not logged in)

---

## Dashboard Routes

### `/dashboard` - Overview

**Layout:** Dashboard layout with sidebar

**Widgets:**
1. Quick stats (profiles, active sessions, team activity)
2. Recent profiles (quick launch)
3. Activity feed
4. Usage chart
5. Quick actions

**Data:**
- Profile count
- Active profiles
- Recent activity
- Usage metrics

---

### `/dashboard/profiles` - Profile List

**Components:**
- Search/filter bar
- View toggle (table/grid)
- Profile table/grid
- Bulk actions bar
- Pagination

**Features:**
- Multi-select
- Sort by name, last active, created
- Filter by group, tags, status
- Quick launch

---

### `/dashboard/profiles/new` - Create Profile

**Components:**
- Multi-step form
- Template selector
- Proxy configuration
- Preview

---

### `/dashboard/profiles/[id]` - Profile Detail

**Components:**
- Profile header with actions
- Fingerprint details
- Session data preview
- Launch history
- Notes

---

### `/dashboard/profiles/[id]/edit` - Edit Profile

**Components:**
- Edit form
- Fingerprint config (read-only unless template change)
- Proxy config
- Group/tags

---

### `/dashboard/groups` - Group Management

**Components:**
- Group list/grid
- Create group button
- Group cards with profile counts

---

### `/dashboard/groups/[id]` - Group Detail

**Components:**
- Group header
- Profile list (filtered)
- Group settings

---

### `/dashboard/proxies` - Proxy Management

**Components:**
- Pool list
- Proxy table
- Health status indicators
- Add proxy/pool buttons

---

### `/dashboard/proxies/import` - Import Proxies

**Components:**
- Text area for paste import
- Format selector
- Pool selector
- Import button
- Results display

---

### `/dashboard/team` - Team Overview

**Components:**
- Team stats
- Member list preview
- Recent activity
- Invite button

---

### `/dashboard/team/members` - Team Members

**Components:**
- Member table
- Role badges
- Action menu (edit, remove)
- Invite button

---

### `/dashboard/team/activity` - Activity Log

**Components:**
- Activity table with filters
- Date range picker
- Action type filter
- User filter
- Export button

---

### `/dashboard/team/invite` - Invite Member

**Components:**
- Email input
- Role selector
- Permission checkboxes
- Group access selector
- Send invite button

---

### `/dashboard/billing` - Billing

**Components:**
- Current plan display
- Usage meters
- Upgrade/downgrade buttons
- Payment method
- Invoice list

---

### `/dashboard/settings` - Settings

**Sub-routes:**

#### `/dashboard/settings/profile`
- Name, email, avatar
- Change password

#### `/dashboard/settings/security`
- Two-factor authentication
- Active sessions
- Security log

#### `/dashboard/settings/api-keys`
- API key list
- Create new key
- Revoke keys

#### `/dashboard/settings/notifications`
- Email notification preferences
- In-app notification preferences

---

## Route Guards & Middleware

### Authentication Guard

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isDashboard && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
};
```

### Role-Based Access

```tsx
// lib/auth/permissions.ts
export const permissions = {
  'profiles:read': ['owner', 'admin', 'member', 'viewer'],
  'profiles:create': ['owner', 'admin', 'member'],
  'profiles:edit': ['owner', 'admin', 'member'],
  'profiles:delete': ['owner', 'admin'],
  'profiles:launch': ['owner', 'admin', 'member'],
  'team:manage': ['owner', 'admin'],
  'billing:manage': ['owner']
};

export function hasPermission(role: string, permission: string): boolean {
  return permissions[permission]?.includes(role) ?? false;
}
```

---

## Navigation Structure

### Marketing Site Header

```tsx
const marketingNav = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Docs', href: '/docs' },
  { name: 'Blog', href: '/blog' },
];

const marketingCTA = [
  { name: 'Login', href: '/login', variant: 'ghost' },
  { name: 'Get Started', href: '/register', variant: 'default' },
];
```

### Dashboard Sidebar

```tsx
const dashboardNav = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Profiles',
    href: '/dashboard/profiles',
    icon: Users,
    badge: 'Core'
  },
  {
    name: 'Groups',
    href: '/dashboard/groups',
    icon: FolderKanban
  },
  {
    name: 'Proxies',
    href: '/dashboard/proxies',
    icon: Globe
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    children: [
      { name: 'Members', href: '/dashboard/team/members' },
      { name: 'Activity', href: '/dashboard/team/activity' }
    ]
  },
  {
    name: 'Automation',
    href: '/dashboard/automation',
    icon: Zap,
    badge: 'Soon'
  }
];

const dashboardFooterNav = [
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];
```

---

## Breadcrumb Structure

```tsx
// Automatic breadcrumb generation
const breadcrumbs = {
  '/dashboard': ['Dashboard'],
  '/dashboard/profiles': ['Dashboard', 'Profiles'],
  '/dashboard/profiles/new': ['Dashboard', 'Profiles', 'Create'],
  '/dashboard/profiles/[id]': ['Dashboard', 'Profiles', '{name}'],
  '/dashboard/profiles/[id]/edit': ['Dashboard', 'Profiles', '{name}', 'Edit'],
  '/dashboard/team/members': ['Dashboard', 'Team', 'Members'],
  '/dashboard/settings/api-keys': ['Dashboard', 'Settings', 'API Keys']
};
```

---

## URL Parameters & Query Strings

### Profile List

```
/dashboard/profiles?
  search=amazon          # Search term
  group=grp_abc123       # Filter by group
  status=available       # Filter: all, available, in_use
  tags=usa,main          # Filter by tags (comma-separated)
  sort=last_active       # Sort field
  order=desc             # Sort order
  page=1                 # Current page
  limit=50               # Items per page
  view=table             # View mode: table, grid
```

### Activity Log

```
/dashboard/team/activity?
  action=profile.launch  # Filter by action
  user=usr_abc123        # Filter by user
  from=2024-01-01        # Date range start
  to=2024-01-31          # Date range end
```

### Auth Callbacks

```
/login?callbackUrl=/dashboard/profiles
/verify-email?token=abc123&email=user@example.com
/reset-password?token=abc123
/invite/abc123
```

---

## Dynamic Routes Summary

| Route Pattern | Use |
|---------------|-----|
| `/blog/[slug]` | Blog posts |
| `/docs/[...slug]` | Documentation (catch-all) |
| `/invite/[token]` | Team invitations |
| `/dashboard/profiles/[id]` | Profile detail |
| `/dashboard/profiles/[id]/edit` | Profile edit |
| `/dashboard/groups/[id]` | Group detail |
| `/dashboard/proxies/pools/[id]` | Proxy pool detail |

---

## Redirects Configuration

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // Legacy routes
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true
      },
      {
        source: '/app/:path*',
        destination: '/dashboard/:path*',
        permanent: true
      },
      // Convenience shortcuts
      {
        source: '/profiles',
        destination: '/dashboard/profiles',
        permanent: false
      },
      {
        source: '/settings',
        destination: '/dashboard/settings',
        permanent: false
      },
      // Marketing redirects
      {
        source: '/free',
        destination: '/pricing',
        permanent: false
      }
    ];
  }
};
```

---

## Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://multilogin.io';

  // Static pages
  const staticPages = [
    '',
    '/features',
    '/pricing',
    '/download',
    '/blog',
    '/docs',
    '/about',
    '/contact',
    '/legal/privacy',
    '/legal/terms'
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8
  }));

  // Dynamic blog posts
  const posts = await getBlogPosts();
  const blogPages = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }));

  // Dynamic docs
  const docs = await getDocPages();
  const docPages = docs.map(doc => ({
    url: `${baseUrl}/docs/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  return [...staticPages, ...blogPages, ...docPages];
}
```

---

## Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/invite/']
      }
    ],
    sitemap: 'https://multilogin.io/sitemap.xml'
  };
}
```

---

## Next Steps

1. Implement all route components
2. Set up navigation components
3. Configure middleware for auth
4. Create sitemap generation
5. Add analytics tracking
