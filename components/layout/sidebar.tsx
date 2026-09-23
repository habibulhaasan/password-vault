"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, FolderOpen, Tag, Settings, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { CategoryIcon } from "@/lib/constants/categories";
import { Separator } from "@/components/ui/separator";
import { PasswordGeneratorDialog } from "@/components/password-generator/password-generator-dialog";

const mainNav = [
  { href: "/dashboard", label: "All Credentials", icon: LayoutDashboard },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const { categories } = useCategories();
  const [generatorOpen, setGeneratorOpen] = useState(false);

  return (
    <>
      <nav
        className="flex h-full flex-col gap-1 p-3"
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-0.5">
          {mainNav.map((item) => {
            const isActive =
              pathname === item.href &&
              (!currentCategory || item.href !== "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          
          <button
            onClick={() => setGeneratorOpen(true)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground text-left"
          >
            <KeyRound className="size-4" />
            Generator
          </button>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <Link
              href="/categories"
              onClick={onNavigate}
              className="text-[11px] text-muted-foreground hover:text-foreground"
              aria-label="Manage categories"
            >
              Manage
            </Link>
          </div>
          {categories.map((category) => {
            const categoryPath = `/dashboard?category=${encodeURIComponent(category.id)}`;
            const isActive =
              pathname === "/dashboard" && currentCategory === category.id;

            return (
              <Link
                key={category.id}
                href={categoryPath}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <CategoryIcon
                    name={category.icon}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">{category.label}</span>
                </div>
                {category.isCustom && (
                  <>
                    <span
                      className="size-1.5 rounded-full bg-primary/70 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only">(custom)</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <PasswordGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
      />
    </>
  );
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <Suspense
      fallback={<nav className="h-full p-3" aria-label="Main navigation" />}
    >
      <SidebarContent onNavigate={onNavigate} />
    </Suspense>
  );
}
