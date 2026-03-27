"use client";

import { useQuery } from "@tanstack/react-query";
import { auditQueryKeys } from "@/modules/audit/presentation/query-keys";
import { listAuditLogs } from "@/modules/audit/infrastructure/repository";
import type { AuditLogListParams } from "@/modules/audit/domain/audit";

export function useAuditLogsQuery(params?: AuditLogListParams) {
  return useQuery({
    queryKey: auditQueryKeys.logs(params),
    queryFn: () => listAuditLogs(params),
  });
}
