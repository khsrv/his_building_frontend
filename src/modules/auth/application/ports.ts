import type { PasswordSignInInput } from "@/modules/auth/domain/sign-in";
import type { Session, SessionUser } from "@/modules/auth/domain/session";

export interface AuthRepository {
  getServerSession(): Promise<Session | null>;
  signOut(): Promise<void>;
}

export interface AuthClientPort {
  signInWithPassword(input: PasswordSignInInput): Promise<SessionUser>;
}
