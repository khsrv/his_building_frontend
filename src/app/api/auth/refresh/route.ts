import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendRequest } from "@/shared/lib/http/backend-client";
import { SESSION_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY } from "@/modules/auth/infrastructure/session-cookie";
import { resolvePermissions } from "@/shared/types/permissions";
import type { UserRole, PermissionCode } from "@/shared/types/permissions";
import type { Session, SessionUser } from "@/modules/auth/domain/session";

interface BackendUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions?: string[];
  tenant_id?: string;
  can_login: boolean;
}

interface BackendAuthResponse {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user: BackendUser;
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_KEY)?.value;

  if (!refreshToken) {
    return NextResponse.json({ code: "INVALID_TOKEN" }, { status: 400 });
  }

  try {
    const result = await backendRequest<BackendAuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    const authData = result.data;
    const role = authData.user.role as UserRole;
    // Prefer permissions from backend (single source of truth); fallback to local resolution
    const backendPerms = authData.user.permissions as PermissionCode[] | undefined;
    const permissions = backendPerms && backendPerms.length > 0
      ? backendPerms
      : resolvePermissions([role]);
    const sessionUser: SessionUser = {
      id: authData.user.id,
      email: authData.user.email,
      fullName: authData.user.full_name,
      avatarUrl: null,
      role,
      roles: [role],
      permissions,
      tenantId: authData.user.tenant_id ?? "",
      tenantName: "",
    };

    const expiresAt = new Date(authData.refresh_token_expires_at);
    const session: Session = { user: sessionUser, expiresAtIso: expiresAt.toISOString() };

    const isProduction = process.env.NODE_ENV === "production";

    // Return only access token to client — refresh token stays server-side only
    const response = NextResponse.json({
      data: {
        accessToken: authData.access_token,
        accessTokenExpiresAt: authData.access_token_expires_at,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_KEY,
      value: encodeURIComponent(JSON.stringify(session)),
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE_KEY,
      value: authData.refresh_token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/api/auth",
      expires: expiresAt,
    });

    return response;
  } catch (err) {
    const error = err as { status?: number; code?: string };
    return NextResponse.json(
      { code: error.code ?? "REFRESH_FAILED" },
      { status: error.status ?? 401 },
    );
  }
}
