'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Fingerprint,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Shield,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Globe,
  Monitor,
  Cpu,
} from 'lucide-react';
import { useFingerprintUpgradeInfo, useUpgradeFingerprint } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Types
interface FingerprintChange {
  field: string;
  label: string;
  icon: React.ElementType;
  old: string;
  new: string;
  impact: 'none' | 'low' | 'medium' | 'high';
  description: string;
}

interface FingerprintUpgrade {
  currentVersion: {
    id: string;
    version: number;
    browserVersion: string;
    userAgent: string;
  };
  latestVersion: {
    id: string;
    version: number;
    browserVersion: string;
    userAgent: string;
  };
  changes: FingerprintChange[];
  recommendation: 'upgrade' | 'skip' | 'review';
  safeToUpgrade: boolean;
}

// Removed mock data - now using real API

const impactConfig = {
  none: {
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    label: 'No Change',
  },
  low: {
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    label: 'Low Impact',
  },
  medium: {
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    label: 'Medium Impact',
  },
  high: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    label: 'High Impact',
  },
};

// Helper to enrich API changes with UI properties
function enrichChange(change: {
  field: string;
  old: string;
  new: string;
  impact: 'none' | 'low' | 'medium' | 'high';
}): FingerprintChange {
  // Map field names to UI labels, icons, and descriptions
  const fieldConfig: Record<string, { label: string; icon: React.ElementType; description: string }> = {
    userAgent: {
      label: 'User Agent',
      icon: Globe,
      description: 'Browser identification string used by websites to detect your browser type and version.',
    },
    browserVersion: {
      label: 'Browser Version',
      icon: Monitor,
      description: 'The version number of Chrome that your fingerprint emulates.',
    },
    platform: {
      label: 'Platform',
      icon: Cpu,
      description: 'Operating system platform information reported to websites.',
    },
    webgl: {
      label: 'WebGL Renderer',
      icon: Monitor,
      description: 'Graphics card and driver information exposed through WebGL.',
    },
    canvas: {
      label: 'Canvas Fingerprint',
      icon: Fingerprint,
      description: 'Unique rendering signature based on graphics hardware and drivers.',
    },
  };

  const config = fieldConfig[change.field] || {
    label: change.field.charAt(0).toUpperCase() + change.field.slice(1),
    icon: Info,
    description: `Changes to ${change.field} detected.`,
  };

  return {
    ...change,
    ...config,
  };
}

