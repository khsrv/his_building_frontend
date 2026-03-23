import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData } from "@/shared/lib/http/api-response";

export async function fetchSettings(): Promise<Record<string, string>> {
  const res = await apiClient.get<unknown>("/api/v1/settings");
  const data = getResponseData<Record<string, string>>(res);
  return data ?? {};
}

export async function setSetting(key: string, value: string): Promise<void> {
  await apiClient.post("/api/v1/settings", { key, value });
}
