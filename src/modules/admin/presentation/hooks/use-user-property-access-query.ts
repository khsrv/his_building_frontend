"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { getUserPropertyAccess } from "@/modules/admin/infrastructure/admin-repository";

export function useUserPropertyAccessQuery(userId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.userPropertyAccess(userId ?? ""),
    queryFn: () => getUserPropertyAccess(userId!),
    enabled: Boolean(userId),
  });
}
