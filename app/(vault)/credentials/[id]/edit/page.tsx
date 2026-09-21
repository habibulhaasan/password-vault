"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCredentials } from "@/hooks/use-credentials";
import { CredentialForm } from "@/components/credentials/credential-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CredentialFormData } from "@/types/credential";

export default function EditCredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getCredential, decryptCredential, updateCredential } = useCredentials();

  const [initialData, setInitialData] = useState<CredentialFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setInitialData({
          title: decrypted.title,
          username: decrypted.username,
          password: decrypted.password,
          websiteUrl: decrypted.websiteUrl || "",
          categoryId: decrypted.categoryId || "",
          tags: decrypted.tags || [],
          notes: decrypted.notes || "",
        });
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Failed to decrypt credential for editing.");
        setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, getCredential, decryptCredential]);

  const handleUpdate = async (data: CredentialFormData) => {
    await updateCredential(id, data);
    router.push(`/credentials/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Decrypting credential for editing...</p>
        </div>
      </div>
    );
  }

  if (error || !initialData) {
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

  return (
    <div className="container max-w-3xl py-6 px-4">
      <CredentialForm
        isEdit
        initialValues={initialData}
        onSubmit={handleUpdate}
        onCancel={() => router.push(`/credentials/${id}`)}
      />
    </div>
  );
}
