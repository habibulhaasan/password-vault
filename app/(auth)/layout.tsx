import { Shield } from "lucide-react";
import { GuestGuard } from "@/components/auth/guest-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
        <div className="mb-8 flex items-center gap-2">
          <Shield className="size-8 text-primary" />
          <h1 className="text-2xl font-bold">Password Vault</h1>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </GuestGuard>
  );
}
