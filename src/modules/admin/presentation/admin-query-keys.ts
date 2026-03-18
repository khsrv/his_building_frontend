export const adminQueryKeys = {
  all: ["admin"] as const,
  users: (params?: object) => [...adminQueryKeys.all, "users", params] as const,
  user: (id: string) => [...adminQueryKeys.all, "users", id] as const,
  tenants: (params?: object) => [...adminQueryKeys.all, "tenants", params] as const,
  tenant: (id: string) => [...adminQueryKeys.all, "tenants", id] as const,
  settings: () => [...adminQueryKeys.all, "settings"] as const,
} as const;
