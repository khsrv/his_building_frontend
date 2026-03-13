import { Suspense, type ReactNode } from "react";
import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import { AppShell } from "@/shared/ui/layout/app-shell";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard allowedRoles={["admin", "manager"]}>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading admin shell...</div>}>
        <AppShell>{children}</AppShell>
      </Suspense>
    </AuthGuard>
  );
}
