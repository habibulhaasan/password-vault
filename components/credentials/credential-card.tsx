"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/lib/constants/categories";
import { formatDaysSinceLastLogin } from "@/lib/utils/date";
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
  Copy,
  Check,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Loader2,
} from "lucide-react";
import type { EncryptedCredential } from "@/types/credential";

interface CredentialCardProps {
  credential: EncryptedCredential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const { decryptCredential, deleteCredential } = useCredentials();
  const { getCategory } = useCategories();
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryObj = credential.categoryId
    ? getCategory(credential.categoryId)
    : undefined;

  const handleCopyPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCopying || copied) return;

    setIsCopying(true);
    try {
      const decrypted = await decryptCredential(credential);
      await navigator.clipboard.writeText(decrypted.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy password:", err);
    } finally {
      setIsCopying(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this credential?")) {
      setIsDeleting(true);
      try {
        await deleteCredential(credential.id);
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
          : `https://${credential.websiteUrl}`
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
              <MoreVertical className="size-4" />
              <span className="sr-only">Credential options</span>
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
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5" />
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
            <Globe className="size-3.5 shrink-0" />
            <a
              href={
                /^https?:\/\//i.test(credential.websiteUrl || "")
                  ? credential.websiteUrl
                  : `https://${credential.websiteUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-foreground hover:underline inline-flex items-center gap-1"
            >
              {displayDomain}
              <ExternalLink className="size-2.5" />
            </a>
          </div>
        )}

        {/* Days since last login */}
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          <span>Last login: {formatDaysSinceLastLogin(credential.lastLoginAt)}</span>
        </div>

        {/* Tags */}
        {credential.tags && credential.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {credential.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {tag}
              </Badge>
            ))}
            {credential.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{credential.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleCopyPassword}
          disabled={isCopying}
        >
          {isCopying ? (
            <Loader2 className="size-3 animate-spin" />
          ) : copied ? (
            <Check className="size-3 text-emerald-500" />
          ) : (
            <Copy className="size-3" />
          )}
          {copied ? "Copied!" : "Copy Password"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/credentials/${credential.id}`} />}
          className="h-7 px-2.5 text-xs"
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
