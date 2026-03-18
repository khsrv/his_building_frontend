import { NextResponse } from "next/server";
import { backendRequest } from "@/shared/lib/http/backend-client";
import { resolvePermissions } from "@/shared/types/permissions";
import type { UserRole } from "@/shared/types/permissions";
import { SESSION_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY } from "@/modules/auth/infrastructure/session-cookie";
import type { Session, SessionUser } from "@/modules/auth/domain/session";

interface BackendUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
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

interface BackendMeResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_id?: string;
  tenant_name?: string;
  can_login: boolean;
}

function mapBackendUser(user: BackendUser, me?: BackendMeResponse | null): SessionUser {
  const role = (me?.role ?? user.role) as UserRole;
  return {
    id: me?.id ?? user.id,
    email: me?.email ?? user.email,
    fullName: me?.full_name ?? user.full_name,
    avatarUrl: null,
    role,
    roles: [role],
    permissions: resolvePermissions([role]),
    tenantId: me?.tenant_id ?? user.tenant_id ?? "",
    tenantName: me?.tenant_name ?? "",
  };
}

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null) as unknown;

  if (!rawBody || typeof rawBody !== "object") {
    return NextResponse.json({ code: "AUTH_INVALID_INPUT" }, { status: 400 });
  }

  const body = rawBody as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ code: "AUTH_INVALID_INPUT" }, { status: 400 });
  }

  try {
    const result = await backendRequest<BackendAuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const authData = result.data;

    // Fetch fresh user profile with new access token to enrich session (tenant info, etc.)
    const meData = await backendRequest<BackendMeResponse>("/api/v1/users/me", {
      token: authData.access_token,
    }).then((r) => r.data).catch(() => null);

    const sessionUser = mapBackendUser(authData.user, meData);

    const expiresAt = new Date(authData.refresh_token_expires_at);
    const session: Session = {
      user: sessionUser,
      expiresAtIso: expiresAt.toISOString(),
    };

    const response = NextResponse.json(
      {
        data: {
          user: sessionUser,
          accessToken: authData.access_token,
          accessTokenExpiresAt: authData.access_token_expires_at,
          // refresh token is stored in httpOnly cookie only — never exposed to JS
        },
      },
      { status: 200 },
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Store session in httpOnly cookie for server-side access
    response.cookies.set({
      name: SESSION_COOKIE_KEY,
      value: encodeURIComponent(JSON.stringify(session)),
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // Store refresh token in httpOnly cookie — never accessible to JavaScript
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
    const error = err as { status?: number; code?: string; message?: string };

    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return NextResponse.json({ code: "AUTH_INVALID_CREDENTIALS" }, { status: 401 });
    }

    return NextResponse.json(
      { code: error.code ?? "AUTH_UNKNOWN_ERROR", message: error.message },
      { status: error.status ?? 500 },
    );
  }
}
