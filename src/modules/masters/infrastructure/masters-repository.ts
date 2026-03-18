import { apiClient } from "@/shared/lib/http/api-client";
import type {
  Master,
  WorkOrder,
  MasterType,
  WorkOrderStatus,
  CreateMasterInput,
  UpdateMasterInput,
  CreateWorkOrderInput,
  CompleteWorkOrderInput,
  MastersListParams,
  WorkOrdersListParams,
} from "@/modules/masters/domain/master";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface MasterDto {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  specialization: string | null;
  daily_rate: number | null;
  created_at: string;
}

interface WorkOrderDto {
  id: string;
  master_id: string;
  master_name: string;
  property_id: string;
  property_name: string;
  description: string;
  status: string;
  planned_amount: number;
  actual_amount: number | null;
  planned_start_date: string;
  planned_end_date: string | null;
  actual_end_date: string | null;
  notes: string | null;
  created_at: string;
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

const VALID_MASTER_TYPES: readonly MasterType[] = ["individual", "brigade"];
const VALID_WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = [
  "draft", "in_progress", "completed", "accepted",
];

function toMasterType(value: string): MasterType {
  return (VALID_MASTER_TYPES as readonly string[]).includes(value)
    ? (value as MasterType)
    : "individual";
}

function toWorkOrderStatus(value: string): WorkOrderStatus {
  return (VALID_WORK_ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as WorkOrderStatus)
    : "draft";
}

function mapMasterDto(dto: MasterDto): Master {
  return {
    id: dto.id,
    name: dto.name,
    type: toMasterType(dto.type),
    phone: dto.phone,
    specialization: dto.specialization,
    dailyRate: dto.daily_rate,
    createdAt: dto.created_at,
  };
}

function mapWorkOrderDto(dto: WorkOrderDto): WorkOrder {
  return {
    id: dto.id,
    masterId: dto.master_id,
    masterName: dto.master_name,
    propertyId: dto.property_id,
    propertyName: dto.property_name,
    description: dto.description,
    status: toWorkOrderStatus(dto.status),
    plannedAmount: dto.planned_amount,
    actualAmount: dto.actual_amount,
    plannedStartDate: dto.planned_start_date,
    plannedEndDate: dto.planned_end_date,
    actualEndDate: dto.actual_end_date,
    notes: dto.notes,
    createdAt: dto.created_at,
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

  const res = await apiClient.get<PaginatedResponseDto<MasterDto>>(
    "/api/v1/masters",
    query,
  );
  return {
    items: res.data.items.map(mapMasterDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createMaster(input: CreateMasterInput): Promise<Master> {
  const body: Record<string, unknown> = {
    name: input.name,
    type: input.type,
  };
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.specialization !== undefined) body["specialization"] = input.specialization;
  if (input.dailyRate !== undefined) body["daily_rate"] = input.dailyRate;

  const res = await apiClient.post<SingleResponseDto<MasterDto>>("/api/v1/masters", body);
  return mapMasterDto(res.data);
}

export async function updateMaster(
  id: string,
  input: UpdateMasterInput,
): Promise<Master> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.type !== undefined) body["type"] = input.type;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.specialization !== undefined) body["specialization"] = input.specialization;
  if (input.dailyRate !== undefined) body["daily_rate"] = input.dailyRate;

  const res = await apiClient.patch<SingleResponseDto<MasterDto>>(
    `/api/v1/masters/${id}`,
    body,
  );
  return mapMasterDto(res.data);
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

  const res = await apiClient.get<PaginatedResponseDto<WorkOrderDto>>(
    "/api/v1/work-orders",
    query,
  );
  return {
    items: res.data.items.map(mapWorkOrderDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const body: Record<string, unknown> = {
    master_id: input.masterId,
    property_id: input.propertyId,
    description: input.description,
    planned_amount: input.plannedAmount,
    planned_start_date: input.plannedStartDate,
  };
  if (input.plannedEndDate !== undefined) body["planned_end_date"] = input.plannedEndDate;

  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    "/api/v1/work-orders",
    body,
  );
  return mapWorkOrderDto(res.data);
}

export async function startWorkOrder(id: string): Promise<WorkOrder> {
  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    `/api/v1/work-orders/${id}/start`,
    {},
  );
  return mapWorkOrderDto(res.data);
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
  return mapWorkOrderDto(res.data);
}

export async function acceptWorkOrder(id: string): Promise<WorkOrder> {
  const res = await apiClient.post<SingleResponseDto<WorkOrderDto>>(
    `/api/v1/work-orders/${id}/accept`,
    {},
  );
  return mapWorkOrderDto(res.data);
}
