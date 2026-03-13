import { cookies } from "next/headers";
import type { AuthRepository } from "@/modules/auth/application/ports";
import type { Session } from "@/modules/auth/domain/session";
import { SESSION_COOKIE_KEY } from "@/modules/auth/infrastructure/session-cookie";

export class NextAuthRepository implements AuthRepository {
  async getServerSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const rawSession = cookieStore.get(SESSION_COOKIE_KEY)?.value;

    if (!rawSession) {
      return null;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(rawSession)) as Session;
      return parsed;
    } catch {
      return null;
    }
  }

  async signOut(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_KEY);
  }
}
