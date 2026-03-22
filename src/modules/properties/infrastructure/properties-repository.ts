import { apiClient } from "@/shared/lib/http/api-client";
import { httpRequest } from "@/shared/lib/http/http-client";
import { AppError } from "@/shared/lib/errors/app-error";
import {
  getResponseData,
  getResponseItems,
  getResponsePagination,
  isApiRecord,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import { mapUnitStatus, type BackendUnitStatus } from "@/shared/types/api";
import type {
  Property,
  PropertyBlock,
  ChessBoard,
  ChessUnit,
  ChessFloor,
  ChessBlock,
  ChessBoardFilters,
  PropertiesListParams,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateBlockInput,
  FloorInfo,
  UnitsListParams,
  Unit,
  UnitStatus,
  CreateUnitInput,
  BulkCreateUnitsInput,
  UpdateUnitInput,
} from "@/modules/properties/domain/property";
import type { PropertyStatus } from "@/modules/properties/domain/property";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface PropertyDto {
  id: string;
  tenant_id?: string;
  name: string;
  address?: string;
  city?: string;
  district?: string | null;
  description?: string | null;
  property_type?: string | null;
  status?: string;
  currency?: string;
  total_units?: number;
  sold_units?: number;
  realization_percent?: number;
  construction_start_date?: string | null;
  construction_end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface BlockDto {
  id: string;
  property_id: string;
  name: string;
  floors_count?: number;
  underground_floors?: number;
  sort_order?: number;
  created_at?: string;
}

interface ChessUnitDto {
  id: string;
  unit_number: string;
  unit_type: string;
  rooms: number | null;
  total_area: number | null;
  current_price: number | null;
  price_per_sqm: number | null;
  status: BackendUnitStatus;
  position: string;
}

interface ChessFloorDto {
  floor_id?: string;
  floor_number: number;
  units?: ChessUnitDto[];
}

interface ChessBlockDto {
  block_id: string;
  block_name: string;
  floors_count: number;
  floors?: ChessFloorDto[];
}

interface ChessBoardDto {
  blocks?: ChessBlockDto[];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function isPropertyStatus(value: string): value is PropertyStatus {
  return (
    value === "planning" ||
    value === "construction" ||
    value === "completed" ||
    value === "suspended"
  );
}

function mapPropertyDto(dto: PropertyDto): Property {
  const rawStatus = dto.status ?? "";
  return {
    id: dto.id,
    name: dto.name ?? "",
    address: dto.address ?? "",
    city: dto.city ?? "",
    status: isPropertyStatus(rawStatus) ? rawStatus : "planning",
    currency: dto.currency ?? "USD",
    totalUnits: Number(dto.total_units ?? 0),
    soldUnits: Number(dto.sold_units ?? 0),
    realizationPercent: Number(dto.realization_percent ?? 0),
    constructionStartDate: dto.construction_start_date ?? null,
    constructionEndDate: dto.construction_end_date ?? null,
    createdAt: dto.created_at ?? "",
  };
}

function mapBlockDto(dto: BlockDto): PropertyBlock {
  return {
    id: dto.id,
    propertyId: dto.property_id,
    name: dto.name ?? "",
    floorsCount: Number(dto.floors_count ?? 0),
  };
}

function mapChessUnitDto(dto: ChessUnitDto): ChessUnit {
  return {
    id: dto.id,
    unitNumber: dto.unit_number,
    rooms: dto.rooms ?? null,
    totalArea: dto.total_area ?? null,
    currentPrice: dto.current_price ?? null,
    pricePerSqm: dto.price_per_sqm ?? null,
    status: mapUnitStatus(dto.status),
    unitType: dto.unit_type,
    position: dto.position,
  };
}

function mapChessFloorDto(dto: ChessFloorDto): ChessFloor {
  return {
    floorId: dto.floor_id ?? null,
    floorNumber: Number(dto.floor_number ?? 0),
    units: (dto.units ?? []).map(mapChessUnitDto),
  };
}

function mapChessBlockDto(dto: ChessBlockDto): ChessBlock {
  return {
    id: dto.block_id,
    name: dto.block_name,
    floorsCount: Number(dto.floors_count ?? 0),
    floors: (dto.floors ?? []).map(mapChessFloorDto),
  };
}

function mapChessBoardDto(dto: ChessBoardDto): ChessBoard {
  return {
    blocks: (dto.blocks ?? []).map(mapChessBlockDto),
  };
}

// ─── Repository functions ─────────────────────────────────────────────────────

export async function fetchPropertiesList(
  params: PropertiesListParams,
): Promise<{ items: readonly Property[]; total: number; page: number; limit: number }> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params.page !== undefined) query["page"] = params.page;
  if (params.limit !== undefined) query["limit"] = params.limit;
  if (params.search) query["search"] = params.search;
  if (params.status) query["status"] = params.status;

  const response = await apiClient.get<unknown>("/api/v1/properties", query);
  const normalized = normalizeApiKeys(response);
  const items = getResponseItems<PropertyDto>(normalized).filter((item) => Boolean(item?.id));
  const pagination = getResponsePagination(normalized);

  return {
    items: items.map(mapPropertyDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params.page ?? 1),
    limit: pagination?.limit ?? (params.limit ?? 20),
  };
}

export async function fetchPropertyDetail(id: string): Promise<Property> {
  const response = await apiClient.get<unknown>(`/api/v1/properties/${id}`);
  return mapPropertyDto(getResponseData<PropertyDto>(normalizeApiKeys(response)));
}

export async function fetchPropertyBlocks(propertyId: string): Promise<readonly PropertyBlock[]> {
  const response = await apiClient.get<unknown>(`/api/v1/properties/${propertyId}/blocks`);
  const items = getResponseItems<BlockDto>(normalizeApiKeys(response));
  return items.map(mapBlockDto);
}

export async function fetchChessBoard(
  propertyId: string,
  filters?: ChessBoardFilters,
): Promise<ChessBoard> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (filters?.status) query["status"] = filters.status;
  if (filters?.rooms !== undefined) query["rooms"] = filters.rooms;
  if (filters?.priceMin !== undefined) query["price_min"] = filters.priceMin;
  if (filters?.priceMax !== undefined) query["price_max"] = filters.priceMax;

  const response = await apiClient.get<unknown>(`/api/v1/properties/${propertyId}/chessboard`, query);
  const normalized = normalizeApiKeys(response);
  const data = getResponseData<unknown>(normalized);

  if (isApiRecord(data) && Array.isArray(data["blocks"])) {
    return mapChessBoardDto({ blocks: data["blocks"] as ChessBlockDto[] });
  }

  return mapChessBoardDto(data as ChessBoardDto);
}

