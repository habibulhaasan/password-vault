"use client";

import React, { useState } from "react";
import { useVault } from "@/hooks/use-vault";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { announce } from "@/lib/a11y/announcer";
import { cn } from "@/lib/utils";

interface AutoLockOption {
  minutes: number;
  label: string;
  description: string;
}

const AUTO_LOCK_OPTIONS: AutoLockOption[] = [
  {
    minutes: 5,
    label: "5 minutes",
    description: "Quick timeout for shared or public environments",
  },
  {
    minutes: 15,
    label: "15 minutes (Default)",
    description: "Recommended balance of security and convenience",
  },
  {
    minutes: 30,
    label: "30 minutes",
    description: "Extended session for intensive workflows",
  },
  {
    minutes: 0,
    label: "Never",
    description: "Manual lock only — leaves vault unlocked until closed",
  },
];

export function AutoLockCard() {
  const { autoLockMinutes, updateAutoLockMinutes, lockVault } = useVault();
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectOption = async (option: AutoLockOption) => {
    if (option.minutes === autoLockMinutes || saving) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateAutoLockMinutes(option.minutes);
      setSavedSuccess(true);
      announce(`Auto-lock timeout updated to ${option.label}`);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update auto-lock policy:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Auto-Lock Policy
              </CardTitle>
              <CardDescription className="text-xs">
                Automatically lock vault and purge decrypted memory after inactivity
              </CardDescription>
            </div>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {AUTO_LOCK_OPTIONS.map((option) => {
            const isSelected = autoLockMinutes === option.minutes;
            const isNever = option.minutes === 0;

            return (
              <button
                key={option.minutes}
                type="button"
                onClick={() => handleSelectOption(option)}
                disabled={saving}
                aria-pressed={isSelected}
                aria-label={`Set auto-lock to ${option.label}`}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-manipulation",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary"
                    : "border-border/70 hover:border-border hover:bg-muted/50 text-foreground"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground">
                    {option.label}
                  </span>
                  {isSelected ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {option.description}
                </p>
                {isNever && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="h-3 w-3" />
                    Security Risk
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Current session timeout:{" "}
            <strong className="text-foreground font-semibold">
              {autoLockMinutes === 0 ? "Disabled" : `${autoLockMinutes} minutes`}
            </strong>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={lockVault}
            className="w-full sm:w-auto h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Lock Vault Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

