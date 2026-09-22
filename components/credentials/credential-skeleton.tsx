import { Skeleton } from "@/components/ui/skeleton";

export function CredentialCardSkeleton() {
  return (
    <div
      data-slot="credential-card-skeleton"
      className="h-44 rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="size-9 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4 max-w-[140px]" />
            <Skeleton className="h-3 w-1/3 max-w-[80px]" />
          </div>
        </div>
        <Skeleton className="size-7 rounded-md" />
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function CredentialGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading credentials"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CredentialCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading encrypted credentials...</span>
    </div>
  );
}

export function CredentialDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading credential details"
      className="container max-w-2xl py-6 px-4 space-y-5"
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-border/80 bg-card p-6 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Username row */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </div>

          {/* Password row */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </div>
          </div>

          {/* Website row */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3 w-12" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Timestamps footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4 text-xs">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <span className="sr-only">Decrypting credential record...</span>
    </div>
  );
}

