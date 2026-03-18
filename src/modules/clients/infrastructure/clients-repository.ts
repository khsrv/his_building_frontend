import { apiClient } from "@/shared/lib/http/api-client";
import type {
  Client,
  Interaction,
  PipelineStage,
  PipelineBoardStage,
  CreateClientInput,
  UpdateClientInput,
  AddInteractionInput,
  ClientsListParams,
  PipelineBoardParams,
  ClientSource,
  InteractionType,
} from "@/modules/clients/domain/client";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface ClientDto {
  id: string;
  full_name: string;
  phone: string;
  extra_phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  email: string | null;
  address: string | null;
  source: string;
  pipeline_stage_id: string | null;
  pipeline_stage_name: string | null;
  manager_id: string | null;
  manager_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface InteractionDto {
  id: string;
  client_id: string;
  type: string;
  notes: string;
  next_contact_date: string | null;
  created_by_name: string;
  created_at: string;
}

interface PipelineStageDto {
  id: string;
  name: string;
  color: string;
  order: number;
  clients_count: number;
}

interface PipelineBoardStageDto {
  id: string;
  name: string;
  color: string;
  order: number;
  clients: ClientDto[];
}

interface ClientsListResponseDto {
  data: {
    items: ClientDto[];
    pagination: { total: number; page: number; limit: number };
  };
}

interface ClientDetailResponseDto {
  data: ClientDto;
}

interface InteractionsListResponseDto {
  data: InteractionDto[];
}

interface PipelineStagesResponseDto {
  data: PipelineStageDto[];
}

interface PipelineBoardResponseDto {
  data: {
    stages: PipelineBoardStageDto[];
  };
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function isClientSource(value: string): value is ClientSource {
  return [
    "website",
    "phone",
    "walk_in",
    "referral",
    "broker",
    "social_media",
    "advertising",
    "other",
  ].includes(value);
}

function isInteractionType(value: string): value is InteractionType {
  return ["call", "meeting", "message", "email", "other"].includes(value);
}

function mapClientDto(dto: ClientDto): Client {
  return {
    id: dto.id,
    fullName: dto.full_name,
    phone: dto.phone,
    extraPhone: dto.extra_phone,
    whatsapp: dto.whatsapp,
    telegram: dto.telegram,
    email: dto.email,
    address: dto.address,
    source: isClientSource(dto.source) ? dto.source : "other",
    pipelineStageId: dto.pipeline_stage_id,
    pipelineStageName: dto.pipeline_stage_name,
    managerId: dto.manager_id,
    managerName: dto.manager_name,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}

function mapInteractionDto(dto: InteractionDto): Interaction {
  return {
    id: dto.id,
    clientId: dto.client_id,
    type: isInteractionType(dto.type) ? dto.type : "other",
    notes: dto.notes,
    nextContactDate: dto.next_contact_date,
    createdByName: dto.created_by_name,
    createdAt: dto.created_at,
  };
}

function mapPipelineStageDto(dto: PipelineStageDto): PipelineStage {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color,
    order: dto.order,
    clientsCount: dto.clients_count,
  };
}

function mapPipelineBoardStageDto(dto: PipelineBoardStageDto): PipelineBoardStage {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color,
    order: dto.order,
    clients: dto.clients.map(mapClientDto),
  };
}

// ─── Repository functions ──────────────────────────────────────────────────────

export interface ClientsListResult {
  items: readonly Client[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchClientsList(params?: ClientsListParams): Promise<ClientsListResult> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;
  if (params?.source) query["source"] = params.source;
  if (params?.managerId) query["manager_id"] = params.managerId;
  if (params?.pipelineStageId) query["pipeline_stage_id"] = params.pipelineStageId;

  const res = await apiClient.get<ClientsListResponseDto>("/api/v1/clients", query);
  return {
    items: res.data.items.map(mapClientDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function fetchClientDetail(id: string): Promise<Client> {
  const res = await apiClient.get<ClientDetailResponseDto>(`/api/v1/clients/${id}`);
  return mapClientDto(res.data);
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const body: Record<string, unknown> = {
    full_name: input.fullName,
    phone: input.phone,
    source: input.source,
  };
  if (input.extraPhone !== undefined) body["extra_phone"] = input.extraPhone;
  if (input.whatsapp !== undefined) body["whatsapp"] = input.whatsapp;
  if (input.telegram !== undefined) body["telegram"] = input.telegram;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.pipelineStageId !== undefined) body["pipeline_stage_id"] = input.pipelineStageId;
  if (input.managerId !== undefined) body["manager_id"] = input.managerId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<ClientDetailResponseDto>("/api/v1/clients", body);
  return mapClientDto(res.data);
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const body: Record<string, unknown> = {};
  if (input.fullName !== undefined) body["full_name"] = input.fullName;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.extraPhone !== undefined) body["extra_phone"] = input.extraPhone;
  if (input.whatsapp !== undefined) body["whatsapp"] = input.whatsapp;
  if (input.telegram !== undefined) body["telegram"] = input.telegram;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.source !== undefined) body["source"] = input.source;
  if (input.pipelineStageId !== undefined) body["pipeline_stage_id"] = input.pipelineStageId;
  if (input.managerId !== undefined) body["manager_id"] = input.managerId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.patch<ClientDetailResponseDto>(`/api/v1/clients/${id}`, body);
  return mapClientDto(res.data);
}

export async function deleteClient(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/clients/${id}`);
}

export async function fetchClientInteractions(clientId: string): Promise<Interaction[]> {
  const res = await apiClient.get<InteractionsListResponseDto>(
    `/api/v1/clients/${clientId}/interactions`,
  );
  return res.data.map(mapInteractionDto);
}

export async function addClientInteraction(
  clientId: string,
  input: AddInteractionInput,
): Promise<Interaction> {
  const body: Record<string, unknown> = {
    type: input.type,
    notes: input.notes,
  };
  if (input.nextContactDate !== undefined) body["next_contact_date"] = input.nextContactDate;

  const res = await apiClient.post<{ data: InteractionDto }>(
    `/api/v1/clients/${clientId}/interactions`,
    body,
  );
  return mapInteractionDto(res.data);
}

export async function fetchPipelineStages(): Promise<PipelineStage[]> {
  const res = await apiClient.get<PipelineStagesResponseDto>("/api/v1/pipeline-stages");
  return res.data.map(mapPipelineStageDto);
}

export async function fetchPipelineBoard(params?: PipelineBoardParams): Promise<PipelineBoardStage[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params?.managerId) query["manager_id"] = params.managerId;
  if (params?.source) query["source"] = params.source;

  const res = await apiClient.get<PipelineBoardResponseDto>("/api/v1/pipeline/board", query);
  return res.data.stages.map(mapPipelineBoardStageDto);
}

export async function moveClientStage(clientId: string, stageId: string): Promise<void> {
  await apiClient.patch(`/api/v1/clients/${clientId}/stage`, { stage_id: stageId });
}

// ─── Assign manager ──────────────────────────────────────────────────────────

export async function assignManager(clientId: string, managerId: string): Promise<void> {
  await apiClient.patch(`/api/v1/clients/${clientId}`, { manager_id: managerId });
}

// ─── Pipeline stage CRUD ─────────────────────────────────────────────────────

export interface CreatePipelineStageInput {
  name: string;
  slug: string;
  color?: string | undefined;
  sortOrder?: number | undefined;
  isFinal?: boolean | undefined;
  isDefault?: boolean | undefined;
}

export interface UpdatePipelineStageInput {
  name?: string | undefined;
  color?: string | undefined;
  sortOrder?: number | undefined;
  isFinal?: boolean | undefined;
}

interface PipelineStageDetailDto {
  id: string;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
  is_final: boolean;
  is_default: boolean;
  clients_count: number;
  created_at: string;
}

export interface PipelineStageDetail {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly color: string;
  readonly sortOrder: number;
  readonly isFinal: boolean;
  readonly isDefault: boolean;
  readonly clientsCount: number;
  readonly createdAt: string;
}

function mapPipelineStageDetailDto(dto: PipelineStageDetailDto): PipelineStageDetail {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    color: dto.color,
    sortOrder: dto.sort_order,
    isFinal: dto.is_final,
    isDefault: dto.is_default,
    clientsCount: dto.clients_count,
    createdAt: dto.created_at,
  };
}

export async function fetchPipelineStagesDetail(): Promise<PipelineStageDetail[]> {
  const res = await apiClient.get<{ data: PipelineStageDetailDto[] }>("/api/v1/pipeline-stages");
  return res.data.map(mapPipelineStageDetailDto);
}

export async function createPipelineStage(input: CreatePipelineStageInput): Promise<PipelineStageDetail> {
  const body: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
  };
  if (input.color !== undefined) body["color"] = input.color;
  if (input.sortOrder !== undefined) body["sort_order"] = input.sortOrder;
  if (input.isFinal !== undefined) body["is_final"] = input.isFinal;
  if (input.isDefault !== undefined) body["is_default"] = input.isDefault;

  const res = await apiClient.post<{ data: PipelineStageDetailDto }>("/api/v1/pipeline-stages", body);
  return mapPipelineStageDetailDto(res.data);
}

export async function updatePipelineStage(
  id: string,
  input: UpdatePipelineStageInput,
): Promise<PipelineStageDetail> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.color !== undefined) body["color"] = input.color;
  if (input.sortOrder !== undefined) body["sort_order"] = input.sortOrder;
  if (input.isFinal !== undefined) body["is_final"] = input.isFinal;

  const res = await apiClient.patch<{ data: PipelineStageDetailDto }>(
    `/api/v1/pipeline-stages/${id}`,
    body,
  );
  return mapPipelineStageDetailDto(res.data);
}

export async function deletePipelineStage(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/pipeline-stages/${id}`);
}
