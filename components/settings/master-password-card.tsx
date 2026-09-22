"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, ShieldAlert, RefreshCw } from "lucide-react";
import { ChangeMasterPasswordDialog } from "./change-master-password-dialog";

export function MasterPasswordCard() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Master Password
                </CardTitle>
                <CardDescription className="text-xs">
                  Your master encryption key used to derive all vault cryptographic operations
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px]"
            >
              Configured
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/70 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">
                Vault Master Encryption Key
              </p>
              <p className="text-xs text-muted-foreground">
                Protects all passwords, usernames, and notes with AES-GCM 256-bit encryption.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="w-full sm:w-auto h-8 text-xs shrink-0"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Change Master Password
            </Button>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              If you forget your master password, your stored vault credentials cannot be decrypted. We recommend saving it in a secure offline physical location.
            </span>
          </div>
        </CardContent>
      </Card>

      <ChangeMasterPasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

