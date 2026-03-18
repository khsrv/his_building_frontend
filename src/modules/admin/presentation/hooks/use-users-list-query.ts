"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { listUsers } from "@/modules/admin/infrastructure/admin-repository";
import type { UserListParams } from "@/modules/admin/domain/admin";

export function useUsersListQuery(params?: UserListParams) {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => listUsers(params),
  });
}