// Version Badge Component
// Change Item Component
function ChangeItem({
  change,
  expanded,
  onToggle,
}: {
  change: FingerprintChange;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = impactConfig[change.impact];
  const Icon = change.icon;

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        expanded ? 'bg-muted/30' : 'hover:bg-muted/20'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <div className={cn('p-2 rounded-md', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{change.label}</span>
            <Badge variant="outline" className={cn('text-xs', config.color)}>
              {config.label}
            </Badge>
          </div>
          {!expanded && (
            <p className="text-xs text-muted-foreground truncate">
              {change.old} → {change.new}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-background">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="font-mono text-sm text-red-500 line-through">
                    {change.old}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">New</p>
                  <p className="font-mono text-sm text-emerald-500">
                    {change.new}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {change.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Risk Indicator Component
function RiskIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score <= 25) return 'text-emerald-500';
    if (score <= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getLabel = () => {
    if (score <= 25) return 'Low Risk';
    if (score <= 50) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Progress value={100 - score} className="h-2" />
      </div>
      <span className={cn('text-sm font-medium', getColor())}>
        {getLabel()}
      </span>
    </div>
  );
}

// Upgrade Preview Dialog
function UpgradePreviewDialog({
  open,
  onOpenChange,
  upgrade,
  onConfirm,
  profileId,
  riskScore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upgrade: FingerprintUpgrade;
  onConfirm: () => void;
  profileId: string;
  riskScore: number;
}) {
  const [expandedChange, setExpandedChange] = React.useState<string | null>(null);
  const upgradeFingerprint = useUpgradeFingerprint();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      await upgradeFingerprint.mutateAsync({
        profileId,
        versionId: upgrade.latestVersion.id
      });
      toast({
        title: 'Fingerprint upgraded',
        description: `Successfully upgraded to v${upgrade.latestVersion.version}`,
      });
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Upgrade failed',
        description: error instanceof Error ? error.message : 'Failed to upgrade fingerprint',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            Upgrade Fingerprint
          </DialogTitle>
          <DialogDescription>
            Review the changes before upgrading to the latest fingerprint version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Version Comparison */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="font-semibold">v{upgrade.currentVersion.version}</p>
              <p className="text-sm text-muted-foreground">
                {upgrade.currentVersion.browserVersion.split(' ')[0]} {upgrade.currentVersion.version}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="p-4 rounded-lg bg-primary/10 text-center border-2 border-primary/20">
              <p className="text-xs text-primary mb-1">New</p>
              <p className="font-semibold">v{upgrade.latestVersion.version}</p>
              <p className="text-sm text-muted-foreground">
                {upgrade.latestVersion.browserVersion.split(' ')[0]} {upgrade.latestVersion.version}
              </p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Risk Assessment</span>
            </div>
            <RiskIndicator score={riskScore} />
          </div>

          {/* Changes List */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              What will change
            </h4>
            <div className="space-y-2">
              {upgrade.changes.map((change) => (
                <ChangeItem
                  key={change.field}
                  change={change}
                  expanded={expandedChange === change.field}
                  onToggle={() =>
                    setExpandedChange(
                      expandedChange === change.field ? null : change.field
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-500">Safe to Upgrade</p>
              <p className="text-sm text-muted-foreground">
                These changes maintain your session integrity. Your cookies,
                login states, and browsing history will be preserved.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={upgradeFingerprint.isPending}>
            Skip for Now
          </Button>
          <Button onClick={handleUpgrade} disabled={upgradeFingerprint.isPending}>
            {upgradeFingerprint.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Upgrading...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Upgrade to v{upgrade.latestVersion.version}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Update Available Badge Component
export function UpdateAvailableBadge({
  currentVersion,
  latestVersion,
  onClick,
}: {
  currentVersion: number;
  latestVersion: number;
  onClick?: () => void;
}) {
  if (currentVersion >= latestVersion) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className="gap-1 cursor-pointer bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0"
            onClick={onClick}
          >
            <AlertTriangle className="h-3 w-3" />
            Update Available
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            v{currentVersion} → v{latestVersion}
          </p>
          <p className="text-xs text-muted-foreground">Click to upgrade</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Main Fingerprint Aging Card Component
export function FingerprintAgingCard({
  profileId,
  className,
}: {
  profileId: string;
  className?: string;
}) {
  const { data: upgradeInfo, isLoading, error } = useFingerprintUpgradeInfo(profileId);
  const [showUpgradeDialog, setShowUpgradeDialog] = React.useState(false);

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <CardTitle>Fingerprint Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !upgradeInfo) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <CardTitle>Fingerprint Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-500">Error Loading Data</p>
              <p className="text-sm text-muted-foreground">
                Failed to load fingerprint information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const versionsBehind = upgradeInfo.latestVersion.version - upgradeInfo.currentVersion.version;
  const needsUpgrade = versionsBehind > 0;

  // Enrich changes with UI properties
  const enrichedUpgradeInfo: FingerprintUpgrade = {
    ...upgradeInfo,
    changes: upgradeInfo.changes.map(enrichChange),
  };

  // Calculate risk score based on changes impact
  const riskScore = enrichedUpgradeInfo.changes.reduce((score, change) => {
    const impactScores = { none: 0, low: 10, medium: 25, high: 40 };
    return score + (impactScores[change.impact] || 0);
  }, 0);
  const normalizedRiskScore = Math.min(100, riskScore);

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <CardTitle>Fingerprint Status</CardTitle>
          </div>
          {needsUpgrade && (
            <Badge className="bg-amber-500/10 text-amber-500 border-0">
              {versionsBehind} version{versionsBehind > 1 ? 's' : ''} behind
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Version Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Current Version</p>
              <p className="font-semibold">
                Chrome {upgradeInfo.currentVersion.version}
              </p>
            </div>
            {needsUpgrade ? (
              <Lock className="h-5 w-5 text-amber-500" />
            ) : (
              <Unlock className="h-5 w-5 text-emerald-500" />
            )}
          </div>

          {/* Upgrade Available */}
          {needsUpgrade && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border-2 border-dashed border-amber-500/30 bg-amber-500/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Upgrade Available</p>
                  <p className="text-sm text-muted-foreground">
                    Chrome {upgradeInfo.latestVersion.version} is available
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowUpgradeDialog(true)}
                >
                  Preview Upgrade
                </Button>
              </div>
            </motion.div>
          )}

          {/* Up to Date */}
          {!needsUpgrade && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-500">Up to Date</p>
                <p className="text-sm text-muted-foreground">
                  Your fingerprint is using the latest browser version.
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {versionsBehind === 0 ? '100%' : `${Math.max(0, 100 - versionsBehind * 5)}%`}
              </p>
              <p className="text-xs text-muted-foreground">Freshness Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{normalizedRiskScore}%</p>
              <p className="text-xs text-muted-foreground">Update Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UpgradePreviewDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        upgrade={enrichedUpgradeInfo}
        profileId={profileId}
        riskScore={normalizedRiskScore}
        onConfirm={() => {
          // Refetch will happen automatically via React Query cache invalidation
        }}
      />
    </>
  );
}

// Bulk Upgrade Component
export function BulkFingerprintUpgrade({
  profiles,
  className,
}: {
  profiles: Array<{
    id: string;
    name: string;
    currentVersion: number;
    latestVersion: number;
  }>;
  className?: string;
}) {
  const outdatedProfiles = profiles.filter(
    (p) => p.currentVersion < p.latestVersion
  );

  if (outdatedProfiles.length === 0) return null;

  return (
    <Card className={cn('border-amber-500/30 bg-amber-500/5', className)}>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-medium">
              {outdatedProfiles.length} Profile{outdatedProfiles.length > 1 ? 's' : ''}{' '}
              Need Updates
            </p>
            <p className="text-sm text-muted-foreground">
              Keep your fingerprints fresh for better detection avoidance
            </p>
          </div>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Update All
        </Button>
      </CardContent>
    </Card>
  );
}

export default FingerprintAgingCard;
