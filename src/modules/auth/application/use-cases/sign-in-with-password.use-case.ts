import type { AuthClientPort } from "@/modules/auth/application/ports";
import type { PasswordSignInInput } from "@/modules/auth/domain/sign-in";
import type { SessionUser } from "@/modules/auth/domain/session";

export function createSignInWithPasswordUseCase(authClient: AuthClientPort) {
  return async function signInWithPassword(input: PasswordSignInInput): Promise<SessionUser> {
    return authClient.signInWithPassword(input);
  };
}
