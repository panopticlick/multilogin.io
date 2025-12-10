// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  teamId: string;
  role: TeamRole;
  expires: string;
}

// Team Types
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Team {
  id: string;
  name: string;
  plan: Plan;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  user: User;
  joinedAt: Date;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  expiresAt: Date;
  createdAt: Date;
}

// Plan Types - only 'free' is currently available
export type Plan = 'free';

export interface PlanLimits {
  profiles: number;
  teamMembers: number;
  proxyPools: number;
  apiRequestsPerMinute: number;
  cloudSync: boolean;
  fingerprinting: boolean;
  auditLog: boolean;
  priority: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    profiles: 5,
    teamMembers: 1,
    proxyPools: 1,
    apiRequestsPerMinute: 30,
    cloudSync: true,
    fingerprinting: true,
    auditLog: false,
    priority: false,
  },
};

// Future plan configurations (not currently active)
export const FUTURE_PLAN_LIMITS = {
  pro: {
    profiles: 50,
    teamMembers: 1,
    proxyPools: 5,
    apiRequestsPerMinute: 100,
    cloudSync: true,
    fingerprinting: true,
    auditLog: true,
    priority: false,
  },
  team: {
    profiles: 200,
    teamMembers: 10,
    proxyPools: 20,
    apiRequestsPerMinute: 300,
    cloudSync: true,
    fingerprinting: true,
    auditLog: true,
    priority: true,
  },
  enterprise: {
    profiles: -1, // Unlimited
    teamMembers: -1,
    proxyPools: -1,
    apiRequestsPerMinute: 1000,
    cloudSync: true,
    fingerprinting: true,
    auditLog: true,
    priority: true,
  },
};

// Browser Profile Types
export type ProfileStatus = 'available' | 'in_use' | 'locked' | 'error';

export interface Profile {
  id: string;
  teamId: string;
  name: string;
  templateId: string;
  groupId: string | null;
  tags: string[];

  // Fingerprint
  userAgent: string;
  platform: string;
  vendor: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  deviceMemory: number;
  hardwareConcurrency: number;
  webglVendor: string | null;
  webglRenderer: string | null;

  // Settings
  timezone: string;
  language: string;
  proxy: string | null;
  notes: string | null;

  // Status
  status: ProfileStatus;
  lockedBy: string | null;
  lockedAt: Date | null;

