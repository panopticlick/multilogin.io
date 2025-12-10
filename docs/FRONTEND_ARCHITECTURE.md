# Frontend Architecture - Next.js 14 Application

## Overview

The frontend is a Next.js 14 application using the App Router, deployed to Cloudflare Pages. It serves two distinct experiences:

1. **Marketing Site** - Public pages for SEO, conversion, and trust-building
2. **Web Dashboard** - Protected application for profile management

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 14.x | React framework with SSR/SSG |
| Runtime | React | 18.x | UI library |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | shadcn/ui | Latest | Pre-built accessible components |
| State | Zustand | 4.x | Global state management |
| Data Fetching | TanStack Query | 5.x | Server state, caching, mutations |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Tables | TanStack Table | 8.x | Data tables with virtualization |
| Auth | NextAuth.js | 5.x (beta) | Authentication |
| Icons | Lucide React | Latest | Icon library |
| Animations | Framer Motion | 10.x | Page transitions, micro-interactions |

---

## Project Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Marketing site group
│   │   ├── page.tsx             # / - Homepage
│   │   ├── features/
│   │   │   └── page.tsx         # /features
│   │   ├── pricing/
│   │   │   └── page.tsx         # /pricing
│   │   ├── download/
│   │   │   └── page.tsx         # /download
│   │   ├── blog/
│   │   │   ├── page.tsx         # /blog - Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # /blog/[slug] - Article
│   │   ├── docs/
│   │   │   ├── page.tsx         # /docs - Docs home
│   │   │   └── [...slug]/
│   │   │       └── page.tsx     # /docs/[...slug] - Doc pages
│   │   └── layout.tsx           # Marketing layout
│   │
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/
│   │   │   └── page.tsx         # /login
│   │   ├── register/
│   │   │   └── page.tsx         # /register
│   │   ├── forgot-password/
│   │   │   └── page.tsx         # /forgot-password
│   │   ├── verify-email/
│   │   │   └── page.tsx         # /verify-email
│   │   └── layout.tsx           # Auth layout (centered card)
│   │
│   ├── dashboard/               # Protected dashboard
│   │   ├── page.tsx             # /dashboard - Overview
│   │   ├── profiles/
│   │   │   ├── page.tsx         # /dashboard/profiles - List
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # /dashboard/profiles/new
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # /dashboard/profiles/[id] - View
│   │   │       └── edit/
│   │   │           └── page.tsx # /dashboard/profiles/[id]/edit
│   │   ├── groups/
│   │   │   ├── page.tsx         # /dashboard/groups
│   │   │   └── [id]/
│   │   │       └── page.tsx     # /dashboard/groups/[id]
│   │   ├── proxies/
│   │   │   ├── page.tsx         # /dashboard/proxies
│   │   │   └── new/
│   │   │       └── page.tsx     # /dashboard/proxies/new
│   │   ├── team/
│   │   │   ├── page.tsx         # /dashboard/team - Members
│   │   │   ├── activity/
│   │   │   │   └── page.tsx     # /dashboard/team/activity - Audit log
│   │   │   └── invite/
│   │   │       └── page.tsx     # /dashboard/team/invite
│   │   ├── automation/
│   │   │   └── page.tsx         # /dashboard/automation
│   │   ├── billing/
│   │   │   └── page.tsx         # /dashboard/billing
│   │   ├── settings/
│   │   │   └── page.tsx         # /dashboard/settings
│   │   └── layout.tsx           # Dashboard layout (sidebar)
│   │
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth.js handler
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts     # Stripe webhooks
│   │
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx            # 404 page
│   ├── error.tsx                # Error boundary
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── marketing/               # Marketing-specific
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   ├── Testimonials.tsx
│   │   └── CTA.tsx
│   │
│   ├── dashboard/               # Dashboard-specific
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   ├── QuickLaunch.tsx
│   │   ├── ProfileTable.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── ProxyPoolCard.tsx
│   │   ├── TeamMemberList.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── UsageChart.tsx
│   │   └── StatsWidget.tsx
│   │
│   ├── profiles/                # Profile-related
│   │   ├── ProfileForm.tsx
│   │   ├── FingerprintConfig.tsx
│   │   ├── ProxyConfig.tsx
│   │   ├── BulkActions.tsx
│   │   └── ImportExportDialog.tsx
│   │
│   └── shared/                  # Shared components
│       ├── Logo.tsx
│       ├── ThemeToggle.tsx
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       └── SearchInput.tsx
│
├── lib/                          # Utilities and helpers
│   ├── api/                     # API client
│   │   ├── client.ts            # Base fetch wrapper
│   │   ├── profiles.ts          # Profile API calls
│   │   ├── proxies.ts           # Proxy API calls
│   │   ├── teams.ts             # Team API calls
│   │   └── billing.ts           # Billing API calls
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useProfiles.ts       # TanStack Query hooks
│   │   ├── useProxies.ts
│   │   ├── useTeam.ts
│   │   ├── useAuth.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── stores/                  # Zustand stores
│   │   ├── uiStore.ts           # UI state (sidebar, modals)
│   │   ├── filterStore.ts       # Table filters
│   │   └── selectionStore.ts    # Multi-select state
│   │
│   ├── utils/                   # Helper functions
│   │   ├── cn.ts                # className merger
│   │   ├── format.ts            # Date, number formatting
│   │   ├── validation.ts        # Zod schemas
│   │   └── constants.ts         # App constants
│   │
│   └── auth.ts                  # NextAuth.js config
│
├── content/                      # MDX content
│   ├── blog/                    # Blog posts
│   │   ├── getting-started.mdx
│   │   └── ...
│   └── docs/                    # Documentation
│       ├── introduction.mdx
│       └── ...
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── downloads/
│
├── styles/                       # Additional styles
│   └── themes.css               # Theme variables
│
├── next.config.js               # Next.js config
├── tailwind.config.js           # Tailwind config
├── postcss.config.js            # PostCSS config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## Layouts

