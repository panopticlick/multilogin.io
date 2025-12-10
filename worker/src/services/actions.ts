/**
 * Plugin/Action Architecture
 *
 * Enables marketplace extensibility with:
 * - JSON-defined actions (no code execution)
 * - Browser automation primitives
 * - Third-party script marketplace support
 */

import { z } from 'zod';

// Action types supported by the client
export type ActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'wait'
  | 'screenshot'
  | 'scroll'
  | 'hover'
  | 'select'
  | 'extract'
  | 'condition'
  | 'loop'
  | 'variable';

// Base action schema
const baseActionSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  continueOnError: z.boolean().default(false),
  timeout: z.number().min(100).max(60000).default(10000),
});

// Navigate action
const navigateActionSchema = baseActionSchema.extend({
  action: z.literal('navigate'),
  url: z.string().url(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).default('load'),
});

// Click action
const clickActionSchema = baseActionSchema.extend({
  action: z.literal('click'),
  selector: z.string(),
  button: z.enum(['left', 'right', 'middle']).default('left'),
  clickCount: z.number().min(1).max(3).default(1),
  delay: z.number().min(0).max(1000).default(0),
});

// Type action
const typeActionSchema = baseActionSchema.extend({
  action: z.literal('type'),
  selector: z.string(),
  text: z.string(),
  delay: z.number().min(0).max(500).default(50), // Delay between keystrokes
  clearFirst: z.boolean().default(false),
});

// Wait action
const waitActionSchema = baseActionSchema.extend({
  action: z.literal('wait'),
  type: z.enum(['selector', 'navigation', 'timeout', 'function']),
  value: z.string().or(z.number()),
});

// Screenshot action
const screenshotActionSchema = baseActionSchema.extend({
  action: z.literal('screenshot'),
  selector: z.string().optional(), // If provided, screenshot element
  fullPage: z.boolean().default(false),
  outputVariable: z.string().optional(),
});

// Scroll action
const scrollActionSchema = baseActionSchema.extend({
  action: z.literal('scroll'),
  type: z.enum(['to', 'by', 'into-view']),
  selector: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  behavior: z.enum(['auto', 'smooth']).default('smooth'),
});

// Hover action
const hoverActionSchema = baseActionSchema.extend({
  action: z.literal('hover'),
  selector: z.string(),
});

// Select action (dropdown)
const selectActionSchema = baseActionSchema.extend({
  action: z.literal('select'),
  selector: z.string(),
  value: z.string().or(z.array(z.string())),
  by: z.enum(['value', 'label', 'index']).default('value'),
});

// Extract action (get data from page)
const extractActionSchema = baseActionSchema.extend({
  action: z.literal('extract'),
  selector: z.string(),
  attribute: z.string().optional(), // If not provided, gets innerText
  multiple: z.boolean().default(false),
  outputVariable: z.string(),
});

// Condition action
const conditionActionSchema = baseActionSchema.extend({
  action: z.literal('condition'),
  type: z.enum(['exists', 'visible', 'text-contains', 'variable-equals']),
  selector: z.string().optional(),
  variable: z.string().optional(),
  value: z.string().optional(),
  then: z.array(z.lazy(() => actionSchema)),
  else: z.array(z.lazy(() => actionSchema)).optional(),
});

// Loop action
const loopActionSchema = baseActionSchema.extend({
  action: z.literal('loop'),
  type: z.enum(['count', 'while', 'for-each']),
  count: z.number().min(1).max(1000).optional(),
  selector: z.string().optional(), // For for-each
  variable: z.string().optional(), // Loop variable name
  actions: z.array(z.lazy(() => actionSchema)),
  maxIterations: z.number().min(1).max(1000).default(100),
});

// Variable action
const variableActionSchema = baseActionSchema.extend({
  action: z.literal('variable'),
  name: z.string(),
  value: z.string().or(z.number()).or(z.boolean()),
  type: z.enum(['set', 'increment', 'decrement', 'concat']).default('set'),
});

// Combined action schema
export const actionSchema = z.discriminatedUnion('action', [
  navigateActionSchema,
  clickActionSchema,
  typeActionSchema,
  waitActionSchema,
  screenshotActionSchema,
  scrollActionSchema,
  hoverActionSchema,
  selectActionSchema,
  extractActionSchema,
  conditionActionSchema,
  loopActionSchema,
  variableActionSchema,
]);

export type Action = z.infer<typeof actionSchema>;

// Script definition
export const scriptSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  author: z.object({
    id: z.string(),
    name: z.string(),
  }),
  category: z.enum([
    'social-media',
    'e-commerce',
    'automation',
    'data-extraction',
    'testing',
    'other',
  ]),
  tags: z.array(z.string().max(30)).max(10),

  // Script inputs (user-configurable)
  inputs: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'select', 'password']),
    label: z.string(),
    description: z.string().optional(),
    required: z.boolean().default(true),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(), // For select type
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    }).optional(),
  })),

  // Script outputs
  outputs: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'screenshot']),
    description: z.string().optional(),
  })),

  // The actions to execute
  actions: z.array(actionSchema),

  // Metadata
  createdAt: z.number(),
  updatedAt: z.number(),
  downloads: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().default(0),

  // Marketplace
  price: z.number().min(0).default(0), // 0 = free
  currency: z.enum(['USD', 'EUR']).default('USD'),
  published: z.boolean().default(false),
});

