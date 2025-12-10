'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Globe,
  Database,
  Server,
  Zap,
  Shield,
  Users,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useSystemHealth } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

// Types
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

// Mock data for charts
const latencyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  latency: Math.floor(Math.random() * 50) + 80,
  p95: Math.floor(Math.random() * 80) + 120,
}));

const healthScoreData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  score: Math.floor(Math.random() * 10) + 88,
}));

const statusConfig: Record<HealthStatus, {
  color: string;
  bgColor: string;
  icon: React.ElementType;
  label: string;
}> = {
  healthy: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle2,
    label: 'Healthy',
  },
  warning: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: AlertTriangle,
    label: 'Warning',
  },
  critical: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: XCircle,
    label: 'Critical',
  },
  unknown: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    icon: Activity,
    label: 'Unknown',
  },
};

// Health Score Ring Component
function HealthScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getStatus = (): HealthStatus => {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'warning';
    return 'critical';
  };

  const status = getStatus();
  const config = statusConfig[status];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={config.color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-sm text-muted-foreground">Health Score</span>
        <Badge className={cn('mt-2', config.bgColor, config.color, 'border-0')}>
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

// Service Status Card
function ServiceStatusCard({
  name,
  status,
  latency,
  uptime,
  icon: Icon,
}: {
  name: string;
  status: HealthStatus;
  latency: number;
  uptime: number;
  icon: React.ElementType;
}) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">
                {latency}ms latency
              </p>
            </div>
          </div>
          <StatusIcon className={cn('h-5 w-5', config.color)} />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Uptime</span>
            <span className="font-medium">{uptime}%</span>
          </div>
          <Progress value={uptime} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// Issue Card
function IssueCard({
  title,
  description,
  severity,
  action,
}: {
  title: string;
  description: string;
  severity: 'warning' | 'critical';
  action: { label: string; href: string };
}) {
  const config = severity === 'critical' ? statusConfig.critical : statusConfig.warning;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        severity === 'critical' && 'border-red-500/30 bg-red-500/5',
        severity === 'warning' && 'border-amber-500/30 bg-amber-500/5'
      )}
    >
      <div className={cn('p-2 rounded-lg', config.bgColor)}>
        <config.icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href={action.href}>
          {action.label}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

