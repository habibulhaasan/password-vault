"use client";

import { useVault } from "@/hooks/use-vault";
import { AutoLockCard } from "@/components/settings/auto-lock-card";
import { MasterPasswordCard } from "@/components/settings/master-password-card";
import { ThemeCard } from "@/components/settings/theme-card";
import { VisualPreferencesCard } from "@/components/settings/visual-preferences-card";
import { AccountCard } from "@/components/settings/account-card";
import { SecuritySpecsCard } from "@/components/settings/security-specs-card";
import { Button } from "@/components/ui/button";
import { Lock, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  const { lockVault } = useVault();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-12 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <SlidersHorizontal className="size-6 text-muted-foreground" />
            Preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Manage your vault security, visual appearance, and account settings.
          </p>
        </div>

        <Button
          type="button"
          onClick={lockVault}
          variant="outline"
          className="gap-2 shadow-sm rounded-full px-6"
        >
          <Lock className="size-4 text-muted-foreground" />
          Lock Vault
        </Button>
      </div>

      <div className="space-y-16">
        {/* Security Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium text-foreground pb-2 border-b border-border/50">
            Security & Access
          </h2>
          <div className="grid gap-6">
            <MasterPasswordCard />
            <AutoLockCard />
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium text-foreground pb-2 border-b border-border/50">
            Appearance
          </h2>
          <div className="grid gap-6">
            <ThemeCard />
            <VisualPreferencesCard />
          </div>
        </section>

        {/* Account Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium text-foreground pb-2 border-b border-border/50">
            Account Details
          </h2>
          <div className="grid gap-6">
            <AccountCard />
            <SecuritySpecsCard />
          </div>
        </section>
      </div>
    </div>
  );
}
