import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  getResponsePagination,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type {
  Supplier,
  SupplierBalance,
  SupplierPayment,
  SupplierStatementItem,
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

// ─── DTOs (snake_case — matches backend API) ────────────────────────────────

interface SupplierDto {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  total_purchased: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface SupplierBalanceDto {
  supplier_id: string;
  supplier_name: string;
  total_purchases?: number;
  total_purchased?: number;
  total_paid: number;
  balance: number;
}

interface SupplierPaymentDto {
  id: string;
  amount: number;
  currency: string;
  notes: string | null;
  paid_at?: string;
  payment_date?: string;
  created_at?: string;
  created_by_name?: string;
  paid_by?: string;
}

interface SupplierStatementDto {
  date: string;
  type: string;
  description: string;
  amount: number;
  running_debt: number;
}

interface MaterialDto {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  property_id: string | null;
  current_stock: number;
  min_stock: number;
  price_per_unit: number | null;
  currency: string | null;
  category_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface StockMovementDto {
  id: string;
  material_id: string;
  material_name?: string;
  material_unit?: string;
  unit?: string;
  type?: string;
  movement_type?: string;
  quantity: number;
  unit_price?: number | null;
  price_per_unit?: number | null;
  total_amount: number | null;
  supplier_id: string | null;
  supplier_name?: string | null;
  property_id: string | null;
  property_name?: string | null;
  notes: string | null;
  created_at?: string;
  movement_date?: string;
  created_by_name?: string;
  created_by?: string;
}

interface PaginatedResponseDto<T> {
  data: {
    items: T[];
    pagination?: { total: number; page: number; limit: number };
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
    contactPerson: dto.contact_person,
    phone: dto.phone,
    email: dto.email,
    address: dto.address,
    notes: dto.notes,
    isActive: dto.is_active,
    totalPurchased: dto.total_purchased,
    totalPaid: dto.total_paid,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapSupplierBalanceDto(dto: SupplierBalanceDto): SupplierBalance {
  return {
    supplierId: dto.supplier_id,
    supplierName: dto.supplier_name,
    totalPurchases: dto.total_purchases ?? dto.total_purchased ?? 0,
    totalPaid: dto.total_paid ?? 0,
    balance: dto.balance ?? 0,
  };
}

function mapSupplierPaymentDto(dto: SupplierPaymentDto): SupplierPayment {
  return {
    id: dto.id,
    amount: dto.amount,
    currency: dto.currency,
    notes: dto.notes,
    paidAt: dto.paid_at ?? dto.payment_date ?? dto.created_at ?? "",
    createdByName: dto.created_by_name ?? dto.paid_by ?? "",
  };
}

function mapSupplierStatementDto(dto: SupplierStatementDto): SupplierStatementItem {
  return {
    date: dto.date,
    type: dto.type,
    description: dto.description,
    amount: Number(dto.amount ?? 0),
    runningDebt: Number(dto.running_debt ?? 0),
  };
}

function mapMaterialDto(dto: MaterialDto): Material {
  return {
    id: dto.id,
    name: dto.name,
    sku: dto.sku,
    unit: toMaterialUnit(dto.unit),
    propertyId: dto.property_id ?? null,
    currentStock: dto.current_stock,
    minStock: dto.min_stock,
    pricePerUnit: dto.price_per_unit,
    currency: dto.currency,
    categoryId: dto.category_id,
    notes: dto.notes,
    description: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapStockMovementDto(dto: StockMovementDto): StockMovement {
  return {
    id: dto.id,
    materialId: dto.material_id,
    materialName: dto.material_name ?? "",
    materialUnit: toMaterialUnit(dto.material_unit ?? dto.unit ?? "piece"),
    type: toMovementType(dto.type ?? dto.movement_type ?? "income"),
    quantity: dto.quantity,
    unitPrice: dto.unit_price ?? dto.price_per_unit ?? null,
    totalAmount: dto.total_amount,
    supplierId: dto.supplier_id,
    supplierName: dto.supplier_name ?? null,
    propertyId: dto.property_id,
    propertyName: dto.property_name ?? null,
    notes: dto.notes,
    createdAt: dto.created_at ?? dto.movement_date ?? "",
    createdByName: dto.created_by_name ?? dto.created_by ?? "",
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
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<PaginatedResponseDto<SupplierDto>>(
    "/api/v1/suppliers",
    query,
  );
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<SupplierDto>(normalized)
    .filter((item) => Boolean(item?.id))
    .map(mapSupplierDto);
  const pagination = getResponsePagination(normalized);
  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const body: Record<string, unknown> = { name: input.name };
  if (input.contactPerson !== undefined) body["contact_person"] = input.contactPerson;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<SupplierDto>>("/api/v1/suppliers", body);
  return mapSupplierDto(getResponseData<SupplierDto>(normalizeApiKeys(res)));
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.contactPerson !== undefined) body["contact_person"] = input.contactPerson;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.patch<SingleResponseDto<SupplierDto>>(
    `/api/v1/suppliers/${id}`,
    body,
  );
  return mapSupplierDto(getResponseData<SupplierDto>(normalizeApiKeys(res)));
}

export async function fetchSupplierBalance(id: string): Promise<SupplierBalance> {
  const res = await apiClient.get<SingleResponseDto<SupplierBalanceDto>>(
    `/api/v1/suppliers/${id}/balance`,
  );
  return mapSupplierBalanceDto(getResponseData<SupplierBalanceDto>(normalizeApiKeys(res)));
}

export async function fetchSupplierPayments(id: string): Promise<SupplierPayment[]> {
  const res = await apiClient.get<ListResponseDto<SupplierPaymentDto>>(
    `/api/v1/suppliers/${id}/payments`,
  );
  const items = getResponseItems<SupplierPaymentDto>(normalizeApiKeys(res));
  return items.filter((item) => Boolean(item?.id)).map(mapSupplierPaymentDto);
}

export async function fetchSupplierStatement(id: string): Promise<SupplierStatementItem[]> {
  const res = await apiClient.get<ListResponseDto<SupplierStatementDto>>(
    `/api/v1/suppliers/${id}/statement`,
  );
  const items = getResponseItems<SupplierStatementDto>(normalizeApiKeys(res));
  return items.map(mapSupplierStatementDto);
}

export async function fetchAllSupplierBalances(): Promise<SupplierBalance[]> {
  const res = await apiClient.get<ListResponseDto<SupplierBalanceDto>>("/api/v1/supplier-balances");
  const items = getResponseItems<SupplierBalanceDto>(normalizeApiKeys(res));
  return items.map(mapSupplierBalanceDto);
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
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.post<SingleResponseDto<SupplierPaymentDto>>(
    `/api/v1/suppliers/${supplierId}/payments`,
    body,
  );
  return mapSupplierPaymentDto(getResponseData<SupplierPaymentDto>(normalizeApiKeys(res)));
}

export async function fetchMaterialsList(
  params?: MaterialsListParams,
): Promise<MaterialsListResult> {
  const query: Record<string, string | number | undefined> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<PaginatedResponseDto<MaterialDto>>(
    "/api/v1/materials",
    query,
  );
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<MaterialDto>(normalized)
    .filter((item) => Boolean(item?.id))
    .map(mapMaterialDto);
  const pagination = getResponsePagination(normalized);
  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createMaterial(input: CreateMaterialInput): Promise<Material> {
  const body: Record<string, unknown> = {
    name: input.name,
    unit: input.unit,
  };
  if (input.sku !== undefined) body["sku"] = input.sku;
  if (input.minStock !== undefined) body["min_stock"] = input.minStock;
  if (input.pricePerUnit !== undefined) body["price_per_unit"] = input.pricePerUnit;
  if (input.currency !== undefined) body["currency"] = input.currency;
  if (input.categoryId !== undefined) body["category_id"] = input.categoryId;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<MaterialDto>>("/api/v1/materials", body);
  return mapMaterialDto(getResponseData<MaterialDto>(normalizeApiKeys(res)));
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput,
): Promise<Material> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.unit !== undefined) body["unit"] = input.unit;
  if (input.sku !== undefined) body["sku"] = input.sku;
  if (input.minStock !== undefined) body["min_stock"] = input.minStock;
  if (input.pricePerUnit !== undefined) body["price_per_unit"] = input.pricePerUnit;
  if (input.currency !== undefined) body["currency"] = input.currency;
  if (input.categoryId !== undefined) body["category_id"] = input.categoryId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.patch<SingleResponseDto<MaterialDto>>(
    `/api/v1/materials/${id}`,
    body,
  );
  return mapMaterialDto(getResponseData<MaterialDto>(normalizeApiKeys(res)));
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
  if (params?.propertyId) query["property_id"] = params.propertyId;
  if (params?.type) query["type"] = params.type;

  const res = await apiClient.get<PaginatedResponseDto<StockMovementDto>>(
    "/api/v1/stock-movements",
    query,
  );
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<StockMovementDto>(normalized)
    .filter((item) => Boolean(item?.id))
    .map(mapStockMovementDto);
  const pagination = getResponsePagination(normalized);
  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createStockMovement(
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  const body: Record<string, unknown> = {
    material_id: input.materialId,
    movement_type: input.type,
    quantity: input.quantity,
  };
  if (input.unitPrice !== undefined) body["price_per_unit"] = input.unitPrice;
  if (input.supplierId !== undefined) body["supplier_id"] = input.supplierId;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<StockMovementDto>>(
    "/api/v1/stock-movements",
    body,
  );
  return mapStockMovementDto(getResponseData<StockMovementDto>(normalizeApiKeys(res)));
}
