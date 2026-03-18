import { apiClient } from "@/shared/lib/http/api-client";
import type {
  Supplier,
  SupplierBalance,
  SupplierPayment,
  Material,
  StockMovement,
  MaterialUnit,
  StockMovementType,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateSupplierPaymentInput,
  CreateMaterialInput,
  UpdateMaterialInput,
  CreateStockMovementInput,
  SuppliersListParams,
  MaterialsListParams,
  StockMovementsListParams,
} from "@/modules/warehouse/domain/warehouse";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface SupplierDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

interface SupplierBalanceDto {
  supplier_id: string;
  supplier_name: string;
  total_purchases: number;
  total_paid: number;
  balance: number;
}

interface SupplierPaymentDto {
  id: string;
  amount: number;
  currency: string;
  notes: string | null;
  paid_at: string;
  created_by_name: string;
}

interface MaterialDto {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  description: string | null;
  created_at: string;
}

interface StockMovementDto {
  id: string;
  material_id: string;
  material_name: string;
  material_unit: string;
  type: string;
  quantity: number;
  unit_price: number | null;
  total_amount: number | null;
  supplier_id: string | null;
  supplier_name: string | null;
  property_id: string | null;
  property_name: string | null;
  notes: string | null;
  created_at: string;
  created_by_name: string;
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

interface ListResponseDto<T> {
  data: { items: T[] };
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const VALID_UNITS: readonly MaterialUnit[] = [
  "tonne", "m3", "m2", "piece", "package", "kg", "litre", "meter",
];

const VALID_MOVEMENT_TYPES: readonly StockMovementType[] = [
  "income", "expense", "write_off", "return",
];

function toMaterialUnit(value: string): MaterialUnit {
  return (VALID_UNITS as readonly string[]).includes(value)
    ? (value as MaterialUnit)
    : "piece";
}

function toMovementType(value: string): StockMovementType {
  return (VALID_MOVEMENT_TYPES as readonly string[]).includes(value)
    ? (value as StockMovementType)
    : "income";
}

function mapSupplierDto(dto: SupplierDto): Supplier {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    email: dto.email,
    address: dto.address,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}

function mapSupplierBalanceDto(dto: SupplierBalanceDto): SupplierBalance {
  return {
    supplierId: dto.supplier_id,
    supplierName: dto.supplier_name,
    totalPurchases: dto.total_purchases,
    totalPaid: dto.total_paid,
    balance: dto.balance,
  };
}

function mapSupplierPaymentDto(dto: SupplierPaymentDto): SupplierPayment {
  return {
    id: dto.id,
    amount: dto.amount,
    currency: dto.currency,
    notes: dto.notes,
    paidAt: dto.paid_at,
    createdByName: dto.created_by_name,
  };
}

function mapMaterialDto(dto: MaterialDto): Material {
  return {
    id: dto.id,
    name: dto.name,
    unit: toMaterialUnit(dto.unit),
    currentStock: dto.current_stock,
    minStock: dto.min_stock,
    description: dto.description,
    createdAt: dto.created_at,
  };
}

function mapStockMovementDto(dto: StockMovementDto): StockMovement {
  return {
    id: dto.id,
    materialId: dto.material_id,
    materialName: dto.material_name,
    materialUnit: toMaterialUnit(dto.material_unit),
    type: toMovementType(dto.type),
    quantity: dto.quantity,
    unitPrice: dto.unit_price,
    totalAmount: dto.total_amount,
    supplierId: dto.supplier_id,
    supplierName: dto.supplier_name,
    propertyId: dto.property_id,
    propertyName: dto.property_name,
    notes: dto.notes,
    createdAt: dto.created_at,
    createdByName: dto.created_by_name,
  };
}

// ─── List result types ────────────────────────────────────────────────────────

export interface SuppliersListResult {
  items: readonly Supplier[];
  total: number;
  page: number;
  limit: number;
}

export interface MaterialsListResult {
  items: readonly Material[];
  total: number;
  page: number;
  limit: number;
}

export interface StockMovementsListResult {
  items: readonly StockMovement[];
  total: number;
  page: number;
  limit: number;
}

// ─── Repository functions ─────────────────────────────────────────────────────

export async function fetchSuppliersList(
  params?: SuppliersListParams,
): Promise<SuppliersListResult> {
  const query: Record<string, string | number | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;

  const res = await apiClient.get<PaginatedResponseDto<SupplierDto>>(
    "/api/v1/suppliers",
    query,
  );
  return {
    items: res.data.items.map(mapSupplierDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const body: Record<string, unknown> = { name: input.name };
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<SupplierDto>>("/api/v1/suppliers", body);
  return mapSupplierDto(res.data);
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.patch<SingleResponseDto<SupplierDto>>(
    `/api/v1/suppliers/${id}`,
    body,
  );
  return mapSupplierDto(res.data);
}

export async function fetchSupplierBalance(id: string): Promise<SupplierBalance> {
  const res = await apiClient.get<SingleResponseDto<SupplierBalanceDto>>(
    `/api/v1/suppliers/${id}/balance`,
  );
  return mapSupplierBalanceDto(res.data);
}

export async function fetchSupplierPayments(id: string): Promise<SupplierPayment[]> {
  const res = await apiClient.get<ListResponseDto<SupplierPaymentDto>>(
    `/api/v1/suppliers/${id}/payments`,
  );
  return res.data.items.map(mapSupplierPaymentDto);
}

export async function createSupplierPayment(
  supplierId: string,
  input: CreateSupplierPaymentInput,
): Promise<SupplierPayment> {
  const body: Record<string, unknown> = {
    amount: input.amount,
    currency: input.currency,
  };
  if (input.accountId !== undefined) body["account_id"] = input.accountId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<SupplierPaymentDto>>(
    `/api/v1/suppliers/${supplierId}/payments`,
    body,
  );
  return mapSupplierPaymentDto(res.data);
}

export async function fetchMaterialsList(
  params?: MaterialsListParams,
): Promise<MaterialsListResult> {
  const query: Record<string, string | number | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;

  const res = await apiClient.get<PaginatedResponseDto<MaterialDto>>(
    "/api/v1/materials",
    query,
  );
  return {
    items: res.data.items.map(mapMaterialDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createMaterial(input: CreateMaterialInput): Promise<Material> {
  const body: Record<string, unknown> = {
    name: input.name,
    unit: input.unit,
  };
  if (input.minStock !== undefined) body["min_stock"] = input.minStock;
  if (input.description !== undefined) body["description"] = input.description;

  const res = await apiClient.post<SingleResponseDto<MaterialDto>>("/api/v1/materials", body);
  return mapMaterialDto(res.data);
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput,
): Promise<Material> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.unit !== undefined) body["unit"] = input.unit;
  if (input.minStock !== undefined) body["min_stock"] = input.minStock;
  if (input.description !== undefined) body["description"] = input.description;

  const res = await apiClient.patch<SingleResponseDto<MaterialDto>>(
    `/api/v1/materials/${id}`,
    body,
  );
  return mapMaterialDto(res.data);
}

export async function deleteMaterial(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/materials/${id}`);
}

export async function fetchStockMovementsList(
  params?: StockMovementsListParams,
): Promise<StockMovementsListResult> {
  const query: Record<string, string | number | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.materialId) query["material_id"] = params.materialId;
  if (params?.supplierId) query["supplier_id"] = params.supplierId;
  if (params?.type) query["type"] = params.type;

  const res = await apiClient.get<PaginatedResponseDto<StockMovementDto>>(
    "/api/v1/stock-movements",
    query,
  );
  return {
    items: res.data.items.map(mapStockMovementDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createStockMovement(
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  const body: Record<string, unknown> = {
    material_id: input.materialId,
    type: input.type,
    quantity: input.quantity,
  };
  if (input.unitPrice !== undefined) body["unit_price"] = input.unitPrice;
  if (input.supplierId !== undefined) body["supplier_id"] = input.supplierId;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<StockMovementDto>>(
    "/api/v1/stock-movements",
    body,
  );
  return mapStockMovementDto(res.data);
}
