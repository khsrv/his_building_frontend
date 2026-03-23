import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseItems, normalizeApiKeys } from "@/shared/lib/http/api-response";
import type { DealCancellationRecord, MarkRefundedInput, RefundStatus } from "@/modules/deals/domain/refund";

interface CancellationDto {
  id: string;
  deal_id: string;
  deal_number?: string;
  client_name?: string;
  client_phone?: string;
  reason: string;
  refund_type: string;
  paid_amount: number;
  refund_amount: number;
  penalty_amount: number;
  penalty_reason?: string;
  currency?: string;
  refund_status: string;
  refunded_at?: string | null;
  cancelled_by: string;
  created_at: string;
}

function mapCancellationDto(dto: CancellationDto): DealCancellationRecord {
  return {
    id: dto.id,
    dealId: dto.deal_id,
    dealNumber: dto.deal_number ?? "",
    clientName: dto.client_name ?? "",
    clientPhone: dto.client_phone ?? "",
    reason: dto.reason ?? "",
    refundType: (["full", "partial", "none"] as const).includes(dto.refund_type as "full") ? (dto.refund_type as "full" | "partial" | "none") : "none",
    paidAmount: dto.paid_amount ?? 0,
    refundAmount: dto.refund_amount ?? 0,
    penaltyAmount: dto.penalty_amount ?? 0,
    penaltyReason: dto.penalty_reason ?? "",
    currency: dto.currency ?? "USD",
    refundStatus: (["pending", "refunded", "not_required"] as const).includes(dto.refund_status as RefundStatus) ? (dto.refund_status as RefundStatus) : "not_required",
    refundedAt: dto.refunded_at ?? null,
    cancelledBy: dto.cancelled_by ?? "",
    createdAt: dto.created_at ?? "",
  };
}

export async function fetchCancellations(status?: string | undefined): Promise<DealCancellationRecord[]> {
  const query: Record<string, string> = {};
  if (status) query["status"] = status;
  const res = await apiClient.get<unknown>("/api/v1/deal-cancellations", query);
  const items = getResponseItems<CancellationDto>(normalizeApiKeys(res));
  return items.map(mapCancellationDto);
}

export async function markRefunded(cancellationId: string, input: MarkRefundedInput): Promise<void> {
  const body: Record<string, unknown> = {
    account_id: input.accountId,
    payment_method: input.paymentMethod,
  };
  if (input.notes) body.notes = input.notes;
  await apiClient.post(`/api/v1/deal-cancellations/${cancellationId}/mark-refunded`, body);
}
