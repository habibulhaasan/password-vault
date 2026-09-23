import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
} from "firebase/firestore";
import type { EncryptedCredential } from "@/types/credential";
import type { Category } from "@/types/category";

/**
 * Firestore Data Converter for EncryptedCredential.
 * Ensures typed queries and document retrieval while extracting document ID cleanly.
 */
export const credentialConverter: FirestoreDataConverter<EncryptedCredential> = {
  toFirestore(credential: EncryptedCredential): DocumentData {
    const data: Partial<EncryptedCredential> = { ...credential };
    delete data.id;
    return data as DocumentData;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): EncryptedCredential {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      encryptedUsername: data.encryptedUsername,
      encryptedPassword: data.encryptedPassword,
      encryptedNotes: data.encryptedNotes || undefined,
      websiteUrl: data.websiteUrl || undefined,
      categoryId: data.categoryId || undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
      lastLoginAt: data.lastLoginAt || null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

/**
 * Firestore Data Converter for custom Category documents.
 */
export const categoryConverter: FirestoreDataConverter<Category> = {
  toFirestore(category: Category): DocumentData {
    const data: Partial<Category> = { ...category };
    delete data.id;
    return data as DocumentData;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): Category {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      label: data.label,
      icon: data.icon || "folder",
      isCustom: data.isCustom !== undefined ? data.isCustom : true,
      isDeleted: data.isDeleted,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
