import Conf from 'conf';
import os from 'os';
import path from 'path';

interface ConfigSchema {
  apiKey: string;
  apiUrl: string;
  profilesDir: string;
  clientId: string;
  lastSync: number;
}

// Generate unique client ID based on machine
function generateClientId(): string {
  const hostname = os.hostname();
  const username = os.userInfo().username;
  const platform = os.platform();
  const arch = os.arch();

  // Create a simple hash
  const str = `${hostname}:${username}:${platform}:${arch}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `client_${Math.abs(hash).toString(16)}`;
}

// Default profiles directory
function getDefaultProfilesDir(): string {
  const home = os.homedir();
  switch (os.platform()) {
    case 'win32':
      return path.join(home, 'AppData', 'Local', 'Multilogin', 'Profiles');
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'Multilogin', 'Profiles');
    default:
      return path.join(home, '.multilogin', 'profiles');
  }
}

export const config = new Conf<ConfigSchema>({
  projectName: 'multilogin',
  defaults: {
    apiKey: '',
    apiUrl: 'https://api.multilogin.io',
    profilesDir: getDefaultProfilesDir(),
    clientId: generateClientId(),
    lastSync: 0,
  },
});

export function isConfigured(): boolean {
  return !!config.get('apiKey');
}

export function getApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.get('apiKey')}`,
    'X-Client-ID': config.get('clientId'),
  };
}

export function getProfileDir(profileId: string): string {
  return path.join(config.get('profilesDir'), profileId);
}
