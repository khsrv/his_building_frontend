"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { listSettings } from "@/modules/admin/infrastructure/admin-repository";

export function useCompanySettingsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.settings(),
    queryFn: listSettings,
  });
}
