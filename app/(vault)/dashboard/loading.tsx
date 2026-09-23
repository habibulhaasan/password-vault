import { CredentialGridSkeleton } from "@/components/credentials/credential-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container max-w-7xl py-6 px-4 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <CredentialGridSkeleton count={6} />
    </div>
  );
}
