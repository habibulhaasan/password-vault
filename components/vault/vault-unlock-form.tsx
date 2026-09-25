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
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const unlockSchema = z.object({
  masterPassword: z.string().min(1, "Master password is required"),
});

type UnlockFormValues = z.infer<typeof unlockSchema>;

export function VaultUnlockForm() {
  const { unlockVault } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnlockFormValues>({
    resolver: zodResolver(unlockSchema),
    defaultValues: {
      masterPassword: "",
    },
  });

  const onSubmit = async (values: UnlockFormValues) => {
    setError(null);
    const success = await unlockVault(values.masterPassword);
    if (!success) {
      setError("Incorrect master password. Please try again.");
      reset({ masterPassword: "" });
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="text-center sm:text-left">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
            <Lock className="size-5" />
          </div>
          <CardTitle className="text-xl">Vault Locked</CardTitle>
          <CardDescription>
            Enter your Master Password to decrypt and access your credentials.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                  placeholder="••••••••••••"
                  autoComplete="current-password"
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
          </CardContent>

          <CardFooter className="mt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying Master Password...
                </>
              ) : (
                "Unlock Vault"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
