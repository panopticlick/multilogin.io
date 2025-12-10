'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
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
  History,
  Clock,
  RotateCcw,
  GitCompare,
  Cookie,
  Database,
  User,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  useSnapshots,
  useRestoreSnapshot,
  useSnapshotDiff,
  usePartialRestoreSnapshot,
} from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { SessionSnapshot } from '@/types';

interface DiffItem {
  type: 'added' | 'removed' | 'modified';
  key: string;
  oldValue?: string;
  newValue?: string;
}

type PartialSelection = {
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
};

const defaultPartialSelection: PartialSelection = {
  cookies: true,
  localStorage: false,
  sessionStorage: false,
};

interface SnapshotDiffResponse {
  added: {
    cookies: Array<Record<string, unknown>>;
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  };
  removed: {
    cookies: Array<Record<string, unknown>>;
    localStorage: string[];
    sessionStorage: string[];
  };
  modified: {
    cookies: Array<{ old: Record<string, unknown>; new: Record<string, unknown> }>;
    localStorage: Array<{ key: string; old: string; new: string }>;
    sessionStorage: Array<{ key: string; old: string; new: string }>;
  };
}

function formatCookieLabel(cookie: Record<string, unknown>) {
  const domain = (cookie.domain as string) || 'domain';
  const name = (cookie.name as string) || 'cookie';
  return `${domain}:${name}`;
}

