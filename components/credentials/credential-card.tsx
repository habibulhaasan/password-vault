"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/lib/constants/categories";
import { formatDaysSinceLastLogin } from "@/lib/utils/date";
import { useClipboardState, safeOpenUrl } from "@/lib/utils/clipboard";
import { announce } from "@/lib/a11y/announcer";
import { useCredentials } from "@/hooks/use-credentials";
import { useCategories } from "@/hooks/use-categories";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  Check,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Loader2,
  User,
  KeyRound,
} from "lucide-react";
import type { EncryptedCredential } from "@/types/credential";

interface CredentialCardProps {
  credential: EncryptedCredential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const { decryptCredential, deleteCredential, markAsLoggedIn } =
    useCredentials();
  const { getCategory } = useCategories();
  const { isCopied, copy } = useClipboardState(2000);
  const [isCopyingUser, setIsCopyingUser] = useState(false);
  const [isCopyingPass, setIsCopyingPass] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryObj = credential.categoryId
    ? getCategory(credential.categoryId)
    : undefined;

  const handleMarkAsLoggedIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await markAsLoggedIn(credential.id);
      announce(`Marked ${credential.title} as logged in`);
    } catch (err) {
      console.warn("Failed to mark as logged in:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCopyUsername = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCopyingUser || isCopied("user")) return;

    setIsCopyingUser(true);
    try {
      const decrypted = await decryptCredential(credential);
      await copy(decrypted.username, "user");
      announce(`Username for ${credential.title} copied to clipboard`);
    } catch (err) {
      console.warn("Failed to copy username:", err);
    } finally {
      setIsCopyingUser(false);
    }
  };

  const handleCopyPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCopyingPass || isCopied("pass")) return;

    setIsCopyingPass(true);
    try {
      const decrypted = await decryptCredential(credential);
      await copy(decrypted.password, "pass", { clearAfterMs: 30000 });
      announce(
        `Password for ${credential.title} copied to clipboard. Clipboard will be cleared in 30 seconds.`,
      );
    } catch (err) {
      console.warn("Failed to copy password:", err);
    } finally {
      setIsCopyingPass(false);
    }
  };

  const handleOpenWebsite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (credential.websiteUrl) {
      safeOpenUrl(credential.websiteUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this credential?")) {
      setIsDeleting(true);
      try {
        await deleteCredential(credential.id);
        announce(`Credential ${credential.title} deleted`);
      } catch (err) {
        console.warn("Failed to delete credential:", err);
        setIsDeleting(false);
      }
    }
  };

  // Extract friendly hostname for display
  let displayDomain: string | null = null;
  if (credential.websiteUrl) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(credential.websiteUrl)
          ? credential.websiteUrl
          : `https://${credential.websiteUrl}`,
      );
      displayDomain = url.hostname.replace(/^www\./, "");
    } catch {
      displayDomain = credential.websiteUrl;
    }
  }

  return (
    <Card className="group flex flex-col justify-between transition-all hover:border-foreground/20 hover:shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <CategoryIcon name={categoryObj?.icon} className="size-4" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/credentials/${credential.id}`}
                className="hover:underline focus-visible:underline outline-none"
              >
                <CardTitle className="truncate text-base font-semibold">
                  {credential.title}
                </CardTitle>
              </Link>
              {categoryObj && (
                <p className="text-xs text-muted-foreground truncate">
                  {categoryObj.label}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground opacity-60 group-hover:opacity-100"
                />
              }
            >
              <MoreVertical className="size-4" aria-hidden="true" />
              <span className="sr-only">Options for {credential.title}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/credentials/${credential.id}`} />}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/credentials/${credential.id}/edit`} />}
              >
                <Edit className="size-3.5" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyUsername}>
                <User className="size-3.5" aria-hidden="true" />
                {isCopied("user") ? "Username Copied!" : "Copy Username"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyPassword}>
                <KeyRound className="size-3.5" aria-hidden="true" />
                {isCopied("pass") ? "Password Copied!" : "Copy Password"}
              </DropdownMenuItem>
              {credential.websiteUrl && (
                <DropdownMenuItem onClick={handleOpenWebsite}>
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  Open Website
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleMarkAsLoggedIn}
                disabled={isLoggingIn}
              >
                <Clock className="size-3.5" aria-hidden="true" />
                {isLoggingIn ? "Updating..." : "Mark as Logged In"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3 text-xs text-muted-foreground">
        {/* Domain link */}
        {displayDomain && (
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="size-3.5 shrink-0" aria-hidden="true" />
            <button
              type="button"
              onClick={handleOpenWebsite}
              className="truncate hover:text-foreground hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
              aria-label={`Open ${displayDomain} in new tab`}
            >
              {displayDomain}
              <ExternalLink className="size-2.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Days since last login */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Last login: {formatDaysSinceLastLogin(credential.lastLoginAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleMarkAsLoggedIn}
            disabled={isLoggingIn}
            className="text-[10px] font-medium text-primary hover:underline shrink-0 cursor-pointer disabled:opacity-50"
            title={`Mark ${credential.title} as logged in right now`}
            aria-label={`Mark ${credential.title} as logged in right now`}
          >
            {isLoggingIn ? "Saving..." : "Mark Logged In"}
          </button>
        </div>

        {/* Tags */}
        {credential.tags && credential.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {credential.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/dashboard?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-block"
                aria-label={`Filter by tag #${tag}`}
              >
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
            {credential.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{credential.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-1.5 border-t bg-muted/20 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 sm:h-7 px-2.5 sm:px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground touch-manipulation"
            onClick={handleCopyUsername}
            disabled={isCopyingUser}
            title={`Copy username for ${credential.title}`}
            aria-label={`Copy username for ${credential.title}`}
          >
            {isCopyingUser ? (
              <Loader2
                className="size-3.5 sm:size-3 animate-spin"
                aria-hidden="true"
              />
            ) : isCopied("user") ? (
              <Check
                className="size-3.5 sm:size-3 text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <User className="size-3.5 sm:size-3" aria-hidden="true" />
            )}
            <span>{isCopied("user") ? "Copied!" : "Copy User"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 sm:h-7 px-2.5 sm:px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground touch-manipulation"
            onClick={handleCopyPassword}
            disabled={isCopyingPass}
            title={`Copy password for ${credential.title}`}
            aria-label={`Copy password for ${credential.title}`}
          >
            {isCopyingPass ? (
              <Loader2
                className="size-3.5 sm:size-3 animate-spin"
                aria-hidden="true"
              />
            ) : isCopied("pass") ? (
              <Check
                className="size-3.5 sm:size-3 text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <KeyRound className="size-3.5 sm:size-3" aria-hidden="true" />
            )}
            <span>{isCopied("pass") ? "Copied!" : "Copy Pass"}</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {credential.websiteUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 sm:size-7 text-muted-foreground hover:text-foreground touch-manipulation"
              onClick={handleOpenWebsite}
              title={`Open website for ${credential.title} in new tab`}
              aria-label={`Open website for ${credential.title} in new tab`}
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">
                Open website for {credential.title}
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href={`/credentials/${credential.id}`}
                aria-label={`View details for ${credential.title}`}
              />
            }
            className="h-8 sm:h-7 px-3 sm:px-2.5 text-xs touch-manipulation"
          >
            View
            <span className="sr-only">details for {credential.title}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
