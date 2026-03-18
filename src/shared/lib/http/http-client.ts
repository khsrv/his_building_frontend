import { AppError } from "@/shared/lib/errors/app-error";

export interface HttpRequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: HttpRequestOptions["query"]) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const base = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

interface RefreshTokenData {
  accessToken: string;
  accessTokenExpiresAt: string;
}

// ─── Dev logger (disabled in production) ─────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === "development";

function logRequest(method: string, url: string, body?: unknown) {
  if (!IS_DEV || typeof window === "undefined") return;
  console.groupCollapsed(
    `%c⬆ ${method} %c${url}`,
    "color:#6366f1;font-weight:700",
    "color:#94a3b8;font-weight:400",
  );
  if (body) console.log("Body:", body);
  console.groupEnd();
}

function logResponse(method: string, url: string, status: number, data: unknown) {
  if (!IS_DEV || typeof window === "undefined") return;
  const ok = status >= 200 && status < 300;
  console.groupCollapsed(
    `%c${ok ? "⬇" : "✗"} ${status} ${method} %c${url}`,
    ok ? "color:#22c55e;font-weight:700" : "color:#ef4444;font-weight:700",
    "color:#94a3b8;font-weight:400",
  );
  console.log("Response:", data);
  console.groupEnd();
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function doRequest<T>(
  path: string,
  options: HttpRequestOptions & { token?: string | null },
): Promise<T> {
  const { query, skipAuth: _skipAuth, token, headers, ...requestInit } = options;
  const url = buildUrl(path, query);
  const method = (requestInit.method ?? "GET").toUpperCase();

  let parsedBody: unknown;
  if (requestInit.body && typeof requestInit.body === "string") {
    try { parsedBody = JSON.parse(requestInit.body); } catch { parsedBody = requestInit.body; }
  }
  logRequest(method, url, parsedBody);

  const response = await fetch(url, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText || "Request failed" })) as {
        message?: string;
        code?: string;
      };

    logResponse(method, url, response.status, body);

    if (response.status === 401)
      throw new AppError("UNAUTHORIZED", body.message ?? "Unauthorized", 401, body);
    if (response.status === 403)
      throw new AppError("FORBIDDEN", body.message ?? "Forbidden", 403, body);
    if (response.status === 404)
      throw new AppError("NOT_FOUND", body.message ?? "Not found", 404, body);
    if (response.status === 422)
      throw new AppError("VALIDATION", body.message ?? "Validation error", 422, body);
    throw new AppError("UNKNOWN", body.message ?? "Request failed", response.status, body);
  }

  const data = (await response.json()) as T;
  logResponse(method, url, response.status, data);
  return data;
}

// Promise lock to prevent concurrent token refresh (race condition guard)
let _refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      // Refresh token is stored in httpOnly cookie — sent automatically
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new AppError("UNAUTHORIZED", "Session expired", 401, {});
      }

      const data = (await res.json()) as { data: RefreshTokenData };
      const { tokenStorage } = await import("@/shared/lib/http/token-storage");
      tokenStorage.setAccessToken(data.data.accessToken, data.data.accessTokenExpiresAt);
      return data.data.accessToken;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// Import dynamically to avoid SSR issues with tokenStorage
export async function httpRequest<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  if (options.skipAuth) {
    return doRequest<T>(path, { ...options, token: null });
  }

  const { tokenStorage } = await import("@/shared/lib/http/token-storage");

  // If token is expired, refresh first (with race condition protection)
  if (tokenStorage.isAccessTokenExpired()) {
    try {
      await refreshAccessToken();
    } catch {
      tokenStorage.clearAll();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new AppError("UNAUTHORIZED", "Session expired", 401, {});
    }
  }

  const token = tokenStorage.getAccessToken();

  try {
    return await doRequest<T>(path, { ...options, token });
  } catch (err) {
    if (err instanceof AppError && err.code === "UNAUTHORIZED") {
      // Try refresh once on 401 response
      try {
        const newToken = await refreshAccessToken();
        return await doRequest<T>(path, { ...options, token: newToken });
      } catch {
        tokenStorage.clearAll();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    throw err;
  }
}
