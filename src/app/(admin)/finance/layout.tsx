import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import type { ReactNode } from "react";

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["super_admin", "company_admin", "accountant", "cashier"]}>
      {children}
    </AuthGuard>
  );
}
