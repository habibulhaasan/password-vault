import type { Timestamp } from "firebase/firestore";

/**
 * Persisted Firestore model.
 *
 * SENSITIVE FIELDS (username, password, notes) ARE ALWAYS ENCRYPTED CLIENT-SIDE.
 * Plaintext passwords and usernames MUST NEVER be saved to Firestore.
 */
export interface EncryptedCredential {
  id: string;
  title: string;

  // Ciphertext payloads (AES-GCM encoded as base64 with IV/salt)
  encryptedUsername: string;
  encryptedPassword: string;
  encryptedNotes?: string;

  // Non-sensitive metadata queryable for filtering and organization
  websiteUrl?: string;
  categoryId?: string;
  tags: string[];

  // Login tracking
  lastLoginAt?: Timestamp | null;

  // Audit timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Ephemeral in-memory representation of a decrypted credential.
 *
 * CAUTION: Contains sensitive plaintext values in memory.
 * Decrypted credentials must never be permanently saved in localStorage,
 * session cookies, or persisted in unencrypted stores.
 * When the vault locks, all decrypted instances must be purged from memory.
 */
export interface DecryptedCredential {
  id: string;
  title: string;

  username: string;
  password: string;
  notes?: string;

  websiteUrl?: string;
  categoryId?: string;
  tags: string[];

  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Credential form input data before client-side encryption.
 */
export interface CredentialFormData {
  title: string;
  username: string;
  password: string;
  notes?: string;
  websiteUrl?: string;
  categoryId?: string;
  tags: string[];
}

/**
 * DTO for creating a new credential in Firestore.
 */
export type CreateEncryptedCredentialDTO = Omit<
  EncryptedCredential,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * DTO for updating an existing credential in Firestore.
 */
export type UpdateEncryptedCredentialDTO = Partial<
  Omit<EncryptedCredential, "id" | "createdAt" | "updatedAt">
>;
