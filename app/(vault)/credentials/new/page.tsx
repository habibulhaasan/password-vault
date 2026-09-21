"use client";

import { useRouter } from "next/navigation";
import { useCredentials } from "@/hooks/use-credentials";
import { CredentialForm } from "@/components/credentials/credential-form";
import type { CredentialFormData } from "@/types/credential";

export default function NewCredentialPage() {
  const router = useRouter();
  const { createCredential } = useCredentials();

  const handleCreate = async (data: CredentialFormData) => {
    const newId = await createCredential(data);
    router.push(`/credentials/${newId}`);
  };

  return (
    <div className="container max-w-3xl py-6 px-4">
      <CredentialForm onSubmit={handleCreate} />
    </div>
  );
}
