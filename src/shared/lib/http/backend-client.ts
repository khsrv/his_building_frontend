// Server-side only client for backend API calls

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

export interface BackendRequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  revalidate?: number;
}

export interface BackendResponse<T> {
  data: T;
}

export async function backendRequest<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<BackendResponse<T>> {
  const { method = "GET", body, token, revalidate } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const fetchOptions: RequestInit = {
    method,
    headers,
    cache: revalidate !== undefined ? "force-cache" : "no-store",
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  };
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText })) as {
      code?: string;
      message?: string;
      details?: Record<string, unknown>;
    };
    throw {
      status: res.status,
      code: errorBody.code ?? "UNKNOWN",
      message: errorBody.message ?? "Request failed",
      details: errorBody.details,
    };
  }

  return res.json() as Promise<BackendResponse<T>>;
}
