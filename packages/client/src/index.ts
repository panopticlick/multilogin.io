// Multilogin.io Client SDK
// Programmatic API for launching browser profiles

import {
  config as clientConfig,
  isConfigured,
  getApiHeaders,
  getProfileDir,
} from './config.js';
import { api } from './api.js';
import type { Profile } from './api.js';
import {
  launchBrowser,
  stopBrowser,
  stopAllBrowsers,
  getRunningProfiles,
  isProfileRunning,
} from './browser.js';

export { clientConfig as config, isConfigured, getApiHeaders, getProfileDir };
export { api };
export type { Profile };
export { launchBrowser, stopBrowser, stopAllBrowsers, getRunningProfiles, isProfileRunning };

// Convenience function to initialize the client
export function initialize(apiKey: string, options?: { apiUrl?: string }) {
  clientConfig.set('apiKey', apiKey);
  if (options?.apiUrl) {
    clientConfig.set('apiUrl', options.apiUrl);
  }
}

// Default export
const sdk = {
  initialize,
  api,
  launchBrowser,
  stopBrowser,
  stopAllBrowsers,
  getRunningProfiles,
  isProfileRunning,
};

export default sdk;
