"use client";

import { useState, useCallback } from "react";
import {
  generatePassword,
  getPasswordStrength,
  DEFAULT_GENERATOR_OPTIONS,
} from "@/lib/utils/password-generator";
import { useClipboardState } from "@/lib/utils/clipboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { announce } from "@/lib/a11y/announcer";
import { cn } from "@/lib/utils";

export interface PasswordGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Optional callback when used as a field picker.
   * If provided, displays "Use Password" button which delivers the generated password.
   */
  onSelectPassword?: (password: string) => void;
  defaultLength?: number;
}

export function PasswordGeneratorDialog({
  open,
  onOpenChange,
  onSelectPassword,
  defaultLength = DEFAULT_GENERATOR_OPTIONS.length,
}: PasswordGeneratorDialogProps) {
  const { isCopied, copy } = useClipboardState(2000);

  const [length, setLength] = useState(defaultLength);
  const [uppercase, setUppercase] = useState(
    DEFAULT_GENERATOR_OPTIONS.uppercase,
  );
  const [lowercase, setLowercase] = useState(
    DEFAULT_GENERATOR_OPTIONS.lowercase,
  );
  const [numbers, setNumbers] = useState(DEFAULT_GENERATOR_OPTIONS.numbers);
  const [symbols, setSymbols] = useState(DEFAULT_GENERATOR_OPTIONS.symbols);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);

  const [password, setPassword] = useState(() =>
    generatePassword({
      length: defaultLength,
      uppercase: DEFAULT_GENERATOR_OPTIONS.uppercase,
      lowercase: DEFAULT_GENERATOR_OPTIONS.lowercase,
      numbers: DEFAULT_GENERATOR_OPTIONS.numbers,
      symbols: DEFAULT_GENERATOR_OPTIONS.symbols,
      avoidAmbiguous: false,
    }),
  );
  const [showPassword, setShowPassword] = useState(true);

  // Render-phase state adjustment when dialog transitions from closed to open
  if (open && !prevOpen) {
    setPrevOpen(true);
    setPassword(
      generatePassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        avoidAmbiguous,
      }),
    );
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  // Generate password with current parameters
  const handleGenerate = useCallback(() => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 300);

    const generated = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      avoidAmbiguous,
    });
    setPassword(generated);
  }, [length, uppercase, lowercase, numbers, symbols, avoidAmbiguous]);

  // Strength evaluation
  const strength = getPasswordStrength(password);

  // Ensure at least one character set remains active
  const activeCount =
    (uppercase ? 1 : 0) +
    (lowercase ? 1 : 0) +
    (numbers ? 1 : 0) +
    (symbols ? 1 : 0);

  const handleCopy = async () => {
    if (!password) return;
    await copy(password, "generator-modal", { clearAfterMs: 30000 });
    announce(
      "Generated password copied to clipboard. Clipboard will be cleared in 30 seconds.",
    );
  };

  const handleUsePassword = () => {
    if (onSelectPassword && password) {
      onSelectPassword(password);
      onOpenChange(false);
    }
  };

  const handleLengthChange = (val: number) => {
    const clamped = Math.max(8, Math.min(64, isNaN(val) ? 8 : val));
    setLength(clamped);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Password Generator</DialogTitle>
              <DialogDescription className="text-xs">
                Generate cryptographically secure, random passwords.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Password Output Box */}
          <div className="relative rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate font-mono text-base font-medium select-all text-foreground tracking-wide",
                    !showPassword && "tracking-widest",
                  )}
                >
                  {showPassword
                    ? password
                    : "•".repeat(Math.min(password.length, 28))}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((p) => !p)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="size-8 touch-manipulation"
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="size-3.5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Toggle visibility</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleGenerate}
                  title="Generate new password"
                  className="size-8 touch-manipulation"
                >
                  <RotateCcw
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-300",
                      isRotating && "rotate-180 text-foreground",
                    )}
                  />
                  <span className="sr-only">Regenerate</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 gap-1.5 px-2.5 text-xs touch-manipulation"
                >
                  {isCopied("generator-modal") ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Strength Meter Bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Strength:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      strength.score <= 1 && "text-destructive",
                      strength.score === 2 && "text-amber-500",
                      strength.score === 3 && "text-primary",
                      strength.score === 4 && "text-emerald-500",
                    )}
                  >
                    {strength.label}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 font-mono font-normal"
                >
                  ~{strength.entropyBits} bits entropy
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => {
                  const isActive = strength.score >= step;
                  let colorClass = "bg-muted";
                  if (isActive) {
                    if (strength.score <= 1) colorClass = "bg-destructive";
                    else if (strength.score === 2) colorClass = "bg-amber-500";
                    else if (strength.score === 3) colorClass = "bg-primary";
                    else colorClass = "bg-emerald-500";
                  }
                  return (
                    <div
                      key={step}
                      className={cn(
                        "rounded-full transition-colors duration-300",
                        colorClass,
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Controls: Length Slider & Numeric Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label
                htmlFor="length-slider"
                className="font-medium text-foreground"
              >
                Password Length
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="length-number"
                  type="number"
                  min={8}
                  max={64}
                  value={length}
                  aria-label="Password length in characters"
                  onChange={(e) =>
                    handleLengthChange(parseInt(e.target.value, 10))
                  }
                  className="h-7 w-16 text-center font-mono text-xs"
                />
                <span className="text-muted-foreground text-xs">chars</span>
              </div>
            </div>
            <input
              id="length-slider"
              type="range"
              min={8}
              max={64}
              value={length}
              aria-label="Password length slider"
              aria-valuemin={8}
              aria-valuemax={64}
              aria-valuenow={length}
              onChange={(e) => handleLengthChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary touch-manipulation"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>8</span>
              <span>16</span>
              <span>24</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          {/* Controls: Character Sets Checkboxes */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-foreground">
              Character Types
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                htmlFor="opt-uppercase"
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border p-2.5 min-h-[42px] transition-colors cursor-pointer select-none touch-manipulation",
                  uppercase
                    ? "bg-accent/40 border-primary/30"
                    : "bg-card border-border/70 hover:bg-muted/30",
                )}
              >
                <input
                  type="checkbox"
                  id="opt-uppercase"
                  checked={uppercase}
                  disabled={uppercase && activeCount === 1}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="font-medium text-xs">Uppercase (A-Z)</span>
              </label>

              <label
                htmlFor="opt-lowercase"
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border p-2.5 min-h-[42px] transition-colors cursor-pointer select-none touch-manipulation",
                  lowercase
                    ? "bg-accent/40 border-primary/30"
                    : "bg-card border-border/70 hover:bg-muted/30",
                )}
              >
                <input
                  type="checkbox"
                  id="opt-lowercase"
                  checked={lowercase}
                  disabled={lowercase && activeCount === 1}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="font-medium text-xs">Lowercase (a-z)</span>
              </label>

              <label
                htmlFor="opt-numbers"
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border p-2.5 min-h-[42px] transition-colors cursor-pointer select-none touch-manipulation",
                  numbers
                    ? "bg-accent/40 border-primary/30"
                    : "bg-card border-border/70 hover:bg-muted/30",
                )}
              >
                <input
                  type="checkbox"
                  id="opt-numbers"
                  checked={numbers}
                  disabled={numbers && activeCount === 1}
                  onChange={(e) => setNumbers(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="font-medium text-xs">Numbers (0-9)</span>
              </label>

              <label
                htmlFor="opt-symbols"
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border p-2.5 min-h-[42px] transition-colors cursor-pointer select-none touch-manipulation",
                  symbols
                    ? "bg-accent/40 border-primary/30"
                    : "bg-card border-border/70 hover:bg-muted/30",
                )}
              >
                <input
                  type="checkbox"
                  id="opt-symbols"
                  checked={symbols}
                  disabled={symbols && activeCount === 1}
                  onChange={(e) => setSymbols(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="font-medium text-xs">Symbols (!@#$)</span>
              </label>
            </div>

            {/* Avoid Ambiguous Characters Option */}
            <label
              htmlFor="opt-ambiguous"
              className={cn(
                "flex items-center justify-between rounded-lg border p-2.5 min-h-[42px] transition-colors cursor-pointer select-none text-xs touch-manipulation",
                avoidAmbiguous
                  ? "bg-accent/40 border-primary/30"
                  : "bg-card border-border/70 hover:bg-muted/30",
              )}
            >
              <div className="space-y-0.5">
                <span className="font-medium">Avoid Ambiguous Characters</span>
                <p className="text-[10px] text-muted-foreground">
                  Excludes easily confused characters like i, l, 1, L, o, 0, O
                </p>
              </div>
              <input
                type="checkbox"
                id="opt-ambiguous"
                checked={avoidAmbiguous}
                onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                className="size-4 rounded border-input text-primary focus:ring-ring ml-2"
              />
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-6">
          {onSelectPassword ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto h-9 touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUsePassword}
                className="w-full sm:w-auto h-9 gap-1.5 touch-manipulation"
              >
                <KeyRound className="size-3.5" />
                Use Password
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto h-9 touch-manipulation"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  await handleCopy();
                  setTimeout(() => onOpenChange(false), 500);
                }}
                className="w-full sm:w-auto h-9 gap-1.5 touch-manipulation"
              >
                <Copy className="size-3.5" />
                Copy & Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
