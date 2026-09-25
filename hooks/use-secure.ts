"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVault } from "@/hooks/use-vault";
import {
  getIdentitiesRef,
  getSecureDocRef,
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
  encryptSecureFields,
  decryptSecureFields,
} from "@/lib/crypto/vault";
import type {
  EncryptedSecure,
  DecryptedSecure,
  SecureFormData,
} from "@/types/secure";

export function useSecure() {
  const { user } = useAuth();
  const { vaultKey, status: vaultStatus } = useVault();

  const [secureItems, setIdentities] = useState<EncryptedSecure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(getIdentitiesRef(user.uid), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data() as EncryptedSecure);
        setIdentities(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn("Failed to subscribe to secureItems:", err);
        setError("Failed to load secureItems.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const createSecure = useCallback(
    async (input: SecureFormData): Promise<string> => {
      if (!user) throw new Error("Authentication required");
      if (!vaultKey) throw new Error("Vault must be unlocked");

      const encryptedFields = await encryptSecureFields(input, vaultKey);

      const docRef = await addDoc(getIdentitiesRef(user.uid), {
        title: input.title.trim(),
        ...encryptedFields,
        categoryId: input.categoryId || "",
        tags: input.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as unknown as EncryptedSecure);

      return docRef.id;
    },
    [user, vaultKey]
  );

  const updateSecure = useCallback(
    async (id: string, input: SecureFormData): Promise<void> => {
      if (!user) throw new Error("Authentication required");
      if (!vaultKey) throw new Error("Vault must be unlocked");

      const encryptedFields = await encryptSecureFields(input, vaultKey);
      const docRef = getSecureDocRef(user.uid, id);

      await updateDoc(docRef, {
        title: input.title.trim(),
        ...encryptedFields,
        categoryId: input.categoryId || "",
        tags: input.tags || [],
        updatedAt: serverTimestamp(),
      });
    },
    [user, vaultKey]
  );

  const deleteSecure = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("Authentication required");
      const docRef = getSecureDocRef(user.uid, id);
      await deleteDoc(docRef);
    },
    [user]
  );

  const getSecure = useCallback(
    async (id: string): Promise<EncryptedSecure | null> => {
      if (!user) return null;
      try {
        const docRef = getSecureDocRef(user.uid, id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? (snapshot.data() as EncryptedSecure) : null;
      } catch {
        return null;
      }
    },
    [user]
  );

  const decryptSecure = useCallback(
    async (encrypted: EncryptedSecure): Promise<DecryptedSecure> => {
      if (!vaultKey) throw new Error("Vault must be unlocked");
      const decryptedFields = await decryptSecureFields(encrypted, vaultKey);

      return {
        id: encrypted.id,
        title: encrypted.title,
        ...decryptedFields,
        categoryId: encrypted.categoryId,
        tags: encrypted.tags || [],
        createdAt: encrypted.createdAt ? encrypted.createdAt.toDate() : new Date(),
        updatedAt: encrypted.updatedAt ? encrypted.updatedAt.toDate() : new Date(),
      };
    },
    [vaultKey]
  );

  return {
    secureItems: user ? secureItems : [],
    loading: user ? loading : false,
    error,
    vaultStatus,
    createSecure,
    updateSecure,
    deleteSecure,
    getSecure,
    decryptSecure,
  };
}
