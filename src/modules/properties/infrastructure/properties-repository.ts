import { apiClient } from "@/shared/lib/http/api-client";
import type {
  ApiPaginatedResponse,
  ApiResponse,
} from "@/shared/types/api";
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
  tenant_id: string;
  name: string;
  address: string;
  city: string;
  district?: string | null;
  description?: string | null;
  property_type?: string | null;
  status: string;
  currency: string;
  total_units: number;
  sold_units: number;
  realization_percent: number;
  construction_start_date: string | null;
  construction_end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface BlockDto {
  id: string;
  property_id: string;
  name: string;
  floors_count: number;
  underground_floors: number;
  sort_order: number;
  created_at: string;
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
  floor_number: number;
  units: ChessUnitDto[];
}

interface ChessBlockDto {
  block_id: string;
  block_name: string;
  floors_count: number;
  floors: ChessFloorDto[];
}

interface ChessBoardDto {
  blocks: ChessBlockDto[];
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
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    city: dto.city,
    status: isPropertyStatus(dto.status) ? dto.status : "planning",
    currency: dto.currency,
    totalUnits: dto.total_units,
    soldUnits: dto.sold_units,
    realizationPercent: dto.realization_percent,
    constructionStartDate: dto.construction_start_date,
    constructionEndDate: dto.construction_end_date,
    createdAt: dto.created_at,
  };
}

function mapBlockDto(dto: BlockDto): PropertyBlock {
  return {
    id: dto.id,
    propertyId: dto.property_id,
    name: dto.name,
    floorsCount: dto.floors_count,
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
    floorNumber: dto.floor_number,
    units: dto.units.map(mapChessUnitDto),
  };
}

function mapChessBlockDto(dto: ChessBlockDto): ChessBlock {
  return {
    id: dto.block_id,
    name: dto.block_name,
    floorsCount: dto.floors_count,
    floors: dto.floors.map(mapChessFloorDto),
  };
}

function mapChessBoardDto(dto: ChessBoardDto): ChessBoard {
  return {
    blocks: dto.blocks.map(mapChessBlockDto),
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

  const response = await apiClient.get<ApiPaginatedResponse<PropertyDto>>(
    "/api/v1/properties",
    query,
  );

  return {
    items: (response.data.items ?? []).filter((item) => Boolean(item?.id)).map(mapPropertyDto),
    total: response.data.pagination.total,
    page: response.data.pagination.page,
    limit: response.data.pagination.limit,
  };
}

export async function fetchPropertyDetail(id: string): Promise<Property> {
  const response = await apiClient.get<ApiResponse<PropertyDto>>(
    `/api/v1/properties/${id}`,
  );
  return mapPropertyDto(response.data);
}

export async function fetchPropertyBlocks(propertyId: string): Promise<readonly PropertyBlock[]> {
  const response = await apiClient.get<ApiResponse<BlockDto[]>>(
    `/api/v1/properties/${propertyId}/blocks`,
  );
  return response.data.map(mapBlockDto);
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

  const response = await apiClient.get<ApiResponse<ChessBoardDto>>(
    `/api/v1/properties/${propertyId}/chessboard`,
    query,
  );
  return mapChessBoardDto(response.data);
}

// ─── Unit status actions ──────────────────────────────────────────────────────

type UnitAction = "book" | "release" | "reserve" | "mark_sold";

export async function updateUnitStatus(
  unitId: string,
  action: UnitAction,
): Promise<void> {
  await apiClient.patch<ApiResponse<unknown>>(
    `/api/v1/units/${unitId}/status`,
    { action },
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
  created_at: string;
}

interface FloorDto {
  id: string;
  floor_number: number;
  units_count: number;
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
    floorNumber: dto.floor_number,
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
    createdAt: dto.created_at,
  };
}

function mapFloorDto(dto: FloorDto): FloorInfo {
  return {
    id: dto.id,
    floorNumber: dto.floor_number,
    unitsCount: dto.units_count,
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

  const response = await apiClient.post<ApiResponse<PropertyDto>>("/api/v1/properties", body);
  return mapPropertyDto(response.data);
}

export async function updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.city !== undefined) body["city"] = input.city;
  if (input.district !== undefined) body["district"] = input.district;
  if (input.description !== undefined) body["description"] = input.description;
  if (input.status !== undefined) body["status"] = input.status;

  const response = await apiClient.patch<ApiResponse<PropertyDto>>(`/api/v1/properties/${id}`, body);
  return mapPropertyDto(response.data);
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

  const response = await apiClient.post<ApiResponse<BlockDto>>(
    `/api/v1/properties/${propertyId}/blocks`,
    body,
  );
  return mapBlockDto(response.data);
}

