"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Laptop, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: "light" | "dark" | "system";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const emptySubscribe = () => () => {};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    description: "Crisp, clean high-contrast daytime interface",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Gentle on the eyes for low-light environments",
    icon: Moon,
  },
  {
    id: "system",
    label: "System",
    description: "Matches your operating system appearance preference",
    icon: Laptop,
  },
];

export function ThemeCard() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="hidden h-5 w-5 dark:block" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Appearance</CardTitle>
            <CardDescription className="text-xs">
              Customize the theme and visual appearance of your vault interface
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = mounted && theme === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary"
                    : "border-border/70 hover:border-border hover:bg-muted/50 text-foreground"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm text-foreground">
                      {option.label}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
