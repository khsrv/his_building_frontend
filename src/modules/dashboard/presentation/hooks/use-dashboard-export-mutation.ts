"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData, normalizeApiKeys } from "@/shared/lib/http/api-response";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";
import type { DashboardExportResult } from "@/modules/dashboard/domain/dashboard";
import type { DashboardSummaryDto } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapSummaryDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";

interface ExportEnvelopeDto {
  format?: string;
  data?: DashboardSummaryDto;
  note?: string;
}

interface DashboardExportInput {
  format?: "json" | "xlsx" | "pdf";
  propertyId?: string;
}

export function useDashboardExportMutation() {
  return useMutation({
    mutationKey: dashboardKeys.exportSummary("json"),
    mutationFn: async (input?: DashboardExportInput): Promise<DashboardExportResult> => {
      const query: Record<string, string> = {
        format: input?.format ?? "json",
      };
      if (input?.propertyId) {
        query["property_id"] = input.propertyId;
      }

      const response = await apiClient.get<{ data: ExportEnvelopeDto }>(
        "/api/v1/dashboard/export",
        query,
      );
      const payload = getResponseData<ExportEnvelopeDto>(normalizeApiKeys(response));
      const summaryDto: DashboardSummaryDto = {
        total_units: Number(payload.data?.total_units ?? 0),
        sold_units: Number(payload.data?.sold_units ?? 0),
        available_units: Number(payload.data?.available_units ?? 0),
        booked_units: Number(payload.data?.booked_units ?? 0),
        reserved_units: Number(payload.data?.reserved_units ?? 0),
        total_revenue: Number(payload.data?.total_revenue ?? 0),
        total_debt: Number(payload.data?.total_debt ?? 0),
        account_balance: Number(payload.data?.account_balance ?? 0),
        active_deals: Number(payload.data?.active_deals ?? 0),
        total_clients: Number(payload.data?.total_clients ?? 0),
        overdue_count: Number(payload.data?.overdue_count ?? 0),
      };

      return {
        format: payload.format ?? input?.format ?? "json",
        note: payload.note ?? "",
        summary: mapSummaryDtoToDomain(summaryDto),
      };
    },
  });
}
