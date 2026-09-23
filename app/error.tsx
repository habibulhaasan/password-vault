"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log minimal safe information, strictly avoiding secret leakage
    console.error("Root application error:", error.name, error.digest || "");
  }, [error]);

  const safeMessage = sanitizeErrorMessage(error);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background"
    >
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-destructive/20 bg-card p-8 shadow-lg">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            An Unexpected Error Occurred
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {safeMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2"
            variant="default"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try Again
          </Button>

          <Button
            variant="outline"
            render={<Link href="/" />}
            className="w-full sm:w-auto gap-2"
          >
            <Home className="size-4" aria-hidden="true" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