function serializeValue(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function buildDiffItems(diff?: SnapshotDiffResponse, cleared?: PartialSelection): DiffItem[] {
  if (!diff) return [];
  const items: DiffItem[] = [];

  if (!cleared?.cookies) {
    diff.added.cookies.forEach((cookie) => {
      items.push({
        type: 'added',
        key: formatCookieLabel(cookie),
        newValue: serializeValue(cookie.value ?? cookie),
      });
    });
    diff.removed.cookies.forEach((cookie) => {
      items.push({
        type: 'removed',
        key: formatCookieLabel(cookie),
        oldValue: serializeValue(cookie.value ?? cookie),
      });
    });
    diff.modified.cookies.forEach(({ old, new: next }) => {
      items.push({
        type: 'modified',
        key: formatCookieLabel(next),
        oldValue: serializeValue(old.value ?? old),
        newValue: serializeValue(next.value ?? next),
      });
    });
  }

  if (!cleared?.localStorage) {
    Object.entries(diff.added.localStorage).forEach(([key, value]) => {
      items.push({ type: 'added', key: `localStorage:${key}`, newValue: value });
    });
    diff.removed.localStorage.forEach((key) => {
      items.push({ type: 'removed', key: `localStorage:${key}`, oldValue: 'removed' });
    });
    diff.modified.localStorage.forEach(({ key, old, new: next }) => {
      items.push({ type: 'modified', key: `localStorage:${key}`, oldValue: old, newValue: next });
    });
  }

  if (!cleared?.sessionStorage) {
    Object.entries(diff.added.sessionStorage).forEach(([key, value]) => {
      items.push({ type: 'added', key: `sessionStorage:${key}`, newValue: value });
    });
    diff.removed.sessionStorage.forEach((key) => {
      items.push({ type: 'removed', key: `sessionStorage:${key}`, oldValue: 'removed' });
    });
    diff.modified.sessionStorage.forEach(({ key, old, new: next }) => {
      items.push({ type: 'modified', key: `sessionStorage:${key}`, oldValue: old, newValue: next });
    });
  }

  return items;
}

function countDiffCategories(diff?: SnapshotDiffResponse) {
  if (!diff) return { cookies: 0, localStorage: 0, sessionStorage: 0 };
  const cookies = diff.added.cookies.length + diff.removed.cookies.length + diff.modified.cookies.length;
  const localStorage =
    Object.keys(diff.added.localStorage).length +
    diff.removed.localStorage.length +
    diff.modified.localStorage.length;
  const sessionStorage =
    Object.keys(diff.added.sessionStorage).length +
    diff.removed.sessionStorage.length +
    diff.modified.sessionStorage.length;
  return { cookies, localStorage, sessionStorage };
}

function extractCookieKeys(diff?: SnapshotDiffResponse) {
  if (!diff) return [];
  const keys = new Map<string, { domain: string; name: string; path?: string }>();
  const collect = (cookie: Record<string, unknown>) => {
    const domain = (cookie.domain as string) || '';
    const name = (cookie.name as string) || '';
    const path = (cookie.path as string | undefined) || '/';
    const key = `${domain}:${name}:${path}`;
    keys.set(key, { domain, name, path });
  };
  diff.added.cookies.forEach(collect);
  diff.removed.cookies.forEach(collect);
  diff.modified.cookies.forEach(({ old, new: next }) => {
    collect(old);
    collect(next);
  });
  return Array.from(keys.values());
}

function extractLocalKeys(diff?: SnapshotDiffResponse) {
  if (!diff) return [];
  const keys = new Set<string>();
  Object.keys(diff.added.localStorage).forEach((key) => keys.add(key));
  diff.removed.localStorage.forEach((key) => keys.add(key));
  diff.modified.localStorage.forEach(({ key }) => keys.add(key));
  return Array.from(keys);
}

function extractSessionKeys(diff?: SnapshotDiffResponse) {
  if (!diff) return [];
  const keys = new Set<string>();
  Object.keys(diff.added.sessionStorage).forEach((key) => keys.add(key));
  diff.removed.sessionStorage.forEach((key) => keys.add(key));
  diff.modified.sessionStorage.forEach(({ key }) => keys.add(key));
  return Array.from(keys);
}

// Removed mock data - now using real API

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Timeline Marker Component
function TimelineMarker({
  snapshot,
  isSelected,
  isCompareFrom,
  isCompareTo,
  onClick,
}: {
  snapshot: SessionSnapshot;
  isSelected: boolean;
  isCompareFrom: boolean;
  isCompareTo: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'relative flex flex-col items-center group',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          >
            {/* Marker dot */}
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all',
                isSelected
                  ? 'bg-primary border-primary scale-125'
                  : isCompareFrom
                  ? 'bg-blue-500 border-blue-500'
                  : isCompareTo
                  ? 'bg-purple-500 border-purple-500'
                  : 'bg-background border-muted-foreground/30 group-hover:border-primary'
              )}
            />

            {/* Version badge */}
            <span
              className={cn(
                'mt-1 text-xs font-medium',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              v{snapshot.version}
            </span>

            {/* Auto-save indicator */}
            {snapshot.isAutoSave && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-muted rounded-full" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">Version {snapshot.version}</p>
            <p className="text-muted-foreground">
              {format(snapshot.timestamp, 'PPp')}
            </p>
            {snapshot.description && (
              <p className="text-muted-foreground mt-1">{snapshot.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Snapshot Detail Card
function SnapshotDetail({
  snapshot,
  onRestore,
  onCompare,
}: {
  snapshot: SessionSnapshot;
  onRestore: () => void;
  onCompare: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-4 rounded-lg border bg-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Version {snapshot.version}</h4>
            {snapshot.isAutoSave && (
              <Badge variant="secondary" className="text-xs">
                Auto-save
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(snapshot.timestamp, { addSuffix: true })}
          </p>
          {snapshot.description && (
            <p className="text-sm mt-1">{snapshot.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCompare}>
            <GitCompare className="h-4 w-4 mr-1" />
            Compare
          </Button>
          <Button size="sm" onClick={onRestore}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-2 rounded-lg bg-muted/50">
          <Cookie className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{snapshot.cookieCount}</p>
          <p className="text-xs text-muted-foreground">Cookies</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <Database className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{snapshot.localStorageCount}</p>
          <p className="text-xs text-muted-foreground">Local Storage</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <Database className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{snapshot.sessionStorageCount}</p>
          <p className="text-xs text-muted-foreground">Session Storage</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{formatBytes(snapshot.size)}</p>
          <p className="text-xs text-muted-foreground">Total Size</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Modified by {snapshot.author.name}</span>
      </div>
    </motion.div>
  );
}

// Diff View Component
function DiffView({
  diff,
  fromVersion,
  toVersion,
  isLoading,
  onPartialRestore,
  canRestore,
}: {
  diff: DiffItem[];
  fromVersion: number;
  toVersion: number;
  isLoading: boolean;
  onPartialRestore: () => void;
  canRestore: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">Changes</h4>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">v{fromVersion}</Badge>
          <ChevronRight className="h-4 w-4" />
          <Badge variant="outline">v{toVersion}</Badge>
          <Button variant="outline" size="sm" onClick={onPartialRestore} disabled={!canRestore}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Partial Restore
          </Button>
        </div>
      </div>

      {!diff.length && !isLoading ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No differences detected between these versions.
        </div>
      ) : (
        <div className="space-y-2">
          {diff.map((item, index) => (
          <motion.div
            key={`${item.type}-${item.key}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm font-mono',
              item.type === 'added' && 'bg-green-500/10 border border-green-500/20',
              item.type === 'removed' && 'bg-red-500/10 border border-red-500/20',
              item.type === 'modified' && 'bg-amber-500/10 border border-amber-500/20'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'added' && <Plus className="h-4 w-4 text-green-500" />}
              {item.type === 'removed' && <Minus className="h-4 w-4 text-red-500" />}
              {item.type === 'modified' && <RefreshCw className="h-4 w-4 text-amber-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{item.key}</p>
              {item.type === 'modified' && (
                <div className="mt-1 space-y-1">
                  <p className="text-red-500 line-through truncate">
                    {item.oldValue}
                  </p>
                  <p className="text-green-500 truncate">{item.newValue}</p>
                </div>
              )}
              {item.type === 'added' && (
                <p className="text-green-500 truncate mt-1">{item.newValue}</p>
              )}
              {item.type === 'removed' && (
                <p className="text-red-500 truncate mt-1">{item.oldValue}</p>
              )}
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Restore Confirmation Dialog
function RestoreDialog({
  open,
  onOpenChange,
  snapshot,
  onConfirm,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: SessionSnapshot | null;
  onConfirm: () => void;
  profileId: string;
}) {
  const restoreSnapshot = useRestoreSnapshot();
  const { toast } = useToast();

  const handleRestore = async () => {
    if (!snapshot) return;

    try {
      await restoreSnapshot.mutateAsync({
        profileId,
        snapshotId: snapshot.id,
      });
      toast({
        title: 'Snapshot restored',
        description: `Successfully restored to version ${snapshot.version}`,
      });
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Restore failed',
        description: error instanceof Error ? error.message : 'Failed to restore snapshot',
        variant: 'destructive',
      });
    }
  };

  if (!snapshot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Restore to Version {snapshot.version}?
          </DialogTitle>
          <DialogDescription>
            This will overwrite the current session data with the data from{' '}
            <strong>{format(snapshot.timestamp, 'PPp')}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cookies</span>
              <span className="font-medium">{snapshot.cookieCount} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Local Storage</span>
              <span className="font-medium">{snapshot.localStorageCount} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session Storage</span>
              <span className="font-medium">{snapshot.sessionStorageCount} items</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={restoreSnapshot.isPending}>
            Cancel
          </Button>
          <Button onClick={handleRestore} disabled={restoreSnapshot.isPending}>
            {restoreSnapshot.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PartialRestoreDialog({
  open,
  onOpenChange,
  selection,
  onSelectionChange,
  counts,
  onConfirm,
  disabled,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: PartialSelection;
  onSelectionChange: (next: PartialSelection) => void;
  counts: { cookies: number; localStorage: number; sessionStorage: number };
  onConfirm: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}) {
  const options: Array<{ key: keyof PartialSelection; label: string; count: number }> = [
    { key: 'cookies', label: 'Cookies', count: counts.cookies },
    { key: 'localStorage', label: 'Local Storage', count: counts.localStorage },
    { key: 'sessionStorage', label: 'Session Storage', count: counts.sessionStorage },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Data To Restore</DialogTitle>
          <DialogDescription>
            Apply changes from the target snapshot to the current session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {options.map((option) => (
            <label key={option.key} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.count} changes detected</p>
              </div>
              <Checkbox
                checked={selection[option.key]}
                onCheckedChange={(value) =>
                  onSelectionChange({ ...selection, [option.key]: Boolean(value) })
                }
                disabled={option.count === 0}
              />
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={disabled || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Selection'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Time Machine Component
export function TimeMachine({
  profileId,
  className,
}: {
  profileId?: string;
  className?: string;
}) {
  const {
    data: snapshots = [],
    isLoading,
    error,
  } = useSnapshots(profileId ?? '');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareFrom, setCompareFrom] = React.useState<number | null>(null);
  const [compareTo, setCompareTo] = React.useState<number | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = React.useState(false);
  const [showPartialDialog, setShowPartialDialog] = React.useState(false);
  const [partialSelection, setPartialSelection] = React.useState<PartialSelection>(defaultPartialSelection);
  const [clearedCategories, setClearedCategories] = React.useState<PartialSelection>({
    cookies: false,
    localStorage: false,
    sessionStorage: false,
  });

  const selectedSnapshot = snapshots[selectedIndex] ?? null;
  const diffFromId = compareFrom !== null ? snapshots[compareFrom]?.id : undefined;
  const diffToId = compareTo !== null ? snapshots[compareTo]?.id : undefined;
  const diffQuery = useSnapshotDiff(profileId, diffFromId, diffToId);
  const partialRestore = usePartialRestoreSnapshot();
  const diffItems = React.useMemo(() => buildDiffItems(diffQuery.data, clearedCategories), [diffQuery.data, clearedCategories]);
  const diffCounts = React.useMemo(() => countDiffCategories(diffQuery.data), [diffQuery.data]);
  const cookieKeys = React.useMemo(() => extractCookieKeys(diffQuery.data), [diffQuery.data]);
  const localKeys = React.useMemo(() => extractLocalKeys(diffQuery.data), [diffQuery.data]);
  const sessionKeys = React.useMemo(() => extractSessionKeys(diffQuery.data), [diffQuery.data]);
  const totalDiffItems = diffCounts.cookies + diffCounts.localStorage + diffCounts.sessionStorage;
  const canPartialRestore = diffQuery.data && totalDiffItems > 0 && compareTo !== null;
  const selectionHasChanges =
    (partialSelection.cookies && diffCounts.cookies > 0) ||
    (partialSelection.localStorage && diffCounts.localStorage > 0) ||
    (partialSelection.sessionStorage && diffCounts.sessionStorage > 0);
  const { toast } = useToast();

  React.useEffect(() => {
    setClearedCategories({ cookies: false, localStorage: false, sessionStorage: false });
  }, [diffQuery.data]);

  React.useEffect(() => {
    if (snapshots.length === 0) {
      setSelectedIndex(0);
      return;
    }
    if (selectedIndex > snapshots.length - 1) {
      setSelectedIndex(Math.max(0, snapshots.length - 1));
    }
  }, [snapshots.length, selectedIndex]);

  const handleSliderChange = (value: number[]) => {
    if (!snapshots.length) return;
    setSelectedIndex(Math.max(0, snapshots.length - 1 - value[0]));
  };

  const handleRestore = () => {
    // Refetch will happen automatically via React Query cache invalidation
  };

  const handlePartialConfirm = async () => {
    if (!profileId || compareTo === null) return;
    const payload = {
      snapshotId: snapshots[compareTo].id,
      cookies: partialSelection.cookies ? cookieKeys : undefined,
      localStorageKeys: partialSelection.localStorage ? localKeys : undefined,
      sessionStorageKeys: partialSelection.sessionStorage ? sessionKeys : undefined,
    };

    if (!payload.cookies && !payload.localStorageKeys && !payload.sessionStorageKeys) {
      toast({ title: 'Select data', description: 'Choose at least one category to restore.' });
      return;
    }

    setClearedCategories((prev) => ({
      cookies: prev.cookies || partialSelection.cookies,
      localStorage: prev.localStorage || partialSelection.localStorage,
      sessionStorage: prev.sessionStorage || partialSelection.sessionStorage,
    }));

    try {
      await partialRestore.mutateAsync({ profileId, data: payload });
      toast({ title: 'Partial restore queued', description: 'Selected data will be updated shortly.' });
      setShowPartialDialog(false);
    } catch (error) {
      setClearedCategories({ cookies: false, localStorage: false, sessionStorage: false });
      toast({
        title: 'Partial restore failed',
        description: error instanceof Error ? error.message : 'Unable to apply changes.',
        variant: 'destructive',
      });
    }
  };

  const handleCompareToggle = () => {
    if (compareMode) {
      setCompareMode(false);
      setCompareFrom(null);
      setCompareTo(null);
      setClearedCategories({ cookies: false, localStorage: false, sessionStorage: false });
      setPartialSelection(defaultPartialSelection);
    } else {
      setCompareMode(true);
      setCompareFrom(selectedIndex);
      setCompareTo(Math.min(selectedIndex + 1, snapshots.length - 1));
    }
  };

  if (!profileId) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Time Machine</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-sm text-muted-foreground">
            Select a profile to view snapshot history.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Time Machine</CardTitle>
          </div>
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || snapshots.length === 0) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Time Machine</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {error ? 'Error loading snapshots' : 'No snapshots yet. Create one to get started.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Time Machine</CardTitle>
        </div>
        <Button
          variant={compareMode ? 'default' : 'outline'}
          size="sm"
          onClick={handleCompareToggle}
          disabled={snapshots.length < 2}
        >
          <GitCompare className="h-4 w-4 mr-1" />
          {compareMode ? 'Exit Compare' : 'Compare'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline Slider */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Oldest</span>
            <span>Current</span>
          </div>

          <Slider
            value={[snapshots.length - 1 - selectedIndex]}
            max={snapshots.length - 1}
            step={1}
            onValueChange={handleSliderChange}
            className="py-4"
          />

          {/* Timeline Markers */}
          <div className="flex justify-between px-2">
            {[...snapshots].reverse().map((snapshot, index) => (
              <TimelineMarker
                key={snapshot.id}
                snapshot={snapshot}
                isSelected={snapshots.length - 1 - index === selectedIndex}
                isCompareFrom={compareMode && snapshots.length - 1 - index === compareFrom}
                isCompareTo={compareMode && snapshots.length - 1 - index === compareTo}
                onClick={() => {
                  if (compareMode) {
                    if (compareFrom === null) {
                      setCompareFrom(snapshots.length - 1 - index);
                    } else if (compareTo === null) {
                      setCompareTo(snapshots.length - 1 - index);
                    } else {
                      setCompareFrom(snapshots.length - 1 - index);
                      setCompareTo(null);
                    }
                  } else {
                    setSelectedIndex(snapshots.length - 1 - index);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Snapshot Detail or Diff View */}
        <AnimatePresence mode="wait">
          {compareMode && compareFrom !== null && compareTo !== null ? (
            <DiffView
              key="diff"
              diff={diffItems}
              fromVersion={snapshots[compareFrom].version}
              toVersion={snapshots[compareTo].version}
              isLoading={diffQuery.isFetching}
              onPartialRestore={() => setShowPartialDialog(true)}
              canRestore={Boolean(canPartialRestore && selectionHasChanges && !partialRestore.isPending)}
            />
          ) : selectedSnapshot ? (
            <SnapshotDetail
              key={selectedSnapshot.id}
              snapshot={selectedSnapshot}
              onRestore={() => setShowRestoreDialog(true)}
              onCompare={handleCompareToggle}
            />
          ) : null}
        </AnimatePresence>
      </CardContent>

      {/* Restore Dialog */}
      <RestoreDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        snapshot={selectedSnapshot}
        profileId={profileId}
        onConfirm={handleRestore}
      />

      <PartialRestoreDialog
        open={showPartialDialog}
        onOpenChange={setShowPartialDialog}
        selection={partialSelection}
        onSelectionChange={setPartialSelection}
        counts={diffCounts}
        onConfirm={handlePartialConfirm}
        disabled={!selectionHasChanges || !canPartialRestore}
        isSubmitting={partialRestore.isPending}
      />
    </Card>
  );
}

// Compact Version Badge for Profile List
export function VersionBadge({
  version,
  hasUpdates,
}: {
  version: number;
  hasUpdates?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'gap-1',
              hasUpdates && 'border-amber-500/50 bg-amber-500/10'
            )}
          >
            <History className="h-3 w-3" />
            v{version}
            {hasUpdates && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Session version {version}</p>
          {hasUpdates && (
            <p className="text-xs text-amber-500">Updates available</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TimeMachine;
