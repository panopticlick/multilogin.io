import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { requirePermission } from '../middleware/auth';
import { errors } from '../middleware/error';
import {
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  ensureDefaultPolicy,
  evaluateProfileAgainstPolicy,
  listBrowserVersions,
  upsertBrowserVersions,
  getPolicy,
} from '../services/fingerprint-policy';
import type { PolicyInput } from '../services/fingerprint-policy';

const app = new Hono<{ Bindings: Env }>();

const policySchema = z.object({
  name: z.string().min(2),
  description: z.string().max(500).optional(),
  maxVersionsBehind: z.number().min(0).max(10).optional(),
  maxVersionsBehindMobile: z.number().min(0).max(10).optional(),
  autoUpgrade: z.boolean().optional(),
  upgradeWindowHours: z.number().min(1).max(168).optional(),
  requireManualApproval: z.boolean().optional(),
  riskTolerance: z.enum(['conservative', 'balanced', 'aggressive']).optional(),
  allowedBrowsers: z.array(z.string()).optional(),
  preferredProxyTypes: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  notificationChannels: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

app.get('/', requirePermission('team:read'), async (c) => {
  const auth = c.get('auth');
  await ensureDefaultPolicy(c.env, auth.teamId);
  const policies = await listPolicies(c.env, auth.teamId);
  return c.json({ success: true, data: policies });
});

app.post('/', requirePermission('team:manage'), async (c) => {
  const auth = c.get('auth');
  const body = policySchema.parse(await c.req.json());
  const policy = await createPolicy(c.env, auth.teamId, body as PolicyInput);
  return c.json({ success: true, data: policy });
});

app.patch('/:id', requirePermission('team:manage'), async (c) => {
  const auth = c.get('auth');
  const body = policySchema.partial().parse(await c.req.json());
  const policyId = c.req.param('id');
  const policy = await updatePolicy(c.env, auth.teamId, policyId, body as PolicyInput);
  return c.json({ success: true, data: policy });
});

app.delete('/:id', requirePermission('team:manage'), async (c) => {
  const auth = c.get('auth');
  const policyId = c.req.param('id');
  await deletePolicy(c.env, auth.teamId, policyId);
  return c.json({ success: true });
});

app.post('/:id/evaluate', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');
  const schema = z.object({ profileId: z.string().min(6) });
  const { profileId } = schema.parse(await c.req.json());
  const policyId = c.req.param('id');
  const policy = await getPolicy(c.env, auth.teamId, policyId);

  if (!policy) {
    throw errors.notFound('Policy');
  }

  const evaluation = await evaluateProfileAgainstPolicy(c.env, auth.teamId, profileId, policy);
  return c.json({ success: true, data: evaluation });
});

const browserVersionSchema = z.object({
  browser: z.string().min(2),
  channel: z.string().min(2),
  platform: z.string().min(2),
  region: z.string().min(2).optional(),
  version: z.number().min(50).max(300),
  majorVersion: z.number().min(50).max(300).optional(),
  releaseDate: z.number().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

app.get('/browser-versions', requirePermission('team:read'), async (c) => {
  const versions = await listBrowserVersions(c.env);
  return c.json({ success: true, data: versions });
});

app.post('/browser-versions', requirePermission('team:manage'), async (c) => {
  const body = await c.req.json();
  const entries = Array.isArray(body) ? body : [body];
  const parsed = entries.map((entry) => browserVersionSchema.parse(entry));
  await upsertBrowserVersions(c.env, parsed);
  return c.json({ success: true });
});

export default app;
