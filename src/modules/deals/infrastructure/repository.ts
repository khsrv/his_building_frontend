import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type { Deal, ScheduleItem, CreateDealInput, DealsListParams, ReceivePaymentInput, CancelDealInput } from "@/modules/deals/domain/deal";
import type {
  DealsListResponseDto,
  DealDetailResponseDto,
  ScheduleResponseDto,
  PaymentDto,
  CreateDealRequestDto,
  ReceivePaymentRequestDto,
  PaymentDetailResponseDto,
  ClientSearchResponseDto,
  UnitSearchResponseDto,
  PropertiesListResponseDto,
  DealDto,
  ScheduleItemDto,
  ClientSearchItemDto,
  UnitSearchItemDto,
  PropertyMinimalDto,
} from "@/modules/deals/infrastructure/dto";
import { mapDealDtoToDomain, mapScheduleItemDtoToDomain } from "@/modules/deals/infrastructure/mappers";

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function fetchDealsList(params?: DealsListParams): Promise<Deal[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.status) query["status"] = params.status;
  if (params?.propertyId) query["property_id"] = params.propertyId;
  if (params?.clientId) query["client_id"] = params.clientId;
  if (params?.unitId) query["unit_id"] = params.unitId;

  const res = await apiClient.get<DealsListResponseDto>("/api/v1/deals", query);
  const items = getResponseItems<DealDto>(normalizeApiKeys(res));
  return items.map(mapDealDtoToDomain);
}

export async function fetchDealDetail(id: string): Promise<Deal> {
  const res = await apiClient.get<DealDetailResponseDto>(`/api/v1/deals/${id}`);
  return mapDealDtoToDomain(getResponseData<DealDto>(normalizeApiKeys(res)));
}

export async function createDeal(input: CreateDealInput): Promise<Deal> {
  const body: CreateDealRequestDto = {
    client_id: input.clientId,
    unit_id: input.unitId,
    payment_type: input.paymentType,
    total_amount: input.totalAmount,
    currency: input.currency,
  };
  if (input.discountAmount !== undefined) body.discount_amount = input.discountAmount;
  if (input.discountReason !== undefined) body.discount_reason = input.discountReason;
  if (input.downPayment !== undefined) body.down_payment = input.downPayment;
  if (input.installmentMonths !== undefined) body.installment_months = input.installmentMonths;
  if (input.installmentFrequency !== undefined) body.installment_frequency = input.installmentFrequency;
  if (input.mortgageBank !== undefined) body.mortgage_bank = input.mortgageBank;
  if (input.mortgageRate !== undefined) body.mortgage_rate = input.mortgageRate;
  if (input.notes !== undefined) body.notes = input.notes;

  const res = await apiClient.post<DealDetailResponseDto>("/api/v1/deals", body);
  return mapDealDtoToDomain(getResponseData<DealDto>(normalizeApiKeys(res)));
}

export async function activateDeal(id: string): Promise<Deal> {
  const res = await apiClient.post<DealDetailResponseDto>(`/api/v1/deals/${id}/activate`, {});
  return mapDealDtoToDomain(getResponseData<DealDto>(normalizeApiKeys(res)));
}

export async function completeDeal(id: string): Promise<Deal> {
  const res = await apiClient.post<DealDetailResponseDto>(`/api/v1/deals/${id}/complete`, {});
  return mapDealDtoToDomain(getResponseData<DealDto>(normalizeApiKeys(res)));
}

