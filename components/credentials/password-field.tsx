"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends React.ComponentProps<typeof Input> {
  error?: string;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <Input
            ref={ref}
            type={visible ? "text" : "password"}
            disabled={disabled}
            className={cn("pr-20", className)}
            aria-invalid={!!error}
            autoComplete="new-password"
            {...props}
          />
          <div className="absolute right-1 flex items-center gap-0.5">
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
