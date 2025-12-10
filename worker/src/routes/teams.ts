import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { Team, TeamMember } from '../types/models';
import { errors } from '../middleware/error';
import { requirePermission } from '../middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// Helper function
function generateId(prefix: string): string {
  const random = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

// Schemas
const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

// GET /api/v1/teams/current - Get current team
app.get('/current', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');

  const team = await c.env.DB.prepare(`
    SELECT t.*, u.name as owner_name, u.email as owner_email
    FROM teams t
    JOIN users u ON u.id = t.owner_id
    WHERE t.id = ?
  `)
    .bind(auth.teamId)
    .first<Team & { owner_name: string; owner_email: string }>();

  if (!team) {
    throw errors.notFound('Team');
  }

  // Get member count
  const memberCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM team_members WHERE team_id = ?
  `)
    .bind(auth.teamId)
    .first<{ count: number }>();

  // Get profile count
  const profileCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM profiles WHERE team_id = ?
  `)
    .bind(auth.teamId)
    .first<{ count: number }>();

  return c.json({
    success: true,
    data: {
      id: team.id,
      name: team.name,
      plan: 'free',
      owner: {
        id: team.owner_id,
        name: team.owner_name,
        email: team.owner_email,
      },
      memberCount: memberCount?.count || 0,
      profileCount: profileCount?.count || 0,
      createdAt: team.created_at,
    },
  });
});

