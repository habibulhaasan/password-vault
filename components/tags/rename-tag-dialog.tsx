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
import { renameTagSchema, type TagWithCount } from "@/types/tag";
import { Tag, Loader2 } from "lucide-react";

interface RenameTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TagWithCount | null;
  onRename: (oldTag: string, newTag: string) => Promise<void>;
}

function RenameTagFormContent({
  tag,
  onRename,
  onCancel,
}: {
  tag: TagWithCount;
  onRename: (oldTag: string, newTag: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [newTag, setNewTag] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = renameTagSchema.safeParse({ newTag });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid tag name");
      return;
    }

    const trimmed = validation.data.newTag.trim();
    if (trimmed === tag.name) {
      onCancel();
      return;
    }

    setIsSubmitting(true);
    try {
      await onRename(tag.name, trimmed);
      onCancel();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to rename tag. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Tag className="size-5" />
          </div>
          <div>
            <DialogTitle>Rename Tag</DialogTitle>
            <DialogDescription>
              Update #{tag.name} across your vault
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
        <Label htmlFor="tag-name">New Tag Name</Label>
        <Input
          id="tag-name"
          placeholder="e.g. work, important, 2FA"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          maxLength={30}
          autoFocus
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Affects {tag.count} {tag.count === 1 ? "credential" : "credentials"}
          </span>
          <span>{newTag.length} / 30</span>
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
              Renaming...
            </>
          ) : (
            "Rename Tag"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameTagDialog({
  open,
  onOpenChange,
  tag,
  onRename,
}: RenameTagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && tag && (
          <RenameTagFormContent
            key={tag.name}
            tag={tag}
            onRename={onRename}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
