"use client";

import Link from "next/link";
import { formatDaysSinceLastLogin } from "@/lib/utils/date";
import { copyToClipboard, useClipboardState, safeOpenUrl } from "@/lib/utils/clipboard";
import { announce } from "@/lib/a11y/announcer";
import { CredentialIcon } from "@/components/credentials/credential-icon";
import { useCredentials } from "@/hooks/use-credentials";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  User,
  KeyRound,
  Check,
  Loader2,
} from "lucide-react";
import type { EncryptedCredential } from "@/types/credential";
import { useState } from "react";

interface CredentialTableProps {
  credentials: EncryptedCredential[];
}

export function CredentialTable({ credentials }: CredentialTableProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/80">
            <tr>
              <th className="h-10 px-4 font-medium align-middle">Name</th>
              <th className="h-10 px-4 font-medium align-middle hidden sm:table-cell">Website</th>
              <th className="h-10 px-4 font-medium align-middle hidden md:table-cell">Tags</th>
              <th className="h-10 px-4 font-medium align-middle">Last Login</th>
              <th className="h-10 px-4 font-medium align-middle text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {credentials.map((credential) => (
              <TableRow key={credential.id} credential={credential} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableRow({ credential }: { credential: EncryptedCredential }) {
  const { decryptCredential, deleteCredential, markAsLoggedIn } = useCredentials();
  const { getCategory } = useCategories();
  const { isCopied, copy } = useClipboardState(2000);
  
  const [isCopyingUser, setIsCopyingUser] = useState(false);
  const [isCopyingPass, setIsCopyingPass] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryObj = credential.categoryId ? getCategory(credential.categoryId) : undefined;

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

  const handleMarkAsLoggedIn = async () => {
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

  const handleCopyUsername = async () => {
    if (isCopyingUser || isCopied("user")) return;
    setIsCopyingUser(true);
    try {
      const decrypted = await decryptCredential(credential);
      await copy(decrypted.username, "user");
      announce(`Username for ${credential.title} copied`);
    } catch (err) {
      console.warn("Failed to copy username:", err);
    } finally {
      setIsCopyingUser(false);
    }
  };

  const handleCopyPassword = async () => {
    if (isCopyingPass || isCopied("pass")) return;
    setIsCopyingPass(true);
    try {
      const decrypted = await decryptCredential(credential);
      await copy(decrypted.password, "pass", { clearAfterMs: 30000 });
      announce(`Password for ${credential.title} copied`);
    } catch (err) {
      console.warn("Failed to copy password:", err);
    } finally {
      setIsCopyingPass(false);
    }
  };

  const handleOpenWebsite = () => {
    if (credential.websiteUrl) safeOpenUrl(credential.websiteUrl);
  };

  const handleDelete = async () => {
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

  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3 min-w-0">
          <CredentialIcon 
            credential={credential} 
            size={20} 
            className="size-8 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors" 
          />
          <div className="min-w-0 flex flex-col">
            <Link
              href={`/credentials/${credential.id}`}
              className="font-medium hover:underline focus-visible:underline outline-none truncate"
            >
              {credential.title}
            </Link>
            {categoryObj && (
              <span className="text-xs text-muted-foreground truncate">{categoryObj.label}</span>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 align-middle hidden sm:table-cell">
        {displayDomain ? (
          <div className="flex items-center gap-2 truncate">
            <CredentialIcon credential={credential} size={16} className="bg-transparent" />
            <button
              type="button"
              onClick={handleOpenWebsite}
              className="truncate text-sm text-foreground hover:underline inline-flex items-center gap-1.5 cursor-pointer max-w-[180px] lg:max-w-[250px]"
              title={credential.websiteUrl}
            >
              {displayDomain}
              <ExternalLink className="size-3 text-muted-foreground opacity-50" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3 align-middle hidden md:table-cell">
        {credential.tags && credential.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {credential.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                #{tag}
              </Badge>
            ))}
            {credential.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground">+{credential.tags.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3 align-middle text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 shrink-0" aria-hidden="true" />
          <span>{formatDaysSinceLastLogin(credential.lastLoginAt)}</span>
        </div>
      </td>

      <td className="px-4 py-3 align-middle text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCopyUsername}
            disabled={isCopyingUser}
            title="Copy Username"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            {isCopyingUser ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isCopied("user") ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <User className="size-3.5" />
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCopyPassword}
            disabled={isCopyingPass}
            title="Copy Password"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            {isCopyingPass ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isCopied("pass") ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <KeyRound className="size-3.5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground" />}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/credentials/${credential.id}`} />}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/credentials/${credential.id}/edit`} />}>
                <Edit className="size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleMarkAsLoggedIn} disabled={isLoggingIn}>
                <Clock className="size-3.5" /> Mark Logged In
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}

