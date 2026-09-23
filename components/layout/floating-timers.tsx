"use client";

import { useEffect, useState, useRef } from "react";
import { useVault } from "@/hooks/use-vault";
import { Lock, ClipboardX, GripHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const [isHidden, setIsHidden] = useState(false);

  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary mouse button (0) or touch
    if (e.button !== 0 && e.pointerType === "mouse") return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

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
  useEffect(() => {
    if (status !== "unlocked" || !autoLockMinutes) {
      setVaultTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const lockAtStr = sessionStorage.getItem("vaultLockTime");
      if (!lockAtStr) {
        setVaultTimeLeft(null);
        return;
      }
      const lockAt = parseInt(lockAtStr, 10);
      const remaining = lockAt - Date.now();
      if (remaining <= 0) {
        setVaultTimeLeft(null);
      } else {
        setVaultTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
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

  // If no timers are shown or active, don't render the widget
  if (isHidden) return null;
  if (!showVaultTimer && !showClipboardTimer) return null;
  if (!showVaultTimer && clipboardTimeLeft === null) return null;
  if (!showClipboardTimer && vaultTimeLeft === null) return null;
  if (vaultTimeLeft === null && clipboardTimeLeft === null) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div 
      className={cn(
        "fixed z-50 flex touch-none select-none animate-in fade-in-50 slide-in-from-top-4",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        top: '10px',
        left: '50%',
        transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Drag to move timers"
    >
      <div className="flex items-center bg-card/80 backdrop-blur-md border border-border shadow-md rounded-full px-1 py-1 transition-shadow hover:shadow-lg whitespace-nowrap min-w-max">
        <div className="p-1 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
          <GripHorizontal className="size-3.5" />
        </div>
        
        <div className="flex items-center gap-2 pr-1">
          {showClipboardTimer && clipboardTimeLeft !== null && (
            <div className="flex items-center gap-1.5 border-l border-border/50 pl-2 first:border-l-0 first:pl-1">
              <ClipboardX className="size-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs font-mono font-medium text-foreground w-[40px] text-center shrink-0">
                {formatTime(clipboardTimeLeft)}
              </span>
            </div>
          )}
          
          {showVaultTimer && vaultTimeLeft !== null && (
            <div className="flex items-center gap-1.5 border-l border-border/50 pl-2 first:border-l-0 first:pl-1">
              <Lock className="size-3.5 text-primary shrink-0" />
              <span className="text-xs font-mono font-medium text-foreground w-[40px] text-center shrink-0">
                {formatTime(vaultTimeLeft)}
              </span>
            </div>
          )}
          
          <button
            type="button"
            className="p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsHidden(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Hide timers temporarily"
            aria-label="Hide timers"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
