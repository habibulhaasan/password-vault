"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AVAILABLE_CATEGORY_ICONS,
  CategoryIcon,
} from "@/lib/constants/categories";
import {
  categoryFormSchema,
  type Category,
  type CategoryFormData,
} from "@/types/category";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
}

function CategoryFormContent({
  categoryToEdit,
  onSave,
  onCancel,
}: {
  categoryToEdit?: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(categoryToEdit?.label || "");
  const [selectedIcon, setSelectedIcon] = useState(
    categoryToEdit?.icon || "folder",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = categoryFormSchema.safeParse({
      label,
      icon: selectedIcon,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(validation.data);
      onCancel();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save category. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(categoryToEdit);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CategoryIcon name={selectedIcon} className="size-5" />
          </div>
          <div>
            <DialogTitle>
              {isEditing ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update category name and icon identifier"
                : "Create a custom category to organize your credentials"}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          placeholder="e.g. Subscriptions, Gaming, Crypto"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={50}
          autoFocus
          disabled={isSubmitting}
        />
        <div className="flex justify-end text-[11px] text-muted-foreground">
          {label.length} / 50
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Icon</Label>
        <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1 rounded-lg border border-border/70 bg-muted/20">
          {AVAILABLE_CATEGORY_ICONS.map((item) => {
            const isSelected = selectedIcon === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedIcon(item.name)}
                disabled={isSubmitting}
                title={item.label}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg p-2 text-xs transition-all hover:bg-accent",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CategoryIcon name={item.name} className="size-5" />
                <span className="mt-1 text-[10px] truncate max-w-full leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Category"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
  onSave,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <CategoryFormContent
            key={categoryToEdit ? categoryToEdit.id : "new"}
            categoryToEdit={categoryToEdit}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
