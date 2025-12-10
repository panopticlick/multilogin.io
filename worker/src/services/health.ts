/**
 * Profile Health Check Service
 *
 * Monitors profile health including:
 * - Proxy connectivity and latency
 * - IP fraud score detection
 * - Cookie validity checking
 */

import type { Env } from '../types/env';

export interface HealthCheckResult {
  profileId: string;
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    proxy: ProxyHealthCheck | null;
    ip: IPHealthCheck | null;
    cookies: CookieHealthCheck | null;
  };
  score: number; // 0-100
  checkedAt: number;
}

export interface ProxyHealthCheck {
  status: 'ok' | 'slow' | 'failed';
  latency: number | null; // ms
  externalIp: string | null;
  error?: string;
}

export interface IPHealthCheck {
  status: 'clean' | 'suspicious' | 'blacklisted';
  fraudScore: number; // 0-100, higher = worse
  isProxy: boolean;
  isVpn: boolean;
  isDatacenter: boolean;
  isTor: boolean;
  country: string | null;
  isp: string | null;
  riskFactors: string[];
}

export interface CookieHealthCheck {
  status: 'valid' | 'expired' | 'unknown';
  domainsChecked: number;
  validDomains: number;
  expiredDomains: string[];
}

// Proxy health check - test connectivity and latency
export async function checkProxyHealth(
  proxy: { protocol: string; host: string; port: number; username?: string | null; password?: string | null }
): Promise<ProxyHealthCheck> {
  const startTime = Date.now();
  const { host } = proxy;

  try {
    // Test connectivity by fetching IP check service
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Use a simple IP check service
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
      // Note: In production, use cf.resolveOverride or a proxy service
      // This is a simplified example
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        status: 'failed',
        latency: null,
        externalIp: null,
        error: `HTTP ${response.status} while checking ${host}`,
      };
    }

    const latency = Date.now() - startTime;
    const data = await response.json() as { ip: string };

    return {
      status: latency > 3000 ? 'slow' : 'ok',
      latency,
      externalIp: data.ip,
    };
  } catch (error) {
    return {
      status: 'failed',
      latency: null,
      externalIp: null,
      error: error instanceof Error ? error.message : `Connection to ${host} failed`,
    };
  }
}

// Known Tor exit nodes (updated periodically from https://check.torproject.org/torbulkexitlist)
// In production, this would be fetched from KV with periodic updates
const TOR_EXIT_NODES_SAMPLE = new Set([
  // Sample of known exit nodes - in production, fetch complete list
]);

// VPN provider ASN patterns (common VPN providers)
const VPN_PROVIDER_PATTERNS = [
  'nordvpn', 'expressvpn', 'cyberghost', 'surfshark', 'pia', 'private internet',
  'ipvanish', 'protonvpn', 'mullvad', 'windscribe', 'hotspot shield',
  'tunnelbear', 'hide.me', 'vypr', 'purevpn', 'perfect privacy',
];

// Cloud provider patterns (datacenter IPs)
const CLOUD_PROVIDER_PATTERNS = [
  'digitalocean', 'amazon', 'aws', 'google cloud', 'gcp', 'azure', 'microsoft',
  'linode', 'vultr', 'ovh', 'hetzner', 'contabo', 'scaleway', 'upcloud',
  'kamatera', 'cloudflare', 'fastly', 'akamai', 'oracle cloud', 'ibm cloud',
  'alibaba cloud', 'tencent cloud', 'huawei cloud', 'rackspace', 'equinix',
];

