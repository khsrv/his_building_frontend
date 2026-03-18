import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import type { ReactNode } from "react";

export default function DealsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["super_admin", "company_admin", "sales_head", "manager", "broker"]}>
      {children}
    </AuthGuard>
  );
}
