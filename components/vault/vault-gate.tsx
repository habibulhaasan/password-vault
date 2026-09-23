"use client";

import { useVault } from "@/hooks/use-vault";
import { VaultSetupForm } from "./vault-setup-form";
import { VaultUnlockForm } from "./vault-unlock-form";
import { Loader2 } from "lucide-react";

export function VaultGate({ children }: { children: React.ReactNode }) {
  const { status } = useVault();

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[60vh] items-center justify-center animate-in fade-in-50"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground p-6 rounded-xl border border-border/40 bg-card/50">
          <Loader2
            className="size-6 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-xs font-medium text-foreground">
            Verifying secure vault status...
          </p>
          <span className="sr-only">Checking encryption status...</span>
        </div>
      </div>
    );
  }

  if (status === "uninitialized") {
    return <VaultSetupForm />;
  }

  if (status === "locked") {
    return <VaultUnlockForm />;
  }

  return <>{children}</>;
}
