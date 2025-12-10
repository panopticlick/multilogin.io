'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Key,
  Plus,
  Copy,
  Check,
  MoreHorizontal,
  Trash2,
  Clock,
  Shield,
  AlertTriangle,
  Activity,
  RefreshCw,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useAPIKeys, useCreateAPIKey, useRevokeAPIKey } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

// Types
interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: number | null;
  expiresAt: number | null;
  createdAt: number;
}

// Available permissions
const availablePermissions = [
  {
    id: 'profiles:read',
    label: 'Read Profiles',
    description: 'View profile information',
  },
  {
    id: 'profiles:write',
    label: 'Write Profiles',
    description: 'Create, update, and delete profiles',
  },
  {
    id: 'profiles:launch',
    label: 'Launch Profiles',
    description: 'Start browser sessions',
  },
  {
    id: 'proxies:read',
    label: 'Read Proxies',
    description: 'View proxy configurations',
  },
  {
    id: 'proxies:write',
    label: 'Write Proxies',
    description: 'Manage proxy settings',
  },
  {
    id: 'sync:read',
    label: 'Read Sync Data',
    description: 'Access session data',
  },
  {
    id: 'sync:write',
    label: 'Write Sync Data',
    description: 'Upload session data',
  },
];

// Create API Key Dialog
function CreateKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [expiresIn, setExpiresIn] = React.useState<string>('90');
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  const createAPIKey = useCreateAPIKey();
  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : 'Failed to create API key';

  const handleCreate = async () => {
    try {
      // Calculate expiration timestamp
      let expiresAt: number | undefined;
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn, 10);
        expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      }

      const result = await createAPIKey.mutateAsync({
        name,
        permissions: selectedPermissions,
        expiresAt,
      });

      setGeneratedKey(result.key);

      toast({
        title: 'API Key Created',
        description: 'Your new API key has been generated successfully.',
      });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: getErrorMessage(error),
      });
    }
  };

  const handleCopy = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedPermissions([]);
    setExpiresIn('90');
    setGeneratedKey(null);
    onOpenChange(false);
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={generatedKey ? handleClose : onOpenChange}>
      <DialogContent className="max-w-lg">
        {generatedKey ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>
              <DialogTitle className="text-center">API Key Created</DialogTitle>
              <DialogDescription className="text-center">
                Copy your API key now. You won&apos;t be able to see it again.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm">
                <code className="flex-1 break-all">{generatedKey}</code>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-500">Important</p>
                    <p className="text-muted-foreground">
                      Store this key securely. It won&apos;t be shown again.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production API"
                />
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid gap-2 border rounded-lg p-3">
                  {availablePermissions.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded"
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{perm.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expires">Expiration</Label>
                <select
                  id="expires"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border bg-background"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name || selectedPermissions.length === 0 || createAPIKey.isPending}
              >
                {createAPIKey.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Create Key
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Revoke Confirmation Dialog
function RevokeDialog({
  apiKey,
  open,
  onOpenChange,
}: {
  apiKey: APIKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const revokeAPIKey = useRevokeAPIKey();
  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : 'Failed to revoke API key';

  if (!apiKey) return null;

  const handleConfirm = async () => {
    try {
      await revokeAPIKey.mutateAsync(apiKey.id);

      toast({
        title: 'API Key Revoked',
        description: `"${apiKey.name}" has been revoked successfully.`,
      });

      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke &quot;{apiKey.name}&quot;? This action
            cannot be undone and any applications using this key will stop working.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={revokeAPIKey.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={revokeAPIKey.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {revokeAPIKey.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke Key'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// API Key Card
function APIKeyCard({
  apiKey,
  onRevoke,
}: {
  apiKey: APIKey;
  onRevoke: () => void;
}) {
  const [now, setNow] = React.useState(0);
  React.useEffect(() => {
    setNow(Date.now());
  }, []);
  const isExpiringSoon =
    apiKey.expiresAt && apiKey.expiresAt - now < 7 * 24 * 60 * 60 * 1000;
  const isExpired = apiKey.expiresAt && apiKey.expiresAt < now;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(isExpired && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{apiKey.name}</h3>
                  {isExpired && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <Badge className="bg-amber-500/10 text-amber-500 border-0">
                      Expires soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {apiKey.keyPrefix}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRevoke} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Permissions */}
          <div className="flex flex-wrap gap-1 mt-3">
            {apiKey.permissions.map((perm) => (
              <Badge key={perm} variant="secondary" className="text-xs">
                {perm}
              </Badge>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {format(new Date(apiKey.createdAt), 'MMM d, yyyy')}
            </span>
            {apiKey.lastUsedAt && (
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Last used {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}
              </span>
            )}
            {apiKey.expiresAt && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  isExpiringSoon && 'text-amber-500',
                  isExpired && 'text-destructive'
                )}
              >
                <Clock className="h-3 w-3" />
                {isExpired
                  ? 'Expired'
                  : `Expires ${formatDistanceToNow(new Date(apiKey.expiresAt), { addSuffix: true })}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading Skeleton
function APIKeysSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main API Keys Page
export default function APIKeysPage() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [revokeKey, setRevokeKey] = React.useState<APIKey | null>(null);
  const errorMessage = (err: unknown) =>
    err instanceof Error ? err.message : 'An error occurred';

  const { data: keys = [], isLoading, error } = useAPIKeys();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Key
        </Button>
      </div>

      {/* Documentation Link */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">API Documentation</p>
              <p className="text-sm text-muted-foreground">
                Learn how to use the Multilogin API
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href="/docs/api" target="_blank">
              View Docs
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Keys List */}
      {isLoading ? (
        <APIKeysSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
            <p className="font-medium">Failed to load API keys</p>
            <p className="text-sm text-muted-foreground mb-4">
              {errorMessage(error)}
            </p>
          </CardContent>
        </Card>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="font-medium">No API keys</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first API key to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {keys.map((key) => (
              <APIKeyCard
                key={key.id}
                apiKey={key}
                onRevoke={() => setRevokeKey(key)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Use environment variables to store API keys, never hardcode them
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Create separate keys for development and production
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Grant only the minimum permissions required
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Rotate keys regularly and revoke unused ones
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Revoke Dialog */}
      <RevokeDialog
        apiKey={revokeKey}
        open={!!revokeKey}
        onOpenChange={(open) => !open && setRevokeKey(null)}
      />
    </div>
  );
}
