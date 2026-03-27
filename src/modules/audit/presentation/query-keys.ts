export const auditQueryKeys = {
  all: ["audit"] as const,
  logs: (params?: object) => [...auditQueryKeys.all, "logs", params] as const,
} as const;
