import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  getResponsePagination,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type {
  Deposit,
  CreateDepositInput,
  ReturnDepositInput,
  ApplyDepositInput,
  DepositsListParams,
  DepositsListResult,
  DepositStatus,
} from "@/modules/deposits/domain/deposit";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface DepositDto {
  id: string;
  tenant_id?: string;
  depositor_name: string;
  depositor_phone: string | null;
  client_id: string | null;
  amount: number;
  currency: string;
  account_id: string | null;
  status: string;
  notes: string | null;
  deal_id: string | null;
  property_id: string | null;
  received_by: string | null;
  returned_at: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function isDepositStatus(value: string): value is DepositStatus {
  return ["active", "applied", "returned"].includes(value);
}

function mapDepositDto(dto: DepositDto): Deposit {
  return {
    id: dto.id,
    depositorName: dto.depositor_name,
    depositorPhone: dto.depositor_phone,
    clientId: dto.client_id,
    amount: dto.amount,
    currency: dto.currency,
    accountId: dto.account_id,
    status: isDepositStatus(dto.status) ? dto.status : "active",
    notes: dto.notes,
    dealId: dto.deal_id,
    propertyId: dto.property_id,
    receivedBy: dto.received_by,
    returnedAt: dto.returned_at,
    appliedAt: dto.applied_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

// ─── Repository functions ──────────────────────────────────────────────────────

export async function fetchDepositsList(
  params?: DepositsListParams,
): Promise<DepositsListResult> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.status) query["status"] = params.status;
  if (params?.clientId) query["client_id"] = params.clientId;
  if (params?.propertyId) query["property_id"] = params.propertyId;
  if (params?.dateFrom) query["date_from"] = params.dateFrom;
  if (params?.dateTo) query["date_to"] = params.dateTo;

  const res = await apiClient.get<unknown>("/api/v1/deposits", query);
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<DepositDto>(normalized);
  const pagination = getResponsePagination(normalized);
  return {
    items: items.filter((item) => Boolean(item?.id)).map(mapDepositDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function fetchDepositDetail(id: string): Promise<Deposit> {
  const res = await apiClient.get<unknown>(`/api/v1/deposits/${id}`);
  return mapDepositDto(getResponseData<DepositDto>(res));
}

export async function createDeposit(
  input: CreateDepositInput,
): Promise<Deposit> {
  const body: Record<string, unknown> = {
    depositor_name: input.depositorName,
    amount: input.amount,
    currency: input.currency,
  };
  if (input.depositorPhone !== undefined)
    body["depositor_phone"] = input.depositorPhone;
  if (input.clientId !== undefined) body["client_id"] = input.clientId;
  if (input.accountId !== undefined) body["account_id"] = input.accountId;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<unknown>("/api/v1/deposits", body);
  return mapDepositDto(getResponseData<DepositDto>(res));
}

export async function returnDeposit(
  id: string,
  input?: ReturnDepositInput,
): Promise<Deposit> {
  const body: Record<string, unknown> = {};
  if (input?.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<unknown>(
    `/api/v1/deposits/${id}/return`,
    body,
  );
  return mapDepositDto(getResponseData<DepositDto>(res));
}

export async function applyDeposit(
  id: string,
  input: ApplyDepositInput,
): Promise<Deposit> {
  const body: Record<string, unknown> = {
    deal_id: input.dealId,
    client_id: input.clientId,
  };
  if (input.scheduleItemId !== undefined)
    body["schedule_item_id"] = input.scheduleItemId;

  const res = await apiClient.post<unknown>(
    `/api/v1/deposits/${id}/apply`,
    body,
  );
  return mapDepositDto(getResponseData<DepositDto>(res));
}
