"use client";

import { useEffect, useState } from "react";
import { useVault } from "@/hooks/use-vault";
import { Lock, ClipboardX } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingTimers() {
  const { status, autoLockMinutes } = useVault();
  const pathname = usePathname();

  // Settings
  const [showVaultTimer, setShowVaultTimer] = useState(true);
  const [showClipboardTimer, setShowClipboardTimer] = useState(true);

  // States
  const [vaultTimeLeft, setVaultTimeLeft] = useState<number | null>(null);
  const [clipboardTimeLeft, setClipboardTimeLeft] = useState<number | null>(
    null,
  );

  useEffect(() => {
    // Load settings
    const loadSettings = () => {
      const vTimer = localStorage.getItem("setting_showVaultTimer");
      const cTimer = localStorage.getItem("setting_showClipboardTimer");
      if (vTimer !== null) setShowVaultTimer(vTimer === "true");
      if (cTimer !== null) setShowClipboardTimer(cTimer === "true");
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);
    window.addEventListener("settings-updated", loadSettings);
    return () => {
      window.removeEventListener("storage", loadSettings);
      window.removeEventListener("settings-updated", loadSettings);
    };
  }, []);

  // Clipboard Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const handleClipboardStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ clearAfterMs: number }>;
      const clearAt = Date.now() + customEvent.detail.clearAfterMs;

      setClipboardTimeLeft(customEvent.detail.clearAfterMs);

      clearInterval(interval);
      interval = setInterval(() => {
        const remaining = clearAt - Date.now();
        if (remaining <= 0) {
          setClipboardTimeLeft(null);
          clearInterval(interval);
        } else {
          setClipboardTimeLeft(remaining);
        }
      }, 1000);
    };

    window.addEventListener("clipboard-timer-start", handleClipboardStart);
    return () => {
      window.removeEventListener("clipboard-timer-start", handleClipboardStart);
      clearInterval(interval);
    };
  }, []);

  // Vault Timer Logic
  // Since VaultProvider uses window activity events to reset its internal lastActivityRef,
  // we can also track window activity here to sync our timer visually.
  useEffect(() => {
    if (status !== "unlocked" || !autoLockMinutes) {
      setVaultTimeLeft(null);
      return;
    }

    let lastActivity = Date.now();
    const handleActivity = () => {
      lastActivity = Date.now();
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );

    const interval = setInterval(() => {
      const lockAt = lastActivity + autoLockMinutes * 60 * 1000;
      const remaining = lockAt - Date.now();
      if (remaining <= 0) {
        setVaultTimeLeft(null);
      } else {
        setVaultTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [status, autoLockMinutes]);

  // Hide on auth pages or when vault is locked
  if (
    status !== "unlocked" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      {showClipboardTimer && clipboardTimeLeft !== null && (
        <div className="flex items-center gap-2.5 bg-card/95 border border-border shadow-lg rounded-full px-4 py-2 backdrop-blur-sm animate-in slide-in-from-right-4 fade-in-50">
          <ClipboardX className="size-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Clipboard Clear
            </span>
            <span className="text-sm font-mono font-medium text-foreground leading-tight">
              {formatTime(clipboardTimeLeft)}
            </span>
          </div>
        </div>
      )}

      {showVaultTimer && vaultTimeLeft !== null && (
        <div className="flex items-center gap-2.5 bg-card/95 border border-border shadow-lg rounded-full px-4 py-2 backdrop-blur-sm animate-in slide-in-from-right-4 fade-in-50">
          <Lock className="size-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
              Auto-Lock In
            </span>
            <span className="text-sm font-mono font-medium text-foreground leading-tight">
              {formatTime(vaultTimeLeft)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
