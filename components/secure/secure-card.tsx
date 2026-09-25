"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/lib/constants/categories";
import { formatDaysSinceLastLogin } from "@/lib/utils/date";
import { copyToClipboard, useClipboardState, safeOpenUrl } from "@/lib/utils/clipboard";
import { Shield } from "lucide-react";
import { announce } from "@/lib/a11y/announcer";
import { useSecure } from "@/hooks/use-secure";
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
import type { EncryptedSecure } from "@/types/secure";

interface SecureCardProps {
  secureItem: EncryptedSecure;
}

export function SecureCard({ secureItem }: SecureCardProps) {
  const { decryptSecure, deleteSecure } =
    useSecure();
  const { getCategory } = useCategories();
  const { isCopied, copy } = useClipboardState(2000);
  const [isCopyingUser, setIsCopyingUser] = useState(false);
  const [isCopyingPass, setIsCopyingPass] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryObj = secureItem.categoryId
    ? getCategory(secureItem.categoryId)
    : undefined;

  const handleMarkAsLoggedIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await deleteSecure(secureItem.id);
      announce(`Marked ${secureItem.title} as logged in`);
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
      const decrypted = await decryptSecure(secureItem);
      await copy(decrypted.title, "user");
      announce(`Username for ${secureItem.title} copied to clipboard`);
    } catch (err) {
      console.warn("Failed to copy title:", err);
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
      const decrypted = await decryptSecure(secureItem);
      await copy(decrypted.title, "pass", { clearAfterMs: 30000 });
      announce(
        `Password for ${secureItem.title} copied to clipboard. Clipboard will be cleared in 30 seconds.`,
      );
    } catch (err) {
      console.warn("Failed to copy title:", err);
    } finally {
      setIsCopyingPass(false);
    }
  };

  const handleOpenWebsite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (secureItem.title) {
      safeOpenUrl(secureItem.title);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this secureItem?")) {
      setIsDeleting(true);
      try {
        await deleteSecure(secureItem.id);
        announce(`Identity ${secureItem.title} deleted`);
      } catch (err) {
        console.warn("Failed to delete secureItem:", err);
        setIsDeleting(false);
      }
    }
  };

  // Extract friendly hostname for display
  let displayDomain: string | null = null;
  if (secureItem.title) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(secureItem.title)
          ? secureItem.title
          : `https://${secureItem.title}`,
      );
      displayDomain = url.hostname.replace(/^www\./, "");
    } catch {
      displayDomain = secureItem.title;
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
                href={`/secure/${secureItem.id}`}
                className="hover:underline focus-visible:underline outline-none"
              >
                <CardTitle className="truncate text-base font-semibold">
                  {secureItem.title}
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
              <span className="sr-only">Options for {secureItem.title}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/secure/${secureItem.id}`} />}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/secure/${secureItem.id}/edit`} />}
              >
                <Edit className="size-3.5" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleCopyUsername}>
                <User className="size-3.5" aria-hidden="true" />
                {isCopied("user") ? "Username Copied!" : "Copy Username"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyPassword}>
                <KeyRound className="size-3.5" aria-hidden="true" />
                {isCopied("pass") ? "Password Copied!" : "Copy Password"}
              </DropdownMenuItem>
              {secureItem.title && (
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
          <div className="flex items-center gap-2 truncate bg-muted/30 px-2 py-1.5 rounded-md border border-border/50 hover:bg-muted/50 transition-colors">
            <Shield  size={16} className="bg-transparent" />
            <button
              type="button"
              onClick={handleOpenWebsite}
              className="truncate font-medium text-foreground hover:underline inline-flex items-center gap-1.5 text-left cursor-pointer flex-1"
              aria-label={`Open ${displayDomain} in new tab`}
            >
              {displayDomain}
              <ExternalLink
                className="size-3 text-muted-foreground opacity-50"
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* Days since last login */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Last login: {formatDaysSinceLastLogin(secureItem.createdAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleMarkAsLoggedIn}
            disabled={isLoggingIn}
            className="text-[10px] font-medium text-primary hover:underline shrink-0 cursor-pointer disabled:opacity-50"
            title={`Mark ${secureItem.title} as logged in right now`}
            aria-label={`Mark ${secureItem.title} as logged in right now`}
          >
            {isLoggingIn ? "Saving..." : "Mark Logged In"}
          </button>
        </div>

        {/* Tags */}
        {secureItem.tags && secureItem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {secureItem.tags.slice(0, 3).map((tag) => (
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
            {secureItem.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{secureItem.tags.length - 3} more
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
            title={`Copy title for ${secureItem.title}`}
            aria-label={`Copy title for ${secureItem.title}`}
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
            title={`Copy title for ${secureItem.title}`}
            aria-label={`Copy title for ${secureItem.title}`}
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
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href={`/secure/${secureItem.id}`}
                aria-label={`View details for ${secureItem.title}`}
              />
            }
            className="h-8 sm:h-7 px-3 sm:px-2.5 text-xs touch-manipulation"
          >
            View
            <span className="sr-only">details for {secureItem.title}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
