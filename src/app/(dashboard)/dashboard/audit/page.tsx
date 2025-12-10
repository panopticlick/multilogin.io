'use client';

import * as React from 'react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Download,
  User,
  Play,
  Plus,
  Trash2,
  Edit,
  Key,
  Users,
  Settings,
  RefreshCw,
  Clock,
  MapPin,
  Monitor,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

// Types
type AuditAction =
  | 'profile.create'
  | 'profile.update'
  | 'profile.delete'
  | 'profile.launch'
  | 'profile.sync'
  | 'team.invite'
  | 'team.remove'
  | 'team.role_change'
  | 'api_key.create'
  | 'api_key.revoke'
  | 'settings.update'
  | 'proxy.create'
  | 'proxy.delete'
  | 'proxy.test'
  | 'group.create'
  | 'group.delete'
  | 'login'
  | 'logout';

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  userEmail?: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: Date;
}

// Action configurations
const actionConfig: Record<AuditAction, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  category: string;
}> = {
  'profile.create': {
    label: 'Created profile',
    icon: Plus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    category: 'Profiles',
  },
  'profile.update': {
    label: 'Updated profile',
    icon: Edit,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    category: 'Profiles',
  },
  'profile.delete': {
    label: 'Deleted profile',
    icon: Trash2,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'Profiles',
  },
  'profile.launch': {
    label: 'Launched profile',
    icon: Play,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    category: 'Profiles',
  },
  'profile.sync': {
    label: 'Synced session',
    icon: RefreshCw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    category: 'Profiles',
  },
  'team.invite': {
    label: 'Invited member',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    category: 'Team',
  },
  'team.remove': {
    label: 'Removed member',
    icon: Users,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'Team',
  },
  'team.role_change': {
    label: 'Changed role',
    icon: Shield,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    category: 'Team',
  },
  'api_key.create': {
    label: 'Created API key',
    icon: Key,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    category: 'Security',
  },
  'api_key.revoke': {
    label: 'Revoked API key',
    icon: Key,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'Security',
  },
  'settings.update': {
    label: 'Updated settings',
    icon: Settings,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    category: 'Settings',
  },
  'proxy.create': {
    label: 'Added proxy',
    icon: Globe,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    category: 'Proxies',
  },
  'proxy.delete': {
    label: 'Deleted proxy',
    icon: Globe,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'Proxies',
  },
  'proxy.test': {
    label: 'Tested proxy',
    icon: Globe,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    category: 'Proxies',
  },
  'group.create': {
    label: 'Created group',
    icon: Plus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    category: 'Groups',
  },
  'group.delete': {
    label: 'Deleted group',
    icon: Trash2,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    category: 'Groups',
  },
  'login': {
    label: 'Logged in',
    icon: User,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    category: 'Auth',
  },
  'logout': {
    label: 'Logged out',
    icon: User,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    category: 'Auth',
  },
};

// Loading Skeleton Components
function AuditEntryRowSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Audit Entry Row Component
function AuditEntryRow({
  entry,
  onClick,
}: {
  entry: AuditEntry;
  onClick: () => void;
}) {
  const config = actionConfig[entry.action] || {
    label: entry.action,
    icon: Activity,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    category: 'Other',
  };
  const Icon = config.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
      onClick={onClick}
    >
      {/* User Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={entry.userImage || undefined} />
        <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
      </Avatar>

      {/* Action Icon */}
      <div className={cn('p-2 rounded-lg', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{entry.userName}</span>
          <span className="text-muted-foreground">{config.label}</span>
          {entry.targetName && (
            <Badge variant="secondary" className="font-normal">
              {entry.targetName}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
          </span>
          {entry.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {entry.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            {entry.ipAddress}
          </span>
        </div>
      </div>

      {/* Category Badge */}
      <Badge variant="outline" className="hidden sm:flex">
        {config.category}
      </Badge>
    </motion.button>
  );
}

// Audit Entry Detail Dialog
function AuditDetailDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: AuditEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;

  const config = actionConfig[entry.action] || {
    label: entry.action,
    icon: Activity,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    category: 'Other',
  };
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <DialogTitle>{config.label}</DialogTitle>
              <DialogDescription>
                {format(entry.createdAt, 'PPpp')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{entry.userName}</p>
              {entry.userEmail && (
                <p className="text-sm text-muted-foreground">{entry.userEmail}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Action</span>
                <span className="font-medium">{entry.action}</span>
              </div>
              {entry.targetName && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">{entry.targetName}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono">{entry.ipAddress}</span>
              </div>
              {entry.location && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Location</span>
                  <span>{entry.location}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Timestamp</span>
                <span>{format(entry.createdAt, 'PPpp')}</span>
              </div>
            </div>
          </div>

          {/* User Agent */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">User Agent</h4>
            <p className="text-xs font-mono p-2 rounded bg-muted/50 break-all">
              {entry.userAgent}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Audit Log Page
export default function AuditLogPage() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState<string>('all');
  const [userFilter, setUserFilter] = React.useState<string>('all');
  const [selectedEntry, setSelectedEntry] = React.useState<AuditEntry | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 15;

  // Fetch audit logs from API (note: API doesn't support category filtering, only specific actions)
  const { data: auditData, isLoading, error } = useAuditLogs({
    userId: userFilter !== 'all' ? userFilter : undefined,
    page,
    limit: pageSize,
  });

  // Show error toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading audit logs',
        description: error instanceof Error ? error.message : 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Convert API data to AuditEntry format
  const logs = React.useMemo(() => {
    if (!auditData?.items) return [];
    return auditData.items.map((item) => ({
      ...item,
      action: item.action as AuditAction,
      createdAt: new Date(item.createdAt),
    }));
  }, [auditData]);

  // Get unique users for filter
  const uniqueUsers = React.useMemo(() => {
    const users = new Map<string, { id: string; name: string }>();
    logs.forEach((log) => {
      if (!users.has(log.userId)) {
        users.set(log.userId, { id: log.userId, name: log.userName });
      }
    });
    return Array.from(users.values());
  }, [logs]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    Object.values(actionConfig).forEach((config) => {
      cats.add(config.category);
    });
    return Array.from(cats);
  }, []);

  // Client-side filtering (API doesn't support search or category filtering)
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          log.userName.toLowerCase().includes(searchLower) ||
          log.targetName?.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (actionFilter !== 'all') {
        const config = actionConfig[log.action];
        if (!config || config.category !== actionFilter) return false;
      }

      return true;
    });
  }, [logs, search, actionFilter]);

  const totalPages = auditData ? Math.ceil(auditData.total / pageSize) : 1;
  const totalItems = auditData?.total || 0;

  // Stats
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: totalItems,
      today: logs.filter((l) => l.createdAt >= today).length,
      thisWeek: logs.filter(
        (l) => l.createdAt >= subDays(new Date(), 7)
      ).length,
    };
  }, [logs, totalItems]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [actionFilter, userFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all activities in your workspace
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.today}</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.thisWeek}</p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, target, or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px]">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log List */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Activity Feed</CardTitle>
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredLogs.length} events`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <AuditEntryRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <p className="font-medium">Failed to load audit logs</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium">No events found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredLogs.map((entry) => (
                <AuditEntryRow
                  key={entry.id}
                  entry={entry}
                  onClick={() => setSelectedEntry(entry)}
                />
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <AuditDetailDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </div>
  );
}
