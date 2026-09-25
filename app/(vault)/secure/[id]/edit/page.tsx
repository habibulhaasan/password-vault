"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSecure } from "@/hooks/use-secure";
import { SecureForm } from "@/components/secure/secure-form";
import { SecureFormSkeleton } from "@/components/secure/secure-form-skeleton";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { SecureFormData } from "@/types/secure";

export default function EditIdentityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getSecure, decryptSecure, updateSecure } =
    useSecure();

  const [initialData, setInitialData] = useState<SecureFormData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const encrypted = await getSecure(id);
        if (!isMounted) return;
        if (!encrypted) {
          setError("Identity not found");
          setLoading(false);
          return;
        }

        const decrypted = await decryptSecure(encrypted);
        if (!isMounted) return;

        setInitialData({
          title: decrypted.title,
          tags: decrypted.tags || [],
        customFields: decrypted.customFields || [],
        });
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(
          sanitizeErrorMessage(
            err,
            "Failed to decrypt secureItem for editing.",
          ),
        );
        setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, getSecure, decryptSecure]);

  const handleUpdate = async (data: SecureFormData) => {
    await updateSecure(id, data);
    router.push(`/secure/${id}`);
  };

  if (loading) {
    return <SecureFormSkeleton />;
  }

  if (error || !initialData) {
    return (
      <div className="container max-w-2xl py-8 px-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">
          <p>{error || "Identity not found"}</p>
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
      <SecureForm
        isEdit
        initialValues={initialData}
        onSubmit={handleUpdate}
        onCancel={() => router.push(`/secure/${id}`)}
      />
    </div>
  );
}
