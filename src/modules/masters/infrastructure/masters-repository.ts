import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  getResponsePagination,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type {
  Master,
  WorkOrder,
  WorkOrderStatus,
  CreateMasterInput,
  UpdateMasterInput,
  CreateWorkOrderInput,
  CompleteWorkOrderInput,
  MastersListParams,
  WorkOrdersListParams,
} from "@/modules/masters/domain/master";

// ─── DTOs (snake_case — matches backend API) ────────────────────────────────

interface MasterDto {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string | null;
  specialization: string | null;
  company_name: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface WorkOrderDto {
  id: string;
  tenant_id: string;
  master_id: string;
  property_id: string | null;
  title: string;
  description: string;
  planned_amount: number;
  actual_amount: number | null;
  currency: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  accepted_at: string | null;
  accepted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponseDto<T> {
  data: {
    items: T[];
    pagination: { total: number; page: number; limit: number };
  };
}

interface SingleResponseDto<T> {
  data: T;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const VALID_WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = [
  "draft", "in_progress", "completed", "accepted",
];

function toWorkOrderStatus(value: string): WorkOrderStatus {
  return (VALID_WORK_ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as WorkOrderStatus)
    : "draft";
}

function mapMasterDto(dto: MasterDto): Master {
  return {
    id: dto.id,
    name: dto.full_name,
    type: dto.company_name ? "brigade" : "individual",
    phone: dto.phone || null,
    specialization: dto.specialization || null,
    companyName: dto.company_name || null,
    notes: dto.notes || null,
    isActive: dto.is_active,
    dailyRate: null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapWorkOrderDto(dto: WorkOrderDto): WorkOrder {
  return {
    id: dto.id,
    masterId: dto.master_id,
    masterName: "",
    propertyId: dto.property_id ?? "",
    propertyName: "",
    title: dto.title,
    description: dto.description,
    status: toWorkOrderStatus(dto.status),
    plannedAmount: dto.planned_amount,
    actualAmount: dto.actual_amount,
    currency: dto.currency,
    startedAt: dto.started_at,
    completedAt: dto.completed_at,
    acceptedAt: dto.accepted_at,
    acceptedBy: dto.accepted_by,
    notes: dto.notes,
    plannedStartDate: dto.started_at ?? dto.created_at,
    plannedEndDate: dto.completed_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

// ─── List result types ────────────────────────────────────────────────────────

export interface MastersListResult {
  items: readonly Master[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkOrdersListResult {
  items: readonly WorkOrder[];
  total: number;
  page: number;
  limit: number;
}

// ─── Repository functions ─────────────────────────────────────────────────────

export async function fetchMastersList(
  params?: MastersListParams,
): Promise<MastersListResult> {
  const query: Record<string, string | number | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;

  const res = await apiClient.get<PaginatedResponseDto<MasterDto>>("/api/v1/masters", query);
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<MasterDto>(normalized).filter((item): item is MasterDto => Boolean(item?.id));
  const pagination = getResponsePagination(normalized);
  return {
    items: items.map(mapMasterDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createMaster(input: CreateMasterInput): Promise<Master> {
  const body: Record<string, unknown> = {
    full_name: input.fullName,
  };
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.specialization !== undefined) body["specialization"] = input.specialization;
  if (input.companyName !== undefined) body["company_name"] = input.companyName;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<MasterDto>>("/api/v1/masters", body);
  return mapMasterDto(getResponseData<MasterDto>(normalizeApiKeys(res)));
}

export async function updateMaster(
  id: string,
  input: UpdateMasterInput,
): Promise<Master> {
  const body: Record<string, unknown> = {};
  if (input.fullName !== undefined) body["full_name"] = input.fullName;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.specialization !== undefined) body["specialization"] = input.specialization;
  if (input.companyName !== undefined) body["company_name"] = input.companyName;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.patch<SingleResponseDto<MasterDto>>(
    `/api/v1/masters/${id}`,
    body,
  );
  return mapMasterDto(getResponseData<MasterDto>(normalizeApiKeys(res)));
}

export async function deleteMaster(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/masters/${id}`);
}

export async function fetchWorkOrdersList(
  params?: WorkOrdersListParams,
): Promise<WorkOrdersListResult> {
  const query: Record<string, string | number | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.status) query["status"] = params.status;
  if (params?.masterId) query["master_id"] = params.masterId;
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<PaginatedResponseDto<WorkOrderDto>>("/api/v1/work-orders", query);
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<WorkOrderDto>(normalized).filter(
    (item): item is WorkOrderDto => Boolean(item?.id),
  );
  const pagination = getResponsePagination(normalized);
  return {
    items: items.map(mapWorkOrderDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const body: Record<string, unknown> = {
    master_id: input.masterId,
    title: input.title,
    planned_amount: input.plannedAmount,
    currency: input.currency ?? "USD",
  };
  if (input.description !== undefined) body["description"] = input.description;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    "/api/v1/work-orders",
    body,
  );
  return mapWorkOrderDto(getResponseData<WorkOrderDto>(normalizeApiKeys(res)));
}

export async function startWorkOrder(id: string): Promise<WorkOrder> {
  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    `/api/v1/work-orders/${id}/start`,
    {},
  );
  return mapWorkOrderDto(getResponseData<WorkOrderDto>(normalizeApiKeys(res)));
}

export async function completeWorkOrder(
  id: string,
  input: CompleteWorkOrderInput,
): Promise<WorkOrder> {
  const body: Record<string, unknown> = {
    actual_amount: input.actualAmount,
  };
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    `/api/v1/work-orders/${id}/complete`,
    body,
  );
  return mapWorkOrderDto(getResponseData<WorkOrderDto>(normalizeApiKeys(res)));
}

export async function acceptWorkOrder(id: string): Promise<WorkOrder> {
  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    `/api/v1/work-orders/${id}/accept`,
    {},
  );
  return mapWorkOrderDto(getResponseData<WorkOrderDto>(normalizeApiKeys(res)));
}
