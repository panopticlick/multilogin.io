'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Globe,
  Settings,
  FileText,
  Key,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Activity,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  disabled?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Profiles',
    href: '/dashboard/profiles',
    icon: Users,
  },
  {
    title: 'Groups',
    href: '/dashboard/groups',
    icon: FolderOpen,
  },
  {
    title: 'Proxies',
    href: '/dashboard/proxies',
    icon: Globe,
  },
];

const settingsNavItems: NavItem[] = [
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'API Keys',
    href: '/dashboard/api-keys',
    icon: Key,
  },
  {
    title: 'Audit Log',
    href: '/dashboard/audit',
    icon: Activity,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const resourceNavItems: NavItem[] = [
  {
    title: 'Documentation',
    href: '/docs',
    icon: FileText,
  },
  {
    title: 'Help Center',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-[68px]' : 'w-[240px]'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="Multilogin Dashboard">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold">Multilogin</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
          {/* Main Navigation */}
          <div className="mb-4" role="group" aria-labelledby="nav-main">
            {!isCollapsed && (
              <p id="nav-main" className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                MAIN
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          {/* Settings Navigation */}
          <div className="mb-4" role="group" aria-labelledby="nav-settings">
            {!isCollapsed && (
              <p id="nav-settings" className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                SETTINGS
              </p>
            )}
            {settingsNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          {/* Resources */}
          <div role="group" aria-labelledby="nav-resources">
            {!isCollapsed && (
              <p id="nav-resources" className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                RESOURCES
              </p>
            )}
            {resourceNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={toggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      aria-label={isCollapsed ? item.title : undefined}
      aria-disabled={item.disabled}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        item.disabled && 'pointer-events-none opacity-50',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}