export type Script = z.infer<typeof scriptSchema>;

// Script execution context
export interface ExecutionContext {
  variables: Record<string, unknown>;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  screenshots: string[];
  logs: Array<{ level: string; message: string; timestamp: number }>;
  startedAt: number;
  profile: {
    id: string;
    name: string;
  };
}

// Script execution result
export interface ExecutionResult {
  success: boolean;
  outputs: Record<string, unknown>;
  screenshots: string[];
  logs: Array<{ level: string; message: string; timestamp: number }>;
  error?: string;
  duration: number;
  actionsExecuted: number;
}

// Validate a script
export function validateScript(script: unknown): { valid: boolean; errors: string[] } {
  try {
    scriptSchema.parse(script);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

// Validate a single action
export function validateAction(action: unknown): { valid: boolean; errors: string[] } {
  try {
    actionSchema.parse(action);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

// Example scripts for marketplace

export const EXAMPLE_SCRIPTS: Partial<Script>[] = [
  {
    id: 'script_amazon_wishlist',
    name: 'Amazon Add to Wishlist',
    description: 'Automatically adds a product to your Amazon wishlist',
    version: '1.0.0',
    category: 'e-commerce',
    tags: ['amazon', 'wishlist', 'shopping'],
    inputs: [
      {
        name: 'productUrl',
        type: 'string',
        label: 'Product URL',
        description: 'The Amazon product page URL',
        required: true,
      },
      {
        name: 'wishlistName',
        type: 'string',
        label: 'Wishlist Name',
        description: 'Which wishlist to add to',
        required: false,
        default: 'Default',
      },
    ],
    outputs: [
      {
        name: 'success',
        type: 'boolean',
        description: 'Whether the item was added successfully',
      },
      {
        name: 'productTitle',
        type: 'string',
        description: 'The title of the added product',
      },
    ],
    actions: [
      {
        action: 'navigate',
        url: '{{inputs.productUrl}}',
        waitUntil: 'networkidle',
      },
      {
        action: 'extract',
        selector: '#productTitle',
        outputVariable: 'productTitle',
      },
      {
        action: 'click',
        selector: '#add-to-wishlist-button-submit',
      },
      {
        action: 'wait',
        type: 'selector',
        value: '.a-alert-success',
        timeout: 5000,
      },
      {
        action: 'variable',
        name: 'success',
        value: true,
      },
    ],
  },
  {
    id: 'script_instagram_like',
    name: 'Instagram Auto Like',
    description: 'Like posts from a specific hashtag',
    version: '1.0.0',
    category: 'social-media',
    tags: ['instagram', 'like', 'automation'],
    inputs: [
      {
        name: 'hashtag',
        type: 'string',
        label: 'Hashtag',
        description: 'The hashtag to search (without #)',
        required: true,
      },
      {
        name: 'likeCount',
        type: 'number',
        label: 'Number of Likes',
        description: 'How many posts to like',
        required: true,
        default: 5,
        validation: { min: 1, max: 20 },
      },
    ],
    outputs: [
      {
        name: 'likedCount',
        type: 'number',
        description: 'Number of posts actually liked',
      },
    ],
    actions: [
      {
        action: 'navigate',
        url: 'https://www.instagram.com/explore/tags/{{inputs.hashtag}}/',
        waitUntil: 'networkidle',
      },
      {
        action: 'variable',
        name: 'likedCount',
        value: 0,
      },
      {
        action: 'loop',
        type: 'count',
        count: '{{inputs.likeCount}}',
        variable: 'i',
        actions: [
          {
            action: 'click',
            selector: 'article a[href*="/p/"]',
          },
          {
            action: 'wait',
            type: 'selector',
            value: '[aria-label="Like"]',
          },
          {
            action: 'click',
            selector: '[aria-label="Like"]',
          },
          {
            action: 'variable',
            name: 'likedCount',
            value: 1,
            type: 'increment',
          },
          {
            action: 'wait',
            type: 'timeout',
            value: 2000,
          },
          {
            action: 'click',
            selector: '[aria-label="Close"]',
          },
          {
            action: 'wait',
            type: 'timeout',
            value: 1000,
          },
        ],
      },
    ],
  },
];

// Security: Sanitize script before execution
export function sanitizeScript(script: Script): Script {
  // Remove any potential script injection
  const sanitize = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeAction = (action: Action): Action => {
    const sanitized = { ...action };

    if ('url' in sanitized && typeof sanitized.url === 'string') {
      // Only allow http/https URLs
      if (!sanitized.url.match(/^https?:\/\//) && !sanitized.url.startsWith('{{')) {
        sanitized.url = 'about:blank';
      }
    }

    if ('selector' in sanitized && typeof sanitized.selector === 'string') {
      sanitized.selector = sanitize(sanitized.selector);
    }

    if ('text' in sanitized && typeof sanitized.text === 'string') {
      sanitized.text = sanitize(sanitized.text);
    }

    return sanitized;
  };

  return {
    ...script,
    actions: script.actions.map(sanitizeAction),
  };
}
