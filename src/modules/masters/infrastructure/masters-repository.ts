import { apiClient } from "@/shared/lib/http/api-client";
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

// ─── DTOs (PascalCase — matches backend API) ────────────────────────────────

interface MasterDto {
  ID: string;
  TenantID: string;
  FullName: string;
  Phone: string | null;
  Specialization: string | null;
  CompanyName: string | null;
  Notes: string | null;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

interface WorkOrderDto {
  ID: string;
  TenantID: string;
  MasterID: string;
  PropertyID: string;
  Title: string;
  Description: string;
  PlannedAmount: number;
  ActualAmount: number | null;
  Currency: string;
  Status: string;
  StartedAt: string | null;
  CompletedAt: string | null;
  AcceptedAt: string | null;
  AcceptedBy: string | null;
  Notes: string | null;
  CreatedAt: string;
  UpdatedAt: string;
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
    id: dto.ID,
    name: dto.FullName,
    type: dto.CompanyName ? "brigade" : "individual",
    phone: dto.Phone,
    specialization: dto.Specialization,
    companyName: dto.CompanyName,
    notes: dto.Notes,
    isActive: dto.IsActive,
    dailyRate: null,
    createdAt: dto.CreatedAt,
    updatedAt: dto.UpdatedAt,
  };
}

function mapWorkOrderDto(dto: WorkOrderDto): WorkOrder {
  return {
    id: dto.ID,
    masterId: dto.MasterID,
    masterName: "",
    propertyId: dto.PropertyID,
    propertyName: "",
    title: dto.Title,
    description: dto.Description,
    status: toWorkOrderStatus(dto.Status),
    plannedAmount: dto.PlannedAmount,
    actualAmount: dto.ActualAmount,
    currency: dto.Currency,
    startedAt: dto.StartedAt,
    completedAt: dto.CompletedAt,
    acceptedAt: dto.AcceptedAt,
    acceptedBy: dto.AcceptedBy,
    notes: dto.Notes,
    plannedStartDate: dto.StartedAt ?? dto.CreatedAt,
    plannedEndDate: dto.CompletedAt,
    createdAt: dto.CreatedAt,
    updatedAt: dto.UpdatedAt,
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
  const payload = res.data;
  const items = (payload.items ?? []).filter((item): item is MasterDto => Boolean(item?.ID));
  return {
    items: items.map(mapMasterDto),
    total: payload.pagination?.total ?? 0,
    page: payload.pagination?.page ?? 1,
    limit: payload.pagination?.limit ?? 20,
  };
}

export async function createMaster(input: CreateMasterInput): Promise<Master> {
  const body: Record<string, unknown> = {
    FullName: input.fullName,
  };
  if (input.phone !== undefined) body["Phone"] = input.phone;
  if (input.specialization !== undefined) body["Specialization"] = input.specialization;
  if (input.companyName !== undefined) body["CompanyName"] = input.companyName;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<MasterDto>>("/api/v1/masters", body);
  return mapMasterDto(res.data);
}

export async function updateMaster(
  id: string,
  input: UpdateMasterInput,
): Promise<Master> {
  const body: Record<string, unknown> = {};
  if (input.fullName !== undefined) body["FullName"] = input.fullName;
  if (input.phone !== undefined) body["Phone"] = input.phone;
  if (input.specialization !== undefined) body["Specialization"] = input.specialization;
  if (input.companyName !== undefined) body["CompanyName"] = input.companyName;
  if (input.notes !== undefined) body["Notes"] = input.notes;

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

  const res = await apiClient.get<PaginatedResponseDto<WorkOrderDto>>("/api/v1/work-orders", query);
  const payload = res.data;
  const items = (payload.items ?? []).filter((item): item is WorkOrderDto => Boolean(item?.ID));
  return {
    items: items.map(mapWorkOrderDto),
    total: payload.pagination?.total ?? 0,
    page: payload.pagination?.page ?? 1,
    limit: payload.pagination?.limit ?? 20,
  };
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const body: Record<string, unknown> = {
    MasterID: input.masterId,
    PropertyID: input.propertyId,
    Title: input.title,
    PlannedAmount: input.plannedAmount,
  };
  if (input.description !== undefined) body["Description"] = input.description;
  if (input.currency !== undefined) body["Currency"] = input.currency;
  if (input.startedAt !== undefined) body["StartedAt"] = input.startedAt;
  if (input.completedAt !== undefined) body["CompletedAt"] = input.completedAt;

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
    ActualAmount: input.actualAmount,
  };
  if (input.notes !== undefined) body["Notes"] = input.notes;

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
