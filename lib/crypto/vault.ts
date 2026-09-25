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
  encryptedRecoveryEmail?: string;
  encryptedMobile?: string;
  encryptedSecurityQuestions?: string;
  
}

export interface DecryptedCredentialPayload {
  username: string;
  password: string;
  notes?: string;
  recoveryEmail?: string;
  mobile?: string;
  securityQuestions?: { question: string, answer: string }[];
  
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

  let encryptedRecoveryEmail: string | undefined = undefined;
  if (input.recoveryEmail && input.recoveryEmail.trim().length > 0) {
    encryptedRecoveryEmail = await encryptString(input.recoveryEmail, key);
  }

  let encryptedMobile: string | undefined = undefined;
  if (input.mobile && input.mobile.trim().length > 0) {
    encryptedMobile = await encryptString(input.mobile, key);
  }

let encryptedSecurityQuestions: string | undefined = undefined;
  if (input.securityQuestions && input.securityQuestions.length > 0) {
    encryptedSecurityQuestions = await encryptString(JSON.stringify(input.securityQuestions), key);
  }

  return {
    encryptedUsername,
    encryptedPassword,
    encryptedNotes,
    encryptedRecoveryEmail,
    encryptedMobile,
    encryptedSecurityQuestions,
    
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

  let recoveryEmail: string | undefined = undefined;
  if (encrypted.encryptedRecoveryEmail) {
    recoveryEmail = await decryptString(encrypted.encryptedRecoveryEmail, key);
  }

  let mobile: string | undefined = undefined;
  if (encrypted.encryptedMobile) {
    mobile = await decryptString(encrypted.encryptedMobile, key);
  }

  let securityQuestions: { question: string, answer: string }[] | undefined = undefined;
  if (encrypted.encryptedSecurityQuestions) {
    const dec = await decryptString(encrypted.encryptedSecurityQuestions, key);
    try {
      securityQuestions = JSON.parse(dec);
    } catch(e) {}
  }

  return {
    username,
    password,
    notes,
    recoveryEmail,
    mobile,
    securityQuestions,
    
  };
}
