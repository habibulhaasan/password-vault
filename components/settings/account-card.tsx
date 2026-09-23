"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVault } from "@/hooks/use-vault";
import { sendPasswordResetEmail, auth } from "@/lib/firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Mail,
  Fingerprint,
  Calendar,
  LogOut,
  Send,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";

export function AccountCard() {
  const { user, firebaseUser, signOut } = useAuth();
  const { lockVault } = useVault();

  const [copiedUid, setCopiedUid] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    const ok = await copyToClipboard(user.uid);
    if (ok) {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email || isSendingReset) return;

    setIsSendingReset(true);
    setResetError(null);
    setResetSent(false);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 6000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to send password reset email. Please try again later.";
      setResetError(msg);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    lockVault();
    await signOut();
  };

  const createdDate = firebaseUser?.metadata.creationTime
    ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      )
    : "Unknown";

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Account & Authentication
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your Firebase account identity and authentication
              credentials
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email */}
          <div className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.email || "No email available"}
              </p>
            </div>
          </div>

          {/* Account Created */}
          <div className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Account Created
              </p>
              <p className="text-xs font-semibold text-foreground">
                {createdDate}
              </p>
            </div>
          </div>

          {/* UID */}
          <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-border/70 p-3">
            <div className="flex items-center gap-3 min-w-0">
              <Fingerprint className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  User ID (UID)
                </p>
                <p className="font-mono text-xs text-foreground truncate max-w-xs sm:max-w-md">
                  {user?.uid || "Not loaded"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyUid}
              className="h-8 px-2 text-xs"
            >
              {copiedUid ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Feedback notices */}
        {resetSent && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Password reset link sent to <strong>{user?.email}</strong>. Check
              your inbox.
            </span>
          </div>
        )}

        {resetError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{resetError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSendingReset}
            onClick={handleSendResetEmail}
            className="w-full sm:w-auto h-8 text-xs"
          >
            {isSendingReset ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Reset Account Login Password
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="w-full sm:w-auto h-8 text-xs"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