### Root Layout (app/layout.tsx)

```tsx
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Multilogin.io - Multi-Browser Profile Management',
    template: '%s | Multilogin.io'
  },
  description: 'Manage multiple browser profiles with cloud sync. Free, secure, and built for teams.',
  keywords: ['multi-browser', 'antidetect', 'browser profiles', 'fingerprint'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://multilogin.io',
    siteName: 'Multilogin.io',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@multiloginio'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Marketing Layout (app/(marketing)/layout.tsx)

```tsx
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Dashboard Layout (app/dashboard/layout.tsx)

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNav } from '@/components/dashboard/TopNav';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Fixed on desktop, drawer on mobile */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav user={session.user} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Key Components

### Dashboard Sidebar (components/dashboard/Sidebar.tsx)

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Globe,
  Settings,
  CreditCard,
  FolderKanban,
  Zap,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { QuickLaunch } from './QuickLaunch';
import { useUIStore } from '@/lib/stores/uiStore';

const navigation = [
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
      { name: 'Members', href: '/dashboard/team' },
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

const bottomNavigation = [
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden',
          sidebarCollapsed ? 'hidden' : 'block'
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 lg:relative lg:z-0',
          sidebarCollapsed ? 'w-16' : 'w-64',
          'max-lg:w-64',
          sidebarCollapsed && 'max-lg:-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size={32} />
            {!sidebarCollapsed && (
              <span className="font-semibold">Multilogin</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                sidebarCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Quick Launch */}
        {!sidebarCollapsed && (
          <div className="border-b p-4">
            <QuickLaunch />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="border-t p-2">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="h-5 w-5" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
```

### Profile Table (components/dashboard/ProfileTable.tsx)

```tsx
'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState
} from '@tanstack/react-table';
import { useProfiles } from '@/lib/hooks/useProfiles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Play,
  MoreVertical,
  Pencil,
  Trash,
  Copy,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Profile } from '@/lib/types';
import { BulkActions } from '@/components/profiles/BulkActions';

interface ProfileTableProps {
  groupId?: string;
}

export function ProfileTable({ groupId }: ProfileTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'last_active', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const { data, isLoading, error } = useProfiles({
    groupId,
    search: globalFilter
  });

  const columns: ColumnDef<Profile>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-500" />
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">
                {row.original.template_id}
              </div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isLocked = !!row.original.locked_by;
          return (
            <Badge variant={isLocked ? 'destructive' : 'secondary'}>
              {isLocked ? (
                <><Lock className="mr-1 h-3 w-3" /> In Use</>
              ) : (
                <><Unlock className="mr-1 h-3 w-3" /> Available</>
              )}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'proxy',
        header: 'Proxy',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[150px]">
              {row.original.proxy || row.original.proxy_id || 'No proxy'}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'last_active',
        header: 'Last Active',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.last_active), {
              addSuffix: true
            })}
          </span>
        )
      },
      {
        accessorKey: 'launch_count',
        header: 'Launches',
        cell: ({ row }) => row.original.launch_count
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={() => handleLaunch(row.original.id)}
              disabled={!!row.original.locked_by}
            >
              <Play className="mr-1 h-4 w-4" />
              Launch
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: data?.profiles ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter
    }
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleLaunch = async (profileId: string) => {
    // Trigger launch via API
    console.log('Launching profile:', profileId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading profiles</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search profiles..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-[250px]"
          />
        </div>

        {selectedRows.length > 0 && (
          <BulkActions
            selectedIds={selectedRows.map((row) => row.original.id)}
            onClear={() => setRowSelection({})}
          />
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No profiles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedRows.length} of {data?.total ?? 0} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## State Management

### UI Store (lib/stores/uiStore.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  createProfileModalOpen: boolean;
  setCreateProfileModalOpen: (open: boolean) => void;

  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Modals
      createProfileModalOpen: false,
      setCreateProfileModalOpen: (open) =>
        set({ createProfileModalOpen: open }),

      importModalOpen: false,
      setImportModalOpen: (open) => set({ importModalOpen: open }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'multilogin-ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme
      })
    }
  )
);
```

### Filter Store (lib/stores/filterStore.ts)

```typescript
import { create } from 'zustand';

