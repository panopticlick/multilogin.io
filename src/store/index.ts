import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Profile,
  ProfileGroup,
  Team,
  TeamMember,
  DashboardStats,
  SystemHealth,
  ProfileHealth,
  SessionSnapshot,
  AutomationScript,
  ActionStep,
  UserPresence,
  ProfileLock,
  Notification,
} from '@/types';

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'multilogin-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Dashboard Store
interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: true,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Profile Store
interface ProfileState {
  profiles: Profile[];
  selectedProfiles: string[];
  currentProfile: Profile | null;
  groups: ProfileGroup[];
  isLoading: boolean;
  searchQuery: string;
  filterGroup: string | null;
  filterStatus: string | null;
  sortBy: 'name' | 'lastActive' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  viewMode: 'table' | 'grid';

  // Actions
  setProfiles: (profiles: Profile[]) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  removeProfile: (id: string) => void;
  setSelectedProfiles: (ids: string[]) => void;
  toggleProfileSelection: (id: string) => void;
  selectAllProfiles: () => void;
  clearSelection: () => void;
  setCurrentProfile: (profile: Profile | null) => void;
  setGroups: (groups: ProfileGroup[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterGroup: (groupId: string | null) => void;
  setFilterStatus: (status: string | null) => void;
  setSortBy: (sortBy: 'name' | 'lastActive' | 'createdAt') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setViewMode: (mode: 'table' | 'grid') => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      selectedProfiles: [],
      currentProfile: null,
      groups: [],
      isLoading: true,
      searchQuery: '',
      filterGroup: null,
      filterStatus: null,
      sortBy: 'lastActive',
      sortOrder: 'desc',
      viewMode: 'table',

      setProfiles: (profiles) => set({ profiles }),
      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),
      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          selectedProfiles: state.selectedProfiles.filter((pid) => pid !== id),
        })),
      setSelectedProfiles: (ids) => set({ selectedProfiles: ids }),
      toggleProfileSelection: (id) =>
        set((state) => ({
          selectedProfiles: state.selectedProfiles.includes(id)
            ? state.selectedProfiles.filter((pid) => pid !== id)
            : [...state.selectedProfiles, id],
        })),
      selectAllProfiles: () =>
        set((state) => ({
          selectedProfiles: state.profiles.map((p) => p.id),
        })),
      clearSelection: () => set({ selectedProfiles: [] }),
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      setGroups: (groups) => set({ groups }),
      setLoading: (isLoading) => set({ isLoading }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterGroup: (filterGroup) => set({ filterGroup }),
      setFilterStatus: (filterStatus) => set({ filterStatus }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'multilogin-profiles',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        viewMode: state.viewMode,
      }),
    }
  )
);

// Team Store
interface TeamState {
  team: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  setTeam: (team: Team | null) => void;
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: TeamMember) => void;
  removeMember: (userId: string) => void;
  updateMemberRole: (userId: string, role: TeamMember['role']) => void;
  setLoading: (loading: boolean) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  team: null,
  members: [],
  isLoading: true,
  setTeam: (team) => set({ team }),
  setMembers: (members) => set({ members }),
  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => m.userId !== userId),
    })),
  updateMemberRole: (userId, role) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.userId === userId ? { ...m, role } : m
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Sidebar Store
interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
    }),
    {
      name: 'multilogin-sidebar',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);

// Modal Store for global modals
interface ModalState {
  isCreateProfileOpen: boolean;
  isDeleteProfileOpen: boolean;
  isEditProfileOpen: boolean;
  isCreateGroupOpen: boolean;
  isInviteTeamOpen: boolean;
  profileToDelete: string | null;
  profileToEdit: string | null;

