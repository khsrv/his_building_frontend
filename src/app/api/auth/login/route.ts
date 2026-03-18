import { NextResponse } from "next/server";
import type { PasswordSignInInput } from "@/modules/auth/domain/sign-in";
import type { Session, SessionUser } from "@/modules/auth/domain/session";
import type { UserRole } from "@/shared/types/permissions";
import { resolvePermissions } from "@/shared/types/permissions";
import { SESSION_COOKIE_KEY, SESSION_TTL_DAYS } from "@/modules/auth/infrastructure/session-cookie";

interface DemoAccount {
  login: string;
  password: string;
  user: SessionUser;
}

// ─── Demo accounts for development ───────────────────────────────────────────
// Replace with real backend integration in production

const DEMO_TENANT = {
  id: "t-demo-001",
  name: "Сохтмони Дусти",
  slug: "sohtmoni-dusti",
} as const;

function makeDemoUser(
  id: string,
  email: string,
  fullName: string,
  roles: readonly UserRole[],
): SessionUser {
  return {
    id,
    email,
    fullName,
    avatarUrl: null,
    roles,
    permissions: resolvePermissions(roles),
    tenantId: DEMO_TENANT.id,
    tenantName: DEMO_TENANT.name,
    tenantSlug: DEMO_TENANT.slug,
  };
}

const demoAccounts: readonly DemoAccount[] = [
  {
    login: "demo",
    password: "demo123",
    user: makeDemoUser(
      "u-demo-admin",
      "admin@Hisob Building.tj",
      "Алишер Назаров",
      ["admin_company"],
    ),
  },
  {
    login: "manager",
    password: "manager123",
    user: makeDemoUser(
      "u-demo-manager",
      "manager@Hisob Building.tj",
      "Фаррух Рахимов",
      ["sales_manager"],
    ),
  },
  {
    login: "director",
    password: "director123",
    user: makeDemoUser(
      "u-demo-director",
      "director@Hisob Building.tj",
      "Саид Ибрагимов",
      ["sales_director"],
    ),
  },
  {
    login: "accountant",
    password: "accountant123",
    user: makeDemoUser(
      "u-demo-accountant",
      "accountant@Hisob Building.tj",
      "Нигина Каримова",
      ["accountant"],
    ),
  },
];

function normalizeLogin(value: string) {
  return value.trim().toLowerCase();
}

function parseInput(body: unknown): PasswordSignInInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const login = typeof record.login === "string" ? record.login : "";
  const password = typeof record.password === "string" ? record.password : "";
  return { login, password };
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

  const account = demoAccounts.find(
    (c) => normalizeLogin(c.login) === normalizedLogin && c.password === password,
  );

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
