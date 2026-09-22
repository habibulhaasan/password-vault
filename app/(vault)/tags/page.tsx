"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTags } from "@/hooks/use-tags";
import { TagCard } from "@/components/tags/tag-card";
import { RenameTagDialog } from "@/components/tags/rename-tag-dialog";
import { DeleteTagDialog } from "@/components/tags/delete-tag-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Tag,
  Search,
  X,
  Hash,
  TrendingUp,
  Layers,
  Plus,
  SearchX,
} from "lucide-react";
import type { TagWithCount, TagSortOption } from "@/types/tag";

export default function TagsPage() {
  const {
    tags,
    totalUniqueTags,
    totalTaggedCredentials,
    popularTags,
    loading,
    renameTag,
    deleteTag,
  } = useTags();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<TagSortOption>("count-desc");
  const [tagToRename, setTagToRename] = useState<TagWithCount | null>(null);
  const [tagToDelete, setTagToDelete] = useState<TagWithCount | null>(null);

  // Filter and sort tags
  const processedTags = useMemo(() => {
    let result = [...tags];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "count-asc":
          return a.count - b.count || a.name.localeCompare(b.name);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "count-desc":
        default:
          return b.count - a.count || a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [tags, searchQuery, sortBy]);

  const topTag = popularTags[0] || null;

  return (
    <div className="container max-w-7xl py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
            {!loading && (
              <Badge variant="secondary" className="font-mono text-xs">
                {totalUniqueTags} total
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Organize and cross-reference credentials with flexible keywords
          </p>
        </div>

        <Button
          size="sm"
          render={<Link href="/credentials/new" />}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>New Credential</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Hash className="size-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Unique Tags</div>
            <div className="text-lg font-semibold">{totalUniqueTags}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Tagged Credentials</div>
            <div className="text-lg font-semibold">{totalTaggedCredentials}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Top Tag</div>
            <div className="text-lg font-semibold truncate max-w-[140px]">
              {topTag ? `#${topTag}` : "None"}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="tag-sort" className="text-xs text-muted-foreground whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="tag-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TagSortOption)}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="count-desc" className="bg-popover text-popover-foreground">
              Most Used
            </option>
            <option value="count-asc" className="bg-popover text-popover-foreground">
              Least Used
            </option>
            <option value="name-asc" className="bg-popover text-popover-foreground">
              Name (A to Z)
            </option>
            <option value="name-desc" className="bg-popover text-popover-foreground">
              Name (Z to A)
            </option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div
          role="status"
          aria-label="Loading tags"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/60 bg-muted/20 p-4 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded-full bg-muted" />
                <div className="flex gap-1">
                  <div className="size-6 rounded bg-muted" />
                  <div className="size-6 rounded bg-muted" />
                </div>
              </div>
              <div className="h-3 w-20 rounded bg-muted/60" />
            </div>
          ))}
          <span className="sr-only">Loading tags...</span>
        </div>
      )}

      {/* Empty States & Tag Grid */}
      {!loading && (
        <>
          {tags.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No tags created yet"
              description="Tags help you cross-reference credentials across categories (e.g. #2FA, #work, #subscription). Add tags when creating or editing credentials to see them here."
              action={{
                label: "Add First Tagged Credential",
                href: "/credentials/new",
                icon: Plus,
              }}
            />
          ) : processedTags.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching tags found"
              description={`No tags matched "${searchQuery}".`}
              action={{
                label: "Clear Search",
                onClick: () => setSearchQuery(""),
                variant: "outline",
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {processedTags.map((tag) => (
                <TagCard
                  key={tag.name}
                  tag={tag}
                  onRename={setTagToRename}
                  onDelete={setTagToDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Rename Dialog */}
      <RenameTagDialog
        open={Boolean(tagToRename)}
        onOpenChange={(open) => !open && setTagToRename(null)}
        tag={tagToRename}
        onRename={renameTag}
      />

      {/* Delete Dialog */}
      <DeleteTagDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => !open && setTagToDelete(null)}
        tag={tagToDelete}
        onConfirm={deleteTag}
      />
    </div>
  );
}
