export interface ApiPaginationInfo {
  page: number;
  limit: number;
  total: number;
}

export type ApiRecord = Record<string, unknown>;

export function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSnakeCaseKey(key: string): string {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}

export function normalizeApiKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiKeys(item)) as T;
  }

  if (!isApiRecord(value)) {
    return value;
  }

  const normalized: ApiRecord = {};
  for (const [key, raw] of Object.entries(value)) {
    const normalizedKey = toSnakeCaseKey(key);
    const next = normalizeApiKeys(raw);

    // If both snake_case and PascalCase exist, prefer explicit snake_case key.
    if (key === normalizedKey || !(normalizedKey in normalized)) {
      normalized[normalizedKey] = next;
    }
  }

  return normalized as T;
}

export function getResponseData<T = unknown>(response: unknown): T {
  const normalized = normalizeApiKeys(response);
  if (isApiRecord(normalized) && "data" in normalized) {
    return normalized["data"] as T;
  }
  return normalized as T;
}

export function getResponseRecord(response: unknown): ApiRecord | null {
  const data = getResponseData(response);
  return isApiRecord(data) ? data : null;
}

export function getResponseItems<T = unknown>(
  response: unknown,
  containerKeys: readonly string[] = ["items", "columns"],
): T[] {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!isApiRecord(data)) {
    return [];
  }

  for (const key of containerKeys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  // Some endpoints return object maps instead of arrays:
  // data: { "<id>": {...}, "<id2>": {...} }
  const values = Object.values(data);
  if (values.length > 0 && values.every((value) => isApiRecord(value))) {
    return values as T[];
  }

  return [];
}

export function getResponsePagination(response: unknown): ApiPaginationInfo | null {
  const data = getResponseData(response);
  if (!isApiRecord(data)) {
    return null;
  }

  const pagination = data["pagination"];
  if (!isApiRecord(pagination)) {
    return null;
  }

  const page = Number(pagination["page"]);
  const limit = Number(pagination["limit"]);
  const total = Number(pagination["total"]);

  return {
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 20,
    total: Number.isFinite(total) ? total : 0,
  };
}

export function getResponseStringMap(response: unknown): Record<string, string> {
  const data = getResponseData(response);
  if (!isApiRecord(data)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[key] = String(value);
    }
  }
  return result;
}
