import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { VaultProvider } from "@/providers/vault-provider";
import { VaultGate } from "@/components/vault/vault-gate";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FloatingTimers } from "@/components/layout/floating-timers";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <VaultProvider>
        <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <aside className="hidden w-60 shrink-0 overflow-y-auto border-r md:block">
              <Sidebar />
            </aside>
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 overflow-y-auto pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0 outline-none"
            >
              <VaultGate>
                <ErrorBoundary>{children}</ErrorBoundary>
                <FloatingTimers />
              </VaultGate>
            </main>
          </div>
          <MobileNav />
        </div>
      </VaultProvider>
    </AuthGuard>
  );
}



