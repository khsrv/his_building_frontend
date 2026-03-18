"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { listTenants } from "@/modules/admin/infrastructure/admin-repository";
import type { TenantListParams } from "@/modules/admin/domain/admin";

export function useTenantsListQuery(params?: TenantListParams) {
  return useQuery({
    queryKey: adminQueryKeys.tenants(params),
    queryFn: () => listTenants(params),
  });
}
