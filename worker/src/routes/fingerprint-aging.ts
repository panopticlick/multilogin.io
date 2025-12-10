/**
 * Fingerprint Aging API Routes
 *
 * Endpoints for fingerprint version management and upgrades
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { requirePermission } from '../middleware/auth';
import {
  parseUserAgentVersion,
  isOutdated,
  upgradeFingerprint,
  getUpgradeRecommendation,
  analyzeProfileAging,
} from '../services/fingerprint-aging';
import { getBrowserVersionMap } from '../services/fingerprint-policy';
import { errors } from '../middleware/error';

const app = new Hono<{ Bindings: Env }>();

// GET /api/v1/fingerprint/versions - Get current browser versions
app.get('/versions', async (c) => {
  const versions = await getBrowserVersionMap(c.env);
  return c.json({
    success: true,
    data: versions,
  });
});

// GET /api/v1/fingerprint/analyze - Analyze all profiles for aging
app.get('/analyze', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  // Get all profiles
  const profiles = await c.env.DB.prepare(`
    SELECT id, name, user_agent, created_at, last_active
    FROM profiles
    WHERE team_id = ?
  `).bind(auth.teamId).all<{
    id: string;
    name: string;
    user_agent: string;
    created_at: number;
    last_active: number | null;
  }>();

  if (!profiles.results || profiles.results.length === 0) {
    return c.json({
      success: true,
      data: {
        profiles: [],
        summary: { current: 0, outdated: 0, critical: 0 },
      },
    });
  }

  // Get current versions
  const versions = await getBrowserVersionMap(c.env);

  // Map snake_case DB columns to camelCase for the service
  const mappedProfiles = profiles.results.map(p => ({
    id: p.id,
    name: p.name,
    userAgent: p.user_agent,
    createdAt: p.created_at,
    lastActive: p.last_active,
  }));

  // Analyze profiles
  const analysis = analyzeProfileAging(mappedProfiles, versions);

  // Summary
  const summary = {
    current: analysis.filter(p => p.status === 'current').length,
    outdated: analysis.filter(p => p.status === 'outdated').length,
    critical: analysis.filter(p => p.status === 'critical').length,
  };

  return c.json({
    success: true,
    data: {
      profiles: analysis,
      summary,
    },
  });
});

// GET /api/v1/fingerprint/profile/:id - Get aging status for a profile
app.get('/profile/:id', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  // Get profile
  const profile = await c.env.DB.prepare(`
    SELECT id, name, user_agent, platform, created_at, last_active,
           fingerprint_outdated, fingerprint_version
    FROM profiles
    WHERE id = ? AND team_id = ?
  `).bind(profileId, auth.teamId).first<{
    id: string;
    name: string;
    user_agent: string;
    platform: string;
    created_at: number;
    last_active: number | null;
    fingerprint_outdated: number | null;
    fingerprint_version: number | null;
  }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  // Parse user agent
  const parsed = parseUserAgentVersion(profile.user_agent);

  // Get current versions
  const versions = await getBrowserVersionMap(c.env);

  // Check if outdated
  const aging = isOutdated(profile.user_agent, versions);

  // Get recommendation
  let recommendation = null;
  if (aging && parsed) {
    const accountAge = (Date.now() - profile.created_at) / (24 * 60 * 60 * 1000);
    recommendation = getUpgradeRecommendation(
      aging.currentVersion,
      aging.latestVersion,
      accountAge,
      profile.last_active || profile.created_at
    );
  }

  return c.json({
    success: true,
    data: {
      profileId: profile.id,
      profileName: profile.name,
      browser: parsed,
      aging,
      recommendation,
      lastChecked: profile.fingerprint_outdated ? Date.now() : null,
    },
  });
});

// POST /api/v1/fingerprint/profile/:id/upgrade - Upgrade profile fingerprint
app.post('/profile/:id/upgrade', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const profileId = c.req.param('id');

  const body = await c.req.json();
  const schema = z.object({
    targetVersion: z.number().min(100).max(200).optional(),
    confirm: z.boolean().default(false),
  });

  const { targetVersion, confirm } = schema.parse(body);

  // Get profile
  const profile = await c.env.DB.prepare(`
    SELECT id, name, user_agent, platform, vendor, screen_width, screen_height,
           color_depth, device_memory, hardware_concurrency, webgl_vendor,
           webgl_renderer, timezone, language, created_at, last_active
    FROM profiles
    WHERE id = ? AND team_id = ?
  `).bind(profileId, auth.teamId).first<{
    id: string;
    name: string;
    user_agent: string;
    platform: string;
    vendor: string;
    screen_width: number;
    screen_height: number;
    color_depth: number;
    device_memory: number;
    hardware_concurrency: number;
    webgl_vendor: string | null;
    webgl_renderer: string | null;
    timezone: string;
    language: string;
    created_at: number;
    last_active: number | null;
  }>();

  if (!profile) {
    throw errors.notFound('Profile');
  }

  // Determine target version
  let version = targetVersion;
  if (!version) {
    const versions = await getBrowserVersionMap(c.env);
    version = versions.chrome?.stable ? versions.chrome.stable - 1 : 130; // Stay 1 behind stable
  }

  // Generate upgrade preview
  const upgrade = upgradeFingerprint(
    {
      userAgent: profile.user_agent,
      platform: profile.platform,
      vendor: profile.vendor,
      screenWidth: profile.screen_width,
      screenHeight: profile.screen_height,
      colorDepth: profile.color_depth,
      deviceMemory: profile.device_memory,
      hardwareConcurrency: profile.hardware_concurrency,
      webglVendor: profile.webgl_vendor,
      webglRenderer: profile.webgl_renderer,
      timezone: profile.timezone,
      language: profile.language,
    },
    version
  );

  // If not confirmed, return preview
  if (!confirm) {
    return c.json({
      success: true,
      data: {
        preview: true,
        upgrade,
        message: 'Send confirm: true to apply this upgrade',
      },
    });
  }

  // Apply upgrade
  await c.env.DB.prepare(`
    UPDATE profiles
    SET user_agent = ?,
        fingerprint_outdated = 0,
        fingerprint_version = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    upgrade.userAgent,
    version,
    Date.now(),
    profileId
  ).run();

  // Store client hints in profile metadata
  await c.env.KV.put(
    `profile:${profileId}:client_hints`,
    JSON.stringify(upgrade.clientHints),
    { expirationTtl: 365 * 24 * 60 * 60 } // 1 year
  );

  // Log upgrade
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, team_id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, 'fingerprint_upgraded', 'profile', ?, ?, ?, ?, ?)
  `).bind(
    `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
    auth.teamId,
    auth.userId,
    profileId,
    JSON.stringify({ targetVersion: version, changes: upgrade.changes }),
    c.req.header('CF-Connecting-IP') || '',
    c.req.header('User-Agent') || '',
    Date.now()
  ).run();

  return c.json({
    success: true,
    data: {
      applied: true,
      upgrade,
      message: 'Fingerprint upgraded successfully',
    },
  });
});

// POST /api/v1/fingerprint/batch-upgrade - Upgrade multiple profiles
app.post('/batch-upgrade', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');

  const body = await c.req.json();
  const schema = z.object({
    profileIds: z.array(z.string()).min(1).max(50),
    targetVersion: z.number().min(100).max(200).optional(),
  });

  const { profileIds, targetVersion } = schema.parse(body);

  // Determine target version
  let version = targetVersion;
  if (!version) {
    const versions = await getBrowserVersionMap(c.env);
    version = versions.chrome?.stable ? versions.chrome.stable - 1 : 130;
  }

  const results: Array<{ profileId: string; success: boolean; error?: string }> = [];

  for (const profileId of profileIds) {
    try {
      // Get profile
      const profile = await c.env.DB.prepare(`
        SELECT user_agent FROM profiles WHERE id = ? AND team_id = ?
      `).bind(profileId, auth.teamId).first<{ user_agent: string }>();

      if (!profile) {
        results.push({ profileId, success: false, error: 'Not found' });
        continue;
      }

      // Generate new user agent
      const newUA = profile.user_agent.replace(
        /Chrome\/\d+\.\d+\.\d+\.\d+/,
        `Chrome/${version}.0.0.0`
      );

      // Update profile
      await c.env.DB.prepare(`
        UPDATE profiles
        SET user_agent = ?, fingerprint_outdated = 0, fingerprint_version = ?, updated_at = ?
        WHERE id = ?
      `).bind(newUA, version, Date.now(), profileId).run();

      results.push({ profileId, success: true });
    } catch (error) {
      results.push({
        profileId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return c.json({
    success: true,
    data: {
      total: profileIds.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    },
  });
});

export default app;
