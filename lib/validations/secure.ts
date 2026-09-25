import { z } from "zod";

export const secureFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  categoryId: z.string().optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(20).optional(),
  customFields: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Name required").max(100, "Too long"),
      value: z.string().max(10000, "Too long"),
      isSecret: z.boolean().optional(),
      isMultiline: z.boolean().optional()
    })
  ).optional()
});

export type SecureFormValues = z.infer<typeof secureFormSchema>;
