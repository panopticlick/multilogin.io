import { config, getApiHeaders } from './config.js';

interface Profile {
  id: string;
  name: string;
  groupId?: string;
  groupName?: string;
  fingerprint: {
    userAgent: string;
    platform: string;
    screen: { width: number; height: number };
    timezone: string;
    language: string;
  };
  proxyId?: string;
  proxy?: {
    protocol: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  lockedBy?: string;
  lockedAt?: number;
  lastActive?: number;
  launchCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.get('apiUrl')}${endpoint}`;
  const headers = getApiHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json() as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data.data as T;
}

export const api = {
  // Verify API key
  async verify(): Promise<{ user: { id: string; name: string; email: string }; team: { id: string; name: string; plan: 'free' } }> {
    return request('/api/v1/users/me');
  },

  // List profiles
  async listProfiles(options?: { search?: string; groupId?: string }): Promise<{ profiles: Profile[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.groupId) params.set('groupId', options.groupId);

    const query = params.toString();
    return request(`/api/v1/profiles${query ? `?${query}` : ''}`);
  },

  // Get profile
  async getProfile(id: string): Promise<Profile> {
    return request(`/api/v1/profiles/${id}`);
  },

  // Launch profile (acquire lock)
  async launchProfile(id: string): Promise<{
    profile: Profile;
    sessionData?: {
      cookies: string;
      localStorage: string;
    };
  }> {
    return request(`/api/v1/profiles/${id}/launch`, {
      method: 'POST',
      body: JSON.stringify({
        clientId: config.get('clientId'),
      }),
    });
  },

  // Stop profile (release lock)
  async stopProfile(id: string): Promise<void> {
    await request(`/api/v1/profiles/${id}/stop`, {
      method: 'POST',
    });
  },

  // Send heartbeat
  async heartbeat(profileId: string): Promise<void> {
    await request(`/api/v1/profiles/${profileId}/heartbeat`, {
      method: 'POST',
    });
  },

  // Sync session data
  async syncSession(
    profileId: string,
    data: { cookies: string; localStorage: string }
  ): Promise<void> {
    await request(`/api/v1/sync/${profileId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Download session data
  async downloadSession(profileId: string): Promise<{
    cookies: string;
    localStorage: string;
    lastSync: number;
  }> {
    return request(`/api/v1/sync/${profileId}`);
  },

  // List groups
  async listGroups(): Promise<{ id: string; name: string; color: string; profileCount: number }[]> {
    return request('/api/v1/groups');
  },
};

export type { Profile };
