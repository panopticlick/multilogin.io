import { Hono } from 'hono';
import type { Env } from '../types/env';
import { getAllTemplates, getTemplate, generateFingerprint } from '../services/fingerprint';

const app = new Hono<{ Bindings: Env }>();

// GET /api/v1/templates - List all fingerprint templates (public)
app.get('/', async (c) => {
  const templates = getAllTemplates();

  return c.json({
    success: true,
    data: templates,
  });
});

// GET /api/v1/templates/:id - Get template details
app.get('/:id', async (c) => {
  const templateId = c.req.param('id');
  const template = getTemplate(templateId);

  if (!template) {
    return c.json(
      {
        success: false,
        error: 'Template not found',
      },
      404
    );
  }

  return c.json({
    success: true,
    data: {
      id: template.id,
      name: template.name,
      os: template.os,
      browser: template.browser,
      screens: template.screens,
      languages: template.languages,
      timezones: template.timezones,
    },
  });
});

// POST /api/v1/templates/:id/preview - Preview a generated fingerprint
app.post('/:id/preview', async (c) => {
  const templateId = c.req.param('id');
  const fingerprint = generateFingerprint(templateId);

  if (!fingerprint) {
    return c.json(
      {
        success: false,
        error: 'Invalid template ID',
      },
      400
    );
  }

  return c.json({
    success: true,
    data: fingerprint,
  });
});

export { app as templateRoutes };
