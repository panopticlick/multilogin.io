// Fingerprint Templates - Consistent browser fingerprints
// Based on real browser distributions to avoid detection

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

export interface GeneratedFingerprint {
  userAgent: string;
  platform: string;
  vendor: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  deviceMemory: number;
  hardwareConcurrency: number;
  webglVendor: string;
  webglRenderer: string;
  language: string;
  timezone: string;
}

// Template definitions
export const templates: FingerprintTemplate[] = [
  {
    id: 'windows_chrome_desktop',
    name: 'Windows Chrome Desktop',
    os: 'Windows',
    browser: 'Chrome',
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    ],
    platform: 'Win32',
    vendor: 'Google Inc.',
    screens: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 2560, height: 1440 },
      { width: 1536, height: 864 },
    ],
    colorDepth: 24,
    deviceMemory: [4, 8, 16],
    hardwareConcurrency: [4, 8, 12, 16],
    fonts: [
      'Arial',
      'Calibri',
      'Cambria',
      'Consolas',
      'Courier New',
      'Georgia',
      'Segoe UI',
      'Tahoma',
      'Times New Roman',
      'Verdana',
    ],
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: [
      'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ],
    languages: ['en-US', 'en'],
    timezones: [
      'America/New_York',
      'America/Chicago',
      'America/Los_Angeles',
      'America/Denver',
    ],
  },
  {
    id: 'mac_chrome_desktop',
    name: 'macOS Chrome Desktop',
    os: 'macOS',
    browser: 'Chrome',
    userAgents: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    ],
    platform: 'MacIntel',
    vendor: 'Google Inc.',
    screens: [
      { width: 1440, height: 900 },
      { width: 1680, height: 1050 },
      { width: 2560, height: 1600 },
      { width: 1920, height: 1080 },
    ],
    colorDepth: 30,
    deviceMemory: [8, 16],
    hardwareConcurrency: [8, 10, 12],
    fonts: [
      'Arial',
      'Helvetica',
      'Helvetica Neue',
      'Lucida Grande',
      'Geneva',
      'Verdana',
      'Monaco',
      'SF Pro',
    ],
    webglVendor: 'Google Inc. (Apple)',
    webglRenderer: [
      'ANGLE (Apple, Apple M1, OpenGL 4.1)',
      'ANGLE (Apple, Apple M2, OpenGL 4.1)',
      'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)',
      'ANGLE (Intel Inc., Intel(R) Iris(TM) Plus Graphics 655, OpenGL 4.1)',
    ],
    languages: ['en-US', 'en'],
    timezones: ['America/Los_Angeles', 'America/New_York'],
  },
  {
    id: 'mac_safari_desktop',
    name: 'macOS Safari Desktop',
    os: 'macOS',
    browser: 'Safari',
    userAgents: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    ],
    platform: 'MacIntel',
    vendor: 'Apple Computer, Inc.',
    screens: [
      { width: 1440, height: 900 },
      { width: 1680, height: 1050 },
    ],
    colorDepth: 30,
    deviceMemory: [8, 16],
    hardwareConcurrency: [8, 10],
    fonts: ['Arial', 'Helvetica', 'Helvetica Neue', 'San Francisco'],
    webglVendor: 'Apple Inc.',
    webglRenderer: ['Apple GPU'],
    languages: ['en-US'],
    timezones: ['America/Los_Angeles'],
  },
  {
    id: 'linux_chrome_desktop',
    name: 'Linux Chrome Desktop',
    os: 'Linux',
    browser: 'Chrome',
    userAgents: [
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    ],
    platform: 'Linux x86_64',
    vendor: 'Google Inc.',
    screens: [
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
    ],
    colorDepth: 24,
    deviceMemory: [8, 16, 32],
    hardwareConcurrency: [8, 12, 16],
    fonts: ['Liberation Sans', 'DejaVu Sans', 'Ubuntu', 'Cantarell'],
    webglVendor: 'Google Inc. (Intel)',
    webglRenderer: [
      'ANGLE (Intel, Mesa Intel(R) UHD Graphics 630 (CFL GT2), OpenGL 4.6)',
      'ANGLE (NVIDIA Corporation, NVIDIA GeForce GTX 1080/PCIe/SSE2, OpenGL 4.6)',
    ],
    languages: ['en-US', 'en'],
    timezones: ['America/New_York', 'Europe/London', 'UTC'],
  },
  {
    id: 'windows_firefox_desktop',
    name: 'Windows Firefox Desktop',
    os: 'Windows',
    browser: 'Firefox',
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    ],
    platform: 'Win32',
    vendor: '',
    screens: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ],
    colorDepth: 24,
    deviceMemory: [8, 16],
    hardwareConcurrency: [4, 8],
    fonts: ['Arial', 'Calibri', 'Segoe UI', 'Times New Roman', 'Verdana'],
    webglVendor: 'Mozilla',
    webglRenderer: [
      'NVIDIA GeForce GTX 1660 SUPER/PCIe/SSE2',
      'Intel(R) UHD Graphics 630',
    ],
    languages: ['en-US', 'en'],
    timezones: ['America/New_York', 'America/Chicago'],
  },
  {
    id: 'android_chrome_mobile',
    name: 'Android Chrome Mobile',
    os: 'Android',
    browser: 'Chrome',
    userAgents: [
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    ],
    platform: 'Linux armv81',
    vendor: 'Google Inc.',
    screens: [
      { width: 412, height: 915 },
      { width: 393, height: 873 },
    ],
    colorDepth: 24,
    deviceMemory: [4, 8],
    hardwareConcurrency: [8],
    fonts: ['Roboto', 'Droid Sans'],
    webglVendor: 'Qualcomm',
    webglRenderer: ['Adreno (TM) 740', 'Adreno (TM) 730'],
    languages: ['en-US'],
    timezones: ['America/New_York'],
  },
  {
    id: 'ios_safari_mobile',
    name: 'iOS Safari Mobile',
    os: 'iOS',
    browser: 'Safari',
    userAgents: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    ],
    platform: 'iPhone',
    vendor: 'Apple Computer, Inc.',
    screens: [
      { width: 390, height: 844 },
      { width: 393, height: 852 },
      { width: 430, height: 932 },
    ],
    colorDepth: 32,
    deviceMemory: [4, 6],
    hardwareConcurrency: [6],
    fonts: ['San Francisco', '.SF UI Display'],
    webglVendor: 'Apple Inc.',
    webglRenderer: ['Apple GPU'],
    languages: ['en-US'],
    timezones: ['America/New_York', 'America/Los_Angeles'],
  },
];

