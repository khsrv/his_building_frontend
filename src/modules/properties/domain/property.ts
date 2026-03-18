// ─── Property status ──────────────────────────────────────────────────────────

export type PropertyStatus =
  | "planning"
  | "under_construction"
  | "completed"
  | "selling"
  | "archived";

// ─── Core domain entities ─────────────────────────────────────────────────────

export interface Property {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly city: string;
  readonly status: PropertyStatus;
  readonly currency: string;
  readonly blocksCount: number;
  readonly floorsCount: number;
  readonly unitsCount: number;
  readonly availableUnits: number;
  readonly startDate: string | null;
  readonly completionDate: string | null;
  readonly createdAt: string;
}

export interface PropertyBlock {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly floorsCount: number;
}

// ─── Chess board domain types ─────────────────────────────────────────────────

export type ChessUnitStatus = "free" | "booked" | "reserved" | "sold";

export interface ChessUnit {
  readonly id: string;
  readonly unitNumber: string;
  readonly floorNumber: number;
  readonly rooms: number | null;
  readonly totalArea: number | null;
  readonly basePrice: number | null;
  readonly status: ChessUnitStatus;
  readonly unitType: string;
}

export interface ChessFloor {
  readonly floorNumber: number;
  readonly units: readonly ChessUnit[];
}

export interface ChessBlock {
  readonly id: string;
  readonly name: string;
  readonly floors: readonly ChessFloor[];
}

export interface ChessBoard {
  readonly blocks: readonly ChessBlock[];
}

// ─── Filter params ────────────────────────────────────────────────────────────

export interface ChessBoardFilters {
  status?: "available" | "booked" | "reserved" | "sold";
  rooms?: number;
  priceMin?: number;
  priceMax?: number;
}

export interface PropertiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PropertyStatus;
}

// ─── Property detail (extended) ──────────────────────────────────────────────

export interface PropertyDetail extends Property {
  readonly propertyType: string;
  readonly district: string;
  readonly description: string;
}

// ─── Block extended ──────────────────────────────────────────────────────────

export interface PropertyBlockDetail extends PropertyBlock {
  readonly undergroundFloors: number;
  readonly sortOrder: number;
  readonly createdAt: string;
}

// ─── Unit (full detail) ──────────────────────────────────────────────────────

export type UnitStatus = "available" | "booked" | "reserved" | "sold";

export interface Unit {
  readonly id: string;
  readonly propertyId: string;
  readonly blockId: string;
  readonly floorId: string;
  readonly unitNumber: string;
  readonly unitType: string;
  readonly floorNumber: number;
  readonly rooms: number | null;
  readonly totalArea: number | null;
  readonly livingArea: number | null;
  readonly kitchenArea: number | null;
  readonly balconyArea: number | null;
  readonly basePrice: number | null;
  readonly currentPrice: number | null;
  readonly status: UnitStatus;
  readonly finishing: string | null;
  readonly description: string | null;
  readonly createdAt: string;
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreatePropertyInput {
  name: string;
  propertyType: string;
  address?: string | undefined;
  city?: string | undefined;
  district?: string | undefined;
  description?: string | undefined;
  currency?: string | undefined;
  constructionStartDate?: string | undefined;
  constructionEndDate?: string | undefined;
}

export interface UpdatePropertyInput {
  name?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  district?: string | undefined;
  description?: string | undefined;
  status?: string | undefined;
}

export interface CreateBlockInput {
  name: string;
  floorsCount: number;
  undergroundFloors?: number | undefined;
}

export interface CreateUnitInput {
  propertyId: string;
  blockId: string;
  floorId: string;
  unitNumber: string;
  unitType: string;
  floorNumber: number;
  rooms?: number | undefined;
  totalArea?: number | undefined;
  livingArea?: number | undefined;
  kitchenArea?: number | undefined;
  balconyArea?: number | undefined;
  basePrice?: number | undefined;
  finishing?: string | undefined;
  description?: string | undefined;
}

export interface BulkCreateUnitsInput {
  propertyId: string;
  blockId: string;
  floorId: string;
  floorNumber: number;
  unitType: string;
  rooms?: number | undefined;
  totalArea?: number | undefined;
  basePrice?: number | undefined;
  numberFrom: number;
  numberTo: number;
  prefix?: string | undefined;
}

export interface UpdateUnitInput {
  rooms?: number | undefined;
  totalArea?: number | undefined;
  livingArea?: number | undefined;
  kitchenArea?: number | undefined;
  balconyArea?: number | undefined;
  basePrice?: number | undefined;
  currentPrice?: number | undefined;
  finishing?: string | undefined;
  description?: string | undefined;
}

export interface UnitsListParams {
  page?: number | undefined;
  limit?: number | undefined;
  status?: UnitStatus | undefined;
  unitType?: string | undefined;
  propertyId?: string | undefined;
  blockId?: string | undefined;
  rooms?: number | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
}

export interface FloorInfo {
  readonly id: string;
  readonly floorNumber: number;
  readonly unitsCount: number;
}
