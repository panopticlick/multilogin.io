/**
 * Fingerprint Aging Service
 *
 * Manages browser fingerprint versioning and updates:
 * - Tracks current browser versions
 * - Detects outdated fingerprints
 * - Provides safe upgrade paths that preserve account consistency
 */

// Current browser version data (updated regularly via external source)
export interface BrowserVersions {
  chrome: { stable: number; beta: number; dev: number };
  firefox: { stable: number; beta: number };
  safari: { stable: number };
  edge: { stable: number };
  updatedAt: number;
}

// Fingerprint upgrade result
export interface FingerprintUpgrade {
  userAgent: string;
  platform: string;
  clientHints: ClientHints;
  changes: string[];
  preservedFields: string[];
}

export interface ClientHints {
  'sec-ch-ua': string;
  'sec-ch-ua-platform': string;
  'sec-ch-ua-platform-version': string;
  'sec-ch-ua-mobile': string;
  'sec-ch-ua-full-version-list': string;
  'sec-ch-ua-arch': string;
  'sec-ch-ua-bitness': string;
  'sec-ch-ua-model': string;
}

// Default browser versions (fallback)
const DEFAULT_VERSIONS: BrowserVersions = {
  chrome: { stable: 131, beta: 132, dev: 133 },
  firefox: { stable: 133, beta: 134 },
  safari: { stable: 18 },
  edge: { stable: 131 },
  updatedAt: Date.now(),
};

// Parse version from user agent
export function parseUserAgentVersion(userAgent: string): {
  browser: string;
  version: number;
  os: string;
  osVersion: string;
} | null {
  // Chrome on Windows
  let match = userAgent.match(/Windows NT ([\d.]+).*Chrome\/(\d+)/);
  if (match) {
    return {
      browser: 'chrome',
      version: parseInt(match[2]),
      os: 'windows',
      osVersion: match[1],
    };
  }

  // Chrome on macOS
  match = userAgent.match(/Mac OS X ([\d_]+).*Chrome\/(\d+)/);
  if (match) {
    return {
      browser: 'chrome',
      version: parseInt(match[2]),
      os: 'macos',
      osVersion: match[1].replace(/_/g, '.'),
    };
  }

  // Chrome on Linux
  match = userAgent.match(/Linux.*Chrome\/(\d+)/);
  if (match) {
    return {
      browser: 'chrome',
      version: parseInt(match[1]),
      os: 'linux',
      osVersion: '',
    };
  }

  // Firefox
  match = userAgent.match(/Firefox\/(\d+)/);
  if (match) {
    const os = userAgent.includes('Windows') ? 'windows' :
               userAgent.includes('Mac') ? 'macos' : 'linux';
    return {
      browser: 'firefox',
      version: parseInt(match[1]),
      os,
      osVersion: '',
    };
  }

  // Safari (not Chrome)
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    match = userAgent.match(/Version\/(\d+)/);
    if (match) {
      return {
        browser: 'safari',
        version: parseInt(match[1]),
        os: 'macos',
        osVersion: '',
      };
    }
  }

  return null;
}

// Check if fingerprint is outdated
export function isOutdated(
  userAgent: string,
  versions: BrowserVersions = DEFAULT_VERSIONS,
  maxVersionsBehind: number = 2
): { outdated: boolean; currentVersion: number; latestVersion: number; versionsBehind: number } | null {
  const parsed = parseUserAgentVersion(userAgent);
  if (!parsed) return null;

  let latestVersion: number;
  switch (parsed.browser) {
    case 'chrome':
      latestVersion = versions.chrome.stable;
      break;
    case 'firefox':
      latestVersion = versions.firefox.stable;
      break;
    case 'safari':
      latestVersion = versions.safari.stable;
      break;
    default:
      return null;
  }

  const versionsBehind = latestVersion - parsed.version;

  return {
    outdated: versionsBehind > maxVersionsBehind,
    currentVersion: parsed.version,
    latestVersion,
    versionsBehind,
  };
}

// Generate upgraded user agent
function upgradeUserAgent(
  originalUA: string,
  targetVersion: number
): string {
  // Replace Chrome version while preserving other details
  return originalUA.replace(
    /Chrome\/\d+\.\d+\.\d+\.\d+/,
    `Chrome/${targetVersion}.0.0.0`
  ).replace(
    /Safari\/\d+\.\d+/,
    `Safari/537.36`
  );
}

// Generate Client Hints for Chrome
function generateClientHints(
  version: number,
  platform: string,
  platformVersion: string,
  isMobile: boolean = false
): ClientHints {
  const brandVersion = version;
  const fullVersion = `${version}.0.0.0`;

  // Chromium brand rotation (changes each version)
  const brandIndex = version % 4;
  const brands = [
    'Chromium',
    'Google Chrome',
    'Not_A Brand',
    'Not/A)Brand',
  ];

  const secChUa = `"${brands[brandIndex]}";v="${brandVersion}", "Chromium";v="${brandVersion}", "Google Chrome";v="${brandVersion}"`;

  const secChUaFullVersionList = `"${brands[brandIndex]}";v="${fullVersion}", "Chromium";v="${fullVersion}", "Google Chrome";v="${fullVersion}"`;

  let platformName: string;
  switch (platform) {
    case 'windows':
      platformName = 'Windows';
      break;
    case 'macos':
      platformName = 'macOS';
      break;
    case 'linux':
      platformName = 'Linux';
      break;
    default:
      platformName = 'Unknown';
  }

  return {
    'sec-ch-ua': secChUa,
    'sec-ch-ua-platform': `"${platformName}"`,
    'sec-ch-ua-platform-version': `"${platformVersion}"`,
    'sec-ch-ua-mobile': isMobile ? '?1' : '?0',
    'sec-ch-ua-full-version-list': secChUaFullVersionList,
    'sec-ch-ua-arch': platform === 'macos' ? '"arm"' : '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-model': '""',
  };
}

