"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Options for copying to clipboard.
 */
export interface CopyOptions {
  /**
   * Optional duration in milliseconds after which the clipboard is cleared
   * if it still contains the copied sensitive text (e.g., 30000ms for passwords).
   */
  clearAfterMs?: number;
}

/**
 * Copies text to the system clipboard with an automatic fallback for
 * older browser environments or restricted contexts.
 */
export async function copyToClipboard(
  text: string,
  options?: CopyOptions
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  let success = false;

  // Modern asynchronous Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch {
      success = false;
    }
  }

  // Fallback for non-secure contexts or older browsers
  if (!success) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.select();
      success = document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      success = false;
    }
  }

  // Optional auto-clear timer for sensitive copied data (e.g. passwords)
  if (success && options?.clearAfterMs && options.clearAfterMs > 0) {
    setTimeout(async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          const currentText = await navigator.clipboard.readText();
          if (currentText === text) {
            await navigator.clipboard.writeText("");
          }
        }
      } catch {
        // Silently ignore if readText permissions are not granted
      }
    }, options.clearAfterMs);
  }

  return success;
}

/**
 * Safely opens a website URL in a new tab, strictly enforcing
 * http/https schemes and noopener noreferrer attributes.
 */
export function safeOpenUrl(rawUrl?: string): boolean {
  if (!rawUrl || typeof window === "undefined") return false;

  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  const fullUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(fullUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    window.open(parsed.href, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}

/**
 * React hook to manage visual "Copied!" feedback state across multiple actions or fields.
 */
export function useClipboardState(durationMs: number = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = useCallback(
    async (text: string, key: string = "default", options?: CopyOptions): Promise<boolean> => {
      const success = await copyToClipboard(text, options);
      if (success) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setCopiedKey(key);
        timeoutRef.current = setTimeout(() => {
          setCopiedKey(null);
        }, durationMs);
      }
      return success;
    },
    [durationMs]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    copiedKey,
    isCopied: (key: string = "default") => copiedKey === key,
    copy,
  };
}