// ─── Unit status actions ──────────────────────────────────────────────────────

type UnitAction = "book" | "release" | "reserve" | "mark_sold";

export interface UnitStatusPayload {
  action: UnitAction;
  clientId?: string | undefined;
  comment?: string | undefined;
}

export async function updateUnitStatus(
  unitId: string,
  action: UnitAction,
  options?: { clientId?: string | undefined; comment?: string | undefined },
): Promise<void> {
  const body: Record<string, unknown> = { action };
  if (options?.clientId) body.client_id = options.clientId;
  if (options?.comment) body.comment = options.comment;
  await apiClient.patch(
    `/api/v1/units/${unitId}/status`,
    body,
  );
}

// ─── Unit DTOs & mappers ─────────────────────────────────────────────────────

interface UnitDto {
  id: string;
  property_id: string;
  block_id: string;
  floor_id: string;
  unit_number: string;
  unit_type: string;
  floor_number: number;
  rooms: number | null;
  total_area: number | null;
  living_area: number | null;
  kitchen_area: number | null;
  balcony_area: number | null;
  base_price: number | null;
  current_price: number | null;
  status: string;
  finishing: string | null;
  description: string | null;
  photo_urls?: string[] | null;
  created_at: string;
}

interface FloorDto {
  id: string;
  floor_number: number;
  units_count?: number;
}