// Main Health Page
export default function HealthPage() {
  const { toast } = useToast();
  const { data: systemHealth, isLoading, error, refetch } = useSystemHealth();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: 'Health data refreshed',
        description: 'System health has been updated successfully.',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to refresh',
        description: err instanceof Error ? err.message : 'Could not refresh health data.',
        variant: 'destructive',
      });
    }
  };

  // Generate issues based on health data
  const issues = React.useMemo(() => {
    if (!systemHealth) return [];

    const issueList: Array<{
      title: string;
      description: string;
      severity: 'warning' | 'critical';
      action: { label: string; href: string };
    }> = [];

    // Check proxy issues
    if (systemHealth.proxies.failed > 0) {
      issueList.push({
        title: 'Proxy connection failed',
        description: `${systemHealth.proxies.failed} ${systemHealth.proxies.failed === 1 ? 'proxy is' : 'proxies are'} not responding.`,
        severity: systemHealth.proxies.failed > 2 ? 'critical' : 'warning',
        action: { label: 'View Proxies', href: '/dashboard/proxies' },
      });
    }

    // Check profile issues
    if (systemHealth.profiles.critical > 0) {
      issueList.push({
        title: 'Profiles need attention',
        description: `${systemHealth.profiles.critical} ${systemHealth.profiles.critical === 1 ? 'profile has' : 'profiles have'} critical issues.`,
        severity: 'critical',
        action: { label: 'View Profiles', href: '/dashboard/profiles' },
      });
    } else if (systemHealth.profiles.warning > 0) {
      issueList.push({
        title: 'Profiles need attention',
        description: `${systemHealth.profiles.warning} ${systemHealth.profiles.warning === 1 ? 'profile has' : 'profiles have'} warnings.`,
        severity: 'warning',
        action: { label: 'View Profiles', href: '/dashboard/profiles' },
      });
    }

    // Check sync issues
    if (systemHealth.sync.status === 'error') {
      issueList.push({
        title: 'Sync error detected',
        description: `There are ${systemHealth.sync.pendingChanges} pending changes that could not be synced.`,
        severity: 'critical',
        action: { label: 'View Details', href: '/dashboard/settings' },
      });
    }

    // Check API issues
    if (systemHealth.api.status === 'down') {
      issueList.push({
        title: 'API service is down',
        description: 'The API service is currently unavailable. Please try again later.',
        severity: 'critical',
        action: { label: 'Status Page', href: '/dashboard/health' },
      });
    } else if (systemHealth.api.status === 'degraded') {
      issueList.push({
        title: 'API performance degraded',
        description: `High error rate detected (${(systemHealth.api.errorRate * 100).toFixed(1)}%).`,
        severity: 'warning',
        action: { label: 'View Details', href: '/dashboard/health' },
      });
    }

    return issueList;
  }, [systemHealth]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <Card className="lg:w-[300px]">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Skeleton className="h-40 w-40 rounded-full" />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !systemHealth) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
            <p className="text-muted-foreground">
              Monitor the health of your profiles and services
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load health data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred while fetching system health.'}
            </p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor the health of your profiles and services
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Health Score */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="lg:w-[300px]">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <HealthScoreRing score={systemHealth.score} />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Based on profile health, proxy status, and service availability
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Profiles</p>
                  <p className="text-2xl font-bold">
                    {systemHealth.profiles.healthy}/{systemHealth.profiles.total}
                  </p>
                </div>
              </div>
              <Progress
                value={(systemHealth.profiles.healthy / systemHealth.profiles.total) * 100}
                className="mt-4 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Working Proxies</p>
                  <p className="text-2xl font-bold">
                    {systemHealth.proxies.working}/{systemHealth.proxies.total}
                  </p>
                </div>
              </div>
              <Progress
                value={(systemHealth.proxies.working / systemHealth.proxies.total) * 100}
                className="mt-4 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">API Latency</p>
                  <p className="text-2xl font-bold">{systemHealth.api.latency}ms</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {(100 - systemHealth.api.errorRate * 100).toFixed(2)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-3 rounded-lg',
                  systemHealth.sync.status === 'synced' && 'bg-cyan-500/10',
                  systemHealth.sync.status === 'syncing' && 'bg-blue-500/10',
                  systemHealth.sync.status === 'error' && 'bg-red-500/10'
                )}>
                  <Database className={cn(
                    'h-6 w-6',
                    systemHealth.sync.status === 'synced' && 'text-cyan-500',
                    systemHealth.sync.status === 'syncing' && 'text-blue-500',
                    systemHealth.sync.status === 'error' && 'text-red-500'
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sync Status</p>
                  <p className="text-2xl font-bold capitalize">
                    {systemHealth.sync.status}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {systemHealth.sync.lastSync
                  ? `Last sync ${new Date(systemHealth.sync.lastSync).toLocaleString()}`
                  : 'Never synced'}
                {systemHealth.sync.pendingChanges > 0 && ` • ${systemHealth.sync.pendingChanges} pending`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Issues Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {issues.map((issue, index) => (
              <IssueCard key={index} {...issue} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Service Status */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Service Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ServiceStatusCard
            name="API Gateway"
            status={
              systemHealth.api.status === 'operational'
                ? 'healthy'
                : systemHealth.api.status === 'degraded'
                ? 'warning'
                : 'critical'
            }
            latency={systemHealth.api.latency}
            uptime={100 - (systemHealth.api.errorRate * 100)}
            icon={Server}
          />
          <ServiceStatusCard
            name="Sync Service"
            status={
              systemHealth.sync.status === 'synced'
                ? 'healthy'
                : systemHealth.sync.status === 'syncing'
                ? 'warning'
                : 'critical'
            }
            latency={systemHealth.proxies.averageLatency}
            uptime={
              systemHealth.sync.status === 'synced' ? 99.9 :
              systemHealth.sync.status === 'syncing' ? 98.0 : 95.0
            }
            icon={Database}
          />
          <ServiceStatusCard
            name="Proxy Network"
            status={
              systemHealth.proxies.failed === 0
                ? 'healthy'
                : systemHealth.proxies.failed <= 2
                ? 'warning'
                : 'critical'
            }
            latency={systemHealth.proxies.averageLatency}
            uptime={(systemHealth.proxies.working / systemHealth.proxies.total) * 100}
            icon={Globe}
          />
          <ServiceStatusCard
            name="Profile Health"
            status={
              systemHealth.profiles.critical === 0 && systemHealth.profiles.warning === 0
                ? 'healthy'
                : systemHealth.profiles.critical === 0
                ? 'warning'
                : 'critical'
            }
            latency={Math.round(systemHealth.api.latency * 1.2)}
            uptime={(systemHealth.profiles.healthy / systemHealth.profiles.total) * 100}
            icon={Shield}
          />
        </div>
      </div>

      {/* Latency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Latency (24h)</CardTitle>
          <CardDescription>
            Response time in milliseconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="hsl(var(--primary))"
                  fill="url(#latencyGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health Score Trend</CardTitle>
          <CardDescription>
            Weekly health score overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthScoreData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[80, 100]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
