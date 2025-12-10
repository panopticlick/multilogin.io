// API Client for Multilogin.io Worker Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.multilogin.io';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  timeout?: number;
  signal?: AbortSignal;
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
}

class APIError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;
  isNetworkError: boolean;
  isTimeout: boolean;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      details?: Record<string, unknown>;
      isNetworkError?: boolean;
      isTimeout?: boolean;
    }
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.isNetworkError = options?.isNetworkError ?? false;
    this.isTimeout = options?.isTimeout ?? false;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    token,
    timeout = DEFAULT_TIMEOUT,
    signal,
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Create timeout abort controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  // Combine signals if external signal provided
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new APIError(
          `Server error: ${response.statusText}`,
          response.status,
          { isNetworkError: true }
        );
      }
      // For successful non-JSON responses, return empty data
      return {} as T;
    }

    let data: APIResponse<T>;
    try {
      data = await response.json();
    } catch {
      throw new APIError(
        'Invalid response from server',
        response.status,
        { isNetworkError: true }
      );
    }

    if (!response.ok || !data.success) {
      throw new APIError(
        data.error || data.message || 'An error occurred',
        response.status,
        { details: data.details }
      );
    }

    return data.data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new APIError('Request timed out', 408, { isTimeout: true });
      }

      // Network errors (DNS, connection refused, etc.)
      throw new APIError(
        'Network error: Unable to connect to server',
        0,
        { isNetworkError: true }
      );
    }

    throw new APIError('An unexpected error occurred', 500);
  }
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{
      user: { id: string; email: string; name: string };
      team: { id: string; name: string; plan: 'free' };
      token: string;
    }>('/api/v1/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<{
      user: { id: string; email: string; name: string; image?: string };
      team: { id: string; name: string; plan: 'free'; role: string };
      token: string;
    }>('/api/v1/auth/login', { method: 'POST', body: data }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (data: { token: string; password: string }) =>
    request<{ message: string }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: data,
    }),
};

