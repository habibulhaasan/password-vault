"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  credentialFormSchema,
  type CredentialFormValues,
} from "@/lib/validations/credential";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PasswordField } from "@/components/credentials/password-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, X, Loader2 } from "lucide-react";
import type { CredentialFormData } from "@/types/credential";

interface CredentialFormProps {
  initialValues?: Partial<CredentialFormData>;
  isEdit?: boolean;
  onSubmit: (data: CredentialFormData) => Promise<void>;
  onCancel?: () => void;
}

export function CredentialForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
}: CredentialFormProps) {
  const router = useRouter();
  const { customCategories, systemCategories } = useCategories();
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      username: initialValues?.username || "",
      password: initialValues?.password || "",
      websiteUrl: initialValues?.websiteUrl || "",
      categoryId: initialValues?.categoryId || "",
      tags: initialValues?.tags || [],
      notes: initialValues?.notes || "",
    },
  });

  const tags = useWatch({ control, name: "tags" }) || [];

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput("");
      return;
    }
    if (tags.length >= 20) return;
    setValue("tags", [...tags, trimmed], { shouldValidate: true });
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFormSubmit = async (values: CredentialFormValues) => {
    setError(null);
    try {
      await onSubmit({
        title: values.title,
        username: values.username,
        password: values.password,
        websiteUrl: values.websiteUrl || undefined,
        categoryId: values.categoryId || undefined,
        tags: values.tags,
        notes: values.notes || undefined,
      });
    } catch {
      setError("An error occurred while encrypting and saving. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">
          {isEdit ? "Edit Credential" : "Add Credential"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update your account details. Sensitive fields are re-encrypted before saving."
            : "Store new account credentials. Sensitive fields are encrypted client-side."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/15 p-3 text-xs text-destructive dark:bg-destructive/20"
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. GitHub, Netflix, Personal Email"
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">
                Username / Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                placeholder="hasan@example.com"
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <PasswordField
                id="password"
                placeholder="••••••••••••"
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password")}
              />
            </div>
          </div>

          {/* Website URL & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="text"
                placeholder="https://example.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.websiteUrl}
                {...register("websiteUrl")}
              />
              {errors.websiteUrl && (
                <p className="text-xs text-destructive">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                disabled={isSubmitting}
                {...register("categoryId")}
              >
                <option value="" className="bg-popover text-popover-foreground">
                  Select a category...
                </option>
                {customCategories.length > 0 && (
                  <optgroup
                    label="Custom Categories"
                    className="bg-popover text-popover-foreground"
                  >
                    {customCategories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        className="bg-popover text-popover-foreground"
                      >
                        {cat.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup
                  label="Standard Categories"
                  className="bg-popover text-popover-foreground"
                >
                  {systemCategories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-popover text-popover-foreground"
                    >
                      {cat.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* Tags Manager */}
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (up to 20)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag (press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                disabled={isSubmitting || tags.length >= 20}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || isSubmitting || tags.length >= 20}
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                      disabled={isSubmitting}
                    >
                      <X className="size-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-xs text-destructive">{errors.tags.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Comments / Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes, security questions, or backup codes (encrypted)"
              rows={3}
              disabled={isSubmitting}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel || (() => router.back())}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {isEdit ? "Encrypting & Updating..." : "Encrypting & Saving..."}
              </>
            ) : isEdit ? (
              "Update Credential"
            ) : (
              "Save Credential"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
