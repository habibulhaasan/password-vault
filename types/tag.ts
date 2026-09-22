import { z } from "zod";

export interface TagWithCount {
  name: string;
  count: number;
}

export type TagSortOption =
  | "count-desc"
  | "count-asc"
  | "name-asc"
  | "name-desc";

export const renameTagSchema = z.object({
  newTag: z
    .string()
    .trim()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be 30 characters or less"),
});

export type RenameTagFormData = z.infer<typeof renameTagSchema>;

