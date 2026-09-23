"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tag, ArrowRight, Edit, Trash2 } from "lucide-react";
import type { TagWithCount } from "@/types/tag";

interface TagCardProps {
  tag: TagWithCount;
  onRename?: (tag: TagWithCount) => void;
  onDelete?: (tag: TagWithCount) => void;
}

export function TagCard({ tag, onRename, onDelete }: TagCardProps) {
  return (
    <Card className="group relative flex flex-col justify-between transition-all hover:border-border hover:shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Tag className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                #{tag.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tag.count === 1 ? "1 credential" : `${tag.count} credentials`}
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="font-mono text-xs">
            {tag.count}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3" />

      <CardFooter className="flex items-center justify-between border-t border-border/40 pt-3 pb-3">
        <Link
          href={`/dashboard?tag=${encodeURIComponent(tag.name)}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          aria-label={`View credentials tagged with #${tag.name}`}
        >
          <span>View credentials</span>
          <span className="sr-only">tagged with #{tag.name}</span>
          <ArrowRight
            className="size-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        <div className="flex items-center gap-1">
          {onRename && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRename(tag)}
              title={`Rename tag #${tag.name}`}
              aria-label={`Rename tag #${tag.name}`}
              className="size-7 text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <Edit className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Rename tag #{tag.name}</span>
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(tag)}
              title={`Delete tag #${tag.name}`}
              aria-label={`Delete tag #${tag.name}`}
              className="size-7 text-muted-foreground hover:text-destructive touch-manipulation"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Delete tag #{tag.name}</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