// PATCH /api/v1/teams/current - Update team
app.patch('/current', requirePermission('team:update'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = updateTeamSchema.parse(body);

  // Only owner/admin can update team
  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw errors.forbidden('Only team owner or admin can update team settings');
  }

  const updates: string[] = ['updated_at = ?'];
  const params: (string | number)[] = [Date.now()];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }

  params.push(auth.teamId);

  await c.env.DB.prepare(`
    UPDATE teams SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();

  return c.json({
    success: true,
    message: 'Team updated successfully',
  });
});

// GET /api/v1/teams/members - List team members
app.get('/members', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');

  const members = await c.env.DB.prepare(`
    SELECT
      tm.id,
      tm.role,
      tm.joined_at,
      u.id as user_id,
      u.email,
      u.name,
      u.image
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id = ?
    ORDER BY tm.role DESC, tm.joined_at ASC
  `)
    .bind(auth.teamId)
    .all<{
      id: string;
      role: string;
      joined_at: number;
      user_id: string;
      email: string;
      name: string;
      image: string | null;
    }>();

  return c.json({
    success: true,
    data: members.results.map((m) => ({
      id: m.id,
      userId: m.user_id,
      email: m.email,
      name: m.name,
      image: m.image,
      role: m.role,
      joinedAt: m.joined_at,
    })),
  });
});

// POST /api/v1/teams/members/invite - Invite member
app.post('/members/invite', requirePermission('team:invite'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = inviteMemberSchema.parse(body);

  // Only owner/admin can invite
  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw errors.forbidden('Only team owner or admin can invite members');
  }

  // Check plan limits for members
  // Free plan only: no member cap

  // Check if user exists
  const user = await c.env.DB.prepare(`
    SELECT id, email, name FROM users WHERE email = ?
  `)
    .bind(data.email.toLowerCase())
    .first<{ id: string; email: string; name: string }>();

  if (!user) {
    // In production: Send invitation email
    // For now, create an invitation record
    const inviteId = generateId('inv');
    const now = Date.now();

    await c.env.DB.prepare(`
      INSERT INTO team_invitations (id, team_id, email, role, invited_by, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      inviteId,
      auth.teamId,
      data.email.toLowerCase(),
      data.role,
      auth.userId,
      now,
      now + 7 * 24 * 60 * 60 * 1000 // 7 days
    ).run();

    return c.json({
      success: true,
      message: 'Invitation sent. User will receive an email to join.',
      data: {
        invitationId: inviteId,
        email: data.email,
        role: data.role,
      },
    }, 201);
  }

  // Check if already a member
  const existingMember = await c.env.DB.prepare(`
    SELECT id FROM team_members WHERE team_id = ? AND user_id = ?
  `)
    .bind(auth.teamId, user.id)
    .first();

  if (existingMember) {
    throw errors.conflict('User is already a team member');
  }

  // Add as member
  const memberId = generateId('tm');
  const now = Date.now();

  await c.env.DB.prepare(`
    INSERT INTO team_members (id, team_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(memberId, auth.teamId, user.id, data.role, now).run();

  return c.json({
    success: true,
    message: 'Member added successfully',
    data: {
      id: memberId,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: data.role,
      joinedAt: now,
    },
  }, 201);
});

// PATCH /api/v1/teams/members/:memberId - Update member role
app.patch('/members/:memberId', requirePermission('team:update'), async (c) => {
  const auth = c.get('auth');
  const memberId = c.req.param('memberId');
  const body = await c.req.json();
  const data = updateMemberSchema.parse(body);

  // Only owner/admin can update roles
  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw errors.forbidden('Only team owner or admin can update member roles');
  }

  // Get member
  const member = await c.env.DB.prepare(`
    SELECT tm.*, u.email
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.id = ? AND tm.team_id = ?
  `)
    .bind(memberId, auth.teamId)
    .first<TeamMember & { email: string }>();

  if (!member) {
    throw errors.notFound('Team member');
  }

  // Can't change owner's role
  if (member.role === 'owner') {
    throw errors.forbidden('Cannot change team owner role');
  }

  // Admin can't change other admin's role (only owner can)
  if (member.role === 'admin' && auth.role !== 'owner') {
    throw errors.forbidden('Only team owner can modify admin roles');
  }

  await c.env.DB.prepare(`
    UPDATE team_members SET role = ? WHERE id = ? AND team_id = ?
  `).bind(data.role, memberId, auth.teamId).run();

  return c.json({
    success: true,
    message: 'Member role updated',
  });
});

// DELETE /api/v1/teams/members/:memberId - Remove member
app.delete('/members/:memberId', requirePermission('team:update'), async (c) => {
  const auth = c.get('auth');
  const memberId = c.req.param('memberId');

  // Get member
  const member = await c.env.DB.prepare(`
    SELECT * FROM team_members WHERE id = ? AND team_id = ?
  `)
    .bind(memberId, auth.teamId)
    .first<TeamMember>();

  if (!member) {
    throw errors.notFound('Team member');
  }

  // Can't remove owner
  if (member.role === 'owner') {
    throw errors.forbidden('Cannot remove team owner');
  }

  // Only owner/admin can remove others
  if (auth.role !== 'owner' && auth.role !== 'admin') {
    // Users can remove themselves
    if (member.user_id !== auth.userId) {
      throw errors.forbidden('Only team owner or admin can remove members');
    }
  }

  // Admin can't remove other admins (only owner can)
  if (member.role === 'admin' && auth.role !== 'owner' && member.user_id !== auth.userId) {
    throw errors.forbidden('Only team owner can remove admins');
  }

  await c.env.DB.prepare(`
    DELETE FROM team_members WHERE id = ? AND team_id = ?
  `).bind(memberId, auth.teamId).run();

  return c.json({
    success: true,
    message: 'Member removed from team',
  });
});

// POST /api/v1/teams/leave - Leave team (for non-owners)
app.post('/leave', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');

  if (auth.role === 'owner') {
    throw errors.forbidden('Team owner cannot leave. Transfer ownership first or delete the team.');
  }

  await c.env.DB.prepare(`
    DELETE FROM team_members WHERE team_id = ? AND user_id = ?
  `).bind(auth.teamId, auth.userId).run();

  return c.json({
    success: true,
    message: 'You have left the team',
  });
});

// GET /api/v1/teams/invitations - List pending invitations
app.get('/invitations', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');

  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw errors.forbidden('Only team owner or admin can view invitations');
  }

  const invitations = await c.env.DB.prepare(`
    SELECT
      ti.*,
      u.name as invited_by_name
    FROM team_invitations ti
    JOIN users u ON u.id = ti.invited_by
    WHERE ti.team_id = ? AND ti.expires_at > ?
    ORDER BY ti.created_at DESC
  `)
    .bind(auth.teamId, Date.now())
    .all();

  return c.json({
    success: true,
    data: invitations.results,
  });
});

// DELETE /api/v1/teams/invitations/:inviteId - Cancel invitation
app.delete('/invitations/:inviteId', requirePermission('team:invite'), async (c) => {
  const auth = c.get('auth');
  const inviteId = c.req.param('inviteId');

  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw errors.forbidden('Only team owner or admin can cancel invitations');
  }

  await c.env.DB.prepare(`
    DELETE FROM team_invitations WHERE id = ? AND team_id = ?
  `).bind(inviteId, auth.teamId).run();

  return c.json({
    success: true,
    message: 'Invitation cancelled',
  });
});

export { app as teamRoutes };
