import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldQuestion, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/80 bg-card p-8 shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldQuestion className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
            404 Not Found
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The page you are looking for does not exist, has been moved, or is
            no longer accessible.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            render={<Link href="/dashboard" />}
            className="w-full sm:w-auto gap-2"
          >
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Go to Dashboard
          </Button>

          <Button
            size="sm"
            variant="outline"
            render={<Link href="/" />}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
