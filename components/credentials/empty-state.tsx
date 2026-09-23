"use client";

import { EmptyState, type EmptyStateAction } from "@/components/ui/empty-state";
import { ShieldCheck, Plus, SearchX, FolderOpen } from "lucide-react";

interface CredentialEmptyStateProps {
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

export function EmptyStateCredentials({
  variant = "vault-empty",
  title,
  description,
  actionText,
  actionHref,
  onAction,
  onResetFilters,
  categoryName,
}: CredentialEmptyStateProps) {
  if (variant === "vault-empty") {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={title || "Your vault is empty"}
        description={description || "Add your first credential to get started."}
        action={{
          label: actionText || "Add Credential",
          href: actionHref || "/credentials/new",
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
        title={title || "No credentials found"}
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
            ? `No credentials in ${categoryName}`
            : "No credentials in this category.")
        }
        description={
          description ||
          "Add a credential to this category or clear your selection."
        }
        action={{
          label: actionText || "Add Credential",
          href: actionHref || "/credentials/new",
          onClick: onAction,
          icon: Plus,
          variant: "default",
        }}
        secondaryAction={
          onResetFilters
            ? {
                label: "View All Credentials",
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
      title={title || "No credentials yet"}
      description={description || "Add your first password to get started."}
      action={primaryAction}
    />
  );
}

// Re-export standard name for backward compatibility
export { EmptyStateCredentials as EmptyState };
