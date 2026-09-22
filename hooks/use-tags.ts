"use client";

import { useMemo, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useCredentials } from "./use-credentials";
import {
  db,
  getCredentialDocRef,
  serverTimestamp,
  writeBatch,
} from "@/lib/firebase/firestore";
import { DEFAULT_TAG_SUGGESTIONS } from "@/lib/constants/tags";
import { renameTagSchema, type TagWithCount } from "@/types/tag";

export function useTags() {
  const { user } = useAuth();
  const { credentials, loading } = useCredentials();

  // Aggregate tags and their usage counts across all stored credentials
  const tags = useMemo(() => {
    const map = new Map<string, number>();
    credentials.forEach((c) => {
      c.tags?.forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) {
          map.set(trimmed, (map.get(trimmed) || 0) + 1);
        }
      });
    });

    const list: TagWithCount[] = [];
    map.forEach((count, name) => {
      list.push({ name, count });
    });

    // Default sorting: Most used first, then alphabetically
    list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return list;
  }, [credentials]);

  const totalUniqueTags = tags.length;

  const totalTaggedCredentials = useMemo(() => {
    return credentials.filter((c) => c.tags && c.tags.length > 0).length;
  }, [credentials]);

  const popularTags = useMemo(() => {
    return tags.slice(0, 5).map((t) => t.name);
  }, [tags]);

  // Rename a tag globally across all credentials containing it
  const renameTag = useCallback(
    async (oldTag: string, rawNewTag: string): Promise<void> => {
      if (!user) {
        throw new Error("User must be authenticated to rename a tag");
      }

      const validated = renameTagSchema.parse({ newTag: rawNewTag });
      const newTag = validated.newTag.trim();

      if (oldTag === newTag) return;

      const matchingCreds = credentials.filter((c) =>
        c.tags?.includes(oldTag)
      );

      if (matchingCreds.length === 0) return;

      const batch = writeBatch(db);
      matchingCreds.forEach((cred) => {
        const updatedTags = cred.tags.map((t) => (t === oldTag ? newTag : t));
        // Deduplicate in case the credential already had the newTag
        const deduplicated = Array.from(new Set(updatedTags)).slice(0, 20);
        const docRef = getCredentialDocRef(user.uid, cred.id);
        batch.update(docRef, {
          tags: deduplicated,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    },
    [user, credentials]
  );

  // Delete a tag globally from all credentials containing it
  const deleteTag = useCallback(
    async (tagToDelete: string): Promise<void> => {
      if (!user) {
        throw new Error("User must be authenticated to delete a tag");
      }

      const matchingCreds = credentials.filter((c) =>
        c.tags?.includes(tagToDelete)
      );

      if (matchingCreds.length === 0) return;

      const batch = writeBatch(db);
      matchingCreds.forEach((cred) => {
        const updatedTags = cred.tags.filter((t) => t !== tagToDelete);
        const docRef = getCredentialDocRef(user.uid, cred.id);
        batch.update(docRef, {
          tags: updatedTags,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    },
    [user, credentials]
  );

  // Suggest tags matching input, combining existing tags with default suggestions
  const suggestTags = useCallback(
    (query: string, currentTags: string[] = []): string[] => {
      const q = query.toLowerCase().trim();
      const currentSet = new Set(currentTags.map((t) => t.toLowerCase()));

      const pool = new Set<string>();
      // Existing tags first
      tags.forEach((t) => pool.add(t.name));
      // Standard suggestions
      DEFAULT_TAG_SUGGESTIONS.forEach((s) => pool.add(s));

      return Array.from(pool)
        .filter((t) => {
          const lower = t.toLowerCase();
          if (currentSet.has(lower)) return false;
          if (!q) return true;
          return lower.includes(q);
        })
        .slice(0, 6);
    },
    [tags]
  );

  return {
    tags,
    totalUniqueTags,
    totalTaggedCredentials,
    popularTags,
    loading,
    renameTag,
    deleteTag,
    suggestTags,
  };
}

