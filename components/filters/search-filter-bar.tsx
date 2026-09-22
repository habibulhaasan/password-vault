"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-categories";
import {
  type LastLoginFilter,
  LAST_LOGIN_FILTER_LABELS,
} from "@/lib/utils/date";

export type SortOption =
  | "updated-desc"
  | "updated-asc"
  | "title-asc"
  | "title-desc"
  | "login-desc"
  | "login-asc";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  selectedLastLogin: LastLoginFilter;
  onLastLoginChange: (filter: LastLoginFilter) => void;
  availableTags: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  selectedLastLogin,
  onLastLoginChange,
  availableTags,
  sortBy,
  onSortChange,
  onResetFilters,
}: SearchFilterBarProps) {
  const { customCategories, systemCategories, getCategory } = useCategories();

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory.length > 0 ||
    selectedTag.length > 0 ||
    selectedLastLogin !== "all" ||
    sortBy !== "updated-desc";

  const activeCategoryObj = selectedCategory
    ? getCategory(selectedCategory)
    : undefined;

  return (
    <div className="space-y-3">
      {/* Primary Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search credentials by title, domain, or tag..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="size-3.5" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-auto sm:min-w-36">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="flex h-9 sm:h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              aria-label="Filter by category"
            >
              <option value="" className="bg-popover text-popover-foreground">
                All Categories
              </option>
              {customCategories.length > 0 && (
                <optgroup
                  label="Custom Categories"
                  className="bg-popover text-popover-foreground"
                >
                  {customCategories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-popover text-popover-foreground"
                    >
                      {cat.label}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup
                label="Standard Categories"
                className="bg-popover text-popover-foreground"
              >
                {systemCategories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-popover text-popover-foreground"
                  >
                    {cat.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Tag Dropdown */}
          {availableTags.length > 0 && (
            <div className="relative w-full sm:w-auto sm:min-w-28">
              <select
                value={selectedTag}
                onChange={(e) => onTagChange(e.target.value)}
                className="flex h-9 sm:h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                aria-label="Filter by tag"
              >
                <option value="" className="bg-popover text-popover-foreground">
                  All Tags
                </option>
                {availableTags.map((t) => (
                  <option
                    key={t}
                    value={t}
                    className="bg-popover text-popover-foreground"
                  >
                    #{t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Last Login Filter Dropdown */}
          <div className="relative w-full sm:w-auto sm:min-w-36">
            <select
              value={selectedLastLogin}
              onChange={(e) => onLastLoginChange(e.target.value as LastLoginFilter)}
              className="flex h-9 sm:h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              aria-label="Filter by last login"
            >
              <option value="all" className="bg-popover text-popover-foreground">
                All Logins
              </option>
              <option value="today" className="bg-popover text-popover-foreground">
                Logged in Today
              </option>
              <option value="7days" className="bg-popover text-popover-foreground">
                Within 7 days
              </option>
              <option value="30days" className="bg-popover text-popover-foreground">
                Within 30 days
              </option>
              <option value="over30days" className="bg-popover text-popover-foreground">
                More than 30 days
              </option>
              <option value="never" className="bg-popover text-popover-foreground">
                Never logged in
              </option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto sm:min-w-36">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="flex h-9 sm:h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              aria-label="Sort credentials"
            >
              <option value="updated-desc" className="bg-popover text-popover-foreground">
                Updated (Newest)
              </option>
              <option value="updated-asc" className="bg-popover text-popover-foreground">
                Updated (Oldest)
              </option>
              <option value="title-asc" className="bg-popover text-popover-foreground">
                Title (A-Z)
              </option>
              <option value="title-desc" className="bg-popover text-popover-foreground">
                Title (Z-A)
              </option>
              <option value="login-desc" className="bg-popover text-popover-foreground">
                Last Login (Recent)
              </option>
              <option value="login-asc" className="bg-popover text-popover-foreground">
                Last Login (Oldest)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Reset Button */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-muted-foreground mr-1 text-[11px]">Filters:</span>

          {searchQuery.trim() && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Query: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="size-3" />
                <span className="sr-only">Remove search filter</span>
              </button>
            </Badge>
          )}

          {activeCategoryObj && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Category: {activeCategoryObj.label}
              <button
                type="button"
                onClick={() => onCategoryChange("")}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="size-3" />
                <span className="sr-only">Remove category filter</span>
              </button>
            </Badge>
          )}

          {selectedTag && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Tag: #{selectedTag}
              <button
                type="button"
                onClick={() => onTagChange("")}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="size-3" />
                <span className="sr-only">Remove tag filter</span>
              </button>
            </Badge>
          )}

          {selectedLastLogin !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Login: {LAST_LOGIN_FILTER_LABELS[selectedLastLogin]}
              <button
                type="button"
                onClick={() => onLastLoginChange("all")}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="size-3" />
                <span className="sr-only">Remove login filter</span>
              </button>
            </Badge>
          )}

          {sortBy !== "updated-desc" && (
            <Badge variant="outline" className="gap-1 pr-1 text-xs">
              Sorted
              <button
                type="button"
                onClick={() => onSortChange("updated-desc")}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="size-3" />
                <span className="sr-only">Reset sort</span>
              </button>
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

