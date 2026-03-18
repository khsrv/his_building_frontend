"use client";

import { useQuery } from "@tanstack/react-query";
import { mastersKeys } from "@/modules/masters/presentation/query-keys";
import { fetchWorkOrdersList } from "@/modules/masters/infrastructure/masters-repository";
import type { WorkOrdersListParams } from "@/modules/masters/domain/master";

export function useWorkOrdersListQuery(params?: WorkOrdersListParams) {
  return useQuery({
    queryKey: mastersKeys.workOrdersList(params),
    queryFn: () => fetchWorkOrdersList(params),
  });
}
