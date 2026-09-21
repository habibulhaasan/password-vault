"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVault } from "@/hooks/use-vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";

const vaultSetupSchema = z
  .object({
    masterPassword: z
      .string()
      .min(8, "Master password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your master password"),
  })
  .refine((data) => data.masterPassword === data.confirmPassword, {
    message: "Master passwords do not match",
    path: ["confirmPassword"],
  });

type VaultSetupFormValues = z.infer<typeof vaultSetupSchema>;

export function VaultSetupForm() {
  const { setupVault } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VaultSetupFormValues>({
    resolver: zodResolver(vaultSetupSchema),
    defaultValues: {
      masterPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: VaultSetupFormValues) => {
    setError(null);
    try {
      await setupVault(values.masterPassword);
    } catch {
      setError("Failed to initialize vault encryption. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="text-center sm:text-left">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="text-xl">Create Master Password</CardTitle>
          <CardDescription>
            Set up the master encryption key that will protect all your saved credentials.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                <strong>Important:</strong> Your Master Password derives the local AES-256
                encryption key. It is never transmitted to our servers. If you lose this
                password, your encrypted vault cannot be recovered.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md bg-destructive/15 p-3 text-xs text-destructive dark:bg-destructive/20"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="masterPassword">Master Password</Label>
              <div className="relative">
                <Input
                  id="masterPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a strong master password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="pr-10"
                  {...register("masterPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.masterPassword && (
                <p className="text-xs text-destructive">
                  {errors.masterPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Master Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter master password"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deriving Encryption Key (PBKDF2)...
                </>
              ) : (
                "Initialize Vault"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

