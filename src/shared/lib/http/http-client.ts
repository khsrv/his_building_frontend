import { env } from "@/shared/config/env";
import { AppError } from "@/shared/lib/errors/app-error";

export interface HttpRequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined | null>;
  token?: string | null;
}

function buildUrl(path: string, query?: HttpRequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${env.NEXT_PUBLIC_API_URL}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function httpRequest<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
  const { query, token, headers, ...requestInit } = options;

  const response = await fetch(buildUrl(path, query), {
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
      .catch(() => ({ message: response.statusText || "Request failed" }));

    if (response.status === 401) {
      throw new AppError("UNAUTHORIZED", body.message ?? "Unauthorized", response.status, body);
    }

    if (response.status === 403) {
      throw new AppError("FORBIDDEN", body.message ?? "Forbidden", response.status, body);
    }

    if (response.status === 404) {
      throw new AppError("NOT_FOUND", body.message ?? "Not found", response.status, body);
    }

    if (response.status === 422) {
      throw new AppError("VALIDATION", body.message ?? "Validation error", response.status, body);
    }

    throw new AppError("UNKNOWN", body.message ?? "Request failed", response.status, body);
  }

  return (await response.json()) as T;
}
