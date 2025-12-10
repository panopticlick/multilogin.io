'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Users,
  Lock,
  Chrome,
  Clock,
  User,
  Eye,
  Loader2,
} from 'lucide-react';
import { useOnlineMembers, useProfileLocks } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';

// Types
interface UserPresence {
  id: string;
  name: string;
  image: string | null;
  status: 'online' | 'away' | 'busy';
  currentProfile: string | null;
  lastSeen: number;
}

// Removed mock data - now using real API

const statusConfig = {
  online: {
    color: 'bg-emerald-500',
    label: 'Online',
  },
  away: {
    color: 'bg-amber-500',
    label: 'Away',
  },
  busy: {
    color: 'bg-red-500',
    label: 'Busy',
  },
};

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// User Avatar with Status
function UserAvatarWithStatus({
  user,
  size = 'default',
}: {
  user: {
    id: string;
    name: string;
    image: string | null;
    status?: 'online' | 'away' | 'busy';
  };
  size?: 'sm' | 'default' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const statusSizeClasses = {
    sm: 'h-2 w-2',
    default: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const config = user.status ? statusConfig[user.status] : null;

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.image || undefined} alt={user.name} />
        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      {config && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background',
            statusSizeClasses[size],
            config.color
          )}
        />
      )}
    </div>
  );
}

// Online Members Indicator (for header)
export function OnlineMembersIndicator() {
  const { data: members = [], isLoading, error } = useOnlineMembers();
  const onlineCount = members.filter((m) => m.status === 'online').length;

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Users className="h-4 w-4" />
        <span className="text-xs text-muted-foreground">Error</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member) => (
              <UserAvatarWithStatus key={member.id} user={member} size="sm" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {onlineCount} online
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </h4>
          <p className="text-xs text-muted-foreground">
            {onlineCount} of {members.length} online
          </p>
        </div>
        <div className="max-h-64 overflow-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              <UserAvatarWithStatus user={member} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.currentProfile ? (
                    <span className="flex items-center gap-1">
                      <Chrome className="h-3 w-3" />
                      Profile {member.currentProfile.slice(0, 8)}
                    </span>
                  ) : (
                    statusConfig[member.status].label
                  )}
                </p>
              </div>
              {member.status !== 'online' && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(member.lastSeen, { addSuffix: true })}
                </span>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Profile Lock Badge (shows who is using a profile)
export function ProfileLockBadge({
  profileId,
  className,
}: {
  profileId: string;
  className?: string;
}) {
  const { data: locks = [], isLoading } = useProfileLocks();
  const lock = locks.find((l) => l.profileId === profileId);

  if (isLoading) {
    return <Skeleton className="h-6 w-20" />;
  }

  if (!lock) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              'gap-1.5 cursor-default',
              'bg-amber-500/10 text-amber-600 border-amber-500/20',
              className
            )}
          >
            <Lock className="h-3 w-3" />
            <span className="truncate max-w-[100px]">
              {lock.lockedBy.name.split(' ')[0]}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="font-medium">Being used by {lock.lockedBy.name}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Started {formatDistanceToNow(lock.lockedAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Full Lock Card (for profile detail view)
export function ProfileLockCard({
  profileId,
  className,
}: {
  profileId: string;
  className?: string;
}) {
  const { data: locks = [], isLoading } = useProfileLocks();
  const lock = locks.find((l) => l.profileId === profileId);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!lock) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg',
        'bg-amber-500/10 border border-amber-500/20',
        className
      )}
    >
      <div className="p-2 rounded-full bg-amber-500/20">
        <Lock className="h-5 w-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">Profile In Use</p>
        <p className="text-sm text-muted-foreground">
          {lock.lockedBy.name} is currently using this profile
        </p>
      </div>
      <div className="flex items-center gap-3">
        <UserAvatarWithStatus user={lock.lockedBy} />
        <div className="text-right">
          <p className="text-sm font-medium">{lock.lockedBy.name}</p>
          <p className="text-xs text-muted-foreground">
            Started {formatDistanceToNow(lock.lockedAt, { addSuffix: true })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Presence Avatars for Profile Row (shows who's viewing)
export function ProfileViewers({
  viewers,
  maxDisplay = 3,
}: {
  viewers: UserPresence[];
  maxDisplay?: number;
}) {
  if (viewers.length === 0) return null;

  const displayedViewers = viewers.slice(0, maxDisplay);
  const remainingCount = viewers.length - maxDisplay;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {displayedViewers.map((viewer) => (
                <Avatar key={viewer.id} className="h-5 w-5 border border-background">
                  <AvatarFallback className="text-[8px]">
                    {getInitials(viewer.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">+{remainingCount}</span>
            )}
            <Eye className="h-3 w-3 text-muted-foreground ml-1" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium mb-1">Currently Viewing</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {viewers.map((viewer) => (
              <li key={viewer.id}>{viewer.name}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Active Sessions Panel
export function ActiveSessionsPanel({ className }: { className?: string }) {
  const { data: locks = [], isLoading } = useProfileLocks();

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            Active Sessions
          </h3>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Chrome className="h-4 w-4" />
          Active Sessions
        </h3>
        <Badge variant="secondary">{locks.length} active</Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {locks.map((lock) => (
            <motion.div
              key={lock.profileId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <UserAvatarWithStatus user={lock.lockedBy} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Profile {lock.profileId.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {lock.lockedBy.name} •{' '}
                  {formatDistanceToNow(lock.lockedAt, { addSuffix: true })}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                Active
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        {locks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnlineMembersIndicator;
