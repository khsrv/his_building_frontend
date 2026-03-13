import { NextResponse } from "next/server";
import type { PasswordSignInInput } from "@/modules/auth/domain/sign-in";
import type { Session, SessionUser, UserRole } from "@/modules/auth/domain/session";
import { SESSION_COOKIE_KEY, SESSION_TTL_DAYS } from "@/modules/auth/infrastructure/session-cookie";

interface DemoAccount {
  login: string;
  password: string;
  user: SessionUser;
}

const demoAccounts: readonly DemoAccount[] = [
  {
    login: "demo",
    password: "demo123",
    user: {
      id: "u-demo-admin",
      email: "demo@pos.tj",
      fullName: "Демо",
      roles: ["admin", "manager"] as const satisfies readonly UserRole[],
    },
  },
  {
    login: "manager",
    password: "manager123",
    user: {
      id: "u-demo-manager",
      email: "manager@pos.tj",
      fullName: "Manager Demo",
      roles: ["manager"] as const satisfies readonly UserRole[],
    },
  },
];

function normalizeLogin(value: string) {
  return value.trim().toLowerCase();
}

function parseInput(body: unknown): PasswordSignInInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const login = typeof record.login === "string" ? record.login : "";
  const password = typeof record.password === "string" ? record.password : "";

  return {
    login,
    password,
  };
}

export async function POST(request: Request) {
  const rawBody = (await request.json().catch(() => null)) as unknown;
  const input = parseInput(rawBody);

  if (!input) {
    return NextResponse.json({ code: "AUTH_INVALID_INPUT" }, { status: 400 });
  }

  const normalizedLogin = normalizeLogin(input.login);
  const password = input.password.trim();

  if (!normalizedLogin || !password) {
    return NextResponse.json({ code: "AUTH_INVALID_INPUT" }, { status: 400 });
  }

  const account = demoAccounts.find((candidate) => {
    return normalizeLogin(candidate.login) === normalizedLogin && candidate.password === password;
  });

  if (!account) {
    return NextResponse.json({ code: "AUTH_INVALID_CREDENTIALS" }, { status: 401 });
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const session: Session = {
    user: account.user,
    expiresAtIso: expiresAt.toISOString(),
  };

  const response = NextResponse.json({ data: account.user }, { status: 200 });
  response.cookies.set({
    name: SESSION_COOKIE_KEY,
    value: encodeURIComponent(JSON.stringify(session)),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
