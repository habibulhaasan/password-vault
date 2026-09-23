"use client";

import Link from "next/link";
import { CategoryIcon } from "@/lib/constants/categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryItemProps {
  category: Category;
  credentialCount: number;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function CategoryItem({
  category,
  credentialCount,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const isCustom = Boolean(category.isCustom);

  return (
    <Card className="group relative flex flex-col justify-between transition-all hover:border-border hover:shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <CategoryIcon name={category.icon} className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {category.label}
              </h3>
              <p className="text-xs text-muted-foreground">
                {credentialCount === 1
                  ? "1 credential"
                  : `${credentialCount} credentials`}
              </p>
            </div>
          </div>

          <Badge
            variant={isCustom ? "secondary" : "outline"}
            className="text-[10px] font-normal"
          >
            {isCustom ? "Custom" : "System"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">{/* Quick action bar */}</CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 pt-3 pb-3">
        <Link
          href={`/dashboard?category=${encodeURIComponent(category.id)}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          aria-label={`View credentials in ${category.label}`}
        >
          <span>View credentials</span>
          <span className="sr-only">in {category.label}</span>
          <ArrowRight
            className="size-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        {isCustom && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(category)}
                title={`Edit category ${category.label}`}
                aria-label={`Edit category ${category.label}`}
                className="size-7 text-muted-foreground hover:text-foreground touch-manipulation"
              >
                <Edit className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Edit category {category.label}</span>
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(category)}
                title={`Delete category ${category.label}`}
                aria-label={`Delete category ${category.label}`}
                className="size-7 text-muted-foreground hover:text-destructive touch-manipulation"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span className="sr-only">
                  Delete category {category.label}
                </span>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
