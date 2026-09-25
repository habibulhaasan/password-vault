import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  type Timestamp,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { app } from "./config";
import { credentialConverter, categoryConverter, secureConverter } from "./converters";
import type { EncryptedCredential } from "@/types/credential";
import type { EncryptedSecure } from "@/types/secure";
import type { Category } from "@/types/category";

export const db = getFirestore(app);

/**
 * Generic helper to build a user-scoped collection path.
 *
 * Example:
 *   userCollection("abc123", "credentials")
 *   → CollectionReference for /users/abc123/credentials
 */
export function userCollection(
  uid: string,
  collectionName: string
): CollectionReference<DocumentData> {
  return collection(db, "users", uid, collectionName);
}

/**
 * Generic helper to build a user-scoped document path.
 *
 * Example:
 *   userDoc("abc123", "credentials", "cred456")
 *   → DocumentReference for /users/abc123/credentials/cred456
 */
export function userDoc(
  uid: string,
  collectionName: string,
  docId: string
): DocumentReference<DocumentData> {
  return doc(db, "users", uid, collectionName, docId);
}

/**
 * Typed reference to a user's credentials subcollection: /users/{uid}/credentials
 */
export function getCredentialsRef(
  uid: string
): CollectionReference<EncryptedCredential> {
  return collection(db, "users", uid, "credentials").withConverter(
    credentialConverter
  );
}

/**
 * Typed reference to a specific credential document: /users/{uid}/credentials/{credentialId}
 */
export function getCredentialDocRef(
  uid: string,
  credentialId: string
): DocumentReference<EncryptedCredential> {
  return doc(db, "users", uid, "credentials", credentialId).withConverter(
    credentialConverter
  );
}

/**
 * Typed reference to a user's custom categories subcollection: /users/{uid}/categories
 */
export function getCategoriesRef(uid: string): CollectionReference<Category> {
  return collection(db, "users", uid, "categories").withConverter(
    categoryConverter
  );
}

/**
 * Typed reference to a specific custom category document: /users/{uid}/categories/{categoryId}
 */
export function getCategoryDocRef(
  uid: string,
  categoryId: string
): DocumentReference<Category> {
  return doc(db, "users", uid, "categories", categoryId).withConverter(
    categoryConverter
  );
}

/**
 * Reference to a user's settings document: /users/{uid}/settings/{settingId}
 */
export function getSettingsDocRef(
  uid: string,
  settingId: string = "vault"
): DocumentReference<DocumentData> {
  return userDoc(uid, "settings", settingId);
}

export {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  type Timestamp,
};


export function getIdentitiesRef(uid: string) {
  return collection(db, "users", uid, "secureItems").withConverter(secureConverter);
}

export function getSecureDocRef(uid: string, docId: string) {
  return doc(db, "users", uid, "secureItems", docId).withConverter(secureConverter);
}
