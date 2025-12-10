'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Globe,
  Database,
  Wifi,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSystemHealth } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';

// Types
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

// Removed mock data - now using real API

const statusConfig: Record<HealthStatus, {
  color: string;
  bgColor: string;
  icon: React.ElementType;
  label: string;
  ringColor: string;
}> = {
  healthy: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle2,
    label: 'Healthy',
    ringColor: 'ring-emerald-500/30',
  },
  warning: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: AlertTriangle,
    label: 'Warning',
    ringColor: 'ring-amber-500/30',
  },
  critical: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: XCircle,
    label: 'Critical',
    ringColor: 'ring-red-500/30',
  },
  unknown: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    icon: Activity,
    label: 'Unknown',
    ringColor: 'ring-gray-500/30',
  },
};

// Animated Score Ring Component
function ScoreRing({
  score,
  status,
  size = 120
}: {
  score: number;
  status: HealthStatus;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const config = statusConfig[status];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
      </svg>

      {/* Progress ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
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
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>

      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full ring-4 opacity-50 blur-sm',
          config.ringColor
        )}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: HealthStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn('gap-1.5', config.bgColor, config.color, 'border-0')}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Health Metric Card
function HealthMetric({
  icon: Icon,
  label,
  value,
  subValue,
  status,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  status: HealthStatus;
  href?: string;
}) {
  const config = statusConfig[status];
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all',
        'hover:bg-muted/50 cursor-pointer group',
        config.bgColor
      )}
    >
      <div className={cn('p-2 rounded-md', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{value}</span>
          {subValue && (
            <span className="text-xs text-muted-foreground">{subValue}</span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// Latency Sparkline
function LatencySparkline({
  data,
  trend
}: {
  data: number[];
  trend: 'up' | 'down' | 'stable';
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="text-primary"
        />
      </svg>
      {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
      {trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
    </div>
  );
}

// Main Health Widget Component
export function HealthWidget({ className }: { className?: string }) {
  const { data: health, isLoading, error, refetch } = useSystemHealth();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">System Health</CardTitle>
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <Skeleton className="h-[120px] w-[120px] rounded-full" />
            <div className="grid gap-2 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">System Health</CardTitle>
          <StatusBadge status="unknown" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-500">Error Loading Health Data</p>
              <p className="text-sm text-muted-foreground">
                Failed to fetch system health information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profileHealthPercentage =
    ((health.profiles.healthy / health.profiles.total) * 100).toFixed(0);
  const proxyHealthPercentage =
    ((health.proxies.working / health.proxies.total) * 100).toFixed(0);

  // Mock latency history (would come from API in future)
  const latencyHistory = [120, 145, 132, 150, 128, 142, 138, 145];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">System Health</CardTitle>
          <StatusBadge status={health.overall} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh health data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          {/* Score Ring */}
          <div className="flex justify-center lg:justify-start">
            <ScoreRing score={health.score} status={health.overall} />
          </div>

          {/* Health Metrics */}
          <div className="grid gap-2 sm:grid-cols-2">
            <HealthMetric
              icon={Activity}
              label="Profiles"
              value={`${profileHealthPercentage}%`}
              subValue={`${health.profiles.healthy}/${health.profiles.total} healthy`}
              status={health.profiles.critical > 0 ? 'warning' : 'healthy'}
              href="/dashboard/profiles"
            />

            <HealthMetric
              icon={Globe}
              label="Proxies"
              value={`${proxyHealthPercentage}%`}
              subValue={`${health.proxies.working}/${health.proxies.total} working`}
              status={health.proxies.failed > 2 ? 'critical' : health.proxies.failed > 0 ? 'warning' : 'healthy'}
              href="/dashboard/proxies"
            />

            <HealthMetric
              icon={Database}
              label="Sync Status"
              value={health.sync.status === 'synced' ? 'Synced' : 'Pending'}
              subValue={health.sync.pendingChanges > 0 ? `${health.sync.pendingChanges} changes` : undefined}
              status={health.sync.status === 'error' ? 'critical' : health.sync.status === 'syncing' ? 'warning' : 'healthy'}
            />

            <HealthMetric
              icon={Wifi}
              label="API Status"
              value={`${health.api.latency}ms`}
              subValue={health.api.status}
              status={health.api.status === 'down' ? 'critical' : health.api.status === 'degraded' ? 'warning' : 'healthy'}
            />
          </div>
        </div>

        {/* Latency Trend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Average Latency (24h)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{health.proxies.averageLatency}ms</span>
              <LatencySparkline data={latencyHistory} trend="stable" />
            </div>
          </div>
        </div>

        {/* Issues Alert */}
        <AnimatePresence>
          {(health.profiles.critical > 0 || health.proxies.failed > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Attention Required</p>
                  <p className="text-xs text-muted-foreground">
                    {health.profiles.critical > 0 && `${health.profiles.critical} profile(s) need attention. `}
                    {health.proxies.failed > 0 && `${health.proxies.failed} proxy(ies) not responding.`}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/health">Fix Issues</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Compact Health Badge for Header
export function HealthBadge() {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-muted">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!health) return null;

  const config = statusConfig[health.overall];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/dashboard/health"
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors',
              config.bgColor,
              config.color,
              'hover:opacity-80'
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{health.score}%</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>System Health: {config.label}</p>
          <p className="text-xs text-muted-foreground">Click for details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HealthWidget;
