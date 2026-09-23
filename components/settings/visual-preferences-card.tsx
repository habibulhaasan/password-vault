"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Timer, ClipboardCopy } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisualPreferencesCard() {
  const [showVaultTimer, setShowVaultTimer] = useState(true);
  const [showClipboardTimer, setShowClipboardTimer] = useState(true);

  useEffect(() => {
    const v = localStorage.getItem("setting_showVaultTimer");
    const c = localStorage.getItem("setting_showClipboardTimer");
    if (v !== null) setShowVaultTimer(v === "true");
    if (c !== null) setShowClipboardTimer(c === "true");
  }, []);

  const toggleVaultTimer = () => {
    const next = !showVaultTimer;
    setShowVaultTimer(next);
    localStorage.setItem("setting_showVaultTimer", String(next));
    window.dispatchEvent(new Event("settings-updated"));
  };

  const toggleClipboardTimer = () => {
    const next = !showClipboardTimer;
    setShowClipboardTimer(next);
    localStorage.setItem("setting_showClipboardTimer", String(next));
    window.dispatchEvent(new Event("settings-updated"));
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Visual Aids</CardTitle>
            <CardDescription className="text-xs">
              Toggle on-screen indicators and floating timers for security events
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          onClick={toggleVaultTimer}
          className="flex items-center justify-between rounded-xl border border-border/70 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Vault Auto-Lock Timer</p>
              <p className="text-xs text-muted-foreground mt-1">
                Show a floating countdown when your vault is about to lock
              </p>
            </div>
          </div>
          <div className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
            showVaultTimer ? "bg-primary" : "bg-muted-foreground/30"
          )}>
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              showVaultTimer ? "translate-x-4" : "translate-x-1"
            )} />
          </div>
        </div>

        <div 
          onClick={toggleClipboardTimer}
          className="flex items-center justify-between rounded-xl border border-border/70 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <ClipboardCopy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Clipboard Clear Timer</p>
              <p className="text-xs text-muted-foreground mt-1">
                Show a countdown when sensitive data is copied to your clipboard
              </p>
            </div>
          </div>
          <div className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
            showClipboardTimer ? "bg-primary" : "bg-muted-foreground/30"
          )}>
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              showClipboardTimer ? "translate-x-4" : "translate-x-1"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

