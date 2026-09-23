/**
 * Key derivation primitives using the Web Crypto API.
 * Uses PBKDF2 with HMAC-SHA-256 to derive a 256-bit AES-GCM CryptoKey.
 */

export const DEFAULT_PBKDF2_ITERATIONS = 600000;
export const DEFAULT_SALT_LENGTH = 16; // 128 bits

/**
 * Converts a Uint8Array to a standard base64 string.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a base64 string back to a Uint8Array.
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random salt.
 */
export function generateSalt(length = DEFAULT_SALT_LENGTH): Uint8Array {
  const salt = new Uint8Array(length);
  globalThis.crypto.getRandomValues(salt);
  return salt;
}

/**
 * Serializes a salt to a base64 string for storage in user vault settings.
 */
export function saltToBase64(salt: Uint8Array): string {
  return bytesToBase64(salt);
}

/**
 * Parses a stored base64 salt back to a Uint8Array.
 */
export function base64ToSalt(base64: string): Uint8Array {
  return base64ToBytes(base64);
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a master password and salt using PBKDF2-SHA256.
 *
 * Security guarantees:
 * - extractable is false: The raw key material cannot be extracted or exported from memory via JavaScript.
 * - usages are strictly limited to ["encrypt", "decrypt"].
 */
export async function deriveVaultKey(
  masterPassword: string,
  salt: Uint8Array,
  iterations = DEFAULT_PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  if (!masterPassword || masterPassword.length === 0) {
    throw new Error("Master password cannot be empty");
  }
  if (!salt || salt.byteLength === 0) {
    throw new Error("Salt cannot be empty");
  }

  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(masterPassword);

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable (for session storage persistence)
    ["encrypt", "decrypt"]
  );
}
