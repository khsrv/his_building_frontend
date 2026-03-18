import { apiClient } from "@/shared/lib/http/api-client";
import type {
  ContractTemplate,
  SmsTemplate,
  SmsLog,
  GeneratedContract,
  CreateContractTemplateInput,
  UpdateContractTemplateInput,
  CreateSmsTemplateInput,
  SendSmsInput,
  BulkSendSmsInput,
  SmsLogListParams,
} from "@/modules/contracts/domain/contract";
import type { ApiPaginatedResponse } from "@/shared/types/api";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface ContractTemplateDto {
  id: string;
  name: string;
  template_type: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SmsTemplateDto {
  id: string;
  name: string;
  event_type: string;
  body: string;
  days_before: number | null;
  is_active: boolean;
  created_at: string;
}

interface SmsLogDto {
  id: string;
  phone: string;
  message: string;
  status: string;
  client_id: string | null;
  client_name: string | null;
  template_id: string | null;
  created_at: string;
}

interface GeneratedContractDto {
  html: string;
  deal_number: string;
  client_name: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapContractTemplateDto(dto: ContractTemplateDto): ContractTemplate {
  return {
    id: dto.id,
    name: dto.name,
    templateType: dto.template_type,
    body: dto.body,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapSmsTemplateDto(dto: SmsTemplateDto): SmsTemplate {
  return {
    id: dto.id,
    name: dto.name,
    eventType: dto.event_type,
    body: dto.body,
    daysBefore: dto.days_before,
    isActive: dto.is_active,
    createdAt: dto.created_at,
  };
}

function mapSmsLogDto(dto: SmsLogDto): SmsLog {
  return {
    id: dto.id,
    phone: dto.phone,
    message: dto.message,
    status: dto.status,
    clientId: dto.client_id,
    clientName: dto.client_name,
    templateId: dto.template_id,
    createdAt: dto.created_at,
  };
}

function mapGeneratedContractDto(dto: GeneratedContractDto): GeneratedContract {
  return {
    html: dto.html,
    dealNumber: dto.deal_number,
    clientName: dto.client_name,
  };
}

// ─── Contract Templates ───────────────────────────────────────────────────────

export async function listContractTemplates(): Promise<ContractTemplate[]> {
  const res = await apiClient.get<{ data: ContractTemplateDto[] | { items: ContractTemplateDto[]; pagination?: unknown } }>(
    "/api/v1/contract-templates",
  );
  const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
  return items.filter((item) => Boolean(item?.id)).map(mapContractTemplateDto);
}

export async function getContractTemplate(id: string): Promise<ContractTemplate> {
  const res = await apiClient.get<{ data: ContractTemplateDto }>(
    `/api/v1/contract-templates/${id}`,
  );
  return mapContractTemplateDto(res.data);
}

export async function createContractTemplate(
  input: CreateContractTemplateInput,
): Promise<ContractTemplate> {
  const body: Record<string, unknown> = {
    name: input.name,
    template_type: input.templateType,
    body: input.body,
  };

  const res = await apiClient.post<{ data: ContractTemplateDto }>(
    "/api/v1/contract-templates",
    body,
  );
  return mapContractTemplateDto(res.data);
}

export async function updateContractTemplate(
  id: string,
  input: UpdateContractTemplateInput,
): Promise<ContractTemplate> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.body !== undefined) body["body"] = input.body;
  if (input.isActive !== undefined) body["is_active"] = input.isActive;

  const res = await apiClient.patch<{ data: ContractTemplateDto }>(
    `/api/v1/contract-templates/${id}`,
    body,
  );
  return mapContractTemplateDto(res.data);
}

export async function deleteContractTemplate(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/contract-templates/${id}`);
}

export async function generateContract(
  dealId: string,
  templateId: string,
): Promise<GeneratedContract> {
  const res = await apiClient.post<{ data: GeneratedContractDto }>(
    `/api/v1/deals/${dealId}/generate-contract`,
    { template_id: templateId },
  );
  return mapGeneratedContractDto(res.data);
}

// ─── SMS Templates ────────────────────────────────────────────────────────────

export async function listSmsTemplates(): Promise<SmsTemplate[]> {
  const res = await apiClient.get<{ data: SmsTemplateDto[] | { items: SmsTemplateDto[]; pagination?: unknown } }>("/api/v1/sms-templates");
  const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
  return items.filter((item) => Boolean(item?.id)).map(mapSmsTemplateDto);
}

export async function createSmsTemplate(
  input: CreateSmsTemplateInput,
): Promise<SmsTemplate> {
  const body: Record<string, unknown> = {
    name: input.name,
    event_type: input.eventType,
    body: input.body,
  };
  if (input.daysBefore !== undefined) body["days_before"] = input.daysBefore;

  const res = await apiClient.post<{ data: SmsTemplateDto }>("/api/v1/sms-templates", body);
  return mapSmsTemplateDto(res.data);
}

// ─── SMS ──────────────────────────────────────────────────────────────────────

export async function sendSms(input: SendSmsInput): Promise<{ status: string }> {
  const body: Record<string, unknown> = {
    phone: input.phone,
    message: input.message,
  };
  if (input.clientId !== undefined) body["client_id"] = input.clientId;
  if (input.templateId !== undefined) body["template_id"] = input.templateId;

  const res = await apiClient.post<{ status: string }>("/api/v1/sms/send", body);
  return res;
}

export async function bulkSendSms(input: BulkSendSmsInput): Promise<{ status: string }> {
  const body: Record<string, unknown> = {
    phones: input.phones,
    message: input.message,
  };
  if (input.templateId !== undefined) body["template_id"] = input.templateId;

  const res = await apiClient.post<{ status: string }>("/api/v1/sms/bulk-send", body);
  return res;
}

export async function listSmsLogs(
  params?: SmsLogListParams,
): Promise<{ items: SmsLog[]; total: number }> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.status) query["status"] = params.status;
  if (params?.clientId) query["client_id"] = params.clientId;

  const res = await apiClient.get<ApiPaginatedResponse<SmsLogDto>>(
    "/api/v1/sms/logs",
    query,
  );
  return {
    items: (res.data.items ?? []).filter((item) => Boolean(item?.id)).map(mapSmsLogDto),
    total: res.data.pagination.total,
  };
}
