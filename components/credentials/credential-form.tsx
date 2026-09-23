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
import { useTags } from "@/hooks/use-tags";
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
import { Plus, X, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { useClipboardState } from "@/lib/utils/clipboard";
import { PasswordGeneratorDialog } from "@/components/password-generator/password-generator-dialog";
import { announce } from "@/lib/a11y/announcer";
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
  const { suggestTags } = useTags();
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [generatorOpen, setGeneratorOpen] = useState(false);

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

  const { isCopied, copy } = useClipboardState(2000);
  const watchedUsername = useWatch({ control, name: "username" });
  const watchedPassword = useWatch({ control, name: "password" });
  const tags = useWatch({ control, name: "tags" }) || [];

  const suggestions = tagInput.trim() ? suggestTags(tagInput, tags) : [];
  const suggestedPool =
    tags.length < 5 && !tagInput.trim()
      ? suggestTags("", tags).slice(0, 4)
      : [];

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

  const handleAddSpecificTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    if (tags.length >= 20) return;
    setValue("tags", [...tags, trimmed], { shouldValidate: true });
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true },
    );
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Tab" && tagInput.trim() && suggestions.length > 0) {
      e.preventDefault();
      handleAddSpecificTag(suggestions[0]);
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
      setError(
        "An error occurred while encrypting and saving. Please try again.",
      );
    }
  };

  return (
    <>
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
                required
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
                {...register("title")}
              />
              {errors.title && (
                <p id="title-error" className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="username">
                    Username / Email <span className="text-destructive">*</span>
                  </Label>
                  {watchedUsername && (
                    <button
                      type="button"
                      onClick={() => {
                        copy(watchedUsername, "form-username");
                        announce("Username copied to clipboard");
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="Copy Username"
                      aria-label="Copy username to clipboard"
                    >
                      {isCopied("form-username") ? (
                        <>
                          <Check
                            className="size-3 text-emerald-500"
                            aria-hidden="true"
                          />
                          <span className="text-emerald-500 font-medium">
                            Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" aria-hidden="true" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <Input
                  id="username"
                  placeholder="hasan@example.com"
                  autoComplete="off"
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.username}
                  aria-describedby={
                    errors.username ? "username-error" : undefined
                  }
                  {...register("username")}
                />
                {errors.username && (
                  <p id="username-error" className="text-xs text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGeneratorOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer transition-colors"
                      title="Generate secure password"
                      aria-label="Open password generator"
                    >
                      <Sparkles className="size-3" aria-hidden="true" />
                      <span>Generate</span>
                    </button>
                    {watchedPassword && (
                      <button
                        type="button"
                        onClick={() => {
                          copy(watchedPassword, "form-password", {
                            clearAfterMs: 30000,
                          });
                          announce(
                            "Password copied to clipboard. Clipboard will be cleared in 30 seconds.",
                          );
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Copy Password"
                        aria-label="Copy password to clipboard"
                      >
                        {isCopied("form-password") ? (
                          <>
                            <Check
                              className="size-3 text-emerald-500"
                              aria-hidden="true"
                            />
                            <span className="text-emerald-500 font-medium">
                              Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <PasswordField
                  id="password"
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                  allowCopy
                  onGenerate={() => setGeneratorOpen(true)}
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
                  aria-describedby={
                    errors.websiteUrl ? "website-error" : undefined
                  }
                  {...register("websiteUrl")}
                />
                {errors.websiteUrl && (
                  <p id="website-error" className="text-xs text-destructive">
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
                  <option
                    value=""
                    className="bg-popover text-popover-foreground"
                  >
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
                  disabled={
                    !tagInput.trim() || isSubmitting || tags.length >= 20
                  }
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>

              {/* Tag matching suggestions while typing */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Matching:
                  </span>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSpecificTag(s)}
                      disabled={isSubmitting || tags.length >= 20}
                      className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[11px] text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      #{s}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested tags if input is empty */}
              {suggestedPool.length > 0 && !tagInput.trim() && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Suggested:
                  </span>
                  {suggestedPool.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSpecificTag(s)}
                      disabled={isSubmitting || tags.length >= 20}
                      className="inline-flex items-center gap-1 rounded-md border border-dashed border-border/80 px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Plus className="size-2.5" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
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
                <p className="text-xs text-destructive">
                  {errors.tags.message}
                </p>
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
                <p className="text-xs text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel || (() => router.back())}
              className="w-full sm:w-auto h-9 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isEdit
                    ? "Encrypting & Updating..."
                    : "Encrypting & Saving..."}
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

      <PasswordGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        onSelectPassword={(newPassword) => {
          setValue("password", newPassword, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      />
    </>
  );
}
