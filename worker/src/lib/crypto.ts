/**
 * Encryption utilities for sensitive data storage
 * Uses AES-256-GCM for symmetric encryption with derived keys
 */

// Derive an encryption key from a secret using PBKDF2
async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate a random IV for AES-GCM (12 bytes recommended)
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

// Generate a random salt for key derivation (16 bytes)
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Convert Uint8Array to base64 string
function uint8ArrayToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr));
}

// Convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns a base64-encoded string containing: salt (16 bytes) + iv (12 bytes) + ciphertext
 */
export async function encrypt(plaintext: string, secret: string): Promise<string> {
  if (!plaintext) return '';

  const encoder = new TextEncoder();
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(secret, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine salt + iv + ciphertext into a single array
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt a ciphertext string encrypted with encrypt()
 * Expects base64-encoded string containing: salt (16 bytes) + iv (12 bytes) + ciphertext
 */
export async function decrypt(encryptedBase64: string, secret: string): Promise<string> {
  if (!encryptedBase64) return '';

  try {
    const combined = base64ToUint8Array(encryptedBase64);

    // Extract salt, iv, and ciphertext
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveKey(secret, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    // Return empty string if decryption fails (corrupted or wrong key)
    return '';
  }
}

/**
 * Check if a string appears to be encrypted (base64 encoded with sufficient length)
 * Encrypted strings have at least 28 bytes (16 salt + 12 iv) plus ciphertext
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  try {
    const decoded = base64ToUint8Array(value);
    return decoded.length >= 28; // salt (16) + iv (12) = 28 minimum
  } catch {
    return false;
  }
}

/**
 * Encrypt proxy password for storage
 * Uses JWT_SECRET as the encryption key
 */
export async function encryptProxyPassword(password: string | null | undefined, jwtSecret: string): Promise<string | null> {
  if (!password) return null;
  return encrypt(password, jwtSecret);
}

/**
 * Decrypt proxy password for use
 * Returns original password or empty string if decryption fails
 */
export async function decryptProxyPassword(encryptedPassword: string | null | undefined, jwtSecret: string): Promise<string | null> {
  if (!encryptedPassword) return null;
  const decrypted = await decrypt(encryptedPassword, jwtSecret);
  return decrypted || null;
}
