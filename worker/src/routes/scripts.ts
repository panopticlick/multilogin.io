/**
 * Scripts/Actions Marketplace API Routes
 *
 * Endpoints for the plugin/action marketplace
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/env';
import { requirePermission } from '../middleware/auth';
import { validateScript, validateAction, sanitizeScript, EXAMPLE_SCRIPTS } from '../services/actions';
import type { Script } from '../services/actions';
import { errors } from '../middleware/error';
import { safeJsonParse } from '../lib/utils';

const app = new Hono<{ Bindings: Env }>();

// GET /api/v1/scripts - List available scripts
app.get('/', async (c) => {
  const query = c.req.query();

  const schema = z.object({
    category: z.enum([
      'social-media', 'e-commerce', 'automation',
      'data-extraction', 'testing', 'other'
    ]).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'downloads', 'rating', 'createdAt']).default('downloads'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  });

  const { category, search, sortBy, sortOrder, page, limit } = schema.parse(query);

  // Build query conditions
  const conditions: string[] = ['published = 1'];
  const params: (string | number)[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ? OR tags LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const offset = (page - 1) * limit;

  // Get scripts
  const scripts = await c.env.DB.prepare(`
    SELECT id, name, description, version, category, tags, price, currency,
           downloads, rating, reviews, created_at, updated_at,
           author_id, author_name
    FROM scripts
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${sortBy === 'createdAt' ? 'created_at' : sortBy} ${sortOrder}
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  // Get total count
  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM scripts WHERE ${conditions.join(' AND ')}
  `).bind(...params).first<{ total: number }>();

  return c.json({
    success: true,
    data: {
      scripts: scripts.results || [],
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / limit),
      },
    },
  });
});

// GET /api/v1/scripts/featured - Get featured scripts
app.get('/featured', async (c) => {
  const scripts = await c.env.DB.prepare(`
    SELECT id, name, description, version, category, tags, price, currency,
           downloads, rating, reviews, author_name
    FROM scripts
    WHERE published = 1 AND featured = 1
    ORDER BY downloads DESC
    LIMIT 10
  `).all();

  return c.json({
    success: true,
    data: scripts.results || [],
  });
});

// GET /api/v1/scripts/examples - Get example scripts
app.get('/examples', async (c) => {
  return c.json({
    success: true,
    data: EXAMPLE_SCRIPTS,
  });
});

// GET /api/v1/scripts/:id - Get script details
app.get('/:id', async (c) => {
  const scriptId = c.req.param('id');

  const script = await c.env.DB.prepare(`
    SELECT * FROM scripts WHERE id = ? AND published = 1
  `).bind(scriptId).first();

  if (!script) {
    throw errors.notFound('Script');
  }

  // Parse JSON fields safely
  const parsed = {
    ...script,
    tags: safeJsonParse<string[]>(script.tags as string, []),
    inputs: safeJsonParse<unknown[]>(script.inputs as string, []),
    outputs: safeJsonParse<unknown[]>(script.outputs as string, []),
    actions: safeJsonParse<unknown[]>(script.actions as string, []),
  };

  return c.json({
    success: true,
    data: parsed,
  });
});

// POST /api/v1/scripts/validate - Validate a script
app.post('/validate', async (c) => {
  const body = await c.req.json();

  const result = validateScript(body);

  return c.json({
    success: result.valid,
    data: result,
  });
});

// POST /api/v1/scripts/validate-action - Validate a single action
app.post('/validate-action', async (c) => {
  const body = await c.req.json();

  const result = validateAction(body);

  return c.json({
    success: result.valid,
    data: result,
  });
});

// POST /api/v1/scripts - Create/submit a script (requires auth)
app.post('/', requirePermission('profiles:create'), async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  // Validate script
  const validation = validateScript(body);
  if (!validation.valid) {
    throw errors.badRequest('Invalid script', { errors: validation.errors });
  }

  // Sanitize script
  const script = sanitizeScript(body as Script);

  // Generate ID
  const scriptId = `script_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;

  // Get author name
  const user = await c.env.DB.prepare(`
    SELECT name FROM users WHERE id = ?
  `).bind(auth.userId).first<{ name: string }>();

  // Insert script
  await c.env.DB.prepare(`
    INSERT INTO scripts (
      id, name, description, version, category, tags, inputs, outputs, actions,
      price, currency, published, author_id, author_name, created_at, updated_at,
      downloads, rating, reviews
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
  `).bind(
    scriptId,
    script.name,
    script.description || '',
    script.version,
    script.category,
    JSON.stringify(script.tags),
    JSON.stringify(script.inputs),
    JSON.stringify(script.outputs),
    JSON.stringify(script.actions),
    0,
    'USD',
    0, // Not published initially
    auth.userId,
    user?.name || 'Anonymous',
    Date.now(),
    Date.now()
  ).run();

  return c.json({
    success: true,
    data: {
      id: scriptId,
      message: 'Script created. Submit for review to publish.',
    },
  }, 201);
});

// GET /api/v1/scripts/my - Get user's scripts
app.get('/my', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  const scripts = await c.env.DB.prepare(`
    SELECT id, name, description, version, category, price, published,
           downloads, rating, reviews, created_at, updated_at
    FROM scripts
    WHERE author_id = ?
    ORDER BY updated_at DESC
  `).bind(auth.userId).all();

  return c.json({
    success: true,
    data: scripts.results || [],
  });
});

// PATCH /api/v1/scripts/:id - Update a script
app.patch('/:id', requirePermission('profiles:update'), async (c) => {
  const auth = c.get('auth');
  const scriptId = c.req.param('id');
  const body = await c.req.json();

  // Verify ownership
  const existing = await c.env.DB.prepare(`
    SELECT author_id FROM scripts WHERE id = ?
  `).bind(scriptId).first<{ author_id: string }>();

  if (!existing) {
    throw errors.notFound('Script');
  }

  if (existing.author_id !== auth.userId) {
    throw errors.forbidden('You can only update your own scripts');
  }

  // Partial update schema
  const updateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
    category: z.enum([
      'social-media', 'e-commerce', 'automation',
      'data-extraction', 'testing', 'other'
    ]).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    inputs: z.array(z.any()).optional(),
    outputs: z.array(z.any()).optional(),
    actions: z.array(z.any()).optional(),
  });

  const updates = updateSchema.parse(body);

  // Build update query
  const setClauses: string[] = ['updated_at = ?'];
  const params: (string | number)[] = [Date.now()];

  if (updates.name) {
    setClauses.push('name = ?');
    params.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    params.push(updates.description);
  }
  if (updates.version) {
    setClauses.push('version = ?');
    params.push(updates.version);
  }
  if (updates.category) {
    setClauses.push('category = ?');
    params.push(updates.category);
  }
  if (updates.tags) {
    setClauses.push('tags = ?');
    params.push(JSON.stringify(updates.tags));
  }
  if (updates.inputs) {
    setClauses.push('inputs = ?');
    params.push(JSON.stringify(updates.inputs));
  }
  if (updates.outputs) {
    setClauses.push('outputs = ?');
    params.push(JSON.stringify(updates.outputs));
  }
  if (updates.actions) {
    setClauses.push('actions = ?');
    params.push(JSON.stringify(updates.actions));
  }

  // Unpublish on update (requires re-review)
  setClauses.push('published = 0');

  params.push(scriptId);

  await c.env.DB.prepare(`
    UPDATE scripts SET ${setClauses.join(', ')} WHERE id = ?
  `).bind(...params).run();

  return c.json({
    success: true,
    message: 'Script updated. Submit for review to re-publish.',
  });
});

// DELETE /api/v1/scripts/:id - Delete a script
app.delete('/:id', requirePermission('profiles:delete'), async (c) => {
  const auth = c.get('auth');
  const scriptId = c.req.param('id');

  // Verify ownership
  const existing = await c.env.DB.prepare(`
    SELECT author_id FROM scripts WHERE id = ?
  `).bind(scriptId).first<{ author_id: string }>();

  if (!existing) {
    throw errors.notFound('Script');
  }

  if (existing.author_id !== auth.userId) {
    throw errors.forbidden('You can only delete your own scripts');
  }

  await c.env.DB.prepare(`DELETE FROM scripts WHERE id = ?`).bind(scriptId).run();

  return c.json({
    success: true,
    message: 'Script deleted',
  });
});

// POST /api/v1/scripts/:id/install - Install/purchase a script
app.post('/:id/install', requirePermission('profiles:create'), async (c) => {
  const auth = c.get('auth');
  const scriptId = c.req.param('id');

  // Get script
  const script = await c.env.DB.prepare(`
    SELECT id, name, price, currency, published FROM scripts WHERE id = ?
  `).bind(scriptId).first<{
    id: string;
    name: string;
    price: number;
    currency: string;
    published: number;
  }>();

  if (!script || !script.published) {
    throw errors.notFound('Script');
  }

  // Check if already installed
  const existing = await c.env.DB.prepare(`
    SELECT id FROM user_scripts WHERE user_id = ? AND script_id = ?
  `).bind(auth.userId, scriptId).first();

  if (existing) {
    return c.json({
      success: true,
      data: { alreadyInstalled: true },
      message: 'Script already installed',
    });
  }

  // Install script
  await c.env.DB.prepare(`
    INSERT INTO user_scripts (id, user_id, script_id, installed_at)
    VALUES (?, ?, ?, ?)
  `).bind(
    `us_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
    auth.userId,
    scriptId,
    Date.now()
  ).run();

  // Increment download count
  await c.env.DB.prepare(`
    UPDATE scripts SET downloads = downloads + 1 WHERE id = ?
  `).bind(scriptId).run();

  return c.json({
    success: true,
    message: 'Script installed successfully',
  });
});

// GET /api/v1/scripts/installed - Get user's installed scripts
app.get('/installed', requirePermission('profiles:read'), async (c) => {
  const auth = c.get('auth');

  const scripts = await c.env.DB.prepare(`
    SELECT s.id, s.name, s.description, s.version, s.category,
           us.installed_at
    FROM user_scripts us
    JOIN scripts s ON s.id = us.script_id
    WHERE us.user_id = ?
    ORDER BY us.installed_at DESC
  `).bind(auth.userId).all();

  return c.json({
    success: true,
    data: scripts.results || [],
  });
});

export default app;
