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
  setDoc,
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
  // In customCategories, we will also store system category overrides.
  // We can use an additional field like `isDeleted` to mark system categories as deleted.
  const [customCategories, setCustomCategories] = useState<(Category & { isDeleted?: boolean })[]>([]);
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
        const list = snapshot.docs.map((doc) => doc.data() as Category & { isDeleted?: boolean });
        // Sort custom categories by label alphabetically
        list.sort((a, b) => String(a?.label || "").localeCompare(String(b?.label || "")));
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
    const customMap = new Map<string, Category & { isDeleted?: boolean }>();
    customCategories.forEach((c) => customMap.set(c.id, c));

    // Process system categories (allow overrides and deletions)
    const mergedSystem = SYSTEM_CATEGORIES
      .map((sys) => {
        if (customMap.has(sys.id)) {
          const override = customMap.get(sys.id)!;
          if (override.isDeleted) return null;
          return { ...sys, ...override, isCustom: false };
        }
        return sys;
      })
      .filter(Boolean) as Category[];

    // Process purely custom categories (not system overrides and not deleted)
    const pureCustom = customCategories.filter(
      (c) => !c.isDeleted && !SYSTEM_CATEGORIES.some((s) => s.id === c.id)
    );

    return [...mergedSystem, ...pureCustom];
  }, [customCategories]);

  // Unified system categories to export (for the badge counting, etc)
  const mergedSystemCategories = useMemo(() => {
    return categories.filter((c) => !c.isCustom);
  }, [categories]);

  // Unified pure custom categories to export
  const mergedCustomCategories = useMemo(() => {
    return categories.filter((c) => c.isCustom);
  }, [categories]);

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

      // Check for name conflict across all active categories
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

  // Update category (works for both custom and system overrides)
  const updateCategory = useCallback(
    async (id: string, data: CategoryFormData): Promise<void> => {
      if (!user) {
        throw new Error("User must be authenticated to update a category");
      }

      const isSystem = SYSTEM_CATEGORIES.some((c) => c.id === id);

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
      
      // Use setDoc with merge: true to handle system category overrides that don't exist yet
      await setDoc(docRef, {
        label: labelTrimmed,
        icon: validated.icon.trim(),
        isCustom: !isSystem, // Keep system flags intact
        userId: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    },
    [user, categories]
  );

  // Delete category with cascade unlinking of credentials
  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      if (!user) {
        throw new Error("User must be authenticated to delete a category");
      }

      const isSystem = SYSTEM_CATEGORIES.some((c) => c.id === id);
      const docRef = getCategoryDocRef(user.uid, id);

      // Check for any credentials assigned to this category
      const credsQuery = query(
        getCredentialsRef(user.uid),
        where("categoryId", "==", id)
      );
      const affectedCreds = await getDocs(credsQuery);

      if (!affectedCreds.empty) {
        const batch = writeBatch(db);
        affectedCreds.forEach((credDoc) => {
          batch.update(credDoc.ref, {
            categoryId: "",
            updatedAt: serverTimestamp(),
          });
        });
        
        if (isSystem) {
          batch.set(docRef, { isDeleted: true, updatedAt: serverTimestamp() }, { merge: true });
        } else {
          batch.delete(docRef);
        }
        await batch.commit();
      } else {
        if (isSystem) {
          await setDoc(docRef, { isDeleted: true, updatedAt: serverTimestamp() }, { merge: true });
        } else {
          await deleteDoc(docRef);
        }
      }
    },
    [user]
  );

  return {
    categories,
    customCategories: mergedCustomCategories,
    systemCategories: mergedSystemCategories,
    loading,
    error,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

