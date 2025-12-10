'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, GlassCard, StatsCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProfileAvatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Globe,
  Activity,
  TrendingUp,
  Plus,
  Play,
  MoreHorizontal,
  ArrowUpRight,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDashboardStats,
  useRecentProfiles,
  useRecentActivity,
  useLaunchProfile,
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 mt-2" />
      <Skeleton className="h-3 w-20 mt-2" />
    </Card>
  );
}

function ProfileListSkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { toast } = useToast();
  const stats = useDashboardStats();
  const { data: profilesData, isLoading: profilesLoading } = useRecentProfiles();
  const { data: activityData, isLoading: activityLoading } = useRecentActivity();
  const launchProfile = useLaunchProfile();
  const [now, setNow] = React.useState(0);
  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  const handleLaunch = async (profileId: string, profileName: string) => {
    try {
      await launchProfile.mutateAsync({ id: profileId });
      toast({
        title: 'Profile launching',
        description: `${profileName} is being launched...`,
      });
    } catch (error) {
      toast({
        title: 'Launch failed',
        description: error instanceof Error ? error.message : 'Failed to launch profile',
        variant: 'destructive',
      });
    }
  };

  const recentProfiles = profilesData?.items || [];
  const recentActivity = activityData?.items || [];

  // Calculate stats
  const profileCount = stats.profiles?.count || 0;
  const proxyTotal = stats.proxies?.total || 0;
  const proxyWorking = stats.proxies?.working || 0;
  const proxyFailed = stats.proxies?.failed || 0;
  const teamCount = stats.team?.memberCount || 1;
  const profileDescription = 'Unlimited profiles included';
  const teamDescription = 'Unlimited seats for your team';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profiles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Profile
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Profiles"
              value={profileCount}
              description={profileDescription}
              icon={Users}
              trend="up"
            />
            <StatsCard
              title="Active Proxies"
              value={`${proxyWorking}/${proxyTotal}`}
              description={proxyFailed > 0 ? `${proxyFailed} need attention` : 'All healthy'}
              icon={Globe}
              trend={proxyFailed > 0 ? 'down' : 'up'}
            />
            <StatsCard
              title="Today's Launches"
              value={recentActivity.filter(a =>
                a.action === 'profile.launch' &&
                now - a.createdAt < 86400000
              ).length}
              description="Active sessions"
              icon={Activity}
              trend="up"
            />
            <StatsCard
              title="Team Members"
              value={teamCount}
              description={teamDescription}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Usage and Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Profiles */}
        <Card className="lg:col-span-4">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="font-semibold">Recent Profiles</h2>
              <p className="text-sm text-muted-foreground">
                Your most recently used browser profiles
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profiles">View All</Link>
            </Button>
          </div>
          {profilesLoading ? (
            <ProfileListSkeleton />
          ) : recentProfiles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No profiles yet</p>
              <Button asChild>
                <Link href="/dashboard/profiles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first profile
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <ProfileAvatar profile={{ name: profile.name, templateId: profile.templateId }} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{profile.name}</p>
                      <Badge
                        variant={profile.status === 'in_use' ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {profile.status === 'in_use' ? 'In Use' : 'Available'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {profile.templateId} • {profile.launchCount} launches
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {formatRelativeTime(profile.lastActive)}
                    </span>
                    <Button
                      size="sm"
                      variant={profile.status === 'in_use' ? 'outline' : 'default'}
                      disabled={profile.status === 'in_use' || launchProfile.isPending}
                      onClick={() => handleLaunch(profile.id, profile.name)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Launch
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/profiles/${profile.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">
                Team activity feed
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/audit">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          {activityLoading ? (
            <ActivitySkeleton />
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">
                    {activity.action.includes('launch') && (
                      <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                        <Play className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.action.includes('create') && (
                      <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30">
                        <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    {activity.action.includes('update') && (
                      <div className="rounded-full bg-purple-100 p-1.5 dark:bg-purple-900/30">
                        <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    {activity.action.includes('sync') && (
                      <div className="rounded-full bg-orange-100 p-1.5 dark:bg-orange-900/30">
                        <CheckCircle2 className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                    {activity.action.includes('delete') && (
                      <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
                        <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      <span className="text-muted-foreground">{activity.action.replace('.', ' ')}</span>
                    </p>
                    <p className="text-sm font-medium truncate">{activity.targetName || activity.targetId}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Usage Progress */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Usage</span>
            <span className="text-sm text-muted-foreground">
              {profileCount}/∞
            </span>
          </div>
          <Progress
            value={0}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Unlimited profiles included
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Proxy Health</span>
            <span className="text-sm text-muted-foreground">
              {proxyWorking}/{proxyTotal} working
            </span>
          </div>
          <Progress
            value={proxyTotal > 0 ? (proxyWorking / proxyTotal) * 100 : 0}
            className="h-2"
          />
          {proxyFailed > 0 && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="h-3 w-3" />
              {proxyFailed} proxies need attention
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Team Seats</span>
            <span className="text-sm text-muted-foreground">
              {teamCount}/∞
            </span>
          </div>
          <Progress
            value={0}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Unlimited seats available
          </p>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link href="/dashboard/profiles/new">
              <Users className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">Create Profile</p>
                <p className="text-xs text-muted-foreground">
                  Add a new browser profile
                </p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link href="/dashboard/proxies">
              <Globe className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">Add Proxy</p>
                <p className="text-xs text-muted-foreground">
                  Configure a new proxy
                </p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link href="/dashboard/team">
              <Users className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">Invite Team</p>
                <p className="text-xs text-muted-foreground">
                  Add team members
                </p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link href="/dashboard/api-keys">
              <Zap className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">API Access</p>
                <p className="text-xs text-muted-foreground">
                  Generate API keys
                </p>
              </div>
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
