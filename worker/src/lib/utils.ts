/**
 * Worker utility functions
 */

/**
 * Safely parse JSON with error handling
 * @param json JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse JSON that should not fail (throws on error)
 * Use this when JSON is expected to be valid (e.g., from database)
 * @param json JSON string to parse
 * @param context Context for error message
 * @returns Parsed value
 */
export function parseJsonOrThrow<T>(json: string, context: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse JSON in ${context}: ${message}`);
  }
}

/**
 * Generate a unique ID with optional prefix
 * @param prefix Prefix for the ID (e.g., 'profile', 'proxy')
 * @returns Unique ID string
 */
export function generateId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}
