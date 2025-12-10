'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ProfileAvatar } from '@/components/ui/avatar';
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
  Play,
  Pencil,
  Copy,
  Trash2,
  Download,
  Upload,
  Grid3x3,
  List,
  ArrowUpDown,
  FolderOpen,
  RefreshCw,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  useProfiles,
  useGroups,
  useDeleteProfile,
  useBulkDeleteProfiles,
  useLaunchProfile,
  useAddProfilesToGroup,
  useDuplicateProfile,
  useExportProfiles,
  useImportProfiles,
  useRegenerateFingerprint,
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

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

function TableSkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function ProfilesPage() {
  const { toast } = useToast();
  const [view, setView] = React.useState<'grid' | 'list'>('list');
  const [selectedProfiles, setSelectedProfiles] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [groupFilter, setGroupFilter] = React.useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [profileToDelete, setProfileToDelete] = React.useState<string | null>(null);
  const [moveToGroupDialogOpen, setMoveToGroupDialogOpen] = React.useState(false);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Debounce search query for API calls (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API hooks
  const { data: profilesData, isLoading: profilesLoading, refetch: refetchProfiles } = useProfiles({
    search: debouncedSearchQuery || undefined,
    groupId: groupFilter !== 'all' ? groupFilter : undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'available' | 'in_use' | 'locked') : undefined,
  });
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const deleteProfile = useDeleteProfile();
  const bulkDeleteProfiles = useBulkDeleteProfiles();
  const launchProfile = useLaunchProfile();
  const addProfilesToGroup = useAddProfilesToGroup();
  const duplicateProfile = useDuplicateProfile();
  const exportProfiles = useExportProfiles();
  const importProfiles = useImportProfiles();
  const regenerateFingerprint = useRegenerateFingerprint();

  const profiles = profilesData?.items || [];

  const toggleSelectAll = () => {
    if (selectedProfiles.length === profiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(profiles.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (profileToDelete) {
      try {
        await deleteProfile.mutateAsync(profileToDelete);
        toast({
          title: 'Profile deleted',
          description: 'The profile has been deleted successfully.',
        });
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: error instanceof Error ? error.message : 'Failed to delete profile',
          variant: 'destructive',
        });
      }
    } else if (selectedProfiles.length > 0) {
      try {
        await bulkDeleteProfiles.mutateAsync(selectedProfiles);
        toast({
          title: 'Profiles deleted',
          description: `${selectedProfiles.length} profiles have been deleted.`,
        });
        setSelectedProfiles([]);
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: error instanceof Error ? error.message : 'Failed to delete profiles',
          variant: 'destructive',
        });
      }
    }
    setDeleteDialogOpen(false);
    setProfileToDelete(null);
  };

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

  const handleMoveToGroup = async () => {
    if (!selectedGroupId || selectedProfiles.length === 0) return;
    try {
      await addProfilesToGroup.mutateAsync({
        groupId: selectedGroupId,
        profileIds: selectedProfiles,
      });
      toast({
        title: 'Profiles moved',
        description: `${selectedProfiles.length} profiles have been moved to the group.`,
      });
      setSelectedProfiles([]);
      setMoveToGroupDialogOpen(false);
      setSelectedGroupId('');
    } catch (error) {
      toast({
        title: 'Move failed',
        description: error instanceof Error ? error.message : 'Failed to move profiles',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (profileId: string, profileName: string) => {
    try {
      const result = await duplicateProfile.mutateAsync({ id: profileId });
      toast({
        title: 'Profile duplicated',
        description: `"${profileName}" duplicated as "${result.name}".`,
      });
    } catch (error) {
      toast({
        title: 'Duplicate failed',
        description: error instanceof Error ? error.message : 'Failed to duplicate profile',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateFingerprint = async (profileId: string) => {
    try {
      await regenerateFingerprint.mutateAsync(profileId);
      toast({
        title: 'Fingerprint regenerated',
        description: 'The profile fingerprint has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Regeneration failed',
        description: error instanceof Error ? error.message : 'Failed to regenerate fingerprint',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const ids = selectedProfiles.length > 0 ? selectedProfiles : undefined;
      const result = await exportProfiles.mutateAsync(ids);

      // Download as JSON file
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `multilogin-profiles-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `${result.profiles.length} profiles exported.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export profiles',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;

    try {
      const parsed = JSON.parse(importText);
      const profilesToImport = parsed.profiles || parsed;

      if (!Array.isArray(profilesToImport)) {
        throw new Error('Invalid format: expected an array of profiles');
      }

      const result = await importProfiles.mutateAsync(profilesToImport);

      toast({
        title: 'Import complete',
        description: `${result.imported} profiles imported, ${result.failed} failed.`,
      });

      setImportDialogOpen(false);
      setImportText('');
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import profiles',
        variant: 'destructive',
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const isLoading = profilesLoading || groupsLoading;
  const isMutating = deleteProfile.isPending || bulkDeleteProfiles.isPending || launchProfile.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            Manage your browser profiles and fingerprints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            disabled={importProfiles.isPending}
          >
            {importProfiles.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportProfiles.isPending}
          >
            {exportProfiles.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/profiles/new">
              <Plus className="h-4 w-4 mr-2" />
              New Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetchProfiles()}>
              <RefreshCw className={`h-4 w-4 ${profilesLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {selectedProfiles.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedProfiles.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMoveToGroupDialogOpen(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Move to Group
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setProfileToDelete(null);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <div className="flex items-center border rounded-md">
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setView('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Profiles List/Grid */}
      {isLoading ? (
        <Card>
          <TableSkeleton />
        </Card>
      ) : view === 'list' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-[40px] p-3">
                    <Checkbox
                      checked={
                        selectedProfiles.length === profiles.length &&
                        profiles.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    <Button variant="ghost" size="sm" className="-ml-3">
                      Profile
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Template</th>
                  <th className="p-3 text-left text-sm font-medium">Group</th>
                  <th className="p-3 text-left text-sm font-medium">Tags</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Last Active</th>
                  <th className="w-[100px] p-3"></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const profileGroupId = (profile as { groupId?: string }).groupId;
                  const group = groups?.find((g) => profileGroupId === g.id);
                  return (
                    <tr
                      key={profile.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedProfiles.includes(profile.id)}
                          onCheckedChange={() => toggleSelect(profile.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar profile={{ name: profile.name, templateId: profile.templateId }} size="sm" />
                          <div>
                            <p className="font-medium">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {profile.launchCount} launches
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{profile.templateId}</span>
                      </td>
                      <td className="p-3">
                        {group ? (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: group.color,
                              color: group.color,
                            }}
                          >
                            {group.name}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {profile.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {profile.tags && profile.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={profile.status as 'available' | 'in_use' | 'locked'} />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(profile.lastActive)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant={profile.status === 'in_use' ? 'outline' : 'default'}
                            disabled={profile.status === 'in_use' || isMutating}
                            onClick={() => handleLaunch(profile.id, profile.name)}
                          >
                            {launchProfile.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 mr-1" />
                            )}
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
                                <Link href={`/dashboard/profiles/${profile.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(profile.id, profile.name)}
                                disabled={duplicateProfile.isPending}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRegenerateFingerprint(profile.id)}
                                disabled={regenerateFingerprint.isPending || profile.status === 'in_use'}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate Fingerprint
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(profile.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {profiles.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No profiles found</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/profiles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first profile
                </Link>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => {
            const profileGroupId = (profile as { groupId?: string }).groupId;
            const group = groups?.find((g) => profileGroupId === g.id);
            return (
              <Card key={profile.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <ProfileAvatar profile={{ name: profile.name, templateId: profile.templateId }} size="lg" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/profiles/${profile.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(profile.id, profile.name)}
                        disabled={duplicateProfile.isPending}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRegenerateFingerprint(profile.id)}
                        disabled={regenerateFingerprint.isPending || profile.status === 'in_use'}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate Fingerprint
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-medium truncate">{profile.name}</h3>
                <p className="text-sm text-muted-foreground truncate mb-3">
                  {profile.templateId}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={profile.status as 'available' | 'in_use' | 'locked'} />
                  {group && (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: group.color,
                        color: group.color,
                      }}
                    >
                      {group.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{profile.launchCount} launches</span>
                  <span>{formatRelativeTime(profile.lastActive)}</span>
                </div>
                <Button
                  className="w-full"
                  variant={profile.status === 'in_use' ? 'outline' : 'default'}
                  disabled={profile.status === 'in_use' || isMutating}
                  onClick={() => handleLaunch(profile.id, profile.name)}
                >
                  {launchProfile.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {profile.status === 'in_use' ? 'In Use' : 'Launch'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination info */}
      {profilesData && profilesData.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {profiles.length} of {profilesData.total} profiles
          </span>
          {profilesData.totalPages > 1 && (
            <span>Page {profilesData.page} of {profilesData.totalPages}</span>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile{selectedProfiles.length > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {profileToDelete ? 'this profile' : `${selectedProfiles.length} profiles`}?
              This action cannot be undone and all session data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProfile.isPending || bulkDeleteProfiles.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProfile.isPending || bulkDeleteProfiles.isPending}
            >
              {(deleteProfile.isPending || bulkDeleteProfiles.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Group Dialog */}
      <Dialog open={moveToGroupDialogOpen} onOpenChange={setMoveToGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Group</DialogTitle>
            <DialogDescription>
              Select a group to move {selectedProfiles.length} profile{selectedProfiles.length > 1 ? 's' : ''} to.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups?.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    {group.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMoveToGroupDialogOpen(false)}
              disabled={addProfilesToGroup.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMoveToGroup}
              disabled={!selectedGroupId || addProfilesToGroup.isPending}
            >
              {addProfilesToGroup.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Profiles</DialogTitle>
            <DialogDescription>
              Import profiles from a JSON file. You can use the Export feature to create compatible files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                or paste JSON below
              </span>
            </div>
            <textarea
              className="w-full h-48 p-3 text-sm font-mono rounded-md border bg-muted/50 resize-none"
              placeholder='{"profiles": [{"name": "Profile 1", "templateId": "chrome_win10", ...}]}'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required fields: name, templateId. Optional: groupId, tags, timezone, language, proxy, notes
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportText('');
              }}
              disabled={importProfiles.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importText.trim() || importProfiles.isPending}
            >
              {importProfiles.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
