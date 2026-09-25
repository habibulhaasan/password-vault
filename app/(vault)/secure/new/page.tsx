"use client";

import { useRouter } from "next/navigation";
import { useSecure } from "@/hooks/use-secure";
import { SecureForm } from "@/components/secure/secure-form";
import type { SecureFormData } from "@/types/secure";

export default function NewIdentityPage() {
  const router = useRouter();
  const { createSecure } = useSecure();

  const handleCreate = async (data: SecureFormData) => {
    const newId = await createSecure(data);
    router.push(`/secure/${newId}`);
  };

  return (
    <div className="container max-w-3xl py-6 px-4">
      <SecureForm onSubmit={handleCreate} />
    </div>
  );
}
