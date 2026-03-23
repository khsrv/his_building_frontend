// ─── Property status ──────────────────────────────────────────────────────────

export type PropertyStatus =
  | "planning"
  | "construction"
  | "completed"
  | "suspended";

// ─── Core domain entities ─────────────────────────────────────────────────────

export interface Property {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly city: string;
  readonly district: string;
  readonly status: PropertyStatus;
  readonly propertyType: string;
  readonly currency: string;
  readonly totalUnits: number;
  readonly soldUnits: number;
  readonly availableUnits: number;
  readonly bookedUnits: number;
  readonly reservedUnits: number;
  readonly realizationPercent: number;
  readonly totalRevenue: number;
  readonly avgPricePerSqm: number;
  readonly constructionStartDate: string | null;
  readonly constructionEndDate: string | null;
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
  readonly rooms: number | null;
  readonly totalArea: number | null;
  readonly currentPrice: number | null;
  readonly pricePerSqm: number | null;
  readonly status: ChessUnitStatus;
  readonly unitType: string;
  readonly position: string;
}

export interface ChessFloor {
  readonly floorId: string | null;
  readonly floorNumber: number;
  readonly units: readonly ChessUnit[];
}

export interface ChessBlock {
  readonly id: string;
  readonly name: string;
  readonly floorsCount: number;
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
  readonly photoUrls: readonly string[];
  readonly clientId: string | null;
  readonly bookedUntil: string | null;
  readonly comment: string | null;
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
  unitNumber?: string | undefined;
  unitType: string;
  floorNumber: number;
  rooms?: number | undefined;
  totalArea?: number | undefined;
  livingArea?: number | undefined;
  kitchenArea?: number | undefined;
  balconyArea?: number | undefined;
  basePrice?: number | undefined;
  pricePerSqm?: number | undefined;
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
  pricePerSqm?: number | undefined;
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
  pricePerSqm?: number | undefined;
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