export async function cancelDeal(id: string, input?: CancelDealInput | undefined): Promise<Deal> {
  const body: Record<string, unknown> = {};
  if (input) {
    body.reason = input.reason;
    body.refund_type = input.refundType;
    body.force = input.force;
    if (input.penaltyAmount !== undefined) body.penalty_amount = input.penaltyAmount;
    if (input.penaltyReason !== undefined) body.penalty_reason = input.penaltyReason;
  }
  const res = await apiClient.post<DealDetailResponseDto>(`/api/v1/deals/${id}/cancel`, body);
  return mapDealDtoToDomain(getResponseData<DealDto>(normalizeApiKeys(res)));
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function fetchDealSchedule(dealId: string): Promise<ScheduleItem[]> {
  const res = await apiClient.get<ScheduleResponseDto>(`/api/v1/deals/${dealId}/schedule`);
  const items = getResponseItems<ScheduleItemDto>(normalizeApiKeys(res));
  return items.map(mapScheduleItemDtoToDomain);
}

export async function regenerateSchedule(dealId: string): Promise<ScheduleItem[]> {
  const res = await apiClient.post<ScheduleResponseDto>(`/api/v1/deals/${dealId}/schedule/regenerate`, {});
  const items = getResponseItems<ScheduleItemDto>(normalizeApiKeys(res));
  return items.map(mapScheduleItemDtoToDomain);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  dealId: string;
  scheduleItemId: string | null;
  amount: number;
  currency: string;
  paymentMethod: "cash" | "bank_transfer" | "mobile" | "barter";
  barterDescription: string | null;
  status: "pending" | "confirmed" | "rejected";
  notes: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

function mapPaymentDto(item: PaymentDto): Payment {
  return {
    id: item.id,
    dealId: item.deal_id,
    scheduleItemId: item.schedule_item_id ?? null,
    amount: Number(item.amount ?? 0),
    currency: String(item.currency ?? "USD"),
    paymentMethod: item.payment_method,
    barterDescription: item.barter_description ?? null,
    status: item.status,
    notes: item.notes ?? null,
    createdAt: item.created_at,
    confirmedAt: item.confirmed_at ?? null,
  };
}

export async function fetchDealPayments(dealId: string): Promise<Payment[]> {
  const res = await apiClient.get<{ data: { items: PaymentDto[] } }>("/api/v1/payments", { deal_id: dealId });
  const items = getResponseItems<PaymentDto>(normalizeApiKeys(res));
  return items.map(mapPaymentDto);
}

export async function fetchClientPayments(clientId: string): Promise<Payment[]> {
  const res = await apiClient.get<{ data: { items: PaymentDto[] } }>("/api/v1/payments", { client_id: clientId, limit: 100 });
  const items = getResponseItems<PaymentDto>(normalizeApiKeys(res));
  return items.map(mapPaymentDto);
}

export async function receivePayment(input: ReceivePaymentInput): Promise<Payment> {
  const body: ReceivePaymentRequestDto = {
    deal_id: input.dealId,
    client_id: input.clientId,
    amount: input.amount,
    currency: input.currency,
    payment_method: input.paymentMethod,
  };
  if (input.scheduleItemId !== undefined) body.schedule_item_id = input.scheduleItemId;
  if (input.barterDescription !== undefined) body.barter_description = input.barterDescription;
  if (input.accountId !== undefined) body.account_id = input.accountId;
  if (input.notes !== undefined) body.notes = input.notes;
  const res = await apiClient.post<PaymentDetailResponseDto>("/api/v1/payments", body);
  return mapPaymentDto(getResponseData<PaymentDto>(normalizeApiKeys(res)));
}

// ─── Client search ────────────────────────────────────────────────────────────

export interface ClientSearchResult {
  id: string;
  fullName: string;
  phone: string;
}

export async function searchClients(search: string): Promise<ClientSearchResult[]> {
  const res = await apiClient.get<ClientSearchResponseDto>("/api/v1/clients", { search, limit: 20 });
  const items = getResponseItems<ClientSearchItemDto>(normalizeApiKeys(res));
  return items.map((item) => ({
    id: item.id,
    fullName: item.full_name,
    phone: item.phone,
  }));
}

// ─── Unit search ──────────────────────────────────────────────────────────────

export interface UnitSearchResult {
  id: string;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
  rooms: number | null;
  totalArea: number | null;
  basePrice: number | null;
}

export async function fetchAvailableUnits(propertyId: string): Promise<UnitSearchResult[]> {
  const res = await apiClient.get<UnitSearchResponseDto>("/api/v1/units", {
    property_id: propertyId,
    status: "available",
    limit: 100,
  });
  const items = getResponseItems<UnitSearchItemDto>(normalizeApiKeys(res));
  return items.map((item) => ({
    id: item.id,
    unitNumber: item.unit_number,
    propertyId: item.property_id,
    propertyName: item.property_name,
    rooms: item.rooms ?? null,
    totalArea: item.total_area ?? null,
    basePrice: item.base_price ?? null,
  }));
}

// ─── Properties list ──────────────────────────────────────────────────────────

export interface PropertyMinimal {
  id: string;
  name: string;
}

export async function fetchPropertiesMinimal(): Promise<PropertyMinimal[]> {
  const res = await apiClient.get<PropertiesListResponseDto>("/api/v1/properties", { limit: 100 });
  const items = getResponseItems<PropertyMinimalDto>(normalizeApiKeys(res));
  return items.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

// ─── Schedule item editing ───────────────────────────────────────────────────

export interface UpdateScheduleItemInput {
  dueDate?: string | undefined;
  plannedAmount?: number | undefined;
}

export async function updateScheduleItem(
  dealId: string,
  itemId: string,
  input: UpdateScheduleItemInput,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.dueDate !== undefined) body["due_date"] = input.dueDate;
  if (input.plannedAmount !== undefined) body["planned_amount"] = input.plannedAmount;
  await apiClient.patch(`/api/v1/deals/${dealId}/schedule/${itemId}`, body);
}

// ─── Payment confirm/reject ──────────────────────────────────────────────────

export async function confirmPayment(paymentId: string): Promise<void> {
  await apiClient.post(`/api/v1/payments/${paymentId}/confirm`, {});
}

export async function rejectPayment(paymentId: string): Promise<void> {
  await apiClient.post(`/api/v1/payments/${paymentId}/reject`, {});
}