function isUnitStatus(value: string): value is UnitStatus {
  return (
    value === "available" ||
    value === "booked" ||
    value === "reserved" ||
    value === "sold"
  );
}

function mapUnitDto(dto: UnitDto): Unit {
  return {
    id: dto.id,
    propertyId: dto.property_id,
    blockId: dto.block_id,
    floorId: dto.floor_id,
    unitNumber: dto.unit_number,
    unitType: dto.unit_type,
    floorNumber: Number(dto.floor_number ?? 0),
    rooms: dto.rooms,
    totalArea: dto.total_area,
    livingArea: dto.living_area,
    kitchenArea: dto.kitchen_area,
    balconyArea: dto.balcony_area,
    basePrice: dto.base_price,
    currentPrice: dto.current_price,
    status: isUnitStatus(dto.status) ? dto.status : "available",
    finishing: dto.finishing,
    description: dto.description,
    photoUrls: dto.photo_urls ?? [],
    createdAt: dto.created_at,
  };
}

function mapFloorDto(dto: FloorDto): FloorInfo {
  return {
    id: dto.id,
    floorNumber: Number(dto.floor_number ?? 0),
    unitsCount: Number(dto.units_count ?? 0),
  };
}

// ─── Property CRUD ───────────────────────────────────────────────────────────

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  const body: Record<string, unknown> = {
    name: input.name,
    property_type: input.propertyType,
  };
  if (input.address !== undefined) body["address"] = input.address;
  if (input.city !== undefined) body["city"] = input.city;
  if (input.district !== undefined) body["district"] = input.district;
  if (input.description !== undefined) body["description"] = input.description;
  if (input.currency !== undefined) body["currency"] = input.currency;
  if (input.constructionStartDate !== undefined) body["construction_start_date"] = input.constructionStartDate;
  if (input.constructionEndDate !== undefined) body["construction_end_date"] = input.constructionEndDate;

  const response = await apiClient.post<unknown>("/api/v1/properties", body);
  return mapPropertyDto(getResponseData<PropertyDto>(normalizeApiKeys(response)));
}

export async function updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.city !== undefined) body["city"] = input.city;
  if (input.district !== undefined) body["district"] = input.district;
  if (input.description !== undefined) body["description"] = input.description;
  if (input.status !== undefined) body["status"] = input.status;

  const response = await apiClient.patch<unknown>(`/api/v1/properties/${id}`, body);
  return mapPropertyDto(getResponseData<PropertyDto>(normalizeApiKeys(response)));
}

