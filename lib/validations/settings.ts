import { z } from "zod";

/**
 * Validation schema for changing the vault's Master Password.
 * Ensures the new master password is at least 8 characters, matches confirmation,
 * and is distinct from the current master password.
 */
export const changeMasterPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current master password is required"),
    newPassword: z
      .string()
      .min(8, "New master password must be at least 8 characters")
      .max(128, "Master password cannot exceed 128 characters"),
    confirmNewPassword: z
      .string()
      .min(1, "Please confirm your new master password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New master passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New master password must be different from your current master password",
    path: ["newPassword"],
  });

export type ChangeMasterPasswordFormData = z.infer<
  typeof changeMasterPasswordSchema
>;

