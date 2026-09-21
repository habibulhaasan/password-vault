import type { Timestamp } from "firebase/firestore";
import { z } from "zod";

export interface Category {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const categoryFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name cannot exceed 50 characters"),
  icon: z
    .string()
    .trim()
    .min(1, "Icon is required")
    .max(50, "Icon identifier cannot exceed 50 characters"),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