export async function deleteProperty(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/properties/${id}`);
}

// ─── Block CRUD ──────────────────────────────────────────────────────────────

export async function createBlock(propertyId: string, input: CreateBlockInput): Promise<PropertyBlock> {
  const body: Record<string, unknown> = {
    name: input.name,
    floors_count: input.floorsCount,
  };
  if (input.undergroundFloors !== undefined) body["underground_floors"] = input.undergroundFloors;

  const response = await apiClient.post<unknown>(
    `/api/v1/properties/${propertyId}/blocks`,
    body,
  );

  const normalized = normalizeApiKeys(response);
  const data = getResponseData<unknown>(normalized);

  if (isApiRecord(data) && isApiRecord(data["block"])) {
    return mapBlockDto(data["block"] as unknown as BlockDto);
  }

  return mapBlockDto(data as unknown as BlockDto);
}

export async function updateBlock(
  propertyId: string,
  blockId: string,
  input: { name?: string; sortOrder?: number },
): Promise<PropertyBlock> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.sortOrder !== undefined) body["sort_order"] = input.sortOrder;

  const response = await apiClient.patch<unknown>(
    `/api/v1/properties/${propertyId}/blocks/${blockId}`,
    body,
  );
  return mapBlockDto(getResponseData<BlockDto>(normalizeApiKeys(response)));
}

export async function deleteBlock(propertyId: string, blockId: string): Promise<void> {
  await apiClient.delete(`/api/v1/properties/${propertyId}/blocks/${blockId}`);
}

// ─── Floors ──────────────────────────────────────────────────────────────────

export async function fetchFloors(propertyId: string, blockId: string): Promise<FloorInfo[]> {
  const response = await apiClient.get<unknown>(`/api/v1/properties/${propertyId}/blocks/${blockId}/floors`);
  const items = getResponseItems<FloorDto>(normalizeApiKeys(response));
  return items.map(mapFloorDto);
}

// ─── Floor create response DTO ───────────────────────────────────────────────

interface CreateFloorResponseDto {
  id: string;
  block_id: string;
  floor_number: number;
  sort_order?: number;
}

export async function createFloor(
  propertyId: string,
  blockId: string,
  floorNumber?: number | undefined,
): Promise<FloorInfo> {
  const body: Record<string, unknown> = {};
  if (floorNumber !== undefined) {
    body.floor_number = floorNumber;
  }
  const response = await apiClient.post<unknown>(
    `/api/v1/properties/${propertyId}/blocks/${blockId}/floors`,
    body,
  );
  const data = getResponseData<CreateFloorResponseDto>(normalizeApiKeys(response));
  return {
    id: data.id,
    floorNumber: Number(data.floor_number ?? floorNumber ?? 0),
    unitsCount: 0,
  };
}

export async function deleteFloor(
  propertyId: string,
  blockId: string,
  floorId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/properties/${propertyId}/blocks/${blockId}/floors/${floorId}`);
  } catch (error: unknown) {
    if (
      error instanceof AppError &&
      error.status === 409
    ) {
      throw new AppError("VALIDATION", "Сначала удалите квартиры с этого этажа", 409);
    }
    throw error;
  }
}

export async function duplicateFloor(
  propertyId: string,
  blockId: string,
  floorId: string,
  newFloorNumber?: number | undefined,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (newFloorNumber !== undefined) body.new_floor_number = newFloorNumber;
  await apiClient.post<unknown>(
    `/api/v1/properties/${propertyId}/blocks/${blockId}/floors/${floorId}/duplicate`,
    body,
  );
}

// ─── Units CRUD ──────────────────────────────────────────────────────────────

export async function fetchUnit(id: string): Promise<Unit> {
  const response = await apiClient.get<unknown>(`/api/v1/units/${id}`);
  return mapUnitDto(getResponseData<UnitDto>(normalizeApiKeys(response)));
}

export async function fetchUnitsList(
  params: UnitsListParams,
): Promise<{ items: Unit[]; total: number; page: number; limit: number }> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params.page !== undefined) query["page"] = params.page;
  if (params.limit !== undefined) query["limit"] = params.limit;
  if (params.status) query["status"] = params.status;
  if (params.unitType) query["unit_type"] = params.unitType;
  if (params.propertyId) query["property_id"] = params.propertyId;
  if (params.blockId) query["block_id"] = params.blockId;
  if (params.rooms !== undefined) query["rooms"] = params.rooms;
  if (params.priceMin !== undefined) query["price_min"] = params.priceMin;
  if (params.priceMax !== undefined) query["price_max"] = params.priceMax;

  const response = await apiClient.get<unknown>("/api/v1/units", query);
  const normalized = normalizeApiKeys(response);
  const items = getResponseItems<UnitDto>(normalized).filter((item) => Boolean(item?.id));
  const pagination = getResponsePagination(normalized);

  return {
    items: items.map(mapUnitDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params.page ?? 1),
    limit: pagination?.limit ?? (params.limit ?? 20),
  };
}

