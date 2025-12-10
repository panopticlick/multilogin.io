'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Lightweight stubs to keep callers working while the product is fully free.

export function UpgradePromptDialog() {
  return null;
}

export function UsageLimitBar({
  used,
  limit,
  label,
  icon: Icon,
  className,
}: {
  used: number;
  limit: number;
  label: string;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
        </div>
        <span className="font-medium">
          {used} / {limit === -1 ? '∞' : limit}
        </span>
      </div>
      <Progress value={limit > 0 ? Math.min((used / limit) * 100, 100) : 0} />
    </div>
  );
}

export function UsageOverviewCard({
  usage,
  className,
}: {
  usage: {
    profiles: { used: number; limit: number };
    teamMembers: { used: number; limit: number };
    proxies: { used: number; limit: number };
  };
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Free Forever
          </span>
          <span className="text-sm text-muted-foreground">所有功能已解锁</span>
        </div>
      </div>

      <div className="space-y-4">
        <UsageLimitBar label="Profiles" used={usage.profiles.used} limit={usage.profiles.limit} icon={() => null} />
        <UsageLimitBar label="Team Members" used={usage.teamMembers.used} limit={usage.teamMembers.limit} icon={() => null} />
        <UsageLimitBar label="Proxy Pools" used={usage.proxies.used} limit={usage.proxies.limit} icon={() => null} />
      </div>
    </div>
  );
}

export function SoftGate({ children }: { feature: string; requiredPlan: string; isAllowed: boolean; children: React.ReactNode; fallback?: React.ReactNode }) {
  return <>{children}</>;
}

export function UpgradeBanner() {
  return null;
}

export function FeatureLockOverlay() {
  return null;
}

export default UpgradePromptDialog;
