import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading categories"
      className="container max-w-7xl py-6 px-4 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Search Bar Skeleton */}
      <Skeleton className="h-9 w-full max-w-sm rounded-md" />

      {/* Custom Categories Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-8 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="size-6 rounded" />
                  <Skeleton className="size-6 rounded" />
                </div>
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Standard Categories Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-8 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading categories...</span>
    </div>
  );
}
