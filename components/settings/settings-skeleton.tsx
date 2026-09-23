import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading settings"
      className="space-y-6 animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Grid: 7 cols left, 5 cols right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Master Password Card Skeleton */}
          <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-72" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>

          {/* Auto-Lock Card Skeleton */}
          <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-60" />
            <Skeleton className="h-9 w-48 rounded-md" />
          </div>

          {/* Theme Card Skeleton */}
          <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Account Card Skeleton */}
          <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Security Specs Card Skeleton */}
          <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-4/6" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
