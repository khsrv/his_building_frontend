import type { AuthRepository } from "@/modules/auth/application/ports";
import type { SessionUser } from "@/modules/auth/domain/session";

export function createGetCurrentUserUseCase(authRepository: AuthRepository) {
  return async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await authRepository.getServerSession();
    return session?.user ?? null;
  };
}
