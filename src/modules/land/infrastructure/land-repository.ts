import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData, getResponseItems, normalizeApiKeys } from "@/shared/lib/http/api-response";
import type {
  LandPlot,
  LandOwner,
  CreateLandPlotInput,
  UpdateLandPlotInput,
  CreateLandOwnerInput,
} from "@/modules/land/domain/land";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface LandPlotDto {
  id: string;
  tenant_id: string;
  property_id: string | null;
  address: string;
  cadastral_number: string | null;
  area_sqm: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface LandOwnerDto {
  id: string;
  plot_id: string;
  full_name: string;
  phone: string | null;
  passport_data: string | null;
  deal_type: string;
  money_amount: number | null;
  money_currency: string | null;
  barter_unit_id: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapLandPlotDto(dto: LandPlotDto): LandPlot {
  return {
    id: dto.id,
    address: dto.address,
    cadastralNumber: dto.cadastral_number,
    areaSqm: dto.area_sqm,
    propertyId: dto.property_id,
    propertyName: null, // API does not return joined property name
    status: dto.status,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}

function mapLandOwnerDto(dto: LandOwnerDto): LandOwner {
  return {
    id: dto.id,
    landPlotId: dto.plot_id,
    fullName: dto.full_name,
    phone: dto.phone,
    passportData: dto.passport_data,
    dealType: dto.deal_type,
    moneyAmount: dto.money_amount,
    moneyCurrency: dto.money_currency,
    barterUnitId: dto.barter_unit_id,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}

// ─── Land Plots ───────────────────────────────────────────────────────────────

export async function fetchLandPlots(propertyId?: string): Promise<LandPlot[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (propertyId) query["property_id"] = propertyId;

  const res = await apiClient.get<{ data: { items: LandPlotDto[] } }>("/api/v1/land-plots", query);
  const items = getResponseItems<LandPlotDto>(normalizeApiKeys(res));
  return items.filter((item) => Boolean(item?.id)).map(mapLandPlotDto);
}

export async function fetchLandPlot(id: string): Promise<LandPlot> {
  const res = await apiClient.get<{ data: LandPlotDto }>(`/api/v1/land-plots/${id}`);
  return mapLandPlotDto(getResponseData<LandPlotDto>(normalizeApiKeys(res)));
}

export async function createLandPlot(input: CreateLandPlotInput): Promise<LandPlot> {
  const body: Record<string, unknown> = {
    address: input.address,
  };
  if (input.cadastralNumber !== undefined) body["cadastral_number"] = input.cadastralNumber;
  if (input.areaSqm !== undefined) body["area_sqm"] = input.areaSqm;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<{ data: LandPlotDto }>("/api/v1/land-plots", body);
  return mapLandPlotDto(getResponseData<LandPlotDto>(normalizeApiKeys(res)));
}

export async function updateLandPlot(id: string, input: UpdateLandPlotInput): Promise<LandPlot> {
  const body: Record<string, unknown> = {};
  if (input.address !== undefined) body["address"] = input.address;
  if (input.cadastralNumber !== undefined) body["cadastral_number"] = input.cadastralNumber;
  if (input.areaSqm !== undefined) body["area_sqm"] = input.areaSqm;
  if (input.status !== undefined) body["status"] = input.status;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.patch<{ data: LandPlotDto }>(`/api/v1/land-plots/${id}`, body);
  return mapLandPlotDto(getResponseData<LandPlotDto>(normalizeApiKeys(res)));
}

export async function deleteLandPlot(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/land-plots/${id}`);
}

// ─── Land Owners ──────────────────────────────────────────────────────────────

export async function fetchLandOwners(plotId: string): Promise<LandOwner[]> {
  const res = await apiClient.get<{ data: { items: LandOwnerDto[] } }>(`/api/v1/land-plots/${plotId}/owners`);
  const items = getResponseItems<LandOwnerDto>(normalizeApiKeys(res));
  return items.filter((item) => Boolean(item?.id)).map(mapLandOwnerDto);
}

export async function addLandOwner(plotId: string, input: CreateLandOwnerInput): Promise<LandOwner> {
  const body: Record<string, unknown> = {
    full_name: input.fullName,
    deal_type: input.dealType,
  };
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.passportData !== undefined) body["passport_data"] = input.passportData;
  if (input.moneyAmount !== undefined) body["money_amount"] = input.moneyAmount;
  if (input.moneyCurrency !== undefined) body["money_currency"] = input.moneyCurrency;
  if (input.barterUnitId !== undefined) body["barter_unit_id"] = input.barterUnitId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<{ data: LandOwnerDto }>(`/api/v1/land-plots/${plotId}/owners`, body);
  return mapLandOwnerDto(getResponseData<LandOwnerDto>(normalizeApiKeys(res)));
}

export async function deleteLandOwner(plotId: string, ownerId: string): Promise<void> {
  await apiClient.delete(`/api/v1/land-plots/${plotId}/owners/${ownerId}`);
}
