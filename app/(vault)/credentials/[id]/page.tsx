"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCredentials } from "@/hooks/use-credentials";
import { useCategories } from "@/hooks/use-categories";
import { CategoryIcon } from "@/lib/constants/categories";
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
} from "lucide-react";
import type { DecryptedCredential } from "@/types/credential";

export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getCredential, decryptCredential, deleteCredential } = useCredentials();
  const { getCategory } = useCategories();

  const [credential, setCredential] = useState<DecryptedCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<"username" | "password" | null>(null);
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

  const copyToClipboard = async (text: string, field: "username" | "password") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
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
      router.push("/dashboard");
    } catch {
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
            render={<Link href={`/credentials/${id}/edit`} />}
            className="gap-1.5"
          >
            <Edit className="size-3.5" />
            Edit
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            className="gap-1.5"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
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
              <a
                href={credential.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
              >
                <Globe className="size-3.5" />
                Visit Site
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {credential.tags && credential.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {credential.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="mr-1 size-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 divide-y divide-border">
          {/* Username */}
          <div className="pt-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Username / Email</p>
              <p className="text-sm font-mono select-all text-foreground">
                {credential.username}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(credential.username, "username")}
              className="gap-1.5"
            >
              {copiedField === "username" ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Password */}
          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Password</p>
              <p className="text-sm font-mono select-all text-foreground">
                {showPassword ? credential.password : "••••••••••••••••"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Reveal password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Reveal password"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(credential.password, "password")}
                className="gap-1.5"
              >
                {copiedField === "password" ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Notes */}
          {credential.notes && (
            <div className="pt-4 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap font-sans text-foreground">
                {credential.notes}
              </div>
            </div>
          )}
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
