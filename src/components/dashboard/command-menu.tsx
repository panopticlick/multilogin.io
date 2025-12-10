'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  Globe,
  Settings,
  Key,
  FolderOpen,
  Plus,
  Search,
  Moon,
  Sun,
  Laptop,
  FileText,
  Activity,
  Play,
  Clock,
  Heart,
  Fingerprint,
  History,
  Zap,
  HelpCircle,
  Keyboard,
  Chrome,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCommandPaletteStore } from '@/store';

// Mock profiles for search - in production this would come from API/store
const mockProfiles = [
  { id: 'prf_1', name: 'Chrome - Shopping US', status: 'available', template: 'Windows Chrome' },
  { id: 'prf_2', name: 'Safari - Social Media', status: 'in_use', template: 'macOS Safari' },
  { id: 'prf_3', name: 'Firefox - Research', status: 'available', template: 'Windows Firefox' },
  { id: 'prf_4', name: 'Chrome - Marketing', status: 'available', template: 'Linux Chrome' },
  { id: 'prf_5', name: 'Edge - Testing', status: 'available', template: 'Windows Edge' },
  { id: 'prf_6', name: 'Chrome - Amazon Store', status: 'available', template: 'Windows Chrome' },
];

// Mock scripts for quick run
const mockScripts = [
  { id: 'scr_1', name: 'Amazon Login', steps: 5, category: 'Shopping' },
  { id: 'scr_2', name: 'Instagram Like', steps: 3, category: 'Social' },
  { id: 'scr_3', name: 'Form Fill', steps: 8, category: 'Automation' },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const { setTheme } = useTheme();
  const { recentCommands, addRecentCommand } = useCommandPaletteStore();

  // Keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd+K to open
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
      // Additional shortcuts when command palette is closed
      if (!open) {
        // Cmd+N for new profile
        if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          router.push('/dashboard/profiles/new');
        }
        // Cmd+P for profiles
        if (e.key === 'p' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
          e.preventDefault();
          router.push('/dashboard/profiles');
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, router]);

  const runCommand = React.useCallback((command: () => unknown, commandId?: string) => {
    setOpen(false);
    setSearch('');
    if (commandId) {
      addRecentCommand(commandId);
    }
    command();
  }, [addRecentCommand]);

  // Filter profiles based on search
  const filteredProfiles = React.useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return mockProfiles.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.template.toLowerCase().includes(lowerSearch)
    ).slice(0, 5);
  }, [search]);

  // Filter scripts based on search
  const filteredScripts = React.useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return mockScripts.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerSearch) ||
        s.category.toLowerCase().includes(lowerSearch)
    ).slice(0, 3);
  }, [search]);

  const launchProfile = (profileId: string) => {
    console.log('Launching profile:', profileId);
    // In production, this would call the API
  };

  const runScript = (scriptId: string, profileId?: string) => {
    console.log('Running script:', scriptId, 'on profile:', profileId);
    // In production, this would call the API
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search profiles, run scripts, or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[500px]">
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for profiles, scripts, or navigation
            </p>
          </div>
        </CommandEmpty>

        {/* Profile Search Results */}
        {filteredProfiles.length > 0 && (
          <>
            <CommandGroup heading="Profiles">
              {filteredProfiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  onSelect={() =>
                    runCommand(() => launchProfile(profile.id), `launch:${profile.id}`)
                  }
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <span>{profile.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {profile.template}
                    </span>
                  </div>
                  <Badge
                    variant={profile.status === 'available' ? 'secondary' : 'default'}
                    className="ml-2"
                  >
                    {profile.status === 'available' ? 'Ready' : 'In Use'}
                  </Badge>
                  {profile.status === 'available' && (
                    <Play className="ml-2 h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Script Search Results */}
        {filteredScripts.length > 0 && (
          <>
            <CommandGroup heading="Scripts">
              {filteredScripts.map((script) => (
                <CommandItem
                  key={script.id}
                  onSelect={() =>
                    runCommand(() => runScript(script.id), `script:${script.id}`)
                  }
                >
                  <Zap className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <span>{script.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {script.steps} steps
                    </span>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {script.category}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Recent Commands */}
        {recentCommands.length > 0 && !search && (
          <>
            <CommandGroup heading="Recent">
              {recentCommands.slice(0, 3).map((cmd) => (
                <CommandItem key={cmd} onSelect={() => {}}>
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{cmd}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/profiles/new'), 'new-profile')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Profile
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/proxies/new'), 'new-proxy')}
          >
            <Globe className="mr-2 h-4 w-4" />
            Add New Proxy
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/scripts/new'), 'new-script')}
          >
            <Zap className="mr-2 h-4 w-4" />
            Create Automation Script
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/groups/new'), 'new-group')}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Create Group
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard'), 'nav-dashboard')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/profiles'), 'nav-profiles')}
          >
            <Users className="mr-2 h-4 w-4" />
            Profiles
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/groups'), 'nav-groups')}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Groups
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/proxies'), 'nav-proxies')}
          >
            <Globe className="mr-2 h-4 w-4" />
            Proxies
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/scripts'), 'nav-scripts')}
          >
            <Zap className="mr-2 h-4 w-4" />
            Automation Scripts
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/health'), 'nav-health')}
          >
            <Heart className="mr-2 h-4 w-4" />
            System Health
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Tools */}
        <CommandGroup heading="Tools">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/fingerprints'), 'nav-fingerprints')}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            Fingerprint Manager
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/time-machine'), 'nav-timemachine')}
          >
            <History className="mr-2 h-4 w-4" />
            Time Machine
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/audit'), 'nav-audit')}
          >
            <Activity className="mr-2 h-4 w-4" />
            Audit Log
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/team'), 'nav-team')}
          >
            <Users className="mr-2 h-4 w-4" />
            Team Settings
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/api-keys'), 'nav-apikeys')}
          >
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard/settings'), 'nav-settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Theme */}
        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'), 'theme-light')}>
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'), 'theme-dark')}>
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'), 'theme-system')}>
            <Laptop className="mr-2 h-4 w-4" />
            System Theme
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Help */}
        <CommandGroup heading="Help">
          <CommandItem
            onSelect={() => runCommand(() => window.open('/docs', '_blank'), 'help-docs')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Documentation
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {}, 'help-shortcuts')}
          >
            <Keyboard className="mr-2 h-4 w-4" />
            Keyboard Shortcuts
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => window.open('/support', '_blank'), 'help-support')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Get Support
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Footer with keyboard hints */}
      <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
          <span>Navigate</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
          <span>Select</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
          <span>Close</span>
        </div>
      </div>
    </CommandDialog>
  );
}

// Keyboard shortcut indicator component for headers
export function KeyboardShortcutHint() {
  return (
    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘</kbd>
      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">K</kbd>
    </div>
  );
}
