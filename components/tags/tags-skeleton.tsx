import { Skeleton } from "@/components/ui/skeleton";

export function TagsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading tags"
      className="container max-w-7xl py-6 px-4 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-60" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* 3 Metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Sort Bar Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>

      {/* Tag Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <div className="flex gap-1">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="size-6 rounded" />
              </div>
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading tags...</span>
    </div>
  );
}
