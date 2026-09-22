"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changeMasterPasswordSchema,
  type ChangeMasterPasswordFormData,
} from "@/lib/validations/settings";
import { useVault } from "@/hooks/use-vault";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/credentials/password-field";
import { PasswordGeneratorDialog } from "@/components/password-generator/password-generator-dialog";
import { getPasswordStrength } from "@/lib/utils/password-generator";
import {
  KeyRound,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getStrengthTextColor = (score: number) => {
  switch (score) {
    case 1:
      return "text-red-500";
    case 2:
      return "text-amber-500";
    case 3:
      return "text-blue-500";
    case 4:
      return "text-emerald-500";
    default:
      return "text-muted-foreground";
  }
};

interface ChangeMasterPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeMasterPasswordDialog({
  open,
  onOpenChange,
}: ChangeMasterPasswordDialogProps) {
  const { changeMasterPassword } = useVault();
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ChangeMasterPasswordFormData>({
    resolver: zodResolver(changeMasterPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = useWatch({
    control,
    name: "newPassword",
  });
  const strength = newPasswordValue ? getPasswordStrength(newPasswordValue) : null;

  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting) return;
    if (!newOpen) {
      reset();
      setErrorMessage(null);
      setSuccess(false);
    }
    onOpenChange(newOpen);
  };

  const handlePasswordSelected = (generated: string) => {
    setValue("newPassword", generated);
    setValue("confirmNewPassword", generated);
    trigger(["newPassword", "confirmNewPassword"]);
  };

  const onSubmit = async (data: ChangeMasterPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await changeMasterPassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      setTimeout(() => {
        handleOpenChange(false);
      }, 1800);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to change master password. Please check your current password.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Change Master Password
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Re-encrypt your entire vault with a newly derived 256-bit AES-GCM key
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {success ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Master Password Changed
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  All vault credentials were successfully re-encrypted with your new cryptographic key.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Zero-Knowledge Security Warning
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400/90">
                  Your master password is never stored or sent to any server. If you lose this password, nobody—not even support—can recover your vault data.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Current Master Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-medium">
                  Current Master Password <span className="text-destructive">*</span>
                </Label>
                <PasswordField
                  id="currentPassword"
                  placeholder="Enter current master password"
                  disabled={isSubmitting}
                  error={errors.currentPassword?.message}
                  {...register("currentPassword")}
                />
              </div>

              {/* New Master Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newPassword" className="text-xs font-medium">
                    New Master Password <span className="text-destructive">*</span>
                  </Label>
                  {strength && (
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        getStrengthTextColor(strength.score)
                      )}
                    >
                      {strength.label} ({strength.score}/4)
                    </span>
                  )}
                </div>
                <PasswordField
                  id="newPassword"
                  placeholder="At least 8 characters"
                  disabled={isSubmitting}
                  allowCopy={false}
                  onGenerate={() => setGeneratorOpen(true)}
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />
                {/* Strength Meter Bar */}
                {newPasswordValue && (
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted/60">
                    {[1, 2, 3, 4].map((step) => {
                      const isActive = strength ? strength.score >= step : false;
                      return (
                        <div
                          key={step}
                          className={cn(
                            "h-full flex-1 transition-all duration-300",
                            isActive
                              ? strength?.color
                              : "bg-transparent"
                          )}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm New Master Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmNewPassword" className="text-xs font-medium">
                  Confirm New Master Password <span className="text-destructive">*</span>
                </Label>
                <PasswordField
                  id="confirmNewPassword"
                  placeholder="Re-enter new master password"
                  disabled={isSubmitting}
                  error={errors.confirmNewPassword?.message}
                  {...register("confirmNewPassword")}
                />
              </div>

              <DialogFooter className="pt-2 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Re-encrypting Vault...
                    </>
                  ) : (
                    "Save & Re-encrypt Vault"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Generator Modal */}
      <PasswordGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        onSelectPassword={handlePasswordSelected}
      />
    </>
  );
}