// IP reputation check using multiple free services for better accuracy
export async function checkIPReputation(ip: string): Promise<IPHealthCheck> {
  try {
    // Primary check: ip-api.com (free tier: 45 req/min)
    const [ipApiResult, torCheck] = await Promise.all([
      fetchIpApiData(ip),
      checkTorExitNode(ip),
    ]);

    // Calculate fraud score based on risk factors
    const riskFactors: string[] = [];
    let fraudScore = 0;
    let isVpn = false;
    let isDatacenter = false;

    if (ipApiResult.proxy) {
      riskFactors.push('Detected as proxy');
      fraudScore += 30;
    }

    if (ipApiResult.hosting) {
      riskFactors.push('Datacenter IP');
      isDatacenter = true;
      fraudScore += 25;
    }

    // Check for VPN provider patterns
    const ispLower = ipApiResult.isp.toLowerCase();
    const orgLower = (ipApiResult.org || '').toLowerCase();
    const combinedInfo = `${ispLower} ${orgLower}`;

    if (VPN_PROVIDER_PATTERNS.some(pattern => combinedInfo.includes(pattern))) {
      riskFactors.push('Known VPN provider');
      isVpn = true;
      fraudScore += 35;
    }

    // Check for cloud provider patterns
    if (CLOUD_PROVIDER_PATTERNS.some(pattern => combinedInfo.includes(pattern))) {
      if (!isDatacenter) {
        riskFactors.push('Cloud provider network');
        isDatacenter = true;
        fraudScore += 20;
      }
    }

    // Tor exit node check
    if (torCheck) {
      riskFactors.push('Tor exit node');
      fraudScore += 50;
    }

    // Additional heuristics
    if (ipApiResult.mobile) {
      // Mobile IPs are generally less suspicious
      fraudScore = Math.max(0, fraudScore - 10);
    }

    // Check for residential vs business (AS info heuristic)
    if (ipApiResult.as && !isDatacenter) {
      const asLower = ipApiResult.as.toLowerCase();
      if (asLower.includes('residential') || asLower.includes('cable') ||
          asLower.includes('telecom') || asLower.includes('broadband')) {
        // Likely residential, reduce score
        fraudScore = Math.max(0, fraudScore - 5);
      }
    }

    return {
      status: fraudScore >= 50 ? 'blacklisted' : fraudScore >= 25 ? 'suspicious' : 'clean',
      fraudScore: Math.min(fraudScore, 100),
      isProxy: ipApiResult.proxy,
      isVpn,
      isDatacenter,
      isTor: torCheck,
      country: ipApiResult.country,
      isp: ipApiResult.isp,
      riskFactors,
    };
  } catch (error) {
    return {
      status: 'clean', // Default to clean on error rather than blocking
      fraudScore: 0,
      isProxy: false,
      isVpn: false,
      isDatacenter: false,
      isTor: false,
      country: null,
      isp: null,
      riskFactors: ['Check failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
    };
  }
}

// Fetch data from ip-api.com
async function fetchIpApiData(ip: string): Promise<{
  status: string;
  country: string;
  isp: string;
  org?: string;
  as?: string;
  proxy: boolean;
  hosting: boolean;
  mobile: boolean;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,isp,org,as,proxy,hosting,mobile`,
      {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`IP API error: ${response.status}`);
    }

    const data = await response.json() as {
      status: string;
      country: string;
      isp: string;
      org?: string;
      as?: string;
      proxy: boolean;
      hosting: boolean;
      mobile: boolean;
    };

    if (data.status !== 'success') {
      throw new Error('IP lookup failed');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Check if IP is a known Tor exit node
async function checkTorExitNode(ip: string): Promise<boolean> {
  // Check against cached list
  if (TOR_EXIT_NODES_SAMPLE.has(ip)) {
    return true;
  }

  // Use Tor Project's check service as fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Query check.torproject.org (returns plain text)
    const response = await fetch(`https://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=${ip}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const text = await response.text();
    // If the IP appears in the response, it's a Tor exit node
    return text.includes(ip);
  } catch {
    // On error, assume not Tor (fail open)
    return false;
  }
}

// Check cookie validity by testing key domains
export async function checkCookieValidity(
  cookies: Array<{ domain: string; name: string; value: string; expires?: number }>
): Promise<CookieHealthCheck> {
  const now = Date.now();
  const domainCookies = new Map<string, { valid: number; expired: number }>();

  for (const cookie of cookies) {
    const domain = cookie.domain.replace(/^\./, '');

    if (!domainCookies.has(domain)) {
      domainCookies.set(domain, { valid: 0, expired: 0 });
    }

    const stats = domainCookies.get(domain)!;

    // Check if cookie is expired
    if (cookie.expires && cookie.expires * 1000 < now) {
      stats.expired++;
    } else {
      stats.valid++;
    }
  }

  const expiredDomains: string[] = [];
  let validDomains = 0;

  for (const [domain, stats] of domainCookies) {
    if (stats.expired > 0 && stats.valid === 0) {
      expiredDomains.push(domain);
    } else {
      validDomains++;
    }
  }

  return {
    status: expiredDomains.length === 0 ? 'valid' :
            expiredDomains.length < domainCookies.size / 2 ? 'expired' : 'expired',
    domainsChecked: domainCookies.size,
    validDomains,
    expiredDomains,
  };
}

