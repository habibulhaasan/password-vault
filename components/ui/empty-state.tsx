"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction | React.ReactNode;
  secondaryAction?: EmptyStateAction | React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = ShieldCheck,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const renderAction = (
    act: EmptyStateAction | React.ReactNode,
    isSecondary = false,
  ) => {
    if (!act) return null;
    if (React.isValidElement(act)) return act;

    const actionObj = act as EmptyStateAction;
    const ActionIcon = actionObj.icon;

    const content = (
      <>
        {ActionIcon && <ActionIcon className="size-4" aria-hidden="true" />}
        <span>{actionObj.label}</span>
      </>
    );

    if (actionObj.href) {
      return (
        <Button
          size="sm"
          variant={actionObj.variant || (isSecondary ? "outline" : "default")}
          render={<Link href={actionObj.href} />}
          className="gap-1.5"
        >
          {content}
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant={actionObj.variant || (isSecondary ? "outline" : "default")}
        onClick={actionObj.onClick}
        className="gap-1.5"
      >
        {content}
      </Button>
    );
  };

  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "flex min-h-[35vh] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center animate-in fade-in-50",
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
        {typeof Icon === "function" ? (
          <Icon className="size-6" />
        ) : React.isValidElement(Icon) ? (
          Icon
        ) : (
          <ShieldCheck className="size-6" />
        )}
      </div>

      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action && renderAction(action)}
          {secondaryAction && renderAction(secondaryAction, true)}
        </div>
      )}
    </div>
  );
}
