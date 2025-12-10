/**
 * Scheduled Worker (Cron Trigger)
 *
 * Runs automated tasks:
 * - Profile health checks
 * - Fingerprint aging notifications
 * - Cleanup of expired data
 */

import type { Env } from './types/env';
import { batchHealthCheck } from './services/health';

export interface ScheduledEvent {
  cron: string;
  type: string;
  scheduledTime: number;
}

const scheduledHandler = {
  async scheduled(event: ScheduledEvent, env: Env) {
    console.log(`Cron triggered: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`);

    switch (event.cron) {
      case '*/15 * * * *':
        await runHealthChecks(env);
        break;

      case '*/30 * * * *':
        await runHealthChecks(env);
        break;

      case '0 * * * *':
        await runHealthChecks(env);
        break;

      case '0 3 * * *':
        await runHealthChecks(env);
        await cleanupExpiredData(env);
        await checkFingerprintAging(env);
        break;

      // Every week - Send aging notifications
      case '0 9 * * 1':
        await sendAgingNotifications(env);
        break;

      default:
        console.log(`Unknown cron: ${event.cron}`);
    }
  },
};

export default scheduledHandler;

// Run health checks for all teams (single free plan)
async function runHealthChecks(env: Env) {
  console.log('Running health checks for all teams');

  const teams = await env.DB.prepare(`
    SELECT id FROM teams
  `).all<{ id: string }>();

  let totalChecked = 0;
  let totalHealthy = 0;
  let totalWarning = 0;
  let totalCritical = 0;

  for (const team of teams.results || []) {
    try {
      const stats = await batchHealthCheck(env, team.id);
      totalChecked += stats.checked;
      totalHealthy += stats.healthy;
      totalWarning += stats.warning;
      totalCritical += stats.critical;
    } catch (error) {
      console.error(`Health check failed for team ${team.id}:`, error);
    }
  }

  console.log(`Health check complete: ${totalChecked} profiles checked`);
  console.log(`Results: ${totalHealthy} healthy, ${totalWarning} warning, ${totalCritical} critical`);
}

// Cleanup expired data
async function cleanupExpiredData(env: Env) {
  console.log('Cleaning up expired data');

  const now = Date.now();

  // Delete expired team invitations
  const inviteResult = await env.DB.prepare(`
    DELETE FROM team_invitations WHERE expires_at < ?
  `).bind(now).run();
  console.log(`Deleted ${inviteResult.meta?.changes || 0} expired invites`);

  // Delete expired API keys
  const apiKeyResult = await env.DB.prepare(`
    DELETE FROM api_keys WHERE expires_at IS NOT NULL AND expires_at < ?
  `).bind(now).run();
  console.log(`Deleted ${apiKeyResult.meta?.changes || 0} expired API keys`);

  // Clean up old audit logs (keep 90 days)
  const auditCutoff = now - (90 * 24 * 60 * 60 * 1000);
  const auditResult = await env.DB.prepare(`
    DELETE FROM audit_logs WHERE created_at < ?
  `).bind(auditCutoff).run();
  console.log(`Deleted ${auditResult.meta?.changes || 0} old audit logs`);

  // Clean up old profile versions from R2 (keep 30 days)
  // Note: R2 lifecycle rules should handle this, but we track it
  console.log('R2 cleanup delegated to lifecycle rules');
}

// Check for fingerprint aging issues
async function checkFingerprintAging(env: Env) {
  console.log('Checking fingerprint aging');

  // Get current Chrome version (would be updated via external source)
  const currentChromeVersion = await env.KV.get('current_chrome_version') || '131';
  const majorVersion = parseInt(currentChromeVersion);

  // Find profiles with outdated user agents
  const outdatedProfiles = await env.DB.prepare(`
    SELECT p.id, p.name, p.user_agent, p.team_id, t.owner_id
    FROM profiles p
    JOIN teams t ON t.id = p.team_id
    WHERE p.user_agent LIKE '%Chrome/%'
  `).all<{
    id: string;
    name: string;
    user_agent: string;
    team_id: string;
    owner_id: string;
  }>();

  const agingProfiles: { profileId: string; profileName: string; ownerId: string; currentVersion: number; latestVersion: number }[] = [];

  for (const profile of outdatedProfiles.results || []) {
    // Extract Chrome version from user agent
    const match = profile.user_agent.match(/Chrome\/(\d+)\./);
    if (match) {
      const profileVersion = parseInt(match[1]);
      // Flag if more than 2 versions behind
      if (majorVersion - profileVersion > 2) {
        agingProfiles.push({
          profileId: profile.id,
          profileName: profile.name,
          ownerId: profile.owner_id,
          currentVersion: profileVersion,
          latestVersion: majorVersion,
        });

        // Update profile with aging flag
        await env.DB.prepare(`
          UPDATE profiles
          SET fingerprint_outdated = 1, fingerprint_version = ?
          WHERE id = ?
        `).bind(profileVersion, profile.id).run();
      }
    }
  }

  console.log(`Found ${agingProfiles.length} profiles with outdated fingerprints`);

  // Store aging report for notifications
  if (agingProfiles.length > 0) {
    await env.KV.put(
      'fingerprint_aging_report',
      JSON.stringify({
        profiles: agingProfiles,
        checkedAt: Date.now(),
        latestVersion: majorVersion,
      }),
      { expirationTtl: 7 * 24 * 60 * 60 } // Keep for 1 week
    );
  }
}

// Send aging notifications to users
async function sendAgingNotifications(env: Env) {
  console.log('Sending fingerprint aging notifications');

  const reportJson = await env.KV.get('fingerprint_aging_report');
  if (!reportJson) {
    console.log('No aging report found');
    return;
  }

  const report = JSON.parse(reportJson) as {
    profiles: Array<{ profileId: string; profileName: string; ownerId: string; currentVersion: number; latestVersion: number }>;
    latestVersion: number;
  };

  // Group by owner for consolidated notifications
  const byOwner = new Map<string, typeof report.profiles>();
  for (const profile of report.profiles) {
    if (!byOwner.has(profile.ownerId)) {
      byOwner.set(profile.ownerId, []);
    }
    byOwner.get(profile.ownerId)!.push(profile);
  }

  // In production, would send emails via email service (SendGrid, etc.)
  // For now, we log and could trigger webhooks
  for (const [ownerId, profiles] of byOwner) {
    console.log(`User ${ownerId} has ${profiles.length} profiles needing fingerprint update`);

    // Get team_id for the user
    const userTeam = await env.DB.prepare(`
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = ? LIMIT 1
    `).bind(ownerId).first<{ team_id: string }>();

    if (userTeam) {
      // Store notification in DB
      await env.DB.prepare(`
        INSERT INTO notifications (id, team_id, user_id, type, title, message, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        `notif_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
        userTeam.team_id,
        ownerId,
        'fingerprint_aging',
        'Fingerprint Update Available',
        `${profiles.length} of your browser profiles have outdated fingerprints. Update them to avoid detection.`,
        JSON.stringify({ profiles: profiles.map(p => ({ id: p.profileId, name: p.profileName })) }),
        Date.now()
      ).run();
    }
  }

  console.log(`Sent notifications to ${byOwner.size} users`);
}
