"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCredentials } from "@/hooks/use-credentials";
import { useCategories } from "@/hooks/use-categories";
import { CategoryIcon } from "@/lib/constants/categories";
import { useClipboardState, safeOpenUrl } from "@/lib/utils/clipboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
  Globe,
  Tag,
  Calendar,
  Clock,
} from "lucide-react";
import { formatDaysSinceLastLogin } from "@/lib/utils/date";
import { announce } from "@/lib/a11y/announcer";
import type { DecryptedCredential } from "@/types/credential";

export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getCredential, decryptCredential, deleteCredential, markAsLoggedIn } = useCredentials();
  const { getCategory } = useCategories();
  const { isCopied, copy } = useClipboardState(2000);

  const [credential, setCredential] = useState<DecryptedCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const encrypted = await getCredential(id);
        if (!isMounted) return;
        if (!encrypted) {
          setError("Credential not found");
          setLoading(false);
          return;
        }

        const decrypted = await decryptCredential(encrypted);
        if (!isMounted) return;
        setCredential(decrypted);
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Failed to decrypt credential. Verify vault is unlocked.");
        setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, getCredential, decryptCredential]);

  const handleCopyUsername = () => {
    if (credential) {
      copy(credential.username, "username");
      announce(`Username for ${credential.title} copied to clipboard`);
    }
  };

  const handleCopyPassword = () => {
    if (credential) {
      copy(credential.password, "password", { clearAfterMs: 30000 });
      announce(`Password for ${credential.title} copied to clipboard. Clipboard will be cleared in 30 seconds.`);
    }
  };

  const handleCopyWebsite = () => {
    if (credential?.websiteUrl) {
      copy(credential.websiteUrl, "website");
      announce(`Website URL for ${credential.title} copied to clipboard`);
    }
  };

  const handleCopyNotes = () => {
    if (credential?.notes) {
      copy(credential.notes, "notes");
      announce(`Notes for ${credential.title} copied to clipboard`);
    }
  };

  const handleOpenWebsite = () => {
    if (credential?.websiteUrl) {
      safeOpenUrl(credential.websiteUrl);
    }
  };

  const handleMarkAsLoggedIn = async () => {
    if (!credential || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await markAsLoggedIn(id);
      setCredential((prev) =>
        prev ? { ...prev, lastLoginAt: new Date(), updatedAt: new Date() } : null
      );
      announce(`Marked ${credential.title} as logged in`);
    } catch (err) {
      console.warn("Failed to mark as logged in:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCredential(id);
      announce(`Credential ${credential?.title || ""} deleted`);
      router.push("/dashboard");
    } catch (err) {
      console.warn("Failed to delete credential:", err);
      setIsDeleting(false);
      setError("Failed to delete credential.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Decrypting credential...</p>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="container max-w-2xl py-8 px-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">
          <p>{error || "Credential not found"}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-1.5 size-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const categoryObj = credential.categoryId
    ? getCategory(credential.categoryId)
    : undefined;

  return (
    <div className="container max-w-2xl py-6 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/credentials/${id}/edit`} aria-label={`Edit ${credential.title}`} />}
            className="gap-1.5"
          >
            <Edit className="size-3.5" aria-hidden="true" />
            Edit
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-label={`Delete ${credential.title}`}
            className="gap-1.5"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-3.5" aria-hidden="true" />
            )}
            {confirmDelete ? "Confirm Delete?" : "Delete"}
          </Button>
        </div>
      </div>

      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{credential.title}</CardTitle>
              {categoryObj && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CategoryIcon name={categoryObj.icon} className="size-3.5" />
                  <span>{categoryObj.label}</span>
                </div>
              )}
            </div>

            {credential.websiteUrl && (
              <button
                type="button"
                onClick={handleOpenWebsite}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent cursor-pointer"
                aria-label={`Visit ${credential.websiteUrl} in new tab`}
              >
                <Globe className="size-3.5" aria-hidden="true" />
                Visit Site
                <ExternalLink className="size-3" aria-hidden="true" />
              </button>
            )}
          </div>

          {credential.tags && credential.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {credential.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/dashboard?tag=${encodeURIComponent(tag)}`}
                  aria-label={`Filter by tag #${tag}`}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Tag className="mr-1 size-2.5" aria-hidden="true" />
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 divide-y divide-border">
          {/* Username */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Username / Email</p>
              <p className="text-sm font-mono select-all text-foreground break-all">
                {credential.username}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyUsername}
              title={`Copy username for ${credential.title}`}
              aria-label={`Copy username for ${credential.title}`}
              className="gap-1.5 h-9 sm:h-8 w-full sm:w-auto touch-manipulation"
            >
              {isCopied("username") ? (
                <>
                  <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" aria-hidden="true" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Password */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Password</p>
              <p className="text-sm font-mono select-all text-foreground break-all">
                {showPassword ? credential.password : "••••••••••••••••"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 sm:h-8 px-2.5 touch-manipulation"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Reveal password"}
                aria-label={showPassword ? "Hide password" : "Reveal password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Reveal password"}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPassword}
                title={`Copy password for ${credential.title}`}
                aria-label={`Copy password for ${credential.title}`}
                className="gap-1.5 h-9 sm:h-8 flex-1 sm:flex-initial touch-manipulation"
              >
                {isCopied("password") ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" aria-hidden="true" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Website URL */}
          {credential.websiteUrl && (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Website URL</p>
                <button
                  type="button"
                  onClick={handleOpenWebsite}
                  className="text-sm font-mono truncate text-primary hover:underline flex items-center gap-1 text-left max-w-full cursor-pointer"
                  aria-label={`Open ${credential.websiteUrl} in new tab`}
                >
                  <span className="truncate">{credential.websiteUrl}</span>
                  <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenWebsite}
                  title={`Open website for ${credential.title} in new tab`}
                  aria-label={`Open website for ${credential.title} in new tab`}
                  className="gap-1.5 h-9 sm:h-8 flex-1 sm:flex-initial touch-manipulation"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  Visit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWebsite}
                  title={`Copy website URL for ${credential.title}`}
                  aria-label={`Copy website URL for ${credential.title}`}
                  className="gap-1.5 h-9 sm:h-8 flex-1 sm:flex-initial touch-manipulation"
                >
                  {isCopied("website") ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          {credential.notes && (
            <div className="pt-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyNotes}
                  className="h-7 sm:h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground touch-manipulation"
                >
                  {isCopied("notes") ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy Notes
                    </>
                  )}
                </Button>
              </div>
              <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap font-sans text-foreground break-words">
                {credential.notes}
              </div>
            </div>
          )}

          {/* Last Login Section */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Last Login</p>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>{formatDaysSinceLastLogin(credential.lastLoginAt)}</span>
                {credential.lastLoginAt && (
                  <span className="text-xs text-muted-foreground">
                    ({credential.lastLoginAt.toLocaleDateString()})
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsLoggedIn}
              disabled={isLoggingIn}
              className="gap-1.5 h-9 sm:h-8 w-full sm:w-auto touch-manipulation"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Clock className="size-3.5" />
                  Mark as Logged In
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t text-[11px] text-muted-foreground pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            Created: {credential.createdAt.toLocaleDateString()}
          </span>
          <span>Updated: {credential.updatedAt.toLocaleDateString()}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