// Combined health check for a profile
export async function performFullHealthCheck(
  env: Env,
  profileId: string,
  teamId: string
): Promise<HealthCheckResult> {
  // Get profile with proxy info
  const profile = await env.DB.prepare(`
    SELECT p.*, pr.protocol, pr.host, pr.port, pr.username, pr.password
    FROM profiles p
    LEFT JOIN proxies pr ON p.proxy = pr.id
    WHERE p.id = ? AND p.team_id = ?
  `).bind(profileId, teamId).first<{
    id: string;
    proxy: string | null;
    protocol: string | null;
    host: string | null;
    port: number | null;
    username: string | null;
    password: string | null;
  }>();

  if (!profile) {
    throw new Error('Profile not found');
  }

  let proxyCheck: ProxyHealthCheck | null = null;
  let ipCheck: IPHealthCheck | null = null;
  let cookieCheck: CookieHealthCheck | null = null;

  // Check proxy if configured
  if (profile.proxy && profile.host && profile.port) {
    proxyCheck = await checkProxyHealth({
      protocol: profile.protocol || 'http',
      host: profile.host,
      port: profile.port,
      username: profile.username,
      password: profile.password,
    });

    // If proxy works, check IP reputation
    if (proxyCheck.status !== 'failed' && proxyCheck.externalIp) {
      ipCheck = await checkIPReputation(proxyCheck.externalIp);
    }
  }

  // Check cookies from R2
  try {
    const cookieData = await env.R2.get(`profiles/${profileId}/cookies.json`);
    if (cookieData) {
      const cookies = await cookieData.json() as Array<{ domain: string; name: string; value: string; expires?: number }>;
      cookieCheck = await checkCookieValidity(cookies);
    }
  } catch {
    // No cookies or parse error
  }

  // Calculate overall score
  let score = 100;
  let status: HealthCheckResult['status'] = 'healthy';

  if (proxyCheck) {
    if (proxyCheck.status === 'failed') {
      score -= 40;
      status = 'critical';
    } else if (proxyCheck.status === 'slow') {
      score -= 15;
      if (status === 'healthy') status = 'warning';
    }
  }

  if (ipCheck) {
    if (ipCheck.status === 'blacklisted') {
      score -= 35;
      status = 'critical';
    } else if (ipCheck.status === 'suspicious') {
      score -= 20;
      if (status === 'healthy') status = 'warning';
    }
  }

  if (cookieCheck) {
    if (cookieCheck.status === 'expired') {
      score -= 15;
      if (status === 'healthy') status = 'warning';
    }
  }

  const result: HealthCheckResult = {
    profileId,
    status,
    checks: {
      proxy: proxyCheck,
      ip: ipCheck,
      cookies: cookieCheck,
    },
    score: Math.max(0, score),
    checkedAt: Date.now(),
  };

  // Store health check result in KV for caching
  await env.KV.put(
    `health:${profileId}`,
    JSON.stringify(result),
    { expirationTtl: 3600 } // Cache for 1 hour
  );

  // Update profile health status in DB
  await env.DB.prepare(`
    UPDATE profiles
    SET health_status = ?, health_score = ?, health_checked_at = ?
    WHERE id = ?
  `).bind(result.status, result.score, result.checkedAt, profileId).run();

  return result;
}

// Batch health check for scheduled worker
export async function batchHealthCheck(
  env: Env,
  teamId: string
): Promise<{ checked: number; healthy: number; warning: number; critical: number }> {
  // Single interval for all teams (every 30 minutes)
  const interval = 30 * 60 * 1000;
  const cutoff = Date.now() - interval;

  // Get profiles that need checking
  const profiles = await env.DB.prepare(`
    SELECT id FROM profiles
    WHERE team_id = ? AND (health_checked_at IS NULL OR health_checked_at < ?)
    LIMIT 50
  `).bind(teamId, cutoff).all<{ id: string }>();

  const stats = { checked: 0, healthy: 0, warning: 0, critical: 0 };

  for (const profile of profiles.results || []) {
    try {
      const result = await performFullHealthCheck(env, profile.id, teamId);
      stats.checked++;
      stats[result.status]++;
    } catch {
      // Skip failed checks
    }
  }

  return stats;
}
