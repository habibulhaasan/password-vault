"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { announce } from "@/lib/a11y/announcer";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps
  extends React.ComponentProps<typeof Input> {
  error?: string;
  allowCopy?: boolean;
  onGenerate?: () => void;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, error, disabled, allowCopy = false, onGenerate, id, ...props }, forwardedRef) => {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const innerRef = useRef<HTMLInputElement | null>(null);

    const errorId = id ? `${id}-error` : undefined;

    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    const handleCopy = async () => {
      const val = innerRef.current?.value || (props.value as string);
      if (!val) return;
      const success = await copyToClipboard(val, { clearAfterMs: 30000 });
      if (success) {
        setCopied(true);
        announce("Password copied to clipboard. Clipboard will be cleared in 30 seconds.");
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <Input
            ref={setRefs}
            id={id}
            type={visible ? "text" : "password"}
            disabled={disabled}
            className={cn(
              onGenerate && allowCopy
                ? "pr-24"
                : onGenerate || allowCopy
                ? "pr-16"
                : "pr-9",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error && errorId ? errorId : props["aria-describedby"]}
            autoComplete="new-password"
            {...props}
          />
          <div className="absolute right-1 flex items-center gap-0.5">
            {onGenerate && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                onClick={onGenerate}
                title="Generate secure password"
                aria-label="Generate secure password"
                className="size-7 text-muted-foreground hover:text-primary transition-colors touch-manipulation"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Generate secure password</span>
              </Button>
            )}
            {allowCopy && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                onClick={handleCopy}
                title={copied ? "Password Copied!" : "Copy password"}
                aria-label={copied ? "Password Copied" : "Copy password"}
                className="size-7 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {copied ? "Password Copied" : "Copy password"}
                </span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => setVisible((prev) => !prev)}
              title={visible ? "Hide password" : "Show password"}
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              className="size-7 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              {visible ? (
                <EyeOff className="size-3.5" aria-hidden="true" />
              ) : (
                <Eye className="size-3.5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {visible ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>
        {error && (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
