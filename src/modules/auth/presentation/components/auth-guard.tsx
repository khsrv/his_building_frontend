import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createGetCurrentUserUseCase } from "@/modules/auth/application/use-cases/get-current-user.use-case";
import { NextAuthRepository } from "@/modules/auth/infrastructure/auth-repository";
import type { UserRole } from "@/modules/auth/domain/session";
import { routes } from "@/shared/constants/routes";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: readonly UserRole[];
}

export async function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const getCurrentUser = createGetCurrentUserUseCase(new NextAuthRepository());
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.login);
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => user.roles.includes(role));

    if (!hasPermission) {
      redirect(routes.home);
    }
  }

  return <>{children}</>;
}