export async function createUnit(input: CreateUnitInput): Promise<Unit> {
  const body: Record<string, unknown> = {
    property_id: input.propertyId,
    block_id: input.blockId,
    floor_id: input.floorId,
    unit_type: input.unitType,
    floor_number: input.floorNumber,
  };
  if (input.unitNumber) body["unit_number"] = input.unitNumber;
  if (input.rooms !== undefined) body["rooms"] = input.rooms;
  if (input.totalArea !== undefined) body["total_area"] = input.totalArea;
  if (input.livingArea !== undefined) body["living_area"] = input.livingArea;
  if (input.kitchenArea !== undefined) body["kitchen_area"] = input.kitchenArea;
  if (input.balconyArea !== undefined) body["balcony_area"] = input.balconyArea;
  if (input.basePrice !== undefined) body["base_price"] = input.basePrice;
  if (input.pricePerSqm !== undefined) body["price_per_sqm"] = input.pricePerSqm;
  if (input.finishing !== undefined) body["finishing"] = input.finishing;
  if (input.description !== undefined) body["description"] = input.description;

  const response = await apiClient.post<unknown>("/api/v1/units", body);
  return mapUnitDto(getResponseData<UnitDto>(normalizeApiKeys(response)));
}

export async function bulkCreateUnits(
  input: BulkCreateUnitsInput,
): Promise<{ count: number }> {
  const body: Record<string, unknown> = {
    property_id: input.propertyId,
    block_id: input.blockId,
    floor_id: input.floorId,
    floor_number: input.floorNumber,
    unit_type: input.unitType,
    number_from: input.numberFrom,
    number_to: input.numberTo,
  };
  if (input.rooms !== undefined) body["rooms"] = input.rooms;
  if (input.totalArea !== undefined) body["total_area"] = input.totalArea;
  if (input.basePrice !== undefined) body["base_price"] = input.basePrice;
  if (input.pricePerSqm !== undefined) body["price_per_sqm"] = input.pricePerSqm;
  if (input.prefix !== undefined) body["prefix"] = input.prefix;

  const response = await apiClient.post<unknown>("/api/v1/units/bulk", body);
  const normalized = normalizeApiKeys(response);
  const data = getResponseData<unknown>(normalized);
  const items = getResponseItems<UnitDto>(normalized);

  if (!isApiRecord(data)) {
    return { count: items.length };
  }

  const countRaw = data["count"] ?? data["created"] ?? items.length;
  const count = Number(countRaw);
  return {
    count: Number.isFinite(count) ? count : items.length,
  };
}

export async function updateUnit(id: string, input: UpdateUnitInput): Promise<Unit> {
  const body: Record<string, unknown> = {};
  if (input.rooms !== undefined) body["rooms"] = input.rooms;
  if (input.totalArea !== undefined) body["total_area"] = input.totalArea;
  if (input.livingArea !== undefined) body["living_area"] = input.livingArea;
  if (input.kitchenArea !== undefined) body["kitchen_area"] = input.kitchenArea;
  if (input.balconyArea !== undefined) body["balcony_area"] = input.balconyArea;
  if (input.basePrice !== undefined) body["base_price"] = input.basePrice;
  if (input.pricePerSqm !== undefined) body["price_per_sqm"] = input.pricePerSqm;
  if (input.currentPrice !== undefined) body["current_price"] = input.currentPrice;
  if (input.finishing !== undefined) body["finishing"] = input.finishing;
  if (input.description !== undefined) body["description"] = input.description;

  const response = await apiClient.patch<unknown>(`/api/v1/units/${id}`, body);
  return mapUnitDto(getResponseData<UnitDto>(normalizeApiKeys(response)));
}

export async function deleteUnit(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/units/${id}`);
}

export async function uploadUnitPhoto(unitId: string, file: File): Promise<Unit> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.upload<unknown>(`/api/v1/units/${unitId}/photos`, formData);
  return mapUnitDto(getResponseData<UnitDto>(normalizeApiKeys(response)));
}

export async function deleteUnitPhoto(unitId: string, url: string): Promise<Unit> {
  const response = await httpRequest<unknown>(`/api/v1/units/${unitId}/photos`, {
    method: "DELETE",
    body: JSON.stringify({ url }),
  });
  return mapUnitDto(getResponseData<UnitDto>(normalizeApiKeys(response)));
}
