
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { secureFormSchema, type SecureFormValues } from "@/lib/validations/secure";
import { useTags } from "@/hooks/use-tags";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Loader2, List, Type, FileText } from "lucide-react";
import type { SecureFormData } from "@/types/secure";

const PRESET_NAMES = [
  "TIN", "NID", "BRN", "Account No.", "Card PIN", 
  "Backup Codes", "Special Note", "Passport No.", 
  "Social Security", "Driver's License", "Recovery Email"
];

interface SecureFormProps {
  initialValues?: Partial<SecureFormData>;
  isEdit?: boolean;
  onSubmit: (data: SecureFormData) => Promise<void>;
  onCancel?: () => void;
}

export function SecureForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
}: SecureFormProps) {
  const router = useRouter();
  const { suggestTags } = useTags();
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [customModeIds, setCustomModeIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SecureFormValues>({
    resolver: zodResolver(secureFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      categoryId: initialValues?.categoryId || "",
      tags: initialValues?.tags || [],
      customFields: initialValues?.customFields?.length ? initialValues.customFields : [
        { id: crypto.randomUUID(), name: "", value: "", isSecret: true, isMultiline: false }
      ],
    },
  });

  const { fields: cfFields, append: appendCf, remove: removeCf } = useFieldArray({
    control,
    name: "customFields"
  });

  const tags = useWatch({ control, name: "tags" }) || [];

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 20) return;
    setValue("tags", [...tags, trimmed], { shouldValidate: true });
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue("tags", tags.filter((t) => t !== tagToRemove), { shouldValidate: true });
  };

  const handleFormSubmit = async (values: SecureFormValues) => {
    setError(null);
    try {
      await onSubmit({
        title: values.title,
        categoryId: values.categoryId || undefined,
        tags: values.tags || [],
        customFields: values.customFields?.filter(f => f.name.trim() && f.value.trim()) || [],
      });
    } catch {
      setError("An error occurred while saving. Please try again.");
    }
  };

  const toggleCustomMode = (id: string, isCustom: boolean) => {
    setCustomModeIds(prev => {
      const next = new Set(prev);
      if (isCustom) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <Card className="w-full max-w-2xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">
          {isEdit ? "Edit Secure" : "Add Secure"}
        </CardTitle>
        <CardDescription>
          Store sensitive personal and business secureItems securely.
        </CardDescription>
        {error && (
          <div className="mt-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}
      </CardHeader>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input id="title" placeholder="e.g. Personal, Business" disabled={isSubmitting} autoFocus {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label>Encrypted Information</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => appendCf({ id: crypto.randomUUID(), name: "", value: "", isSecret: true, isMultiline: false })}>
                <Plus className="size-3 mr-1" /> Add Field
              </Button>
            </div>
            
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Add secure fields (TIN, NID, PINs, etc.). Choose a preset name or type your own.
            </p>

            {cfFields.length === 0 && <p className="text-xs text-muted-foreground italic">No fields added.</p>}
            
            <div className="space-y-4">
              {cfFields.map((field, index) => {
                const isMultiline = watch(`customFields.${index}.isMultiline`);
                const currentName = watch(`customFields.${index}.name`) || "";
                
                // It is custom if it's not a preset AND it has a value, OR if it's explicitly marked in state
                const isCustomNameMode = customModeIds.has(field.id) || (!PRESET_NAMES.includes(currentName) && currentName !== "");

                return (
                  <div key={field.id} className="relative grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr] p-3 pb-4 border rounded-md bg-muted/20 items-start">
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive z-10" onClick={() => removeCf(index)}>
                      <X className="size-3.5" />
                    </Button>
                    
                    {/* Left Column: Name & Toggles */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Field Name</Label>
                        {isCustomNameMode ? (
                          <div className="relative">
                            <Input 
                              placeholder="e.g. Employee ID" 
                              disabled={isSubmitting} 
                              className="pr-8"
                              {...register(`customFields.${index}.name` as const)} 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              title="Back to dropdown"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                toggleCustomMode(field.id, false);
                                setValue(`customFields.${index}.name`, "");
                              }}
                            >
                              <List className="size-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSubmitting}
                            value={currentName}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "__CUSTOM__") {
                                toggleCustomMode(field.id, true);
                                setValue(`customFields.${index}.name`, "");
                              } else {
                                setValue(`customFields.${index}.name`, val);
                                if (val === "Backup Codes" || val === "Special Note") {
                                  setValue(`customFields.${index}.isMultiline`, true);
                                } else {
                                  setValue(`customFields.${index}.isMultiline`, false);
                                }
                              }
                            }}
                          >
                            <option value="" disabled>Select field...</option>
                            {PRESET_NAMES.map(preset => (
                              <option key={preset} value={preset}>{preset}</option>
                            ))}
                            <option value="__CUSTOM__" className="font-semibold text-primary">Custom Name...</option>
                          </select>
                        )}
                        {errors.customFields?.[index]?.name && <p className="text-xs text-destructive">{errors.customFields?.[index]?.name?.message}</p>}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-1.5">
                          <input type="checkbox" id={`secret-${field.id}`} className="size-3.5 rounded border-gray-300 text-primary" {...register(`customFields.${index}.isSecret` as const)} />
                          <label htmlFor={`secret-${field.id}`} className="text-xs text-muted-foreground cursor-pointer select-none">Secret (Mask visually)</label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Value & Type Toggle */}
                    <div className="space-y-1.5 pr-6 sm:pr-0 flex flex-col h-full w-full">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Value</Label>
                        </div>
                        {isMultiline ? (
                        <Textarea 
                          placeholder="Long value..." 
                          disabled={isSubmitting} 
                          className="resize-y min-h-[80px] w-full mt-1"
                          {...register(`customFields.${index}.value` as const)} 
                        />
                      ) : (
                        <Input 
                          placeholder="Short value..." 
                          disabled={isSubmitting}
                          className="w-full mt-1"
                          {...register(`customFields.${index}.value` as const)} 
                        />
                      )}
                      {errors.customFields?.[index]?.value && <p className="text-xs text-destructive">{errors.customFields?.[index]?.value?.message}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-border/50">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleAddTag} disabled={!tagInput.trim() || isSubmitting}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive"><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t pt-4 mt-6">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel || (() => router.back())} className="w-full sm:w-auto h-9">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-9">
            {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : isEdit ? "Save Changes" : "Save Note"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
