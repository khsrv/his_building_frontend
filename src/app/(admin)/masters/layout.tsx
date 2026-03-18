import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import type { ReactNode } from "react";

export default function MastersLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["super_admin", "company_admin", "foreman", "warehouse_manager"]}>
      {children}
    </AuthGuard>
  );
}
