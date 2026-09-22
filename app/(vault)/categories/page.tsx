"use client";

import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useCredentials } from "@/hooks/use-credentials";
import { CategoryItem } from "@/components/categories/category-item";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Search,
  FolderPlus,
  X,
  Layers,
  Sparkles,
  ShieldAlert,
  SearchX,
} from "lucide-react";
import type { Category, CategoryFormData } from "@/types/category";

export default function CategoriesPage() {
  const {
    categories,
    customCategories,
    systemCategories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const { credentials, loading: credentialsLoading } = useCredentials();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Compute credentials count per category
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    credentials.forEach((c) => {
      const catId = c.categoryId || "uncategorized";
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [credentials]);

  const uncategorizedCount = countsByCategory["uncategorized"] || 0;

  // Filtered categories based on search
  const filteredCustom = useMemo(() => {
    if (!searchQuery.trim()) return customCategories;
    const q = searchQuery.toLowerCase().trim();
    return customCategories.filter((c) => c.label.toLowerCase().includes(q));
  }, [customCategories, searchQuery]);

  const filteredSystem = useMemo(() => {
    if (!searchQuery.trim()) return systemCategories;
    const q = searchQuery.toLowerCase().trim();
    return systemCategories.filter((c) => c.label.toLowerCase().includes(q));
  }, [systemCategories, searchQuery]);

  const handleSaveEdit = async (data: CategoryFormData) => {
    if (!categoryToEdit) return;
    await updateCategory(categoryToEdit.id, data);
    setCategoryToEdit(null);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  const loading = categoriesLoading || credentialsLoading;

  return (
    <div className="container max-w-7xl py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            {!loading && (
              <Badge variant="secondary" className="font-mono text-xs">
                {categories.length} total
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Classify and organize your encrypted passwords and accounts
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>New Category</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">System Categories</div>
            <div className="text-lg font-semibold">{systemCategories.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Custom Categories</div>
            <div className="text-lg font-semibold">{customCategories.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Uncategorized</div>
            <div className="text-lg font-semibold">{uncategorizedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter categories..."
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

      {/* Loading Skeletons */}
      {loading && (
        <div
          role="status"
          aria-label="Loading categories"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/60 bg-muted/20 p-4 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-muted" />
                  <div className="h-4 w-24 rounded bg-muted" />
                </div>
              </div>
              <div className="h-3 w-16 rounded bg-muted/60" />
            </div>
          ))}
          <span className="sr-only">Loading categories...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Global Search Empty Result across all categories */}
          {searchQuery && filteredCustom.length === 0 && filteredSystem.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No categories found"
              description={`No categories match "${searchQuery}".`}
              action={{
                label: "Clear Search",
                onClick: () => setSearchQuery(""),
                variant: "outline",
              }}
            />
          ) : (
            <>
              {/* Custom Categories Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      Custom Categories
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {customCategories.length}
                    </Badge>
                  </div>
                </div>

                {customCategories.length === 0 ? (
                  <EmptyState
                    icon={FolderPlus}
                    title="No custom categories yet"
                    description="Create custom categories to tailor your vault organization to your personal workflow."
                    action={{
                      label: "Create Your First Category",
                      onClick: () => setIsCreateOpen(true),
                      icon: Plus,
                      variant: "outline",
                    }}
                  />
                ) : filteredCustom.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No custom categories match &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCustom.map((cat) => (
                      <CategoryItem
                        key={cat.id}
                        category={cat}
                        credentialCount={countsByCategory[cat.id] || 0}
                        onEdit={setCategoryToEdit}
                        onDelete={setCategoryToDelete}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* System Categories Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      Standard Categories
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {systemCategories.length}
                    </Badge>
                  </div>
                </div>

                {filteredSystem.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No standard categories match &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSystem.map((cat) => (
                      <CategoryItem
                        key={cat.id}
                        category={cat}
                        credentialCount={countsByCategory[cat.id] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Create Dialog */}
      <CategoryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={async (data) => {
          await createCategory(data);
        }}
      />

      {/* Edit Dialog */}
      <CategoryDialog
        open={Boolean(categoryToEdit)}
        onOpenChange={(open) => !open && setCategoryToEdit(null)}
        categoryToEdit={categoryToEdit}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        category={categoryToDelete}
        credentialCount={
          categoryToDelete ? countsByCategory[categoryToDelete.id] || 0 : 0
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
