import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import * as ProxyChain from 'proxy-chain';
import fs from 'fs/promises';
import { getProfileDir } from './config.js';
import { api, Profile } from './api.js';

// Add stealth plugin
puppeteer.use(StealthPlugin());

interface BrowserInstance {
  browser: Browser;
  page: Page;
  profileId: string;
  proxyUrl?: string;
  heartbeatInterval?: NodeJS.Timeout;
  syncInterval?: NodeJS.Timeout;
}

const activeBrowsers = new Map<string, BrowserInstance>();

// Launch browser with profile
export async function launchBrowser(profileId: string): Promise<BrowserInstance> {
  // Check if already running
  if (activeBrowsers.has(profileId)) {
    throw new Error(`Profile ${profileId} is already running`);
  }

  // Get profile and acquire lock
  console.log(`Acquiring lock for profile ${profileId}...`);
  const { profile, sessionData } = await api.launchProfile(profileId);

  // Prepare user data directory
  const userDataDir = getProfileDir(profileId);
  await fs.mkdir(userDataDir, { recursive: true });

  // Set up proxy if configured
  let proxyUrl: string | undefined;
  if (profile.proxy) {
    const { protocol, host, port, username, password } = profile.proxy;
    const authProxy = username && password
      ? `${protocol}://${username}:${password}@${host}:${port}`
      : `${protocol}://${host}:${port}`;

    // Use proxy-chain to handle authenticated proxy
    proxyUrl = await ProxyChain.anonymizeProxy(authProxy);
  }

  // Build browser args
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    `--window-size=${profile.fingerprint.screen.width},${profile.fingerprint.screen.height}`,
    `--lang=${profile.fingerprint.language}`,
  ];

  if (proxyUrl) {
    const proxyUrlObj = new URL(proxyUrl);
    args.push(`--proxy-server=${proxyUrlObj.host}`);
  }

  // Launch browser
  console.log(`Launching browser for profile "${profile.name}"...`);
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir,
    args,
    defaultViewport: {
      width: profile.fingerprint.screen.width,
      height: profile.fingerprint.screen.height,
    },
    ignoreDefaultArgs: ['--enable-automation'],
  });

  // Get first page or create one
  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();

  // Apply fingerprint overrides
  await applyFingerprint(page, profile);

  // Restore session data if available
  if (sessionData) {
    await restoreSession(page, sessionData);
  }

  // Set up heartbeat
  const heartbeatInterval = setInterval(async () => {
    try {
      await api.heartbeat(profileId);
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }, 60000); // Every minute

  // Set up sync
  const syncInterval = setInterval(async () => {
    try {
      const data = await extractSession(page);
      await api.syncSession(profileId, data);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, 300000); // Every 5 minutes

  const instance: BrowserInstance = {
    browser,
    page,
    profileId,
    proxyUrl,
    heartbeatInterval,
    syncInterval,
  };

  activeBrowsers.set(profileId, instance);

  // Handle browser close
  browser.on('disconnected', () => {
    stopBrowser(profileId).catch(console.error);
  });

  console.log(`Browser launched successfully for profile "${profile.name}"`);
  return instance;
}

// Stop browser and release lock
export async function stopBrowser(profileId: string): Promise<void> {
  const instance = activeBrowsers.get(profileId);
  if (!instance) return;

  console.log(`Stopping browser for profile ${profileId}...`);

  // Clear intervals
  if (instance.heartbeatInterval) {
    clearInterval(instance.heartbeatInterval);
  }
  if (instance.syncInterval) {
    clearInterval(instance.syncInterval);
  }

  // Final sync before closing
  try {
    const data = await extractSession(instance.page);
    await api.syncSession(profileId, data);
    console.log('Final sync completed');
  } catch (error) {
    console.error('Final sync failed:', error);
  }

  // Close browser
  try {
    await instance.browser.close();
  } catch {
    // Browser might already be closed
  }

  // Close proxy if used
  if (instance.proxyUrl) {
    await ProxyChain.closeAnonymizedProxy(instance.proxyUrl, true);
  }

  // Release lock
  try {
    await api.stopProfile(profileId);
    console.log('Lock released');
  } catch (error) {
    console.error('Failed to release lock:', error);
  }

  activeBrowsers.delete(profileId);
}

// Stop all browsers
export async function stopAllBrowsers(): Promise<void> {
  const profileIds = Array.from(activeBrowsers.keys());
  for (const profileId of profileIds) {
    await stopBrowser(profileId);
  }
}

// Apply fingerprint to page
async function applyFingerprint(page: Page, profile: Profile): Promise<void> {
  const fingerprint = profile.fingerprint;

  // Override user agent
  await page.setUserAgent(fingerprint.userAgent);

  // Override platform and other properties
  await page.evaluateOnNewDocument((fp) => {
    // Override navigator properties
    Object.defineProperty(navigator, 'platform', { get: () => fp.platform });
    Object.defineProperty(navigator, 'language', { get: () => fp.language });
    Object.defineProperty(navigator, 'languages', { get: () => [fp.language] });

    // Override screen properties
    Object.defineProperty(screen, 'width', { get: () => fp.screen.width });
    Object.defineProperty(screen, 'height', { get: () => fp.screen.height });
    Object.defineProperty(screen, 'availWidth', { get: () => fp.screen.width });
    Object.defineProperty(screen, 'availHeight', { get: () => fp.screen.height - 40 });

    // Override timezone
    const originalDateToString = Date.prototype.toString;
    Date.prototype.toString = function() {
      return originalDateToString.call(this).replace(/\(.*\)/, `(${fp.timezone})`);
    };

    // Hide webdriver
    Object.defineProperty(navigator, 'webdriver', { get: () => false });

    // Override plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const plugins = [
          { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Plugin', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
        ];
        return Object.assign(plugins, {
          namedItem: (name: string) => plugins.find(p => p.name === name),
          item: (i: number) => plugins[i],
          length: plugins.length,
        });
      },
    });
  }, fingerprint);
}

// Restore session from server
async function restoreSession(
  page: Page,
  sessionData: { cookies: string; localStorage: string }
): Promise<void> {
  try {
    // Parse and set cookies
    if (sessionData.cookies) {
      const cookies = JSON.parse(sessionData.cookies);
      if (Array.isArray(cookies) && cookies.length > 0) {
        await page.setCookie(...cookies);
      }
    }

    // Set localStorage (need to navigate to a page first)
    // This will be done when the user navigates to a page
  } catch (error) {
    console.error('Failed to restore session:', error);
  }
}

// Extract session data from page
async function extractSession(page: Page): Promise<{ cookies: string; localStorage: string }> {
  try {
    // Get cookies
    const cookies = await page.cookies();

    // Get localStorage (only works if we're on a page)
    let localStorage = '{}';
    try {
      localStorage = await page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            data[key] = window.localStorage.getItem(key) || '';
          }
        }
        return JSON.stringify(data);
      });
    } catch {
      // Page might not be navigated yet
    }

    return {
      cookies: JSON.stringify(cookies),
      localStorage,
    };
  } catch (error) {
    console.error('Failed to extract session:', error);
    return { cookies: '[]', localStorage: '{}' };
  }
}

// Get running profiles
export function getRunningProfiles(): string[] {
  return Array.from(activeBrowsers.keys());
}

// Check if profile is running
export function isProfileRunning(profileId: string): boolean {
  return activeBrowsers.has(profileId);
}