// Get template by ID
export function getTemplate(templateId: string): FingerprintTemplate | undefined {
  return templates.find((t) => t.id === templateId);
}

// Get all templates (for API)
export function getAllTemplates(): Array<{
  id: string;
  name: string;
  os: string;
  browser: string;
}> {
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    os: t.os,
    browser: t.browser,
  }));
}

// Generate a consistent fingerprint from a template
export function generateFingerprint(templateId: string): GeneratedFingerprint | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  // Pick random values from each array
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const screen = pick(template.screens);

  return {
    userAgent: pick(template.userAgents),
    platform: template.platform,
    vendor: template.vendor,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: template.colorDepth,
    deviceMemory: pick(template.deviceMemory),
    hardwareConcurrency: pick(template.hardwareConcurrency),
    webglVendor: template.webglVendor,
    webglRenderer: pick(template.webglRenderer),
    language: pick(template.languages),
    timezone: pick(template.timezones),
  };
}

// Validate fingerprint consistency
export function validateFingerprint(fingerprint: GeneratedFingerprint): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check UserAgent vs Platform consistency
  const ua = fingerprint.userAgent.toLowerCase();
  const platform = fingerprint.platform.toLowerCase();

  if (ua.includes('windows') && !platform.includes('win')) {
    issues.push('UserAgent indicates Windows but platform does not match');
  }
  if (ua.includes('macintosh') && !platform.includes('mac')) {
    issues.push('UserAgent indicates macOS but platform does not match');
  }
  if (ua.includes('iphone') && !platform.includes('iphone')) {
    issues.push('UserAgent indicates iPhone but platform does not match');
  }
  if (ua.includes('android') && !platform.includes('linux')) {
    issues.push('UserAgent indicates Android but platform does not match');
  }

  // Check screen resolution for mobile
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    if (fingerprint.screenWidth > 500) {
      issues.push('Mobile UserAgent with desktop screen resolution');
    }
  }

  // Check vendor consistency
  if (ua.includes('safari') && !ua.includes('chrome')) {
    if (!fingerprint.vendor.toLowerCase().includes('apple')) {
      issues.push('Safari UserAgent should have Apple vendor');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
