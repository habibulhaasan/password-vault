"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVault } from "@/hooks/use-vault";
import {
  getCredentialsRef,
  getCredentialDocRef,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "@/lib/firebase/firestore";
import {
  encryptCredentialFields,
  decryptCredentialFields,
} from "@/lib/crypto/vault";
import { normalizeWebsiteUrl } from "@/lib/validations/credential";
import type {
  EncryptedCredential,
  DecryptedCredential,
  CredentialFormData,
} from "@/types/credential";

export function useCredentials() {
  const { user } = useAuth();
  const { vaultKey, status: vaultStatus } = useVault();

  const [credentials, setCredentials] = useState<EncryptedCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to live credentials collection for the authenticated user
  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(getCredentialsRef(user.uid), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data());
        setCredentials(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn("Failed to subscribe to credentials:", err);
        setError("Failed to load credentials.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Create a new credential with client-side encryption
  const createCredential = useCallback(
    async (input: CredentialFormData): Promise<string> => {
      if (!user) throw new Error("Authentication required");
      if (!vaultKey) throw new Error("Vault must be unlocked to save credentials");

      const encryptedFields = await encryptCredentialFields(input, vaultKey);
      const websiteUrl = normalizeWebsiteUrl(input.websiteUrl);

              const docRef = await addDoc(getCredentialsRef(user.uid), {
        title: input.title.trim(),
        encryptedUsername: encryptedFields.encryptedUsername,
        encryptedPassword: encryptedFields.encryptedPassword,
        encryptedNotes: encryptedFields.encryptedNotes || "",
        encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",
        encryptedMobile: encryptedFields.encryptedMobile || "",
        encryptedSecurityQuestions: encryptedFields.encryptedSecurityQuestions || "",
            encryptedCustomFields: encryptedFields.encryptedCustomFields || "",
websiteUrl: websiteUrl || "",
        categoryId: input.categoryId || "",
        tags: input.tags || [],
        lastLoginAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as unknown as EncryptedCredential);

      return docRef.id;
    },
    [user, vaultKey]
  );

  // Update an existing credential with client-side encryption
  const updateCredential = useCallback(
    async (id: string, input: CredentialFormData): Promise<void> => {
      if (!user) throw new Error("Authentication required");
      if (!vaultKey) throw new Error("Vault must be unlocked to update credentials");

      const encryptedFields = await encryptCredentialFields(input, vaultKey);
      const websiteUrl = normalizeWebsiteUrl(input.websiteUrl);

      const docRef = getCredentialDocRef(user.uid, id);
              await updateDoc(docRef, {
        title: input.title.trim(),
        encryptedUsername: encryptedFields.encryptedUsername,
        encryptedPassword: encryptedFields.encryptedPassword,
        encryptedNotes: encryptedFields.encryptedNotes || "",
          encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",
          encryptedMobile: encryptedFields.encryptedMobile || "",
          encryptedSecurityQuestions: encryptedFields.encryptedSecurityQuestions || "",
          
        websiteUrl: websiteUrl || "",
        categoryId: input.categoryId || "",
        tags: input.tags || [],
        updatedAt: serverTimestamp(),
      });
    },
    [user, vaultKey]
  );

  // Delete a credential
  const deleteCredential = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("Authentication required");
      const docRef = getCredentialDocRef(user.uid, id);
      await deleteDoc(docRef);
    },
    [user]
  );

  // Retrieve a single credential document
  const getCredential = useCallback(
    async (id: string): Promise<EncryptedCredential | null> => {
      if (!user) return null;
      try {
        const docRef = getCredentialDocRef(user.uid, id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data() : null;
      } catch {
        return null;
      }
    },
    [user]
  );

  // Decrypt a credential's sensitive fields into memory
  const decryptCredential = useCallback(
    async (encrypted: EncryptedCredential): Promise<DecryptedCredential> => {
      if (!vaultKey) {
        throw new Error("Vault must be unlocked to decrypt credentials");
      }

      const decryptedFields = await decryptCredentialFields(encrypted, vaultKey);

      return {
        id: encrypted.id,
        title: encrypted.title,
        username: decryptedFields.username,
        password: decryptedFields.password,
        notes: decryptedFields.notes,
          recoveryEmail: decryptedFields.recoveryEmail,
          mobile: decryptedFields.mobile,
          securityQuestions: decryptedFields.securityQuestions,
          customFields: decryptedFields.customFields,
        websiteUrl: encrypted.websiteUrl,
        categoryId: encrypted.categoryId,
        tags: encrypted.tags || [],
        lastLoginAt: encrypted.lastLoginAt ? encrypted.lastLoginAt.toDate() : null,
        createdAt: encrypted.createdAt ? encrypted.createdAt.toDate() : new Date(),
        updatedAt: encrypted.updatedAt ? encrypted.updatedAt.toDate() : new Date(),
      };
    },
    [vaultKey]
  );

  // Mark a credential as logged in right now
  const markAsLoggedIn = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("Authentication required");
      const docRef = getCredentialDocRef(user.uid, id);
      await updateDoc(docRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [user]
  );

  return {
    credentials: user ? credentials : [],
    loading: user ? loading : false,
    error,
    vaultStatus,
    createCredential,
    updateCredential,
    deleteCredential,
    getCredential,
    decryptCredential,
    markAsLoggedIn,
  };
}
