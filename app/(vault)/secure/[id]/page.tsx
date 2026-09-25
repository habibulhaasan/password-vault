
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, MoreVertical, Edit, Trash, Copy, Check, Eye, EyeOff, Loader2, Calendar } from "lucide-react";
import { useSecure } from "@/hooks/use-secure";
import { announce } from "@/lib/a11y/announcer";
import { useClipboardState } from "@/lib/utils/clipboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { DecryptedSecure } from "@/types/secure";

export default function SecureDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getSecure, decryptSecure, deleteSecure } = useSecure();
  
  const [secureItem, setIdentity] = useState<DecryptedSecure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const { isCopied, copy } = useClipboardState(2000);

  useEffect(() => {
    let isMounted = true;

    async function loadIdentity() {
      try {
        const enc = await getSecure(id);
        if (!enc) {
          if (isMounted) setError("Identity not found.");
          return;
        }
        const dec = await decryptSecure(enc);
        if (isMounted) {
          setIdentity(dec);
          announce(`Loaded details for ${dec.title}`);
        }
      } catch (err) {
        if (isMounted) setError("Failed to decrypt secureItem. Vault may be locked.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadIdentity();
    return () => { isMounted = false; };
  }, [id, getSecure, decryptSecure]);

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <Skeleton className="h-8 w-24" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !secureItem) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive text-lg">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">{error || "Failed to load secureItem."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteSecure(id);
      announce(`Identity deleted`);
      router.push("/secure");
    } catch {
      setIsDeleting(false);
      setError("Failed to delete secureItem.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pb-20 sm:pb-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground touch-manipulation"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-border/40 bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-semibold">{secureItem.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Secure / Profile</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" />}>
              <MoreVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem render={<Link href={`/secure/${id}/edit`} className="cursor-pointer" />}>
                <Edit className="mr-2 size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <Trash className="mr-2 size-4" />
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-0">
          {secureItem.tags && secureItem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-4 border-b border-border/40" role="list" aria-label="Tags">
              {secureItem.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal text-xs py-0.5 px-2">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {(!secureItem.customFields || secureItem.customFields.length === 0) && (
            <div className="pt-4 space-y-1.5">
              <p className="text-xs text-muted-foreground italic">No secure fields added yet.</p>
            </div>
          )}

          {secureItem.customFields && secureItem.customFields.length > 0 && (
            <div className="pt-4 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Secure Fields</p>
              <div className="space-y-3">
                {secureItem.customFields.map((field) => (
                  <div key={field.id} className="rounded-md border bg-muted/20 p-3 space-y-1">
                    <p className="text-xs font-medium text-foreground">{field.name}</p>
                    <div className="flex items-center justify-between">
                      {field.isSecret && !showPassword ? (
                        <div className="flex items-center space-x-2 w-full">
                          <p className="text-sm font-mono text-muted-foreground break-all tracking-widest mt-1">••••••••</p>
                          <div className="flex-1" />
                          <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="h-7 w-7 p-0 text-muted-foreground">
                            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => { copy(field.value || "", field.id); announce(`${field.name} copied`); }}>
                            {isCopied(field.id) ? <><Check className="size-3 text-emerald-500" /> Copied</> : <><Copy className="size-3" /> Copy</>}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className={`text-sm font-mono text-foreground ${field.isMultiline ? "whitespace-pre-wrap break-words" : "break-all"}`}>{field.value}</div>
                          <div className="flex items-center gap-1">
                            {field.isSecret && (
                              <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="h-7 w-7 p-0 text-muted-foreground">
                                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => { copy(field.value || "", field.id); announce(`${field.name} copied`); }}>
                              {isCopied(field.id) ? <><Check className="size-3 text-emerald-500" /> Copied</> : <><Copy className="size-3" /> Copy</>}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t text-[11px] text-muted-foreground pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            Updated {secureItem.updatedAt.toLocaleDateString()}
          </span>
          <span>Created {secureItem.createdAt.toLocaleDateString()}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
