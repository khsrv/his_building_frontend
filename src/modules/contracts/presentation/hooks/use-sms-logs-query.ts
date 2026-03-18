"use client";

import { useQuery } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { listSmsLogs } from "@/modules/contracts/infrastructure/contracts-repository";
import type { SmsLogListParams } from "@/modules/contracts/domain/contract";

export function useSmsLogsQuery(params?: SmsLogListParams) {
  return useQuery({
    queryKey: contractsQueryKeys.smsLogs(params),
    queryFn: () => listSmsLogs(params),
  });
}
