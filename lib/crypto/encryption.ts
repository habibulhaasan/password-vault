import { bytesToBase64, base64ToBytes } from "./key-derivation";

export const AES_GCM_IV_LENGTH = 12; // 96 bits (NIST recommended for AES-GCM)
export const MIN_CIPHERTEXT_LENGTH = AES_GCM_IV_LENGTH + 16; // IV + 128-bit auth tag

export class DecryptionError extends Error {
  constructor(message = "Decryption failed. The key is invalid or the data has been corrupted.") {
    super(message);
    this.name = "DecryptionError";
  }
}

/**
 * Encrypts a plaintext UTF-8 string using AES-GCM with a fresh random 12-byte IV.
 *
 * Output format: Base64( [12-byte IV] + [ciphertext with 128-bit authentication tag] )
 */
export async function encryptString(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(plaintext);

  // Generate a cryptographically secure random 12-byte IV.
  // NEVER reuse IVs with the same key.
  const iv = new Uint8Array(AES_GCM_IV_LENGTH);
  globalThis.crypto.getRandomValues(iv);

  const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encodedText
  );

  const ciphertextBytes = new Uint8Array(encryptedBuffer);

  // Pack IV (12 bytes) + Ciphertext (with appended auth tag)
  const packed = new Uint8Array(iv.length + ciphertextBytes.length);
  packed.set(iv, 0);
  packed.set(ciphertextBytes, iv.length);

  return bytesToBase64(packed);
}

/**
 * Decrypts a base64-encoded AES-GCM ciphertext payload.
 *
 * Expects format: Base64( [12-byte IV] + [ciphertext with 128-bit authentication tag] )
 * Throws DecryptionError if the key is incorrect or data was tampered with.
 */
export async function decryptString(
  ciphertextBase64: string,
  key: CryptoKey
): Promise<string> {
  if (!ciphertextBase64) {
    throw new DecryptionError("Ciphertext payload is empty");
  }

  let packed: Uint8Array;
  try {
    packed = base64ToBytes(ciphertextBase64);
  } catch {
    throw new DecryptionError("Malformed base64 ciphertext payload");
  }

  if (packed.byteLength < MIN_CIPHERTEXT_LENGTH) {
    throw new DecryptionError("Ciphertext payload is too short to be valid");
  }

  const iv = packed.slice(0, AES_GCM_IV_LENGTH);
  const ciphertext = packed.slice(AES_GCM_IV_LENGTH);

  try {
    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    // OperationError from WebCrypto is thrown when authentication tag check fails
    throw new DecryptionError();
  }
}