// Perform safe fingerprint upgrade
export function upgradeFingerprint(
  currentFingerprint: {
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
    timezone: string;
    language: string;
  },
  targetVersion: number
): FingerprintUpgrade {
  const parsed = parseUserAgentVersion(currentFingerprint.userAgent);

  if (!parsed) {
    throw new Error('Unable to parse current user agent');
  }

  // Upgrade user agent
  const newUserAgent = upgradeUserAgent(currentFingerprint.userAgent, targetVersion);

  // Generate new Client Hints
  const clientHints = generateClientHints(
    targetVersion,
    parsed.os,
    parsed.osVersion
  );

  // List what changed and what was preserved
  const changes = [
    `Chrome version: ${parsed.version} → ${targetVersion}`,
    'Client Hints updated to match new version',
  ];

  const preservedFields = [
    'Screen resolution',
    'Color depth',
    'Device memory',
    'Hardware concurrency',
    'WebGL fingerprint',
    'Timezone',
    'Language',
    'Canvas fingerprint (implicit)',
    'Audio fingerprint (implicit)',
    'Font list (implicit)',
  ];

  return {
    userAgent: newUserAgent,
    platform: currentFingerprint.platform,
    clientHints,
    changes,
    preservedFields,
  };
}

// Get upgrade recommendation
export function getUpgradeRecommendation(
  currentVersion: number,
  latestVersion: number,
  accountAge: number, // days
  lastActivity: number // timestamp
): {
  recommended: boolean;
  targetVersion: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
} {
  const versionsBehind = latestVersion - currentVersion;
  const daysSinceActive = (Date.now() - lastActivity) / (24 * 60 * 60 * 1000);

  // Don't upgrade very new accounts (might look suspicious)
  if (accountAge < 7) {
    return {
      recommended: false,
      targetVersion: currentVersion,
      reason: 'Account too new - wait before upgrading fingerprint',
      urgency: 'low',
    };
  }

  // Critical: more than 4 versions behind
  if (versionsBehind > 4) {
    return {
      recommended: true,
      targetVersion: latestVersion - 1, // Stay 1 behind to look natural
      reason: 'Fingerprint critically outdated - high detection risk',
      urgency: 'high',
    };
  }

  // High: 3-4 versions behind
  if (versionsBehind >= 3) {
    return {
      recommended: true,
      targetVersion: latestVersion - 1,
      reason: 'Fingerprint outdated - should upgrade soon',
      urgency: 'medium',
    };
  }

  // Low: 2 versions behind
  if (versionsBehind === 2) {
    // Only recommend if account has been active recently
    if (daysSinceActive < 7) {
      return {
        recommended: true,
        targetVersion: latestVersion - 1,
        reason: 'Minor version update available',
        urgency: 'low',
      };
    }
  }

  return {
    recommended: false,
    targetVersion: currentVersion,
    reason: 'Fingerprint is current',
    urgency: 'low',
  };
}

// Batch analyze profiles for aging
export function analyzeProfileAging(
  profiles: Array<{
    id: string;
    name: string;
    userAgent: string;
    createdAt: number;
    lastActive: number | null;
  }>,
  versions: BrowserVersions = DEFAULT_VERSIONS
): Array<{
  profileId: string;
  profileName: string;
  status: 'current' | 'outdated' | 'critical';
  currentVersion: number;
  latestVersion: number;
  recommendation: ReturnType<typeof getUpgradeRecommendation>;
}> {
  return profiles.map(profile => {
    const aging = isOutdated(profile.userAgent, versions);

    if (!aging) {
      return {
        profileId: profile.id,
        profileName: profile.name,
        status: 'current' as const,
        currentVersion: 0,
        latestVersion: 0,
        recommendation: {
          recommended: false,
          targetVersion: 0,
          reason: 'Unable to determine browser version',
          urgency: 'low' as const,
        },
      };
    }

    const accountAge = (Date.now() - profile.createdAt) / (24 * 60 * 60 * 1000);
    const recommendation = getUpgradeRecommendation(
      aging.currentVersion,
      aging.latestVersion,
      accountAge,
      profile.lastActive || profile.createdAt
    );

    return {
      profileId: profile.id,
      profileName: profile.name,
      status: aging.versionsBehind > 4 ? 'critical' as const :
              aging.outdated ? 'outdated' as const : 'current' as const,
      currentVersion: aging.currentVersion,
      latestVersion: aging.latestVersion,
      recommendation,
    };
  });
}