  openCreateProfile: () => void;
  closeCreateProfile: () => void;
  openDeleteProfile: (id: string) => void;
  closeDeleteProfile: () => void;
  openEditProfile: (id: string) => void;
  closeEditProfile: () => void;
  openCreateGroup: () => void;
  closeCreateGroup: () => void;
  openInviteTeam: () => void;
  closeInviteTeam: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreateProfileOpen: false,
  isDeleteProfileOpen: false,
  isEditProfileOpen: false,
  isCreateGroupOpen: false,
  isInviteTeamOpen: false,
  profileToDelete: null,
  profileToEdit: null,

  openCreateProfile: () => set({ isCreateProfileOpen: true }),
  closeCreateProfile: () => set({ isCreateProfileOpen: false }),
  openDeleteProfile: (id) => set({ isDeleteProfileOpen: true, profileToDelete: id }),
  closeDeleteProfile: () => set({ isDeleteProfileOpen: false, profileToDelete: null }),
  openEditProfile: (id) => set({ isEditProfileOpen: true, profileToEdit: id }),
  closeEditProfile: () => set({ isEditProfileOpen: false, profileToEdit: null }),
  openCreateGroup: () => set({ isCreateGroupOpen: true }),
  closeCreateGroup: () => set({ isCreateGroupOpen: false }),
  openInviteTeam: () => set({ isInviteTeamOpen: true }),
  closeInviteTeam: () => set({ isInviteTeamOpen: false }),
}));

