"use client";

import Link from "next/link";
import { ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No credentials yet",
  description = "Add your first password to get started.",
  actionText = "Add Credential",
  actionHref = "/credentials/new",
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <ShieldCheck className="size-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">
        <Button size="sm" render={<Link href={actionHref} />} className="gap-1.5">
          <Plus className="size-4" />
          {actionText}
        </Button>
      </div>
    </div>
  );
}

