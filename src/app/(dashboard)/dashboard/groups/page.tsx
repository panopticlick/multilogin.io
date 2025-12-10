'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '@/hooks/use-api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Play,
  Palette,
  Check,
  FolderPlus,
} from 'lucide-react';

// Types
interface ProfileGroup {
  id: string;
  name: string;
  color: string;
  description: string | null;
  profileCount: number;
}

// Predefined colors
const colors = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
];

// Color Picker Component
function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={cn(
            'w-6 h-6 rounded-full transition-all',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
            value === color.value && 'ring-2 ring-offset-2 ring-primary'
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        >
          {value === color.value && (
            <Check className="h-4 w-4 text-white mx-auto" />
          )}
        </button>
      ))}
    </div>
  );
}

// Create/Edit Group Dialog
function GroupDialog({
  group,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: {
  group?: ProfileGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; color: string; description?: string }) => Promise<void>;
  isLoading?: boolean;
}) {
  const [name, setName] = React.useState(group?.name || '');
  const [color, setColor] = React.useState(group?.color || colors[0].value);
  const [description, setDescription] = React.useState(group?.description || '');

  React.useEffect(() => {
    if (group) {
      setName(group.name);
      setColor(group.color);
      setDescription(group.description || '');
    } else {
      setName('');
      setColor(colors[0].value);
      setDescription('');
    }
  }, [group, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ name, color, description: description || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {group ? 'Edit Group' : 'Create Group'}
            </DialogTitle>
            <DialogDescription>
              {group
                ? 'Update the group details below.'
                : 'Create a new group to organize your profiles.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <FolderOpen className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="font-medium">{name || 'Group Name'}</p>
                <p className="text-sm text-muted-foreground">
                  {description || 'No description'}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name..."
                required
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name || isLoading}>
              {isLoading ? 'Saving...' : group ? 'Save Changes' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteDialog({
  group,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  group: ProfileGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}) {
  if (!group) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Group</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{group.name}&quot;?
            {group.profileCount > 0 && (
              <span className="block mt-2 text-amber-500">
                This group contains {group.profileCount} profile(s). They will be
                ungrouped but not deleted.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Loading Skeleton Component
function GroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

// Group Card Component
function GroupCard({
  group,
  onEdit,
  onDelete,
  onViewProfiles,
}: {
  group: ProfileGroup;
  onEdit: () => void;
  onDelete: () => void;
  onViewProfiles: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className="group hover:border-primary/50 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            {/* Icon and Info */}
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${group.color}20` }}
              >
                <FolderOpen className="h-6 w-6" style={{ color: group.color }} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {group.profileCount} profile{group.profileCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewProfiles}>
                  <Users className="h-4 w-4 mr-2" />
                  View Profiles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Action */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={onViewProfiles}
          >
            <Play className="h-4 w-4 mr-2" />
            Launch All
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Groups Page
export default function GroupsPage() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editGroup, setEditGroup] = React.useState<ProfileGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = React.useState<ProfileGroup | null>(null);

  // API hooks
  const { data: groups = [], isLoading, error, refetch } = useGroups();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  // Filter groups
  const filteredGroups = React.useMemo(() => {
    if (!search) return groups;
    const searchLower = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchLower) ||
        g.description?.toLowerCase().includes(searchLower)
    );
  }, [groups, search]);

  // Stats
  const totalProfiles = groups.reduce((sum, g) => sum + g.profileCount, 0);

  const handleCreate = async (data: {
    name: string;
    color: string;
    description?: string;
  }) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'Group created successfully',
      });
      setCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create group',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (data: {
    name: string;
    color: string;
    description?: string;
  }) => {
    if (!editGroup) return;
    try {
      await updateMutation.mutateAsync({
        id: editGroup.id,
        data,
      });
      toast({
        title: 'Success',
        description: 'Group updated successfully',
      });
      setEditGroup(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update group',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteGroup) return;
    try {
      await deleteMutation.mutateAsync(deleteGroup.id);
      toast({
        title: 'Success',
        description: 'Group deleted successfully',
      });
      setDeleteGroup(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Organize your profiles into groups
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-6">
            <div>
              <p className="font-semibold">Failed to load groups</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Please retry in a moment.'}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold">{groups.length}</p>
                    <p className="text-sm text-muted-foreground">Total Groups</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold">{totalProfiles}</p>
                    <p className="text-sm text-muted-foreground">Grouped Profiles</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Palette className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{colors.length}</p>
                <p className="text-sm text-muted-foreground">Available Colors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="font-medium">
              {search ? 'No groups found' : 'No groups yet'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? 'Try a different search term'
                : 'Create your first group to organize profiles'}
            </p>
            {!search && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={() => setEditGroup(group)}
                onDelete={() => setDeleteGroup(group)}
                onViewProfiles={() => {
                  // Navigate to profiles with group filter
                  window.location.href = `/dashboard/profiles?group=${group.id}`;
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Dialog */}
      <GroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <GroupDialog
        group={editGroup || undefined}
        open={!!editGroup}
        onOpenChange={(open) => !open && setEditGroup(null)}
        onSave={handleEdit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        group={deleteGroup}
        open={!!deleteGroup}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