export async function updateBlock(
  propertyId: string,
  blockId: string,
  input: { name?: string; sortOrder?: number },
): Promise<PropertyBlock> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.sortOrder !== undefined) body["sort_order"] = input.sortOrder;

  const response = await apiClient.patch<ApiResponse<BlockDto>>(
    `/api/v1/properties/${propertyId}/blocks/${blockId}`,
    body,
  );
  return mapBlockDto(response.data);
}

export async function deleteBlock(propertyId: string, blockId: string): Promise<void> {
  await apiClient.delete(`/api/v1/properties/${propertyId}/blocks/${blockId}`);
}

// ─── Floors ──────────────────────────────────────────────────────────────────

export async function fetchFloors(propertyId: string, blockId: string): Promise<FloorInfo[]> {
  const response = await apiClient.get<ApiResponse<FloorDto[]>>(
    `/api/v1/properties/${propertyId}/blocks/${blockId}/floors`,
  );
  return response.data.map(mapFloorDto);
}

// ─── Units CRUD ──────────────────────────────────────────────────────────────

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

  const response = await apiClient.get<ApiPaginatedResponse<UnitDto>>("/api/v1/units", query);
  return {
    items: (response.data.items ?? []).filter((item) => Boolean(item?.id)).map(mapUnitDto),
    total: response.data.pagination.total,
    page: response.data.pagination.page,
    limit: response.data.pagination.limit,
  };
}

export async function createUnit(input: CreateUnitInput): Promise<Unit> {
  const body: Record<string, unknown> = {
    property_id: input.propertyId,
    block_id: input.blockId,
    floor_id: input.floorId,
    unit_number: input.unitNumber,
    unit_type: input.unitType,
    floor_number: input.floorNumber,
  };
  if (input.rooms !== undefined) body["rooms"] = input.rooms;
  if (input.totalArea !== undefined) body["total_area"] = input.totalArea;
  if (input.livingArea !== undefined) body["living_area"] = input.livingArea;
  if (input.kitchenArea !== undefined) body["kitchen_area"] = input.kitchenArea;
  if (input.balconyArea !== undefined) body["balcony_area"] = input.balconyArea;
  if (input.basePrice !== undefined) body["base_price"] = input.basePrice;
  if (input.finishing !== undefined) body["finishing"] = input.finishing;
  if (input.description !== undefined) body["description"] = input.description;

  const response = await apiClient.post<ApiResponse<UnitDto>>("/api/v1/units", body);
  return mapUnitDto(response.data);
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
  if (input.prefix !== undefined) body["prefix"] = input.prefix;

  const response = await apiClient.post<ApiResponse<{ count: number }>>("/api/v1/units/bulk", body);
  return { count: response.data.count };
}

export async function updateUnit(id: string, input: UpdateUnitInput): Promise<Unit> {
  const body: Record<string, unknown> = {};
  if (input.rooms !== undefined) body["rooms"] = input.rooms;
  if (input.totalArea !== undefined) body["total_area"] = input.totalArea;
  if (input.livingArea !== undefined) body["living_area"] = input.livingArea;
  if (input.kitchenArea !== undefined) body["kitchen_area"] = input.kitchenArea;
  if (input.balconyArea !== undefined) body["balcony_area"] = input.balconyArea;
  if (input.basePrice !== undefined) body["base_price"] = input.basePrice;
  if (input.currentPrice !== undefined) body["current_price"] = input.currentPrice;
  if (input.finishing !== undefined) body["finishing"] = input.finishing;
  if (input.description !== undefined) body["description"] = input.description;

  const response = await apiClient.patch<ApiResponse<UnitDto>>(`/api/v1/units/${id}`, body);
  return mapUnitDto(response.data);
}

export async function deleteUnit(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/units/${id}`);
}
