import type { DepositsListParams } from "@/modules/deposits/domain/deposit";

export const depositKeys = {
  all: ["deposits"] as const,
  list: (params?: DepositsListParams) => ["deposits", "list", params] as const,
  detail: (id: string) => ["deposits", "detail", id] as const,
} as const;
