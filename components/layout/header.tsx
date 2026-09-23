"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  Lock,
  Unlock,
  Menu,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { PasswordGeneratorDialog } from "@/components/password-generator/password-generator-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useVault } from "@/hooks/use-vault";
import { announce } from "@/lib/a11y/announcer";

export function Header() {
  const { user, signOut } = useAuth();
  const { status, lockVault } = useVault();
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const isUnlocked = status === "unlocked";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-background px-3 sm:px-4">
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden size-9"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <Sidebar onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 font-semibold tracking-tight hover:opacity-90 transition-opacity min-w-0"
          aria-label="Password Vault Home"
        >
          <Shield className="size-5 text-primary shrink-0" aria-hidden="true" />
          <span className="text-sm sm:text-lg font-semibold tracking-tight whitespace-nowrap truncate">
            Password Vault
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Password Generator quick tool */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setGeneratorOpen(true)}
          title="Password Generator"
          aria-label="Open password generator"
          className="size-9 sm:size-8 text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="sr-only">Open password generator</span>
        </Button>

        <ThemeToggle />

        {/* Lock Vault button */}
        <Button
          type="button"
          variant={isUnlocked ? "ghost" : "outline"}
          size="icon"
          disabled={!isUnlocked}
          onClick={
            isUnlocked
              ? () => {
                  lockVault();
                  announce("Vault locked");
                }
              : undefined
          }
          title={isUnlocked ? "Lock vault now" : "Vault is locked"}
          aria-label={isUnlocked ? "Lock vault now" : "Vault is locked"}
          className={cn(
            "size-9 sm:size-8",
            isUnlocked
              ? "text-amber-600 hover:text-amber-700 dark:text-amber-400"
              : "opacity-50",
          )}
        >
          {isUnlocked ? (
            <Unlock className="size-4" aria-hidden="true" />
          ) : (
            <Lock className="size-4" aria-hidden="true" />
          )}
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
            aria-label="Add new credential"
            className="h-9 px-2.5 sm:px-3 gap-1.5"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        ) : (
          <Button
            size="sm"
            disabled
            title="Unlock vault to add credentials"
            aria-label="Unlock vault to add credentials"
            className="h-9 px-2.5 sm:px-3 gap-1.5"
          >
            <Plus className="size-4" aria-hidden="true" />
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
                  className="size-9 sm:size-8 rounded-full"
                  title={user.email || "User profile"}
                  aria-label="User account menu"
                />
              }
            >
              <UserIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">User account menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
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
              </DropdownMenuGroup>
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

      <PasswordGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
      />
    </header>
  );
}
