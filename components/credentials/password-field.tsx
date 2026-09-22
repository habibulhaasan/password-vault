"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps
  extends React.ComponentProps<typeof Input> {
  error?: string;
  allowCopy?: boolean;
  onGenerate?: () => void;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, error, disabled, allowCopy = false, onGenerate, ...props }, forwardedRef) => {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const innerRef = useRef<HTMLInputElement | null>(null);

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
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <Input
            ref={setRefs}
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
                tabIndex={-1}
              >
                <Sparkles className="size-3.5 text-muted-foreground hover:text-primary transition-colors" />
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
                tabIndex={-1}
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
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
              tabIndex={-1}
            >
              {visible ? (
                <EyeOff className="size-3.5 text-muted-foreground" />
              ) : (
                <Eye className="size-3.5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {visible ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
