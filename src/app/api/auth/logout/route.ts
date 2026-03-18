import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NextAuthRepository } from "@/modules/auth/infrastructure/auth-repository";
import { backendRequest } from "@/shared/lib/http/backend-client";
import { REFRESH_TOKEN_COOKIE_KEY } from "@/modules/auth/infrastructure/session-cookie";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_KEY)?.value;

  // Notify backend to revoke the session (fire-and-forget)
  if (refreshToken) {
    await backendRequest("/api/v1/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }).catch(() => null);
  }

  // Always clear the local session and refresh token cookies
  const authRepository = new NextAuthRepository();
  await authRepository.signOut();

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE_KEY,
    value: "",
    httpOnly: true,
    path: "/api/auth",
    expires: new Date(0),
  });

  return response;
}
