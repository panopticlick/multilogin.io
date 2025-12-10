'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Code,
  Share2,
  Filter,
  ArrowUpDown,
  FileCode,
  Terminal,
  ChevronRight,
  Edit,
  Globe,
} from 'lucide-react';
import { ActionBuilder } from '@/components/dashboard/action-builder';
import { useToast } from '@/hooks/use-toast';
import {
  useScripts,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
  useExecuteScript,
  useProfiles,
} from '@/hooks/use-api';

interface Script {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  steps: number; // Number of steps, not the actual steps
  stats: {
    runs: number;
    successRate: number;
    lastRun: number | null;
  };
  isPublic: boolean;
  category?: string;
  tags: string[];
}

interface ScriptStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

const categories = ['All', 'Authentication', 'Social Media', 'Data Collection', 'Testing', 'E-commerce', 'Other'];

// Loading skeleton component
function ScriptListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="p-2 rounded-lg h-9 w-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-3 w-[250px]" />
          </div>
          <div className="hidden lg:flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Script list item component
function ScriptListItem({
  script,
  isSelected,
  onSelect,
  onRun,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  script: Script;
  isSelected: boolean;
  onSelect: () => void;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      {/* Icon */}
      <div className="p-2 rounded-lg bg-primary/10">
        <Code className="h-5 w-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{script.name}</p>
          {script.isPublic && (
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{script.description}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{script.steps} steps</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            {script.stats.successRate}%
          </span>
          <span>•</span>
          <span>{script.stats.runs} runs</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden lg:flex items-center gap-1">
        {script.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {script.tags.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{script.tags.length - 2}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRun();
          }}
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

// Create script dialog
function CreateScriptDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; category: string }) => void;
  isLoading?: boolean;
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('Other');

  const handleSubmit = () => {
    if (!name.trim() || isLoading) return;
    onSubmit({ name, description, category });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Other');
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Script</DialogTitle>
          <DialogDescription>
            Build an automation script with the visual editor
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Script Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Automation Script"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this script do?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Script'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Run script dialog
function RunScriptDialog({
  script,
  open,
  onOpenChange,
  onRun,
  isLoading,
}: {
  script: Script | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: (profileId: string) => void;
  isLoading?: boolean;
}) {
  const [selectedProfile, setSelectedProfile] = React.useState('');
  const { data: profilesData, isLoading: profilesLoading } = useProfiles({ limit: 50 });

  const handleRun = () => {
    if (!selectedProfile || isLoading) return;
    onRun(selectedProfile);
  };

  React.useEffect(() => {
    if (!open) {
      setSelectedProfile('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run Script</DialogTitle>
          <DialogDescription>
            {script?.name} - Select a browser profile to run this script
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Profile</Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile} disabled={profilesLoading || isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={profilesLoading ? "Loading profiles..." : "Choose a profile..."} />
              </SelectTrigger>
              <SelectContent>
                {profilesData?.items?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
                {!profilesLoading && (!profilesData?.items || profilesData.items.length === 0) && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No profiles available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          {script && (
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Script Summary</p>
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="block text-foreground font-medium">{script.steps}</span>
                  Steps
                </div>
                <div>
                  <span className="block text-foreground font-medium">{script.stats.successRate}%</span>
                  Success Rate
                </div>
                <div>
                  <span className="block text-foreground font-medium">{script.stats.runs}</span>
                  Total Runs
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleRun} disabled={!selectedProfile || isLoading}>
            {isLoading ? (
              <>Running...</>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Script
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Scripts Page
export default function ScriptsPage() {
  const { toast } = useToast();
  const [selectedScript, setSelectedScript] = React.useState<Script | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [sortBy, setSortBy] = React.useState<'name' | 'updated' | 'runs'>('updated');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [runDialogOpen, setRunDialogOpen] = React.useState(false);
  const [scriptToRun, setScriptToRun] = React.useState<Script | null>(null);
  const [activeTab, setActiveTab] = React.useState('scripts');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [scriptToDelete, setScriptToDelete] = React.useState<string | null>(null);

  // API hooks
  const { data: scriptsData, isLoading: scriptsLoading, error: scriptsError } = useScripts();
  const createScript = useCreateScript();
  const updateScript = useUpdateScript();
  const deleteScript = useDeleteScript();
  const executeScript = useExecuteScript();

  const scripts = React.useMemo(
    () => scriptsData?.items ?? [],
    [scriptsData?.items]
  );

  // Filter and sort scripts
  const filteredScripts = React.useMemo(() => {
    let result = [...scripts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description?.toLowerCase().includes(query) ?? false) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter((s) => s.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'updated':
        result.sort((a, b) => (b.stats?.lastRun || 0) - (a.stats?.lastRun || 0));
        break;
      case 'runs':
        result.sort((a, b) => (b.stats?.runs || 0) - (a.stats?.runs || 0));
        break;
    }

    // Favorites first (not supported in API yet, skip)
    // result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

    return result;
  }, [scripts, searchQuery, categoryFilter, sortBy]);

  const handleCreateScript = async (data: { name: string; description: string; category: string }) => {
    try {
      await createScript.mutateAsync({
        name: data.name,
        description: data.description,
        steps: [],
      });

      toast({
        title: 'Script created',
        description: `${data.name} has been created successfully.`,
      });

      setCreateDialogOpen(false);
      // Note: result only contains { id, name }, not full script data
      // setSelectedScript(result);
      // setIsEditing(true);
    } catch (error: any) {
      toast({
        title: 'Failed to create script',
        description: error.message || 'An error occurred while creating the script.',
        variant: 'destructive',
      });
    }
  };

  const handleRunScript = (script: Script) => {
    setScriptToRun(script);
    setRunDialogOpen(true);
  };

  const handleStartExecution = async (profileId: string) => {
    if (!scriptToRun) return;

    try {
      await executeScript.mutateAsync({
        scriptId: scriptToRun.id,
        profileId,
        variables: {},
      });

      toast({
        title: 'Script execution started',
        description: `${scriptToRun.name} is now running on the selected profile.`,
        variant: 'success' as any,
      });

      setRunDialogOpen(false);
      setActiveTab('executions');
    } catch (error: any) {
      toast({
        title: 'Failed to execute script',
        description: error.message || 'An error occurred while executing the script.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    setScriptToDelete(scriptId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteScript = async () => {
    if (!scriptToDelete) return;

    try {
      await deleteScript.mutateAsync(scriptToDelete);

      toast({
        title: 'Script deleted',
        description: 'The script has been deleted successfully.',
        variant: 'success' as any,
      });

      if (selectedScript?.id === scriptToDelete) {
        setSelectedScript(null);
        setIsEditing(false);
      }

      setDeleteDialogOpen(false);
      setScriptToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Failed to delete script',
        description: error.message || 'An error occurred while deleting the script.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateScript = async (script: Script) => {
    try {
      await createScript.mutateAsync({
        name: `${script.name} (copy)`,
        description: script.description,
        steps: [],
      });

      toast({
        title: 'Script duplicated',
        description: `${script.name} has been duplicated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to duplicate script',
        description: error.message || 'An error occurred while duplicating the script.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveScript = async (steps: ScriptStep[]) => {
    if (!selectedScript) return;

    try {
      await updateScript.mutateAsync({
        id: selectedScript.id,
        data: { steps },
      });

      toast({
        title: 'Script saved',
        description: 'Your changes have been saved successfully.',
      });

      // Note: We don't update selectedScript here as it would cause type mismatch
      // React Query will automatically refresh the data
    } catch (error: any) {
      toast({
        title: 'Failed to save script',
        description: error.message || 'An error occurred while saving the script.',
        variant: 'destructive',
      });
    }
  };

  if (isEditing && selectedScript) {
    return (
      <div className="space-y-4">
        {/* Edit Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setSelectedScript(null);
              }}
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Scripts
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">{selectedScript.name}</h1>
          </div>
        </div>

        {/* Action Builder */}
        <ActionBuilder
          initialSteps={selectedScript.steps as any}
          scriptName={selectedScript.name}
          onSave={handleSaveScript as any}
          onRun={() => handleRunScript(selectedScript)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scripts & Automation</h1>
          <p className="text-muted-foreground">
            Create and manage browser automation scripts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Script
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scripts" className="gap-2">
            <FileCode className="h-4 w-4" />
            Scripts
            {!scriptsLoading && (
              <Badge variant="secondary" className="ml-1">
                {scriptsData?.total || 0}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="executions" className="gap-2">
            <Terminal className="h-4 w-4" />
            Executions
          </TabsTrigger>
        </TabsList>

        {/* Scripts Tab */}
        <TabsContent value="scripts" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="runs">Most Runs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scripts List */}
          {scriptsLoading ? (
            <ScriptListSkeleton />
          ) : scriptsError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
                <p className="font-medium">Failed to load scripts</p>
                <p className="text-sm text-muted-foreground">
                  {scriptsError.message || 'An error occurred while loading scripts.'}
                </p>
              </CardContent>
            </Card>
          ) : filteredScripts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="font-medium">No scripts found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== 'All'
                    ? 'Try adjusting your filters'
                    : 'Create your first automation script'}
                </p>
                {!searchQuery && categoryFilter === 'All' && (
                  <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Script
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredScripts.map((script) => (
                  <ScriptListItem
                    key={script.id}
                    script={script}
                    isSelected={selectedScript?.id === script.id}
                    onSelect={() => setSelectedScript(script)}
                    onRun={() => handleRunScript(script)}
                    onEdit={() => {
                      setSelectedScript(script);
                      setIsEditing(true);
                    }}
                    onDelete={() => handleDeleteScript(script.id)}
                    onDuplicate={() => handleDuplicateScript(script)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Terminal className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium">Executions coming soon</p>
              <p className="text-sm text-muted-foreground">
                Script execution tracking will be available in the next update
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateScriptDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateScript}
        isLoading={createScript.isPending}
      />

      <RunScriptDialog
        script={scriptToRun}
        open={runDialogOpen}
        onOpenChange={setRunDialogOpen}
        onRun={handleStartExecution}
        isLoading={executeScript.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Script</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this script? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteScript.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteScript}
              disabled={deleteScript.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteScript.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
