import { Skeleton } from "@/components/ui/skeleton";

export function CredentialFormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading form"
      className="container max-w-3xl py-6 px-4 space-y-6 animate-pulse"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {/* Form Fields Card */}
      <div className="rounded-xl border border-border/70 bg-card p-6 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Password & Generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
      <span className="sr-only">Loading credential form...</span>
    </div>
  );
}

