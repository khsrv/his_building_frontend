import { apiClient } from "@/shared/lib/http/api-client";
import type { Deal, ScheduleItem, CreateDealInput, DealsListParams, ReceivePaymentInput } from "@/modules/deals/domain/deal";
import type {
  DealsListResponseDto,
  DealDetailResponseDto,
  ScheduleResponseDto,
  CreateDealRequestDto,
  ReceivePaymentRequestDto,
  PaymentDetailResponseDto,
  ClientSearchResponseDto,
  UnitSearchResponseDto,
  PropertiesListResponseDto,
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

  const res = await apiClient.get<DealsListResponseDto>("/api/v1/deals", query);
  return res.data.items.map(mapDealDtoToDomain);
}

export async function fetchDealDetail(id: string): Promise<Deal> {
  const res = await apiClient.get<DealDetailResponseDto>(`/api/v1/deals/${id}`);
  return mapDealDtoToDomain(res.data);
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
  return mapDealDtoToDomain(res.data);
}

export async function activateDeal(id: string): Promise<Deal> {
  const res = await apiClient.post<DealDetailResponseDto>(`/api/v1/deals/${id}/activate`, {});
  return mapDealDtoToDomain(res.data);
}

export async function completeDeal(id: string): Promise<Deal> {
  const res = await apiClient.post<DealDetailResponseDto>(`/api/v1/deals/${id}/complete`, {});
  return mapDealDtoToDomain(res.data);
}

export async function cancelDeal(id: string): Promise<Deal> {
  const res = await apiClient.post<DealDetailResponseDto>(`/api/v1/deals/${id}/cancel`, {});
  return mapDealDtoToDomain(res.data);
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function fetchDealSchedule(dealId: string): Promise<ScheduleItem[]> {
  const res = await apiClient.get<ScheduleResponseDto>(`/api/v1/deals/${dealId}/schedule`);
  return res.data.items.map(mapScheduleItemDtoToDomain);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  dealId: string;
  scheduleItemId: string | null;
  amount: number;
  currency: string;
  paymentMethod: "cash" | "bank_transfer" | "mobile";
  status: "pending" | "confirmed" | "rejected";
  notes: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

export async function fetchDealPayments(dealId: string): Promise<Payment[]> {
  const res = await apiClient.get<{ data: { items: import("@/modules/deals/infrastructure/dto").PaymentDto[] } }>("/api/v1/payments", {
    deal_id: dealId,
  });
  return res.data.items.map((item) => ({
    id: item.id,
    dealId: item.deal_id,
    scheduleItemId: item.schedule_item_id,
    amount: item.amount,
    currency: item.currency,
    paymentMethod: item.payment_method,
    status: item.status,
    notes: item.notes,
    createdAt: item.created_at,
    confirmedAt: item.confirmed_at,
  }));
}

export async function receivePayment(input: ReceivePaymentInput): Promise<void> {
  const body: ReceivePaymentRequestDto = {
    deal_id: input.dealId,
    amount: input.amount,
    currency: input.currency,
    payment_method: input.paymentMethod,
  };
  if (input.scheduleItemId !== undefined) body.schedule_item_id = input.scheduleItemId;
  if (input.accountId !== undefined) body.account_id = input.accountId;
  if (input.notes !== undefined) body.notes = input.notes;
  await apiClient.post<PaymentDetailResponseDto>("/api/v1/payments", body);
}

// ─── Client search ────────────────────────────────────────────────────────────

export interface ClientSearchResult {
  id: string;
  fullName: string;
  phone: string;
}

export async function searchClients(search: string): Promise<ClientSearchResult[]> {
  const res = await apiClient.get<ClientSearchResponseDto>("/api/v1/clients", {
    search,
    limit: 20,
  });
  return res.data.items.map((item) => ({
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
  return res.data.items.map((item) => ({
    id: item.id,
    unitNumber: item.unit_number,
    propertyId: item.property_id,
    propertyName: item.property_name,
    rooms: item.rooms,
    totalArea: item.total_area,
    basePrice: item.base_price,
  }));
}

// ─── Properties list ──────────────────────────────────────────────────────────

export interface PropertyMinimal {
  id: string;
  name: string;
}

export async function fetchPropertiesMinimal(): Promise<PropertyMinimal[]> {
  const res = await apiClient.get<PropertiesListResponseDto>("/api/v1/properties", {
    limit: 100,
  });
  return res.data.items.map((item) => ({
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
