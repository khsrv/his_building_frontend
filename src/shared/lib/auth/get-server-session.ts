import { cookies } from "next/headers";
import { SESSION_COOKIE_KEY } from "@/modules/auth/infrastructure/session-cookie";
import type { Session } from "@/modules/auth/domain/session";

// Server-side helper to get current session
export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_KEY)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Session;
  } catch {
    return null;
  }
}