interface FilterState {
  // Profile filters
  profileFilters: {
    search: string;
    groupId: string | null;
    tags: string[];
    status: 'all' | 'available' | 'in_use';
    sortBy: 'name' | 'last_active' | 'created_at';
    sortOrder: 'asc' | 'desc';
  };
  setProfileFilter: <K extends keyof FilterState['profileFilters']>(
    key: K,
    value: FilterState['profileFilters'][K]
  ) => void;
  resetProfileFilters: () => void;

  // Proxy filters
  proxyFilters: {
    search: string;
    type: string | null;
    status: 'all' | 'healthy' | 'degraded' | 'offline';
  };
  setProxyFilter: <K extends keyof FilterState['proxyFilters']>(
    key: K,
    value: FilterState['proxyFilters'][K]
  ) => void;
}

const defaultProfileFilters = {
  search: '',
  groupId: null,
  tags: [],
  status: 'all' as const,
  sortBy: 'last_active' as const,
  sortOrder: 'desc' as const
};

export const useFilterStore = create<FilterState>((set) => ({
  profileFilters: defaultProfileFilters,
  setProfileFilter: (key, value) =>
    set((state) => ({
      profileFilters: { ...state.profileFilters, [key]: value }
    })),
  resetProfileFilters: () => set({ profileFilters: defaultProfileFilters }),

  proxyFilters: {
    search: '',
    type: null,
    status: 'all'
  },
  setProxyFilter: (key, value) =>
    set((state) => ({
      proxyFilters: { ...state.proxyFilters, [key]: value }
    }))
}));
```

---

## API Client

### Base Client (lib/api/client.ts)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.multilogin.io';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  // Get API key from session or localStorage
  const apiKey = getAPIKey();

  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      data.error || 'An error occurred',
      response.status,
      data
    );
  }

  return data as T;
}

function getAPIKey(): string | null {
  // In browser, check localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('apiKey');
  }
  return null;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: <T>(endpoint: string, body: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' })
};
```

### Profile API (lib/api/profiles.ts)

