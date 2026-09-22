"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, Tag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] items-center justify-around border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden shadow-xs"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-1.5 min-h-[44px] min-w-[56px] text-[11px] font-medium transition-all rounded-lg active:scale-95",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

