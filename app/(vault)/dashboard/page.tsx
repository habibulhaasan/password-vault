"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCredentials } from "@/hooks/use-credentials";
import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { CredentialCard } from "@/components/credentials/credential-card";
import { EmptyState } from "@/components/credentials/empty-state";
import { announce } from "@/lib/a11y/announcer";
import {
  SearchFilterBar,
  type SortOption,
} from "@/components/filters/search-filter-bar";
import {
  type LastLoginFilter,
  matchesLastLoginFilter,
} from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import type { EncryptedCredential } from "@/types/credential";

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const tagParam = searchParams.get("tag") || "";

  const { credentials, loading } = useCredentials();
  const { getCategory } = useCategories();

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedTag, setSelectedTag] = useState(tagParam);
  const [prevTagParam, setPrevTagParam] = useState(tagParam);
  const [lastLoginFilter, setLastLoginFilter] = useState<LastLoginFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated-desc");

  // Sync category param if URL changes (e.g. user clicked sidebar category)
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }

  // Sync tag param if URL changes (e.g. user clicked a tag badge)
  if (tagParam !== prevTagParam) {
    setPrevTagParam(tagParam);
    setSelectedTag(tagParam);
  }

  // Debounce search query to prevent laggy typing
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Extract all unique tags present across stored credentials
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    credentials.forEach((c) => {
      c.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [credentials]);

  // Filter and sort credentials
  const filteredCredentials = useMemo(() => {
    return credentials
      .filter((cred: EncryptedCredential) => {
        // Search matching
        if (debouncedSearch.trim()) {
          const term = debouncedSearch.toLowerCase().trim();
          const matchTitle = cred.title.toLowerCase().includes(term);
          const matchUrl = cred.websiteUrl?.toLowerCase().includes(term);
          const matchTag = cred.tags?.some((t) => t.toLowerCase().includes(term));
          const catObj = cred.categoryId ? getCategory(cred.categoryId) : undefined;
          const matchCategory = catObj?.label.toLowerCase().includes(term);
          if (!matchTitle && !matchUrl && !matchTag && !matchCategory) return false;
        }

        // Category matching
        if (selectedCategory && cred.categoryId !== selectedCategory) {
          return false;
        }

        // Tag matching
        if (selectedTag && !cred.tags?.includes(selectedTag)) {
          return false;
        }

        // Last login matching
        if (!matchesLastLoginFilter(cred.lastLoginAt, lastLoginFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "updated-asc": {
            const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
            const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
            return timeA - timeB;
          }
          case "title-asc":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          case "login-desc": {
            const timeA = a.lastLoginAt?.toMillis ? a.lastLoginAt.toMillis() : 0;
            const timeB = b.lastLoginAt?.toMillis ? b.lastLoginAt.toMillis() : 0;
            return timeB - timeA;
          }
          case "login-asc": {
            const timeA = a.lastLoginAt?.toMillis ? a.lastLoginAt.toMillis() : 0;
            const timeB = b.lastLoginAt?.toMillis ? b.lastLoginAt.toMillis() : 0;
            return timeA - timeB;
          }
          case "updated-desc":
          default: {
            const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
            const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
            return timeB - timeA;
          }
        }
      });
  }, [credentials, debouncedSearch, selectedCategory, selectedTag, lastLoginFilter, sortBy, getCategory]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedTag("");
    setLastLoginFilter("all");
    setSortBy("updated-desc");
  };

  const isFiltering =
    searchQuery.trim().length > 0 ||
    selectedCategory.length > 0 ||
    selectedTag.length > 0 ||
    lastLoginFilter !== "all";

  // Announce live filter results to screen readers
  useEffect(() => {
    if (!loading && isFiltering) {
      announce(
        filteredCredentials.length === 0
          ? "No credentials found matching your filter criteria"
          : `Showing ${filteredCredentials.length} of ${credentials.length} credentials`
      );
    }
  }, [filteredCredentials.length, isFiltering, loading, credentials.length]);

  return (
    <div className="container max-w-7xl py-6 px-4 space-y-6">
      {/* Overview Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
            {!loading && (
              <Badge
                variant="secondary"
                className="font-mono text-xs"
                aria-label={
                  isFiltering
                    ? `Showing ${filteredCredentials.length} of ${credentials.length} credentials`
                    : `${credentials.length} credentials stored`
                }
              >
                {isFiltering
                  ? `${filteredCredentials.length} of ${credentials.length}`
                  : `${credentials.length} stored`}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Manage, organize, and securely access your encrypted accounts
          </p>
        </div>

        <Button
          size="sm"
          render={<Link href="/credentials/new" aria-label="Add new credential" />}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Credential
        </Button>
      </div>

      {/* Search, Filter, and Sort Bar */}
      {!loading && credentials.length > 0 && (
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          selectedLastLogin={lastLoginFilter}
          onLastLoginChange={setLastLoginFilter}
          availableTags={availableTags}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div
          role="status"
          aria-label="Loading credentials"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border/60 bg-muted/30 p-4 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted/60" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-36 rounded bg-muted/60" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading encrypted credentials...</span>
        </div>
      )}

      {/* Empty Vault State */}
      {!loading && credentials.length === 0 && (
        <EmptyState
          title="No credentials stored yet"
          description="Your vault is currently empty. Click below to add your first password or account."
          actionText="Add First Credential"
          actionHref="/credentials/new"
        />
      )}

      {/* Empty Search/Filter Results State */}
      {!loading && credentials.length > 0 && filteredCredentials.length === 0 && (
        <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center animate-in fade-in-50">
          <h3 className="text-base font-semibold">No matching credentials found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No credentials matched your current search term or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            aria-label="Clear active filters"
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Credential Grid */}
      {!loading && filteredCredentials.length > 0 && (
        <ul
          role="list"
          aria-label="Credentials list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0"
        >
          {filteredCredentials.map((credential) => (
            <li key={credential.id} className="list-none">
              <CredentialCard credential={credential} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
