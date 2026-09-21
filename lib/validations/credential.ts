import { z } from "zod";

/**
 * Validates a website URL ensuring it only allows standard HTTP/HTTPS schemes
 * and rejects dangerous vectors like javascript:, data:, or vbscript:.
 */
export const safeUrlSchema = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const toTest = /^https?:\/\//i.test(val) ? val : `https://${val}`;
      try {
        const parsed = new URL(toTest);
        return (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          parsed.hostname.length > 0
        );
      } catch {
        return false;
      }
    },
    {
      message: "Please enter a valid web address (e.g. https://example.com)",
    }
  );

/**
 * Helper to normalize website URLs by adding https:// if the user omitted a protocol.
 */
export function normalizeWebsiteUrl(url?: string): string | undefined {
  if (!url || !url.trim()) return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Single tag validation schema.
 */
export const tagSchema = z
  .string()
  .trim()
  .min(1, "Tag cannot be empty")
  .max(30, "Tag must be 30 characters or less");

/**
 * Schema for credential creation and editing forms.
 */
export const credentialFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  username: z
    .string()
    .min(1, "Username is required")
    .max(250, "Username must be 250 characters or less"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(500, "Password must be 500 characters or less"),
  websiteUrl: safeUrlSchema,
  categoryId: z.string().max(50).optional().or(z.literal("")),
  tags: z.array(tagSchema).max(20, "Cannot exceed 20 tags"),
  notes: z
    .string()
    .max(5000, "Notes must be 5000 characters or less")
    .optional()
    .or(z.literal("")),
});

export type CredentialFormValues = z.infer<typeof credentialFormSchema>;
