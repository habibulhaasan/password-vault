"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCredentials } from "@/hooks/use-credentials";
import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { CredentialTable } from "@/components/credentials/credential-table";
import { CredentialCard } from "@/components/credentials/credential-card";
import { CredentialGridSkeleton } from "@/components/credentials/credential-skeleton";
import { EmptyState } from "@/components/credentials/empty-state";
import { announce } from "@/lib/a11y/announcer";
import {
  SearchFilterBar,
  type SortOption,
} from "@/components/filters/search-filter-bar";
import { type LastLoginFilter, matchesLastLoginFilter } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, List } from "lucide-react";
import type { EncryptedCredential } from "@/types/credential";

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const tagParam = searchParams.get("tag") || "";

  const { credentials, loading } = useCredentials();
  const { getCategory } = useCategories();

  // View state
  const [view, setView] = useState<"grid" | "table">("grid");

  useEffect(() => {
    const saved = localStorage.getItem("vault_view_preference");
    if (saved === "grid" || saved === "table") setView(saved);
  }, []);

  const handleViewChange = (v: "grid" | "table") => {
    setView(v);
    localStorage.setItem("vault_view_preference", v);
  };

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedTag, setSelectedTag] = useState(tagParam);
  const [prevTagParam, setPrevTagParam] = useState(tagParam);
  const [lastLoginFilter, setLastLoginFilter] =
    useState<LastLoginFilter>("all");
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
          const matchTag = cred.tags?.some((t) =>
            t.toLowerCase().includes(term),
          );
          const catObj = cred.categoryId
            ? getCategory(cred.categoryId)
            : undefined;
          const matchCategory = catObj?.label.toLowerCase().includes(term);
          if (!matchTitle && !matchUrl && !matchTag && !matchCategory)
            return false;
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
            const timeA = a.lastLoginAt?.toMillis
              ? a.lastLoginAt.toMillis()
              : 0;
            const timeB = b.lastLoginAt?.toMillis
              ? b.lastLoginAt.toMillis()
              : 0;
            return timeB - timeA;
          }
          case "login-asc": {
            const timeA = a.lastLoginAt?.toMillis
              ? a.lastLoginAt.toMillis()
              : 0;
            const timeB = b.lastLoginAt?.toMillis
              ? b.lastLoginAt.toMillis()
              : 0;
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
  }, [
    credentials,
    debouncedSearch,
    selectedCategory,
    selectedTag,
    lastLoginFilter,
    sortBy,
    getCategory,
  ]);

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
          : `Showing ${filteredCredentials.length} of ${credentials.length} credentials`,
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

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-md border p-0.5 bg-muted/20">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => handleViewChange("grid")}
              className="size-7 rounded-sm shadow-none"
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => handleViewChange("table")}
              className="size-7 rounded-sm shadow-none"
              aria-label="Table view"
            >
              <List className="size-4" />
            </Button>
          </div>
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/credentials/new" aria-label="Add new credential" />
            }
            className="gap-1.5 self-start sm:self-auto"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Credential</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
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
      {loading && <CredentialGridSkeleton count={6} />}

      {/* Empty Vault State (Section 26) */}
      {!loading && credentials.length === 0 && (
        <EmptyState variant="vault-empty" actionHref="/credentials/new" />
      )}

      {/* Empty Search/Filter Results State (Section 26) */}
      {!loading &&
        credentials.length > 0 &&
        filteredCredentials.length === 0 &&
        (selectedCategory &&
        !searchQuery.trim() &&
        !selectedTag &&
        lastLoginFilter === "all" ? (
          <EmptyState
            variant="no-category-items"
            categoryName={getCategory(selectedCategory)?.label}
            onResetFilters={handleResetFilters}
            actionHref="/credentials/new"
          />
        ) : (
          <EmptyState
            variant="no-search-results"
            onResetFilters={handleResetFilters}
          />
        ))}

      {/* Credential List */}
      {!loading && filteredCredentials.length > 0 && (
        view === "grid" ? (
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
        ) : (
          <CredentialTable credentials={filteredCredentials} />
        )
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-7xl py-6 px-4 space-y-6">
          <CredentialGridSkeleton count={6} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
