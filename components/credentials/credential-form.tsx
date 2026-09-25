"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
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
import { Plus, X, Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useClipboardState } from "@/lib/utils/clipboard";
import { PasswordGeneratorDialog } from "@/components/password-generator/password-generator-dialog";
import type { CredentialFormData } from "@/types/credential";
import { cn } from "@/lib/utils";

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      logoUrl: initialValues?.logoUrl || "",
      categoryId: initialValues?.categoryId || "",
      tags: initialValues?.tags || [],
      notes: initialValues?.notes || "",
      recoveryEmail: initialValues?.recoveryEmail || "",
      mobile: initialValues?.mobile || "",
      securityQuestions: initialValues?.securityQuestions || [],
        customFields: initialValues?.customFields || [],
    },
  });

  const { fields: cfFields, append: appendCf, remove: removeCf } = useFieldArray({
    control,
    name: "customFields"
  });

  const { fields: sqFields, append: appendSq, remove: removeSq } = useFieldArray({
    control,
    name: "securityQuestions"
  });

  const { isCopied, copy } = useClipboardState(2000);
  const watchedUsername = useWatch({ control, name: "username" });
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
        logoUrl: values.logoUrl || undefined,
        categoryId: values.categoryId || undefined,
        tags: values.tags,
        notes: values.notes || undefined,
        recoveryEmail: values.recoveryEmail || undefined,
        mobile: values.mobile || undefined,
        securityQuestions: values.securityQuestions?.length ? values.securityQuestions : undefined,
          customFields: values.customFields?.length ? values.customFields : undefined,
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
              : "Store a new secure credential in your encrypted vault."}
          </CardDescription>
          {error && (
            <div
              role="alert"
              className="mt-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20"
            >
              {error}
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-5">
            {/* Title & Website */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Google, GitHub"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.title}
                  autoFocus
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://example.com"
                  type="url"
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
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="username">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  {isEdit && watchedUsername && (
                    <button
                      type="button"
                      onClick={() =>
                        copy(watchedUsername, "username", {
                          clearAfterMs: 30000,
                        })
                      }
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      disabled={isSubmitting}
                    >
                      {isCopied("username") ? (
                        <>
                          <Check
                            className="size-3 text-emerald-500"
                            aria-hidden="true"
                          />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Copied
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
                  placeholder="Email or username"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.username}
                  autoComplete="username"
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
                  required
                  aria-required="true"
                  allowCopy
                  onGenerate={() => setGeneratorOpen(true)}
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs font-medium text-muted-foreground hover:text-foreground p-0 h-auto"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <ChevronUp className="size-3 mr-1.5" />
                ) : (
                  <ChevronDown className="size-3 mr-1.5" />
                )}
                {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
              </Button>
            </div>

            {/* Advanced Fields Container */}
            <div className={cn("space-y-5 transition-all duration-300 overflow-hidden", showAdvanced ? "opacity-100 max-h-[1000px] mt-4" : "opacity-0 max-h-0 m-0")}>
              
              {/* Category & Logo */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                    {...register("categoryId")}
                  >
                    <option value="" className="bg-popover text-popover-foreground">
                      No Category
                    </option>
                    {customCategories.length > 0 && (
                      <optgroup label="Custom Categories" className="bg-popover text-popover-foreground">
                        {customCategories.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-popover text-popover-foreground">
                            {cat.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Standard Categories" className="bg-popover text-popover-foreground">
                      {systemCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-popover text-popover-foreground">
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="logoUrl">Custom Logo URL</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://example.com/logo.png"
                    type="url"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.logoUrl}
                    {...register("logoUrl")}
                  />
                  {errors.logoUrl && (
                    <p className="text-xs text-destructive">
                      {errors.logoUrl.message}
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
              </div>

              {/* Security/Recovery Fields */}
              <div className="space-y-4 pt-4 mt-6 border-t border-border/50">
                <h4 className="text-sm font-medium text-foreground">Recovery & Security</h4>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="recoveryEmail">Recovery Email</Label>
                    <Input
                      id="recoveryEmail"
                      type="email"
                      placeholder="recovery@example.com"
                      disabled={isSubmitting}
                      {...register("recoveryEmail")}
                    />
                    {errors.recoveryEmail && (
                      <p className="text-xs text-destructive">{errors.recoveryEmail.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      disabled={isSubmitting}
                      {...register("mobile")}
                    />
                    {errors.mobile && (
                      <p className="text-xs text-destructive">{errors.mobile.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Security Questions</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs" 
                      onClick={() => appendSq({ question: "", answer: "" })}
                    >
                      <Plus className="size-3 mr-1" /> Add Question
                    </Button>
                  </div>
                  
                  {sqFields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No security questions added.</p>
                  )}
                  
                  <div className="space-y-4">
                    {sqFields.map((field, index) => (
                      <div key={field.id} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 p-3 border rounded-md bg-muted/20">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-1 top-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSq(index)}
                        >
                          <X className="size-3.5" />
                        </Button>
                        <div className="space-y-1.5 pr-6 sm:pr-0">
                          <Label className="text-xs">Question</Label>
                          <Input
                            placeholder="e.g. Mother's maiden name"
                            disabled={isSubmitting}
                            {...register(`securityQuestions.${index}.question` as const)}
                          />
                          {errors.securityQuestions?.[index]?.question && (
                            <p className="text-xs text-destructive">{errors.securityQuestions?.[index]?.question?.message}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Answer</Label>
                          <Input
                            placeholder="Answer"
                            disabled={isSubmitting}
                            {...register(`securityQuestions.${index}.answer` as const)}
                          />
                          {errors.securityQuestions?.[index]?.answer && (
                            <p className="text-xs text-destructive">{errors.securityQuestions?.[index]?.answer?.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                  <div className="space-y-3 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <Label>Custom Fields (TIN, NID, PINs, etc.)</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs" 
                        onClick={() => appendCf({ id: crypto.randomUUID(), name: "", value: "", isSecret: false })}
                      >
                        <Plus className="size-3 mr-1" /> Add Field
                      </Button>
                    </div>
                    
                    {cfFields.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No custom fields added.</p>
                    )}
                    
                    <div className="space-y-4">
                      {cfFields.map((field, index) => (
                        <div key={field.id} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 p-3 border rounded-md bg-muted/20">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeCf(index)}
                          >
                            <X className="size-3.5" />
                          </Button>
                          <div className="space-y-1.5 pr-6 sm:pr-0">
                            <Label className="text-xs">Field Name</Label>
                            <Input
                              placeholder="e.g. Card PIN"
                              disabled={isSubmitting}
                              {...register(`customFields.${index}.name` as const)}
                            />
                            {errors.customFields?.[index]?.name && (
                              <p className="text-xs text-destructive">{errors.customFields?.[index]?.name?.message}</p>
                            )}
                            <div className="flex items-center space-x-2 pt-1">
                              <input 
                                type="checkbox" 
                                id={`secret-${field.id}`}
                                className="size-3 rounded border-gray-300"
                                {...register(`customFields.${index}.isSecret` as const)}
                              />
                              <label htmlFor={`secret-${field.id}`} className="text-xs text-muted-foreground cursor-pointer">Secret (mask value)</label>
                            </div>
                          </div>
                          <div className="space-y-1.5 mt-1 sm:mt-0">
                            <Label className="text-xs">Value</Label>
                            <Input
                              placeholder="Value"
                              disabled={isSubmitting}
                              {...register(`customFields.${index}.value` as const)}
                            />
                            {errors.customFields?.[index]?.value && (
                              <p className="text-xs text-destructive">{errors.customFields?.[index]?.value?.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t pt-4 mt-6">
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
