'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Globe,
  Zap,
  ArrowUpDown,
  Upload,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import {
  useProxies,
  useDeleteProxy,
  useCheckProxy,
  useCreateProxy,
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JP: '🇯🇵',
  CN: '🇨🇳',
  AU: '🇦🇺',
};

function TableSkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

export default function ProxiesPage() {
  const { toast } = useToast();
  const [selectedProxies, setSelectedProxies] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [proxyToDelete, setProxyToDelete] = React.useState<string | null>(null);
  const [testingProxies, setTestingProxies] = React.useState<string[]>([]);
  const [addProxyDialogOpen, setAddProxyDialogOpen] = React.useState(false);
  const [newProxy, setNewProxy] = React.useState({
    name: '',
    type: 'http' as 'http' | 'https' | 'socks4' | 'socks5',
    host: '',
    port: '',
    username: '',
    password: '',
    country: '',
  });

  // API hooks
  const { data: proxiesData, isLoading, refetch } = useProxies({
    search: searchQuery || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteProxy = useDeleteProxy();
  const checkProxy = useCheckProxy();
  const createProxy = useCreateProxy();

  const proxies = proxiesData?.items || [];

  const stats = {
    total: proxiesData?.total || 0,
    working: proxies.filter((p) => p.status === 'working').length,
    failed: proxies.filter((p) => p.status === 'failed').length,
  };

  const toggleSelectAll = () => {
    if (selectedProxies.length === proxies.length) {
      setSelectedProxies([]);
    } else {
      setSelectedProxies(proxies.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProxies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleTestProxy = async (proxyId: string) => {
    setTestingProxies((prev) => [...prev, proxyId]);
    try {
      await checkProxy.mutateAsync(proxyId);
      toast({
        title: 'Proxy tested',
        description: 'Proxy connection test completed.',
      });
    } catch (error) {
      toast({
        title: 'Test failed',
        description: error instanceof Error ? error.message : 'Failed to test proxy',
        variant: 'destructive',
      });
    } finally {
      setTestingProxies((prev) => prev.filter((id) => id !== proxyId));
    }
  };

  const handleTestAll = async () => {
    const proxyIds = proxies.map((p) => p.id);
    setTestingProxies(proxyIds);
    try {
      await Promise.all(proxyIds.map((id) => checkProxy.mutateAsync(id)));
      toast({
        title: 'All proxies tested',
        description: 'All proxy connection tests completed.',
      });
    } catch (error) {
      toast({
        title: 'Some tests failed',
        description: error instanceof Error
          ? error.message
          : 'Some proxy tests failed. Check individual statuses.',
        variant: 'destructive',
      });
    } finally {
      setTestingProxies([]);
    }
  };

  const handleDelete = async () => {
    if (proxyToDelete) {
      try {
        await deleteProxy.mutateAsync(proxyToDelete);
        toast({
          title: 'Proxy deleted',
          description: 'The proxy has been deleted.',
        });
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: error instanceof Error ? error.message : 'Failed to delete proxy',
          variant: 'destructive',
        });
      }
    } else if (selectedProxies.length > 0) {
      try {
        await Promise.all(selectedProxies.map((id) => deleteProxy.mutateAsync(id)));
        toast({
          title: 'Proxies deleted',
          description: `${selectedProxies.length} proxies have been deleted.`,
        });
        setSelectedProxies([]);
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: error instanceof Error ? error.message : 'Failed to delete proxies',
          variant: 'destructive',
        });
      }
    }
    setDeleteDialogOpen(false);
    setProxyToDelete(null);
  };

  const handleAddProxy = async () => {
    try {
      await createProxy.mutateAsync({
        name: newProxy.name,
        type: newProxy.type,
        host: newProxy.host,
        port: parseInt(newProxy.port, 10),
        username: newProxy.username || undefined,
        password: newProxy.password || undefined,
        country: newProxy.country || undefined,
      });
      toast({
        title: 'Proxy added',
        description: 'The new proxy has been added.',
      });
      setAddProxyDialogOpen(false);
      setNewProxy({
        name: '',
        type: 'http',
        host: '',
        port: '',
        username: '',
        password: '',
        country: '',
      });
    } catch (error) {
      toast({
        title: 'Failed to add proxy',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proxies</h1>
          <p className="text-muted-foreground">
            Manage your proxy connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestAll}
            disabled={testingProxies.length > 0 || proxies.length === 0}
          >
            {testingProxies.length > 0 ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            Test All
          </Button>
          <Button onClick={() => setAddProxyDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Proxy
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Proxies</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.working}</p>
              <p className="text-sm text-muted-foreground">Working</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search proxies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="https">HTTPS</SelectItem>
                <SelectItem value="socks4">SOCKS4</SelectItem>
                <SelectItem value="socks5">SOCKS5</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {selectedProxies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedProxies.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  setProxyToDelete(null);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Proxies Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-[40px] p-3">
                    <Checkbox
                      checked={
                        selectedProxies.length === proxies.length &&
                        proxies.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    <Button variant="ghost" size="sm" className="-ml-3">
                      Proxy
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Type</th>
                  <th className="p-3 text-left text-sm font-medium">Location</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Latency</th>
                  <th className="w-[100px] p-3"></th>
                </tr>
              </thead>
              <tbody>
                {proxies.map((proxy) => (
                  <tr
                    key={proxy.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedProxies.includes(proxy.id)}
                        onCheckedChange={() => toggleSelect(proxy.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{proxy.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {proxy.host}:{proxy.port}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="uppercase">
                        {proxy.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {proxy.country && (
                        <div className="flex items-center gap-2">
                          <span>{countryFlags[proxy.country] || '🌐'}</span>
                          <span className="text-sm">{proxy.country}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {testingProxies.includes(proxy.id) ? (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Testing...
                        </Badge>
                      ) : proxy.status === 'working' ? (
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-600"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Working
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-red-500 text-red-600"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      {proxy.latency ? (
                        <div className="flex items-center gap-2">
                          <Zap
                            className={`h-3 w-3 ${
                              proxy.latency < 100
                                ? 'text-green-500'
                                : proxy.latency < 200
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                          />
                          <span className="text-sm">{proxy.latency}ms</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTestProxy(proxy.id)}
                          disabled={testingProxies.includes(proxy.id)}
                        >
                          {testingProxies.includes(proxy.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/proxies/${proxy.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTestProxy(proxy.id)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setProxyToDelete(proxy.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && proxies.length === 0 && (
          <div className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No proxies found</p>
            <Button className="mt-4" onClick={() => setAddProxyDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first proxy
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Proxy{selectedProxies.length > 1 ? 'ies' : ''}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {proxyToDelete ? 'this proxy' : `${selectedProxies.length} proxies`}?
              Profiles using {proxyToDelete ? 'this proxy' : 'these proxies'} will have their proxy settings removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProxy.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProxy.isPending}
            >
              {deleteProxy.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Proxy Dialog */}
      <Dialog open={addProxyDialogOpen} onOpenChange={setAddProxyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Proxy</DialogTitle>
            <DialogDescription>
              Add a new proxy connection to your pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proxy-name">Name</Label>
              <Input
                id="proxy-name"
                placeholder="e.g., US Residential #1"
                value={newProxy.name}
                onChange={(e) => setNewProxy({ ...newProxy, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proxy-type">Type</Label>
                <Select
                  value={newProxy.type}
                  onValueChange={(value) =>
                    setNewProxy({ ...newProxy, type: value as typeof newProxy.type })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS</SelectItem>
                    <SelectItem value="socks4">SOCKS4</SelectItem>
                    <SelectItem value="socks5">SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxy-country">Country</Label>
                <Input
                  id="proxy-country"
                  placeholder="e.g., US"
                  value={newProxy.country}
                  onChange={(e) => setNewProxy({ ...newProxy, country: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="proxy-host">Host</Label>
                <Input
                  id="proxy-host"
                  placeholder="192.168.1.1"
                  value={newProxy.host}
                  onChange={(e) => setNewProxy({ ...newProxy, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxy-port">Port</Label>
                <Input
                  id="proxy-port"
                  placeholder="8080"
                  value={newProxy.port}
                  onChange={(e) => setNewProxy({ ...newProxy, port: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proxy-username">Username (optional)</Label>
                <Input
                  id="proxy-username"
                  placeholder="username"
                  value={newProxy.username}
                  onChange={(e) => setNewProxy({ ...newProxy, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxy-password">Password (optional)</Label>
                <Input
                  id="proxy-password"
                  type="password"
                  placeholder="password"
                  value={newProxy.password}
                  onChange={(e) => setNewProxy({ ...newProxy, password: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddProxyDialogOpen(false)}
              disabled={createProxy.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProxy}
              disabled={!newProxy.name || !newProxy.host || !newProxy.port || createProxy.isPending}
            >
              {createProxy.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Add Proxy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
