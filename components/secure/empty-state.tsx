"use client";

import { EmptyState, type EmptyStateAction } from "@/components/ui/empty-state";
import { ShieldCheck, Plus, SearchX, FolderOpen } from "lucide-react";

interface IdentityEmptyStateProps {
  variant?:
    "vault-empty" | "no-search-results" | "no-category-items" | "custom";
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  onResetFilters?: () => void;
  categoryName?: string;
}

export function EmptyStateIdentities({
  variant = "vault-empty",
  title,
  description,
  actionText,
  actionHref,
  onAction,
  onResetFilters,
  categoryName,
}: IdentityEmptyStateProps) {
  if (variant === "vault-empty") {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={title || "Your vault is empty"}
        description={description || "Add your first secureItem to get started."}
        action={{
          label: actionText || "Add Identity",
          href: actionHref || "/secure/new",
          onClick: onAction,
          icon: Plus,
          variant: "default",
        }}
      />
    );
  }

  if (variant === "no-search-results") {
    return (
      <EmptyState
        icon={SearchX}
        title={title || "No secureItems found"}
        description={description || "Try another search or clear your filters."}
        action={
          onResetFilters
            ? {
                label: "Clear Filters",
                onClick: onResetFilters,
                variant: "outline",
              }
            : undefined
        }
      />
    );
  }

  if (variant === "no-category-items") {
    return (
      <EmptyState
        icon={FolderOpen}
        title={
          title ||
          (categoryName
            ? `No secureItems in ${categoryName}`
            : "No secureItems in this category.")
        }
        description={
          description ||
          "Add a secureItem to this category or clear your selection."
        }
        action={{
          label: actionText || "Add Identity",
          href: actionHref || "/secure/new",
          onClick: onAction,
          icon: Plus,
          variant: "default",
        }}
        secondaryAction={
          onResetFilters
            ? {
                label: "View All Identities",
                onClick: onResetFilters,
                variant: "outline",
              }
            : undefined
        }
      />
    );
  }

  // Custom fallback
  const primaryAction: EmptyStateAction | undefined =
    actionText && (actionHref || onAction)
      ? {
          label: actionText,
          href: actionHref,
          onClick: onAction,
          icon: Plus,
        }
      : undefined;

  return (
    <EmptyState
      icon={ShieldCheck}
      title={title || "No secureItems yet"}
      description={description || "Add your first password to get started."}
      action={primaryAction}
    />
  );
}

// Re-export standard name for backward compatibility
export { EmptyStateIdentities as EmptyState };
