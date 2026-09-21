"use client";

import Link from "next/link";
import {
  Shield,
  Plus,
  Lock,
  Unlock,
  Menu,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useVault } from "@/hooks/use-vault";

export function Header() {
  const { user, signOut } = useAuth();
  const { status, lockVault } = useVault();

  const isUnlocked = status === "unlocked";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <Shield className="size-5 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">
          Password Vault
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Lock Vault button */}
        <Button
          variant={isUnlocked ? "ghost" : "outline"}
          size="icon"
          disabled={!isUnlocked}
          onClick={isUnlocked ? () => lockVault() : undefined}
          title={isUnlocked ? "Lock vault now" : "Vault is locked"}
          className={isUnlocked ? "text-amber-600 hover:text-amber-700 dark:text-amber-400" : "opacity-50"}
        >
          {isUnlocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
          <span className="sr-only">
            {isUnlocked ? "Lock vault" : "Vault locked"}
          </span>
        </Button>

        {/* Add Credential button */}
        {isUnlocked ? (
          <Button
            size="sm"
            render={<Link href="/credentials/new" />}
            title="Add new credential"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        ) : (
          <Button size="sm" disabled title="Unlock vault to add credentials">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title={user.email || "User profile"}
                />
              }
            >
              <UserIcon className="size-4" />
              <span className="sr-only">User profile menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-medium leading-none text-foreground">
                    Signed in as
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => signOut()}
                className="cursor-pointer"
              >
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
