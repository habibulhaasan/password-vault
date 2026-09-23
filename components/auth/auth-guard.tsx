"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground p-6 rounded-xl border border-border/40 bg-card shadow-sm">
          <Loader2
            className="size-6 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-xs font-medium text-foreground">
            Verifying authentication session...
          </p>
          <span className="sr-only">Checking session status...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
