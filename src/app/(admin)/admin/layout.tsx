import { AuthGuard } from "@/modules/auth/presentation/components/auth-guard";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthGuard allowedRoles={["super_admin"]}>{children}</AuthGuard>;
}
