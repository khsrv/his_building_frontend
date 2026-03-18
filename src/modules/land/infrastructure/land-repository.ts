import { apiClient } from "@/shared/lib/http/api-client";
import type {
  LandPlot,
  LandOwner,
  CreateLandPlotInput,
  UpdateLandPlotInput,
  CreateLandOwnerInput,
} from "@/modules/land/domain/land";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface LandPlotDto {
  ID: string;
  TenantID: string;
  PropertyID: string | null;
  Address: string;
  CadastralNumber: string | null;
  AreaSqm: number | null;
  Status: string;
  Notes: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

interface LandOwnerDto {
  ID: string;
  LandPlotID: string;
  FullName: string;
  Phone: string | null;
  PassportData: string | null;
  DealType: string;
  MoneyAmount: number | null;
  MoneyCurrency: string | null;
  BarterUnitID: string | null;
  Notes: string | null;
  CreatedAt: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapLandPlotDto(dto: LandPlotDto): LandPlot {
  return {
    id: dto.ID,
    address: dto.Address,
    cadastralNumber: dto.CadastralNumber,
    areaSqm: dto.AreaSqm,
    propertyId: dto.PropertyID,
    propertyName: null, // API does not return joined property name
    status: dto.Status,
    notes: dto.Notes,
    createdAt: dto.CreatedAt,
  };
}

function mapLandOwnerDto(dto: LandOwnerDto): LandOwner {
  return {
    id: dto.ID,
    landPlotId: dto.LandPlotID,
    fullName: dto.FullName,
    phone: dto.Phone,
    passportData: dto.PassportData,
    dealType: dto.DealType,
    moneyAmount: dto.MoneyAmount,
    moneyCurrency: dto.MoneyCurrency,
    barterUnitId: dto.BarterUnitID,
    notes: dto.Notes,
    createdAt: dto.CreatedAt,
  };
}

// ─── Land Plots ───────────────────────────────────────────────────────────────

export async function fetchLandPlots(propertyId?: string): Promise<LandPlot[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (propertyId) query["PropertyID"] = propertyId;

  const res = await apiClient.get<{ data: { items: LandPlotDto[] } }>("/api/v1/land-plots", query);
  return (res.data.items ?? []).map(mapLandPlotDto);
}

export async function fetchLandPlot(id: string): Promise<LandPlot> {
  const res = await apiClient.get<{ data: { item: LandPlotDto } }>(`/api/v1/land-plots/${id}`);
  return mapLandPlotDto(res.data.item);
}

export async function createLandPlot(input: CreateLandPlotInput): Promise<LandPlot> {
  const body: Record<string, unknown> = {
    Address: input.address,
  };
  if (input.cadastralNumber !== undefined) body["CadastralNumber"] = input.cadastralNumber;
  if (input.areaSqm !== undefined) body["AreaSqm"] = input.areaSqm;
  if (input.propertyId !== undefined) body["PropertyID"] = input.propertyId;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.post<{ data: LandPlotDto }>("/api/v1/land-plots", body);
  return mapLandPlotDto(res.data);
}

export async function updateLandPlot(id: string, input: UpdateLandPlotInput): Promise<LandPlot> {
  const body: Record<string, unknown> = {};
  if (input.address !== undefined) body["Address"] = input.address;
  if (input.cadastralNumber !== undefined) body["CadastralNumber"] = input.cadastralNumber;
  if (input.areaSqm !== undefined) body["AreaSqm"] = input.areaSqm;
  if (input.status !== undefined) body["Status"] = input.status;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.patch<{ data: LandPlotDto }>(`/api/v1/land-plots/${id}`, body);
  return mapLandPlotDto(res.data);
}

export async function deleteLandPlot(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/land-plots/${id}`);
}

// ─── Land Owners ──────────────────────────────────────────────────────────────

export async function fetchLandOwners(plotId: string): Promise<LandOwner[]> {
  const res = await apiClient.get<{ data: { items: LandOwnerDto[] } }>(`/api/v1/land-plots/${plotId}/owners`);
  return (res.data.items ?? []).map(mapLandOwnerDto);
}

export async function addLandOwner(plotId: string, input: CreateLandOwnerInput): Promise<LandOwner> {
  const body: Record<string, unknown> = {
    FullName: input.fullName,
    DealType: input.dealType,
  };
  if (input.phone !== undefined) body["Phone"] = input.phone;
  if (input.passportData !== undefined) body["PassportData"] = input.passportData;
  if (input.moneyAmount !== undefined) body["MoneyAmount"] = input.moneyAmount;
  if (input.moneyCurrency !== undefined) body["MoneyCurrency"] = input.moneyCurrency;
  if (input.barterUnitId !== undefined) body["BarterUnitID"] = input.barterUnitId;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.post<{ data: LandOwnerDto }>(`/api/v1/land-plots/${plotId}/owners`, body);
  return mapLandOwnerDto(res.data);
}

export async function deleteLandOwner(plotId: string, ownerId: string): Promise<void> {
  await apiClient.delete(`/api/v1/land-plots/${plotId}/owners/${ownerId}`);
}
