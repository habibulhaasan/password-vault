"use client";

import { useVault } from "@/hooks/use-vault";
import { AutoLockCard } from "@/components/settings/auto-lock-card";
import { MasterPasswordCard } from "@/components/settings/master-password-card";
import { ThemeCard } from "@/components/settings/theme-card";
import { AccountCard } from "@/components/settings/account-card";
import { SecuritySpecsCard } from "@/components/settings/security-specs-card";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const { lockVault } = useVault();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Vault Settings
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Encrypted
            </span>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Configure vault encryption, auto-lock timeouts, appearance, and
            account credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={lockVault}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Lock className="h-3.5 w-3.5" />
            Lock Vault
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Security & Preferences (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <MasterPasswordCard />
          <AutoLockCard />
          <ThemeCard />
        </div>

        {/* Right Column: Account & Transparency (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AccountCard />
          <SecuritySpecsCard />
        </div>
      </div>
    </div>
  );
}