```typescript
import { api } from './client';
import { Profile, CreateProfileInput, UpdateProfileInput } from '@/lib/types';

interface ListProfilesResponse {
  profiles: Profile[];
  total: number;
}

interface ListProfilesParams {
  groupId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'name' | 'last_active' | 'created_at';
  order?: 'asc' | 'desc';
}

export const profilesApi = {
  list: (params?: ListProfilesParams) => {
    const query = new URLSearchParams();
    if (params?.groupId) query.set('groupId', params.groupId);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.orderBy) query.set('orderBy', params.orderBy);
    if (params?.order) query.set('order', params.order);

    return api.get<ListProfilesResponse>(`/api/profiles?${query}`);
  },

  get: (id: string) =>
    api.get<Profile>(`/api/profiles/${id}`),

  create: (input: CreateProfileInput) =>
    api.post<Profile>('/api/profiles', input),

  update: (id: string, input: UpdateProfileInput) =>
    api.put<Profile>(`/api/profiles/${id}`, input),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/api/profiles/${id}`),

  launch: (id: string, clientId: string) =>
    api.post<{
      profile: Profile;
      sessionData: any;
      lockAcquired: boolean;
    }>(`/api/profiles/${id}/launch`, {}, {
      headers: { 'X-Client-ID': clientId }
    }),

  release: (id: string, clientId: string) =>
    api.post<{ success: boolean }>(`/api/profiles/${id}/release`, {}, {
      headers: { 'X-Client-ID': clientId }
    })
};
```

---

## TanStack Query Hooks

### useProfiles (lib/hooks/useProfiles.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api/profiles';
import { CreateProfileInput, UpdateProfileInput } from '@/lib/types';

const PROFILES_KEY = ['profiles'];

export function useProfiles(params?: Parameters<typeof profilesApi.list>[0]) {
  return useQuery({
    queryKey: [...PROFILES_KEY, params],
    queryFn: () => profilesApi.list(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: [...PROFILES_KEY, id],
    queryFn: () => profilesApi.get(id),
    enabled: !!id
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProfileInput) => profilesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
    }
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProfileInput }) =>
      profilesApi.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROFILES_KEY, id] });
    }
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profilesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
    }
  });
}

export function useLaunchProfile() {
  return useMutation({
    mutationFn: ({ id, clientId }: { id: string; clientId: string }) =>
      profilesApi.launch(id, clientId)
  });
}
```

---

## Authentication Setup

### NextAuth Configuration (lib/auth.ts)

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';

// Custom adapter for D1 would go here

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Fetch user from D1 via API
        const response = await fetch(
          `${process.env.API_URL}/auth/validate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          }
        );

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const user = await response.json();
        return user;
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.teamId = user.teamId;
        token.apiKey = user.apiKey;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          teamId: token.teamId,
          apiKey: token.apiKey
        }
      };
    }
  },

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-email'
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  }
};
```

---

## Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true
      }
    ];
  },

  // Environment variables (public)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig;
```

### tailwind.config.js

```javascript
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans]
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
};
```

---

## Performance Optimizations

### Image Optimization

```tsx
// Using next/image with proper sizing
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="Dashboard preview"
  width={1200}
  height={800}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Code Splitting

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const ProfileTable = dynamic(
  () => import('@/components/dashboard/ProfileTable'),
  {
    loading: () => <TableSkeleton />,
    ssr: false // Disable SSR for client-heavy components
  }
);
```

### Prefetching

```tsx
// Prefetch critical routes
import { prefetch } from 'next/navigation';

// On hover, prefetch the dashboard
<Link
  href="/dashboard"
  onMouseEnter={() => prefetch('/dashboard')}
>
  Go to Dashboard
</Link>
```

---

## Deployment (Cloudflare Pages)

### Build Configuration

```yaml
# In Cloudflare Pages settings:
Build command: npm run build
Build output directory: .next
Root directory: apps/web
```

### Environment Variables

Set in Cloudflare Pages dashboard:

```
NEXT_PUBLIC_API_URL=https://api.multilogin.io
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx
NEXTAUTH_URL=https://multilogin.io
NEXTAUTH_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## Next Steps

1. Set up shadcn/ui components (`COMPONENT_LIBRARY.md`)
2. Implement all routes (`ROUTING_SITEMAP.md`)
3. Add marketing content (`SEO_CONTENT_STRATEGY.md`)
4. Configure analytics and monitoring

### Dashboard Settings → Fingerprint Policy Manager

The settings page now renders `components/dashboard/fingerprint-policy-manager.tsx`, which consumes the new `/api/v1/fingerprint/policies` endpoints via React Query. It surfaces:

- Current policies, highlighting auto-upgrade state and lag thresholds
- Dialog-driven creation/editing with validation
- Inline evaluation against a given profile ID (uses the new evaluation mutation)

All policy mutations invalidate the `fingerprintPolicies` query key so the App Router view stays consistent with Cloudflare Worker state.
