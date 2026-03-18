import { Suspense, type ReactNode } from "react";
import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import { AppShell } from "@/shared/ui/layout/app-shell";
import { NextAuthRepository } from "@/modules/auth/infrastructure/auth-repository";
import { createGetCurrentUserUseCase } from "@/modules/auth/application/use-cases/get-current-user.use-case";
import { TenantProvider, type TenantInfo } from "@/shared/providers/tenant-provider";

interface AdminLayoutProps {
  children: ReactNode;
}

async function resolveTenant(): Promise<TenantInfo | null> {
  const getCurrentUser = createGetCurrentUserUseCase(new NextAuthRepository());
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.tenantId,
    name: user.tenantName,
    slug: user.tenantSlug,
    baseCurrency: "TJS",
    plan: "business",
    logoUrl: null,
  };
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const tenant = await resolveTenant();

  return (
    <AuthGuard>
      <TenantProvider tenant={tenant}>
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </TenantProvider>
    </AuthGuard>
  );
}
