"use client";

/**
 * api-client — единый клиент для всех API-вызовов из модулей.
 *
 * Использование:
 *   import { apiClient } from "@/shared/lib/http/api-client";
 *
 *   // GET
 *   const res = await apiClient.get<ApiResponse<Property[]>>("/api/v1/properties", { page: 1 });
 *
 *   // POST
 *   const res = await apiClient.post<ApiResponse<Property>>("/api/v1/properties", { name: "ЖК Сомон" });
 *
 *   // PATCH
 *   const res = await apiClient.patch<ApiResponse<Property>>("/api/v1/properties/123", { status: "selling" });
 *
 *   // DELETE
 *   await apiClient.delete("/api/v1/properties/123");
 */

import { httpRequest, type HttpRequestOptions } from "@/shared/lib/http/http-client";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

const apiClient = {
  get<T>(path: string, query?: QueryParams, options?: Omit<HttpRequestOptions, "method" | "query">): Promise<T> {
    return httpRequest<T>(path, { ...options, method: "GET", ...(query ? { query } : {}) });
  },

  post<T>(path: string, body: unknown, options?: Omit<HttpRequestOptions, "method" | "body">): Promise<T> {
    return httpRequest<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T>(path: string, body: unknown, options?: Omit<HttpRequestOptions, "method" | "body">): Promise<T> {
    return httpRequest<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: unknown, options?: Omit<HttpRequestOptions, "method" | "body">): Promise<T> {
    return httpRequest<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T = { data: { status: string } }>(path: string, options?: Omit<HttpRequestOptions, "method">): Promise<T> {
    return httpRequest<T>(path, { ...options, method: "DELETE" });
  },
};

export { apiClient };
