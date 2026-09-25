import type { Timestamp } from "firebase/firestore";
import type { CustomField } from "./credential";

export interface EncryptedSecure {
  id: string;
  title: string;
  encryptedCustomFields?: string | null;
  categoryId?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DecryptedSecure {
  id: string;
  title: string;
  customFields?: CustomField[] | null;
  categoryId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SecureFormData {
  title: string;
  customFields?: CustomField[];
  categoryId?: string;
  tags: string[];
}