// Profiles API
export const profilesAPI = {
  list: (
    token: string,
    params?: {
      search?: string;
      groupId?: string;
      status?: 'available' | 'in_use' | 'locked';
      page?: number;
      limit?: number;
      sortBy?: 'name' | 'lastActive' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{
      items: Array<{
        id: string;
        name: string;
        templateId: string;
        status: string;
        tags: string[];
        lastActive: number;
        launchCount: number;
      }>;
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/v1/profiles${query ? `?${query}` : ''}`, { token });
  },

  get: (token: string, id: string) =>
    request<{
      id: string;
      name: string;
      templateId: string;
      userAgent: string;
      platform: string;
      status: string;
      tags: string[];
      proxy: string | null;
      notes: string | null;
    }>(`/api/v1/profiles/${id}`, { token }),

  create: (
    token: string,
    data: {
      name: string;
      templateId: string;
      groupId?: string;
      tags?: string[];
      timezone?: string;
      language?: string;
      proxy?: string;
      notes?: string;
    }
  ) =>
    request<{
      id: string;
      name: string;
      templateId: string;
      status: string;
      createdAt: number;
    }>('/api/v1/profiles', { method: 'POST', token, body: data }),

  update: (
    token: string,
    id: string,
    data: Partial<{
      name: string;
      groupId: string | null;
      tags: string[];
      timezone: string;
      language: string;
      proxy: string | null;
      notes: string | null;
    }>
  ) =>
    request<{ message: string }>(`/api/v1/profiles/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/api/v1/profiles/${id}`, {
      method: 'DELETE',
      token,
    }),

  launch: (token: string, id: string, clientId?: string) =>
    request<{
      profile: Record<string, unknown>;
      sessionData: Record<string, unknown> | null;
    }>(`/api/v1/profiles/${id}/launch`, {
      method: 'POST',
      token,
      headers: clientId ? { 'X-Client-ID': clientId } : {},
    }),

  release: (token: string, id: string, clientId?: string) =>
    request<{ message: string }>(`/api/v1/profiles/${id}/release`, {
      method: 'POST',
      token,
      headers: clientId ? { 'X-Client-ID': clientId } : {},
    }),

  bulkDelete: (token: string, ids: string[]) =>
    request<{ message: string }>('/api/v1/profiles/bulk-delete', {
      method: 'POST',
      token,
      body: { ids },
    }),

  duplicate: (token: string, id: string, newName?: string) =>
    request<{
      id: string;
      name: string;
      templateId: string;
      createdAt: number;
    }>(`/api/v1/profiles/${id}/duplicate`, {
      method: 'POST',
      token,
      body: newName ? { newName } : {},
    }),

  export: (token: string, ids?: string[]) => {
    const query = ids?.length ? `?ids=${ids.join(',')}` : '';
    return request<{
      version: string;
      exportedAt: number;
      profiles: Array<{
        name: string;
        templateId: string;
        groupId: string | null;
        tags: string[];
        timezone: string;
        language: string;
        proxy: string | null;
        notes: string | null;
      }>;
    }>(`/api/v1/profiles/export${query}`, { token });
  },

  import: (
    token: string,
    profiles: Array<{
      name: string;
      templateId: string;
      groupId?: string | null;
      tags?: string[];
      timezone?: string;
      language?: string;
      proxy?: string | null;
      notes?: string | null;
    }>
  ) =>
    request<{
      results: Array<{ index: number; success: boolean; id?: string; name?: string; error?: string }>;
      imported: number;
      failed: number;
    }>('/api/v1/profiles/import', {
      method: 'POST',
      token,
      body: { profiles },
    }),

  regenerateFingerprint: (token: string, id: string) =>
    request<{
      message: string;
      userAgent: string;
      platform: string;
    }>(`/api/v1/profiles/${id}/regenerate-fingerprint`, {
      method: 'POST',
      token,
    }),
};

// Proxies API
export const proxiesAPI = {
  list: (
    token: string,
    params?: {
      search?: string;
      type?: string;
      status?: string;
      country?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{
      items: Array<{
        id: string;
        name: string;
        type: string;
        host: string;
        port: number;
        status: string;
        latency: number | null;
        country: string | null;
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(`/api/v1/proxies${query ? `?${query}` : ''}`, { token });
  },

  get: (token: string, id: string) =>
    request<{
      id: string;
      name: string;
      type: string;
      host: string;
      port: number;
      username: string | null;
      password: string | null;
      status: string;
      latency: number | null;
    }>(`/api/v1/proxies/${id}`, { token }),

  create: (
    token: string,
    data: {
      name: string;
      type: 'http' | 'https' | 'socks4' | 'socks5';
      host: string;
      port: number;
      username?: string;
      password?: string;
      country?: string;
      city?: string;
      tags?: string[];
    }
  ) =>
    request<{ id: string; name: string }>('/api/v1/proxies', {
      method: 'POST',
      token,
      body: data,
    }),

  update: (token: string, id: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/api/v1/proxies/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/api/v1/proxies/${id}`, {
      method: 'DELETE',
      token,
    }),

  test: (
    token: string,
    data: {
      type: 'http' | 'https' | 'socks4' | 'socks5';
      host: string;
      port: number;
      username?: string;
      password?: string;
    }
  ) =>
    request<{
      working: boolean;
      latency?: number;
      externalIp?: string;
      error?: string;
    }>('/api/v1/proxies/test', { method: 'POST', token, body: data }),

  check: (token: string, id: string) =>
    request<{ working: boolean; latency?: number }>(`/api/v1/proxies/${id}/check`, {
      method: 'POST',
      token,
    }),
};

// Groups API
export const groupsAPI = {
  list: (token: string) =>
    request<
      Array<{
        id: string;
        name: string;
        color: string;
        description: string | null;
        profileCount: number;
      }>
    >('/api/v1/groups', { token }),

  create: (
    token: string,
    data: { name: string; color?: string; description?: string }
  ) =>
    request<{ id: string; name: string; color: string }>('/api/v1/groups', {
      method: 'POST',
      token,
      body: data,
    }),

  update: (
    token: string,
    id: string,
    data: { name?: string; color?: string; description?: string }
  ) =>
    request<{ message: string }>(`/api/v1/groups/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/api/v1/groups/${id}`, {
      method: 'DELETE',
      token,
    }),

  addProfiles: (token: string, id: string, profileIds: string[]) =>
    request<{ message: string }>(`/api/v1/groups/${id}/profiles`, {
      method: 'POST',
      token,
      body: { profileIds },
    }),

  removeProfiles: (token: string, id: string, profileIds: string[]) =>
    request<{ message: string }>(`/api/v1/groups/${id}/profiles`, {
      method: 'DELETE',
      token,
      body: { profileIds },
    }),
};

// Teams API
export const teamsAPI = {
  getCurrent: (token: string) =>
    request<{
      id: string;
      name: string;
      plan: 'free';
      owner: { id: string; name: string; email: string };
      memberCount: number;
      profileCount: number;
    }>('/api/v1/teams/current', { token }),

  update: (token: string, data: { name?: string }) =>
    request<{ message: string }>('/api/v1/teams/current', {
      method: 'PATCH',
      token,
      body: data,
    }),

  listMembers: (token: string) =>
    request<
      Array<{
        id: string;
        userId: string;
        email: string;
        name: string;
        image: string | null;
        role: string;
        joinedAt: number;
      }>
    >('/api/v1/teams/members', { token }),

  inviteMember: (token: string, data: { email: string; role: string }) =>
    request<{
      invitationId?: string;
      id?: string;
      email: string;
      role: string;
    }>('/api/v1/teams/members/invite', {
      method: 'POST',
      token,
      body: data,
    }),

  updateMember: (token: string, memberId: string, data: { role: string }) =>
    request<{ message: string }>(`/api/v1/teams/members/${memberId}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  removeMember: (token: string, memberId: string) =>
    request<{ message: string }>(`/api/v1/teams/members/${memberId}`, {
      method: 'DELETE',
      token,
    }),

  leave: (token: string) =>
    request<{ message: string }>('/api/v1/teams/leave', { method: 'POST', token }),
};

// Templates API (public)
export const templatesAPI = {
  list: () =>
    request<
      Array<{
        id: string;
        name: string;
        os: string;
        browser: string;
      }>
    >('/api/v1/templates'),

  get: (id: string) =>
    request<{
      id: string;
      name: string;
      os: string;
      browser: string;
      screens: Array<{ width: number; height: number }>;
      languages: string[];
      timezones: string[];
    }>(`/api/v1/templates/${id}`),

  preview: (id: string) =>
    request<{
      userAgent: string;
      platform: string;
      screenWidth: number;
      screenHeight: number;
      timezone: string;
      language: string;
    }>(`/api/v1/templates/${id}/preview`, { method: 'POST' }),
};

// Users API
export const usersAPI = {
  getMe: (token: string) =>
    request<{
      id: string;
      email: string;
      name: string;
      image: string | null;
      team: { id: string; name: string; plan: 'free'; role: string } | null;
    }>('/api/v1/users/me', { token }),

  updateMe: (token: string, data: { name?: string; image?: string }) =>
    request<{ message: string }>('/api/v1/users/me', {
      method: 'PATCH',
      token,
      body: data,
    }),

  changePassword: (
    token: string,
    data: { currentPassword: string; newPassword: string }
  ) =>
    request<{ message: string }>('/api/v1/users/me/change-password', {
      method: 'POST',
      token,
      body: data,
    }),

  listAPIKeys: (token: string) =>
    request<
      Array<{
        id: string;
        name: string;
        keyPrefix: string;
        permissions: string[];
        lastUsedAt: number | null;
        expiresAt: number | null;
        createdAt: number;
      }>
    >('/api/v1/users/api-keys', { token }),

  createAPIKey: (
    token: string,
    data: { name: string; permissions?: string[]; expiresAt?: number }
  ) =>
    request<{
      id: string;
      name: string;
      key: string;
      keyPrefix: string;
    }>('/api/v1/users/api-keys', { method: 'POST', token, body: data }),

  revokeAPIKey: (token: string, keyId: string) =>
    request<{ message: string }>(`/api/v1/users/api-keys/${keyId}`, {
      method: 'DELETE',
      token,
    }),

  deleteAccount: (token: string) =>
    request<{ message: string }>('/api/v1/users/me', {
      method: 'DELETE',
      token,
    }),
};

// Billing API
// Sync API
export const syncAPI = {
  upload: (
    token: string,
    profileId: string,
    data: {
      cookies?: Record<string, unknown>[];
      localStorage?: Record<string, string>;
      sessionStorage?: Record<string, string>;
    },
    clientId?: string
  ) =>
    request<{ version: number; size: number }>(`/api/v1/sync/${profileId}/upload`, {
      method: 'POST',
      token,
      body: data,
      headers: clientId ? { 'X-Client-ID': clientId } : {},
    }),

  download: (token: string, profileId: string) =>
    request<{
      cookies?: Record<string, unknown>[];
      localStorage?: Record<string, string>;
      sessionStorage?: Record<string, string>;
      uploadedAt?: number;
      version?: number;
    } | null>(`/api/v1/sync/${profileId}/download`, { token }),

  delete: (token: string, profileId: string) =>
    request<{ message: string }>(`/api/v1/sync/${profileId}`, {
      method: 'DELETE',
      token,
    }),

  status: (token: string, profileId: string) =>
    request<{
      hasData: boolean;
      size?: number;
      lastModified?: string;
    }>(`/api/v1/sync/${profileId}/status`, { token }),
};

// Health Monitoring API
export const healthAPI = {
  getSystemHealth: (token: string) =>
    request<{
      overall: 'healthy' | 'warning' | 'critical' | 'unknown';
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
        lastSync: number | null;
        pendingChanges: number;
        status: 'synced' | 'syncing' | 'error';
      };
      api: {
        status: 'operational' | 'degraded' | 'down';
        latency: number;
        errorRate: number;
      };
    }>('/api/v1/health/system', { token }),

  getProfileHealth: (token: string, profileId: string) =>
    request<{
      profileId: string;
      overallScore: number;
      status: 'healthy' | 'warning' | 'critical' | 'unknown';
      checks: {
        proxy: { id: string; name: string; status: string; score: number; message?: string };
        fingerprint: { id: string; name: string; status: string; score: number; message?: string };
        session: { id: string; name: string; status: string; score: number; message?: string };
        browser: { id: string; name: string; status: string; score: number; message?: string };
      };
      lastUpdated: number;
    }>(`/api/v1/health/profiles/${profileId}`, { token }),

  runHealthCheck: (token: string, profileId: string) =>
    request<{ jobId: string }>(`/api/v1/health/profiles/${profileId}/check`, {
      method: 'POST',
      token,
    }),
};

// Fingerprint API
export const fingerprintAPI = {
  getVersions: (token: string, profileId: string) =>
    request<
      Array<{
        id: string;
        version: number;
        browserVersion: string;
        userAgent: string;
        platform: string;
        createdAt: number;
        isLatest: boolean;
        isCurrent: boolean;
      }>
    >(`/api/v1/fingerprints/${profileId}/versions`, { token }),

  getUpgradeInfo: (token: string, profileId: string) =>
    request<{
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
      changes: Array<{
        field: string;
        old: string;
        new: string;
        impact: 'none' | 'low' | 'medium' | 'high';
      }>;
      recommendation: 'upgrade' | 'skip' | 'review';
      safeToUpgrade: boolean;
    }>(`/api/v1/fingerprints/${profileId}/upgrade-info`, { token }),

  upgrade: (token: string, profileId: string, versionId?: string) =>
    request<{ message: string; newVersion: number }>(
      `/api/v1/fingerprints/${profileId}/upgrade`,
      {
        method: 'POST',
        token,
        body: versionId ? { versionId } : {},
      }
    ),
};

export interface FingerprintPolicyEvaluation {
  profileId: string;
  policyId: string;
  status: 'compliant' | 'warning' | 'violation';
  details: string[];
  versionsBehind?: number;
  latestVersion?: number;
  currentVersion?: number;
}

// Fingerprint Policy API
export const fingerprintPolicyAPI = {
  list: (token: string) =>
    request<Array<{
      id: string;
      name: string;
      description?: string;
      maxVersionsBehind: number;
      maxVersionsBehindMobile: number;
      autoUpgrade: boolean;
      upgradeWindowHours: number;
      requireManualApproval: boolean;
      riskTolerance: string;
      allowedBrowsers: string[];
      preferredProxyTypes: string[];
      regions: string[];
      notificationChannels: string[];
      updatedAt: number;
    }>>('/api/v1/fingerprint/policies', { token }),

  create: (token: string, data: Record<string, unknown>) =>
    request('/api/v1/fingerprint/policies', {
      method: 'POST',
      token,
      body: data,
    }),

  update: (token: string, id: string, data: Record<string, unknown>) =>
    request(`/api/v1/fingerprint/policies/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  delete: (token: string, id: string) =>
    request(`/api/v1/fingerprint/policies/${id}`, {
      method: 'DELETE',
      token,
    }),

  evaluate: (token: string, id: string, data: { profileId: string }) =>
    request<FingerprintPolicyEvaluation>(`/api/v1/fingerprint/policies/${id}/evaluate`, {
      method: 'POST',
      token,
      body: data,
    }),

  listBrowserVersions: (token: string) =>
    request('/api/v1/fingerprint/policies/browser-versions', { token }),
};

// Time Machine API
export const timeMachineAPI = {
  getSnapshots: (token: string, profileId: string) =>
    request<
      Array<{
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
        author: { id: string | null; name: string };
        description?: string | null;
        isAutoSave: boolean;
      }>
    >(`/api/v1/time-machine/${profileId}/snapshots`, { token }),

  getSnapshot: (token: string, profileId: string, snapshotId: string) =>
    request<{
      id: string;
      version: number;
      timestamp: number;
      cookies: Record<string, unknown>[];
      localStorage: Record<string, string>;
      sessionStorage: Record<string, string>;
    }>(`/api/v1/time-machine/${profileId}/snapshots/${snapshotId}`, { token }),

  createSnapshot: (
    token: string,
    profileId: string,
    data: { description?: string }
  ) =>
    request<{ id: string; version: number }>(
      `/api/v1/time-machine/${profileId}/snapshots`,
      {
        method: 'POST',
        token,
        body: data,
      }
    ),

  restore: (token: string, profileId: string, snapshotId: string) =>
    request<{ message: string }>(
      `/api/v1/time-machine/${profileId}/restore/${snapshotId}`,
      {
        method: 'POST',
        token,
        body: { confirm: true },
      }
    ),

  partialRestore: (
    token: string,
    profileId: string,
    data: {
      snapshotId: string;
      cookies?: Array<{ domain: string; name: string; path?: string }>;
      localStorageKeys?: string[];
      sessionStorageKeys?: string[];
    }
  ) =>
    request<{ message?: string }>(`/api/v1/time-machine/${profileId}/partial-restore`, {
      method: 'POST',
      token,
      body: data,
    }),

  compare: (
    token: string,
    profileId: string,
    fromId: string,
    toId: string
  ) =>
    request<{
      added: {
        cookies: Record<string, unknown>[];
        localStorage: Record<string, string>;
        sessionStorage: Record<string, string>;
      };
      removed: {
        cookies: Record<string, unknown>[];
        localStorage: string[];
        sessionStorage: string[];
      };
      modified: {
        cookies: Array<{ old: Record<string, unknown>; new: Record<string, unknown> }>;
        localStorage: Array<{ key: string; old: string; new: string }>;
        sessionStorage: Array<{ key: string; old: string; new: string }>;
      };
    }>(`/api/v1/time-machine/${profileId}/compare?from=${fromId}&to=${toId}`, {
      token,
    }),
};

// Automation Scripts API
export const scriptsAPI = {
  list: (
    token: string,
    params?: {
      search?: string;
      category?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{
      items: Array<{
        id: string;
        name: string;
        description?: string;
        icon?: string;
        steps: number;
        stats: {
          runs: number;
          successRate: number;
          lastRun: number | null;
        };
        isPublic: boolean;
        category?: string;
        tags: string[];
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(`/api/v1/scripts${query ? `?${query}` : ''}`, { token });
  },

  get: (token: string, id: string) =>
    request<{
      id: string;
      name: string;
      description?: string;
      icon?: string;
      steps: Array<{
        id: string;
        type: string;
        name: string;
        config: Record<string, unknown>;
        order: number;
        enabled: boolean;
      }>;
      variables: Record<string, unknown>;
      triggers: Array<{
        type: 'manual' | 'schedule' | 'event';
        config: Record<string, unknown>;
      }>;
      stats: {
        runs: number;
        successRate: number;
        averageDuration: number;
        lastRun: number | null;
      };
    }>(`/api/v1/scripts/${id}`, { token }),

  create: (
    token: string,
    data: {
      name: string;
      description?: string;
      steps: Array<{
        type: string;
        name: string;
        config: Record<string, unknown>;
      }>;
    }
  ) =>
    request<{ id: string; name: string }>('/api/v1/scripts', {
      method: 'POST',
      token,
      body: data,
    }),

  update: (
    token: string,
    id: string,
    data: Partial<{
      name: string;
      description: string;
      steps: Array<{
        id?: string;
        type: string;
        name: string;
        config: Record<string, unknown>;
      }>;
    }>
  ) =>
    request<{ message: string }>(`/api/v1/scripts/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/api/v1/scripts/${id}`, {
      method: 'DELETE',
      token,
    }),

  execute: (
    token: string,
    scriptId: string,
    profileId: string,
    variables?: Record<string, unknown>
  ) =>
    request<{ executionId: string }>(`/api/v1/scripts/${scriptId}/execute`, {
      method: 'POST',
      token,
      body: { profileId, variables },
    }),

  getExecution: (token: string, executionId: string) =>
    request<{
      id: string;
      scriptId: string;
      profileId: string;
      status: 'running' | 'completed' | 'failed' | 'cancelled';
      progress: number;
      currentStep: number;
      totalSteps: number;
      logs: Array<{
        timestamp: number;
        level: 'info' | 'warn' | 'error';
        message: string;
      }>;
      startedAt: number;
      completedAt: number | null;
      error?: string;
    }>(`/api/v1/scripts/executions/${executionId}`, { token }),

  cancelExecution: (token: string, executionId: string) =>
    request<{ message: string }>(
      `/api/v1/scripts/executions/${executionId}/cancel`,
      {
        method: 'POST',
        token,
      }
    ),
};

// Marketplace API
export const marketplaceAPI = {
  list: (params?: {
    search?: string;
    category?: string;
    sort?: 'popular' | 'rating' | 'newest';
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{
      items: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        author: { id: string; name: string; verified: boolean };
        category: string;
        installs: number;
        rating: number;
        reviews: number;
        price: number | 'free';
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(`/api/v1/marketplace/scripts${query ? `?${query}` : ''}`);
  },

  get: (id: string) =>
    request<{
      id: string;
      name: string;
      description: string;
      icon: string;
      author: { id: string; name: string; verified: boolean };
      category: string;
      tags: string[];
      installs: number;
      rating: number;
      reviews: number;
      price: number | 'free';
      preview?: string;
      steps: Array<{
        type: string;
        name: string;
      }>;
    }>(`/api/v1/marketplace/scripts/${id}`),

  install: (token: string, id: string) =>
    request<{ scriptId: string }>(`/api/v1/marketplace/scripts/${id}/install`, {
      method: 'POST',
      token,
    }),
};

// Audit Log API
export const auditAPI = {
  list: (
    token: string,
    params?: {
      action?: string;
      userId?: string;
      startDate?: number;
      endDate?: number;
      page?: number;
      limit?: number;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{
      items: Array<{
        id: string;
        userId: string;
        userName: string;
        userImage: string | null;
        action: string;
        targetType: string;
        targetId: string;
        targetName?: string;
        details: Record<string, unknown>;
        ipAddress: string;
        userAgent: string;
        createdAt: number;
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(`/api/v1/audit${query ? `?${query}` : ''}`, { token });
  },

  get: (token: string, id: string) =>
    request<{
      id: string;
      userId: string;
      userName: string;
      action: string;
      targetType: string;
      targetId: string;
      details: Record<string, unknown>;
      ipAddress: string;
      userAgent: string;
      createdAt: number;
    }>(`/api/v1/audit/${id}`, { token }),
};

// Presence API
export const presenceAPI = {
  getOnlineMembers: (token: string) =>
    request<
      Array<{
        id: string;
        name: string;
        image: string | null;
        status: 'online' | 'away' | 'busy';
        currentProfile: string | null;
        lastSeen: number;
      }>
    >('/api/v1/presence/members', { token }),

  getProfileLocks: (token: string) =>
    request<
      Array<{
        profileId: string;
        lockedBy: {
          id: string;
          name: string;
          image: string | null;
        };
        lockedAt: number;
        expiresAt: number;
      }>
    >('/api/v1/presence/locks', { token }),

  updateStatus: (token: string, status: 'online' | 'away' | 'busy') =>
    request<{ message: string }>('/api/v1/presence/status', {
      method: 'POST',
      token,
      body: { status },
    }),
};

export { APIError };
