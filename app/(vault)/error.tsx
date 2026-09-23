"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, LayoutDashboard } from "lucide-react";

export default function VaultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Safe error logging without sensitive params or plaintext secrets
    console.error("Vault route error caught:", error.name, error.digest || "");
  }, [error]);

  const safeMessage = sanitizeErrorMessage(
    error,
    "An error occurred while managing your encrypted vault data. Your stored credentials remain secure.",
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="container max-w-lg py-12 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="w-full space-y-6 rounded-2xl border border-destructive/20 bg-card p-6 sm:p-8 shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Vault Error
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {safeMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-1.5"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Try Again
          </Button>

          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard" />}
            className="w-full sm:w-auto gap-1.5"
          >
            <LayoutDashboard className="size-3.5" aria-hidden="true" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