  // Metadata
  lastActive: Date | null;
  launchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileGroup {
  id: string;
  teamId: string;
  name: string;
  color: string;
  profileCount: number;
  createdAt: Date;
}

// Fingerprint Template Types
export interface FingerprintTemplate {
  id: string;
  name: string;
  os: string;
  browser: string;
  userAgents: string[];
  platform: string;
  vendor: string;
  screens: { width: number; height: number }[];
  colorDepth: number;
  deviceMemory: number[];
  hardwareConcurrency: number[];
  fonts: string[];
  webglVendor: string;
  webglRenderer: string[];
  languages: string[];
  timezones: string[];
}

// Proxy Types
export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';
export type ProxyStatus = 'active' | 'inactive' | 'error';

export interface Proxy {
  id: string;
  teamId: string;
  poolId: string | null;
  name: string;
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  status: ProxyStatus;
  lastChecked: Date | null;
  responseTime: number | null;
  createdAt: Date;
}

export interface ProxyPool {
  id: string;
  teamId: string;
  name: string;
  rotationMode: 'round_robin' | 'random' | 'sticky';
  proxyCount: number;
  createdAt: Date;
}

// Session Sync Types
export interface SessionData {
  cookies: Cookie[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  hash: string;
  syncedAt: Date;
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

// API Key Types
export interface APIKey {
  id: string;
  userId: string;
  teamId: string;
  name: string;
  tokenPrefix: string;
  tokenHash: string;
  lastUsed: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

// Audit Log Types
export type AuditAction =
  | 'profile.create'
  | 'profile.update'
  | 'profile.delete'
  | 'profile.launch'
  | 'profile.sync'
  | 'proxy.create'
  | 'proxy.update'
  | 'proxy.delete'
  | 'proxy.bulk_import'
  | 'proxy.bulk_delete'
  | 'team.invite'
  | 'team.remove'
  | 'team.role_change'
  | 'api_key.create'
  | 'api_key.revoke'
  | 'settings.update';

export interface AuditEntry {
  id: string;
  teamId: string;
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalProfiles: number;
  activeProfiles: number;
  totalLaunches: number;
  teamMembers: number;
  profilesChange: number;
  launchesChange: number;
}

// Form Types
export interface CreateProfileInput {
  name: string;
  templateId: string;
  groupId?: string;
  tags?: string[];
  timezone?: string;
  language?: string;
  proxy?: string;
  notes?: string;
}

export interface UpdateProfileInput {
  name?: string;
  groupId?: string;
  tags?: string[];
  timezone?: string;
  language?: string;
  proxy?: string;
  notes?: string;
}

export interface CreateGroupInput {
  name: string;
  color?: string;
}

export interface ImportProxyInput {
  proxies: string;
  poolId?: string;
  format: 'host:port' | 'host:port:user:pass' | 'protocol://user:pass@host:port';
}

// Health Monitoring Types
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface HealthCheck {
  id: string;
  name: string;
  status: HealthStatus;
  score: number; // 0-100
  lastChecked: Date;
  message?: string;
  details?: Record<string, unknown>;
}

export interface ProfileHealth {
  profileId: string;
  overallScore: number;
  status: HealthStatus;
  checks: {
    proxy: HealthCheck;
    fingerprint: HealthCheck;
    session: HealthCheck;
    browser: HealthCheck;
  };
  lastUpdated: Date;
}

export interface SystemHealth {
  overall: HealthStatus;
  score: number;
  profiles: {
    healthy: number;
    warning: number;
    critical: number;
    total: number;
  };
  proxies: {
    working: number;
    failed: number;
    total: number;
    averageLatency: number;
  };
  sync: {
    lastSync: Date | null;
    pendingChanges: number;
    status: 'synced' | 'syncing' | 'error';
  };
  api: {
    status: 'operational' | 'degraded' | 'down';
    latency: number;
    errorRate: number;
  };
}

// Fingerprint Aging Types
export interface FingerprintVersion {
  id: string;
  profileId: string;
  version: number;
  browserVersion: string;
  userAgent: string;
  platform: string;
  createdAt: Date;
  isLatest: boolean;
  isCurrent: boolean;
  changelog?: string[];
}

export interface FingerprintUpgrade {
  profileId: string;
  currentVersion: FingerprintVersion;
  latestVersion: FingerprintVersion;
  changes: {
    field: string;
    old: string;
    new: string;
    impact: 'none' | 'low' | 'medium' | 'high';
  }[];
  recommendation: 'upgrade' | 'skip' | 'review';
  safeToUpgrade: boolean;
}

// Time Machine Types
export interface SessionSnapshot {
  id: string;
  profileId: string;
  version: number;
  timestamp: number;
  size: number;
  type: string;
  cookieCount: number;
  localStorageCount: number;
  sessionStorageCount: number;
  domains: string[];
  author: {
    id: string | null;
    name: string;
  };
  description?: string | null;
  isAutoSave: boolean;
}

export interface SessionDiff {
  added: {
    cookies: Cookie[];
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  };
  removed: {
    cookies: Cookie[];
    localStorage: string[];
    sessionStorage: string[];
  };
  modified: {
    cookies: { old: Cookie; new: Cookie }[];
    localStorage: { key: string; old: string; new: string }[];
    sessionStorage: { key: string; old: string; new: string }[];
  };
}

// Automation Action Types
export type ActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'wait'
  | 'scroll'
  | 'screenshot'
  | 'extract'
  | 'condition'
  | 'loop'
  | 'script';

export interface ActionStep {
  id: string;
  type: ActionType;
  name: string;
  config: Record<string, unknown>;
  order: number;
  enabled: boolean;
  timeout?: number;
  retries?: number;
  onError?: 'stop' | 'continue' | 'retry';
}

export interface AutomationScript {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  icon?: string;
  steps: ActionStep[];
  variables: Record<string, unknown>;
  triggers: {
    type: 'manual' | 'schedule' | 'event';
    config: Record<string, unknown>;
  }[];
  stats: {
    runs: number;
    successRate: number;
    averageDuration: number;
    lastRun: Date | null;
  };
  isPublic: boolean;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScriptExecution {
  id: string;
  scriptId: string;
  profileId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: number;
  totalSteps: number;
  logs: {
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    stepId?: string;
  }[];
  startedAt: Date;
  completedAt: Date | null;
  error?: string;
}

// Real-time Presence Types
export interface UserPresence {
  id: string;
  name: string;
  image: string | null;
  status: 'online' | 'away' | 'busy';
  currentProfile: string | null;
  lastSeen: Date;
}

export interface ProfileLock {
  profileId: string;
  lockedBy: UserPresence;
  lockedAt: Date;
  expiresAt: Date;
  reason?: string;
}

// Notification Types
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'upgrade';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible: boolean;
  persistent: boolean;
  createdAt: Date;
  expiresAt?: Date;
  readAt?: Date;
}

// Billing Gate Types
export interface UsageLimit {
  feature: string;
  used: number;
  limit: number;
  percentage: number;
  isLimited: boolean;
  upgradeRequired: boolean;
  upgradeMessage?: string;
}

export interface UpgradePrompt {
  feature: string;
  currentPlan: Plan;
  requiredPlan: Plan;
  title: string;
  description: string;
  benefits: string[];
}

// Script Marketplace Types
export interface MarketplaceScript {
  id: string;
  name: string;
  description: string;
  icon: string;
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
  category: string;
  tags: string[];
  installs: number;
  rating: number;
  reviews: number;
  price: number | 'free';
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
}
