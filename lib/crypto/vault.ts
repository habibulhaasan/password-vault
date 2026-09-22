import { encryptString, decryptString } from "./encryption";
import type { EncryptedCredential } from "@/types/credential";

/**
 * Canary token used to verify that a derived key correctly unlocks a vault
 * without needing to decrypt any actual user credentials.
 */
export const VAULT_CANARY_TOKEN = "PASSWORD_VAULT_CANARY_VERIFICATION_V1";

/**
 * Generates an encrypted canary token to store in the user's vault settings.
 * Used during vault unlock to immediately verify whether the provided master password is correct.
 */
export async function createVaultVerificationToken(
  key: CryptoKey
): Promise<string> {
  return encryptString(VAULT_CANARY_TOKEN, key);
}

/**
 * Verifies whether a derived CryptoKey can decrypt the vault's verification token.
 * Returns true if the key is valid, false otherwise.
 */
export async function verifyVaultKey(
  verificationToken: string,
  key: CryptoKey
): Promise<boolean> {
  try {
    const decrypted = await decryptString(verificationToken, key);
    return decrypted === VAULT_CANARY_TOKEN;
  } catch {
    return false;
  }
}

export interface EncryptedCredentialPayload {
  encryptedUsername: string;
  encryptedPassword: string;
  encryptedNotes?: string;
}

export interface DecryptedCredentialPayload {
  username: string;
  password: string;
  notes?: string;
}

/**
 * Encrypts the sensitive fields of a credential form input.
 * Plaintext passwords and notes are converted to AES-GCM ciphertexts.
 */
export async function encryptCredentialFields(
  input: DecryptedCredentialPayload,
  key: CryptoKey
): Promise<EncryptedCredentialPayload> {
  const encryptedUsername = await encryptString(input.username, key);
  const encryptedPassword = await encryptString(input.password, key);

  let encryptedNotes: string | undefined = undefined;
  if (input.notes && input.notes.trim().length > 0) {
    encryptedNotes = await encryptString(input.notes, key);
  }

  return {
    encryptedUsername,
    encryptedPassword,
    encryptedNotes,
  };
}

/**
 * Decrypts the sensitive ciphertext fields of an EncryptedCredential.
 * Produces ephemeral in-memory plaintext fields.
 */
export async function decryptCredentialFields(
  encrypted: EncryptedCredential,
  key: CryptoKey
): Promise<DecryptedCredentialPayload> {
  const username = await decryptString(encrypted.encryptedUsername, key);
  const password = await decryptString(encrypted.encryptedPassword, key);

  let notes: string | undefined = undefined;
  if (encrypted.encryptedNotes) {
    notes = await decryptString(encrypted.encryptedNotes, key);
  }

  return {
    username,
    password,
    notes,
  };
}