// Health Monitoring Store
interface HealthState {
  systemHealth: SystemHealth | null;
  profileHealthMap: Record<string, ProfileHealth>;
  isLoading: boolean;
  lastUpdated: Date | null;
  setSystemHealth: (health: SystemHealth) => void;
  setProfileHealth: (profileId: string, health: ProfileHealth) => void;
  setLoading: (loading: boolean) => void;
  clearHealth: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  systemHealth: null,
  profileHealthMap: {},
  isLoading: false,
  lastUpdated: null,
  setSystemHealth: (systemHealth) =>
    set({ systemHealth, lastUpdated: new Date() }),
  setProfileHealth: (profileId, health) =>
    set((state) => ({
      profileHealthMap: { ...state.profileHealthMap, [profileId]: health },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  clearHealth: () =>
    set({ systemHealth: null, profileHealthMap: {}, lastUpdated: null }),
}));

// Time Machine Store
interface TimeMachineState {
  snapshots: Record<string, SessionSnapshot[]>;
  selectedSnapshot: SessionSnapshot | null;
  compareMode: boolean;
  compareSnapshots: [string | null, string | null];
  isLoading: boolean;
  setSnapshots: (profileId: string, snapshots: SessionSnapshot[]) => void;
  setSelectedSnapshot: (snapshot: SessionSnapshot | null) => void;
  setCompareMode: (mode: boolean) => void;
  setCompareSnapshots: (snapshots: [string | null, string | null]) => void;
  setLoading: (loading: boolean) => void;
}

export const useTimeMachineStore = create<TimeMachineState>((set) => ({
  snapshots: {},
  selectedSnapshot: null,
  compareMode: false,
  compareSnapshots: [null, null],
  isLoading: false,
  setSnapshots: (profileId, snapshots) =>
    set((state) => ({
      snapshots: { ...state.snapshots, [profileId]: snapshots },
    })),
  setSelectedSnapshot: (selectedSnapshot) => set({ selectedSnapshot }),
  setCompareMode: (compareMode) => set({ compareMode }),
  setCompareSnapshots: (compareSnapshots) => set({ compareSnapshots }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Automation Scripts Store
interface ScriptState {
  scripts: AutomationScript[];
  currentScript: AutomationScript | null;
  editingSteps: ActionStep[];
  isDirty: boolean;
  isLoading: boolean;
  executionStatus: Record<string, {
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    logs: Array<{ timestamp: Date; level: string; message: string }>;
  }>;
  setScripts: (scripts: AutomationScript[]) => void;
  setCurrentScript: (script: AutomationScript | null) => void;
  setEditingSteps: (steps: ActionStep[]) => void;
  addStep: (step: ActionStep) => void;
  updateStep: (id: string, updates: Partial<ActionStep>) => void;
  removeStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  setDirty: (dirty: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateExecutionStatus: (
    executionId: string,
    status: ScriptState['executionStatus'][string]
  ) => void;
}

export const useScriptStore = create<ScriptState>((set) => ({
  scripts: [],
  currentScript: null,
  editingSteps: [],
  isDirty: false,
  isLoading: false,
  executionStatus: {},
  setScripts: (scripts) => set({ scripts }),
  setCurrentScript: (currentScript) => set({ currentScript }),
  setEditingSteps: (editingSteps) => set({ editingSteps }),
  addStep: (step) =>
    set((state) => ({
      editingSteps: [...state.editingSteps, step],
      isDirty: true,
    })),
  updateStep: (id, updates) =>
    set((state) => ({
      editingSteps: state.editingSteps.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      isDirty: true,
    })),
  removeStep: (id) =>
    set((state) => ({
      editingSteps: state.editingSteps.filter((s) => s.id !== id),
      isDirty: true,
    })),
  reorderSteps: (fromIndex, toIndex) =>
    set((state) => {
      const newSteps = [...state.editingSteps];
      const [removed] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, removed);
      return {
        editingSteps: newSteps.map((s, i) => ({ ...s, order: i })),
        isDirty: true,
      };
    }),
  setDirty: (isDirty) => set({ isDirty }),
  setLoading: (isLoading) => set({ isLoading }),
  updateExecutionStatus: (executionId, status) =>
    set((state) => ({
      executionStatus: { ...state.executionStatus, [executionId]: status },
    })),
}));

// Presence Store
interface PresenceState {
  onlineMembers: UserPresence[];
  profileLocks: ProfileLock[];
  myStatus: 'online' | 'away' | 'busy';
  setOnlineMembers: (members: UserPresence[]) => void;
  setProfileLocks: (locks: ProfileLock[]) => void;
  setMyStatus: (status: 'online' | 'away' | 'busy') => void;
  isProfileLocked: (profileId: string) => ProfileLock | undefined;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineMembers: [],
  profileLocks: [],
  myStatus: 'online',
  setOnlineMembers: (onlineMembers) => set({ onlineMembers }),
  setProfileLocks: (profileLocks) => set({ profileLocks }),
  setMyStatus: (myStatus) => set({ myStatus }),
  isProfileLocked: (profileId) =>
    get().profileLocks.find((lock) => lock.profileId === profileId),
}));

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.readAt
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.readAt) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, readAt: new Date() } : n
          ),
          unreadCount: state.unreadCount - 1,
        };
      }
      return state;
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        readAt: n.readAt || new Date(),
      })),
      unreadCount: 0,
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// Command Palette Store
interface CommandPaletteState {
  isOpen: boolean;
  recentCommands: string[];
  setOpen: (open: boolean) => void;
  toggle: () => void;
  addRecentCommand: (command: string) => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>()(
  persist(
    (set) => ({
      isOpen: false,
      recentCommands: [],
      setOpen: (isOpen) => set({ isOpen }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      addRecentCommand: (command) =>
        set((state) => ({
          recentCommands: [
            command,
            ...state.recentCommands.filter((c) => c !== command),
          ].slice(0, 10),
        })),
    }),
    {
      name: 'multilogin-command-palette',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recentCommands: state.recentCommands }),
    }
  )
);

// Upgrade Prompt Store
interface UpgradePromptState {
  isOpen: boolean;
  feature: string | null;
  requiredPlan: string | null;
  openUpgradePrompt: (feature: string, requiredPlan: string) => void;
  closeUpgradePrompt: () => void;
}

export const useUpgradePromptStore = create<UpgradePromptState>((set) => ({
  isOpen: false,
  feature: null,
  requiredPlan: null,
  openUpgradePrompt: (feature, requiredPlan) =>
    set({ isOpen: true, feature, requiredPlan }),
  closeUpgradePrompt: () =>
    set({ isOpen: false, feature: null, requiredPlan: null }),
}));
