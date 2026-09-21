"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./use-auth";
import {
  db,
  getCategoriesRef,
  getCategoryDocRef,
  getCredentialsRef,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "@/lib/firebase/firestore";
import { SYSTEM_CATEGORIES } from "@/lib/constants/categories";
import {
  categoryFormSchema,
  type Category,
  type CategoryFormData,
} from "@/types/category";

export function useCategories() {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time custom categories from Firestore
  useEffect(() => {
    if (!user) {
      return;
    }

    const categoriesRef = getCategoriesRef(user.uid);
    const unsubscribe = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const list: Category[] = snapshot.docs.map((doc) => doc.data());
        // Sort custom categories by label alphabetically
        list.sort((a, b) => a.label.localeCompare(b.label));
        setCustomCategories(list);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch custom categories:", err);
        setError("Failed to load categories");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Unified list of system and custom categories
  const categories = useMemo(() => {
    return [...SYSTEM_CATEGORIES, ...customCategories];
  }, [customCategories]);

  // Lookup helper
  const getCategory = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  // Create custom category
  const createCategory = useCallback(
    async (data: CategoryFormData): Promise<string> => {
      if (!user) {
        throw new Error("User must be authenticated to create a category");
      }

      const validated = categoryFormSchema.parse(data);
      const labelTrimmed = validated.label.trim();
      const labelLower = labelTrimmed.toLowerCase();

      // Check for name conflict across all categories
      const exists = categories.some(
        (c) => c.label.toLowerCase() === labelLower
      );
      if (exists) {
        throw new Error(`A category named "${labelTrimmed}" already exists.`);
      }

      const docRef = await addDoc(getCategoriesRef(user.uid), {
        label: labelTrimmed,
        icon: validated.icon.trim(),
        isCustom: true,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as unknown as Category);

      return docRef.id;
    },
    [user, categories]
  );

  // Update custom category
  const updateCategory = useCallback(
    async (id: string, data: CategoryFormData): Promise<void> => {
      if (!user) {
        throw new Error("User must be authenticated to update a category");
      }

      const isSystem = SYSTEM_CATEGORIES.some((c) => c.id === id);
      if (isSystem) {
        throw new Error("System categories cannot be modified.");
      }

      const validated = categoryFormSchema.parse(data);
      const labelTrimmed = validated.label.trim();
      const labelLower = labelTrimmed.toLowerCase();

      // Check for name conflict against other categories
      const duplicate = categories.some(
        (c) => c.id !== id && c.label.toLowerCase() === labelLower
      );
      if (duplicate) {
        throw new Error(`A category named "${labelTrimmed}" already exists.`);
      }

      const docRef = getCategoryDocRef(user.uid, id);
      await updateDoc(docRef, {
        label: labelTrimmed,
        icon: validated.icon.trim(),
        updatedAt: serverTimestamp(),
      });
    },
    [user, categories]
  );

  // Delete custom category with cascade unlinking of credentials
  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      if (!user) {
        throw new Error("User must be authenticated to delete a category");
      }

      const isSystem = SYSTEM_CATEGORIES.some((c) => c.id === id);
      if (isSystem) {
        throw new Error("System categories cannot be deleted.");
      }

      // Check for any credentials assigned to this category
      const credsQuery = query(
        getCredentialsRef(user.uid),
        where("categoryId", "==", id)
      );
      const affectedCreds = await getDocs(credsQuery);

      if (!affectedCreds.empty) {
        // Unlink category from affected credentials and delete category atomically
        const batch = writeBatch(db);
        affectedCreds.forEach((credDoc) => {
          batch.update(credDoc.ref, {
            categoryId: "",
            updatedAt: serverTimestamp(),
          });
        });
        batch.delete(getCategoryDocRef(user.uid, id));
        await batch.commit();
      } else {
        await deleteDoc(getCategoryDocRef(user.uid, id));
      }
    },
    [user]
  );

  return {
    categories,
    customCategories,
    systemCategories: SYSTEM_CATEGORIES,
    loading,
    error,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

