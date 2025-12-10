import type { Context } from 'hono';
import { ZodError } from 'zod';

// Custom API Error class
export class APIError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(message: string, statusCode: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Error handler middleware
export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(error.message);
    });

    return c.json(
      {
        success: false,
        error: 'Validation Error',
        message: 'Request validation failed',
        details: formattedErrors,
      },
      400
    );
  }

  // Custom API errors
  if (err instanceof APIError) {
    return c.json(
      {
        success: false,
        error: err.message,
        ...(err.details && { details: err.details }),
      },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500
    );
  }

  // Generic errors
  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    },
    500
  );
}

// Common error responses
export const errors = {
  notFound: (resource: string) => new APIError(`${resource} not found`, 404),
  unauthorized: (message = 'Authentication required') => new APIError(message, 401),
  forbidden: (message = 'Access denied') => new APIError(message, 403),
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new APIError(message, 400, details),
  conflict: (message: string) => new APIError(message, 409),
  rateLimited: (retryAfter: number) =>
    new APIError('Too many requests', 429, { retryAfter }),
  serverError: (message = 'Internal server error') => new APIError(message, 500),
};
