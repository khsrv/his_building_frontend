import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  getResponsePagination,
  getResponseRecord,
  isApiRecord,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
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
  id?: string;
  template_id?: string;
  name?: string;
  title?: string;
  template_type?: string;
  type?: string;
  body?: string;
  content?: string;
  is_active?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SmsTemplateDto {
  id?: string;
  template_id?: string;
  name?: string;
  title?: string;
  event_type?: string;
  type?: string;
  body?: string;
  message?: string;
  days_before?: number | null;
  is_active?: boolean;
  active?: boolean;
  created_at?: string;
}

interface SmsLogDto {
  id: string;
  phone: string;
  message: string;
  status: string;
  client_id?: string | null;
  client_name?: string | null;
  template_id?: string | null;
  created_at?: string;
  sent_at?: string;
}

interface GeneratedContractDto {
  html: string;
  deal_number?: string;
  client_name?: string;
}

function pickFirstString(...values: readonly (string | null | undefined)[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function pickBoolean(primary: boolean | undefined, fallback: boolean): boolean {
  if (typeof primary === "boolean") {
    return primary;
  }
  return fallback;
}

function extractItemsFromEnvelope<T>(
  response: unknown,
  containerKeys: readonly string[],
): T[] {
  const normalized = normalizeApiKeys(response);
  const data = getResponseData<unknown>(normalized);

  const candidates: unknown[] = [data];
  if (isApiRecord(data)) {
    candidates.push(data["data"], data["result"], data["payload"], data["list"]);
    for (const key of containerKeys) {
      candidates.push(data[key]);
    }
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
    if (!isApiRecord(candidate)) {
      continue;
    }
    for (const key of containerKeys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }

  const fallback = getResponseItems<T>(data, containerKeys);
  if (fallback.length > 0) {
    return fallback;
  }

  const dataRecord = getResponseRecord(data);
  if (!dataRecord) {
    return [];
  }

  for (const [key, value] of Object.entries(dataRecord)) {
    if (!Array.isArray(value)) {
      continue;
    }
    const keyMatched = containerKeys.includes(key);
    const looksLikeObjectList =
      value.length === 0 || value.every((item) => isApiRecord(item));
    if (keyMatched || looksLikeObjectList) {
      return value as T[];
    }
  }

  return [];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapContractTemplateDto(dto: ContractTemplateDto): ContractTemplate {
  const name = pickFirstString(dto.name, dto.title, "Без названия");
  const templateType = pickFirstString(dto.template_type, dto.type, "sale");
  const body = pickFirstString(dto.body, dto.content);
  const id = pickFirstString(dto.id, dto.template_id, `${templateType}:${name}`);
  const createdAt = pickFirstString(dto.created_at, dto.updated_at);
  const updatedAt = pickFirstString(dto.updated_at, dto.created_at);

  return {
    id,
    name,
    templateType,
    body,
    isActive: pickBoolean(dto.is_active, pickBoolean(dto.active, true)),
    createdAt,
    updatedAt,
  };
}

function mapSmsTemplateDto(dto: SmsTemplateDto): SmsTemplate {
  const name = pickFirstString(dto.name, dto.title, "Без названия");
  const eventType = pickFirstString(dto.event_type, dto.type, "custom");
  const body = pickFirstString(dto.body, dto.message);
  const id = pickFirstString(dto.id, dto.template_id, `${eventType}:${name}`);

  return {
    id,
    name,
    eventType,
    body,
    daysBefore: dto.days_before ?? null,
    isActive: pickBoolean(dto.is_active, pickBoolean(dto.active, true)),
    createdAt: pickFirstString(dto.created_at),
  };
}

function mapSmsLogDto(dto: SmsLogDto): SmsLog {
  return {
    id: dto.id,
    phone: dto.phone,
    message: dto.message,
    status: dto.status,
    clientId: dto.client_id ?? null,
    clientName: dto.client_name ?? null,
    templateId: dto.template_id ?? null,
    createdAt: dto.created_at ?? dto.sent_at ?? "",
  };
}

function mapGeneratedContractDto(dto: GeneratedContractDto): GeneratedContract {
  return {
    html: dto.html,
    dealNumber: dto.deal_number ?? "",
    clientName: dto.client_name ?? "",
  };
}

// ─── Contract Templates ───────────────────────────────────────────────────────

export async function listContractTemplates(): Promise<ContractTemplate[]> {
  const res = await apiClient.get<{ data: ContractTemplateDto[] | { items: ContractTemplateDto[]; pagination?: unknown } }>(
    "/api/v1/contract-templates",
  );
  const items = extractItemsFromEnvelope<ContractTemplateDto>(res, [
    "items",
    "templates",
    "contract_templates",
    "rows",
    "columns",
  ]);
  return items.map(mapContractTemplateDto).filter((item) => item.id.length > 0);
}

export async function getContractTemplate(id: string): Promise<ContractTemplate> {
  const res = await apiClient.get<{ data: ContractTemplateDto }>(
    `/api/v1/contract-templates/${id}`,
  );
  return mapContractTemplateDto(getResponseData<ContractTemplateDto>(normalizeApiKeys(res)));
}

export async function createContractTemplate(
  input: CreateContractTemplateInput,
): Promise<ContractTemplate> {
  const body: Record<string, unknown> = {
    name: input.name,
    template_type: input.templateType,
    body: input.body,
    is_active: true,
  };

  const res = await apiClient.post<{ data: ContractTemplateDto }>(
    "/api/v1/contract-templates",
    body,
  );
  return mapContractTemplateDto(getResponseData<ContractTemplateDto>(normalizeApiKeys(res)));
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
  return mapContractTemplateDto(getResponseData<ContractTemplateDto>(normalizeApiKeys(res)));
}

export async function deleteContractTemplate(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/contract-templates/${id}`);
}

export async function generateContract(
  dealId: string,
  templateId?: string,
): Promise<GeneratedContract> {
  const body: Record<string, unknown> = {};
  if (templateId) {
    body["template_id"] = templateId;
  }
  const res = await apiClient.post<{ data: GeneratedContractDto }>(
    `/api/v1/deals/${dealId}/generate-contract`,
    body,
  );
  return mapGeneratedContractDto(getResponseData<GeneratedContractDto>(normalizeApiKeys(res)));
}

// ─── SMS Templates ────────────────────────────────────────────────────────────

export async function listSmsTemplates(): Promise<SmsTemplate[]> {
  const res = await apiClient.get<{ data: SmsTemplateDto[] | { items: SmsTemplateDto[]; pagination?: unknown } }>("/api/v1/sms-templates");
  const items = extractItemsFromEnvelope<SmsTemplateDto>(res, [
    "items",
    "templates",
    "sms_templates",
    "rows",
    "columns",
  ]);
  return items.map(mapSmsTemplateDto).filter((item) => item.id.length > 0);
}

export async function createSmsTemplate(
  input: CreateSmsTemplateInput,
): Promise<SmsTemplate> {
  const body: Record<string, unknown> = {
    name: input.name,
    event_type: input.eventType,
    body: input.body,
    is_active: true,
  };
  if (input.daysBefore !== undefined) body["days_before"] = input.daysBefore;

  const res = await apiClient.post<{ data: SmsTemplateDto }>("/api/v1/sms-templates", body);
  return mapSmsTemplateDto(getResponseData<SmsTemplateDto>(normalizeApiKeys(res)));
}

// ─── SMS ──────────────────────────────────────────────────────────────────────

export async function sendSms(input: SendSmsInput): Promise<{ status: string }> {
  const body: Record<string, unknown> = {
    phone: input.phone,
    message: input.message,
  };
  if (input.clientId !== undefined) body["client_id"] = input.clientId;
  if (input.templateId !== undefined) body["template_id"] = input.templateId;

  const res = await apiClient.post<unknown>("/api/v1/sms/send", body);
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function bulkSendSms(input: BulkSendSmsInput): Promise<{ status: string }> {
  const body: Record<string, unknown> = {
    phones: input.phones,
    message: input.message,
  };
  if (input.templateId !== undefined) body["template_id"] = input.templateId;

  const res = await apiClient.post<unknown>("/api/v1/sms/bulk-send", body);
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
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
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<SmsLogDto>(normalized);
  const pagination = getResponsePagination(normalized);
  return {
    items: items.filter((item) => Boolean(item?.id)).map(mapSmsLogDto),
    total: pagination?.total ?? items.length,
  };
}
