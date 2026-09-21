"use client";

import { useVault } from "@/hooks/use-vault";
import { VaultSetupForm } from "./vault-setup-form";
import { VaultUnlockForm } from "./vault-unlock-form";
import { Loader2 } from "lucide-react";

export function VaultGate({ children }: { children: React.ReactNode }) {
  const { status } = useVault();

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Checking vault status...</p>
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

