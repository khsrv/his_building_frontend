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

// ─── DTOs (PascalCase — matches backend API) ────────────────────────────────

interface SupplierDto {
  ID: string;
  Name: string;
  ContactPerson: string | null;
  Phone: string | null;
  Email: string | null;
  Address: string | null;
  Notes: string | null;
  IsActive: boolean;
  TotalPurchased: number;
  TotalPaid: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

interface SupplierBalanceDto {
  SupplierID: string;
  SupplierName: string;
  TotalPurchases: number;
  TotalPaid: number;
  Balance: number;
}

interface SupplierPaymentDto {
  ID: string;
  Amount: number;
  Currency: string;
  Notes: string | null;
  PaidAt: string;
  CreatedByName: string;
}

interface MaterialDto {
  ID: string;
  Name: string;
  SKU: string | null;
  Unit: string;
  CurrentStock: number;
  MinStock: number;
  PricePerUnit: number | null;
  Currency: string | null;
  CategoryID: string | null;
  Notes: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

interface StockMovementDto {
  ID: string;
  MaterialID: string;
  MaterialName: string;
  MaterialUnit: string;
  Type: string;
  Quantity: number;
  UnitPrice: number | null;
  TotalAmount: number | null;
  SupplierID: string | null;
  SupplierName: string | null;
  PropertyID: string | null;
  PropertyName: string | null;
  Notes: string | null;
  CreatedAt: string;
  CreatedByName: string;
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
    id: dto.ID,
    name: dto.Name,
    contactPerson: dto.ContactPerson,
    phone: dto.Phone,
    email: dto.Email,
    address: dto.Address,
    notes: dto.Notes,
    isActive: dto.IsActive,
    totalPurchased: dto.TotalPurchased,
    totalPaid: dto.TotalPaid,
    createdAt: dto.CreatedAt,
    updatedAt: dto.UpdatedAt,
  };
}

function mapSupplierBalanceDto(dto: SupplierBalanceDto): SupplierBalance {
  return {
    supplierId: dto.SupplierID,
    supplierName: dto.SupplierName,
    totalPurchases: dto.TotalPurchases,
    totalPaid: dto.TotalPaid,
    balance: dto.Balance,
  };
}

function mapSupplierPaymentDto(dto: SupplierPaymentDto): SupplierPayment {
  return {
    id: dto.ID,
    amount: dto.Amount,
    currency: dto.Currency,
    notes: dto.Notes,
    paidAt: dto.PaidAt,
    createdByName: dto.CreatedByName,
  };
}

function mapMaterialDto(dto: MaterialDto): Material {
  return {
    id: dto.ID,
    name: dto.Name,
    sku: dto.SKU,
    unit: toMaterialUnit(dto.Unit),
    currentStock: dto.CurrentStock,
    minStock: dto.MinStock,
    pricePerUnit: dto.PricePerUnit,
    currency: dto.Currency,
    categoryId: dto.CategoryID,
    notes: dto.Notes,
    description: dto.Notes,
    createdAt: dto.CreatedAt,
    updatedAt: dto.UpdatedAt,
  };
}

function mapStockMovementDto(dto: StockMovementDto): StockMovement {
  return {
    id: dto.ID,
    materialId: dto.MaterialID,
    materialName: dto.MaterialName,
    materialUnit: toMaterialUnit(dto.MaterialUnit),
    type: toMovementType(dto.Type),
    quantity: dto.Quantity,
    unitPrice: dto.UnitPrice,
    totalAmount: dto.TotalAmount,
    supplierId: dto.SupplierID,
    supplierName: dto.SupplierName,
    propertyId: dto.PropertyID,
    propertyName: dto.PropertyName,
    notes: dto.Notes,
    createdAt: dto.CreatedAt,
    createdByName: dto.CreatedByName,
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
    items: (res.data.items ?? []).filter((item) => Boolean(item?.ID)).map(mapSupplierDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  const body: Record<string, unknown> = { Name: input.name };
  if (input.contactPerson !== undefined) body["ContactPerson"] = input.contactPerson;
  if (input.phone !== undefined) body["Phone"] = input.phone;
  if (input.email !== undefined) body["Email"] = input.email;
  if (input.address !== undefined) body["Address"] = input.address;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<SupplierDto>>("/api/v1/suppliers", body);
  return mapSupplierDto(res.data);
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["Name"] = input.name;
  if (input.contactPerson !== undefined) body["ContactPerson"] = input.contactPerson;
  if (input.phone !== undefined) body["Phone"] = input.phone;
  if (input.email !== undefined) body["Email"] = input.email;
  if (input.address !== undefined) body["Address"] = input.address;
  if (input.notes !== undefined) body["Notes"] = input.notes;

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
  return (res.data.items ?? []).filter((item) => Boolean(item?.ID)).map(mapSupplierPaymentDto);
}

export async function createSupplierPayment(
  supplierId: string,
  input: CreateSupplierPaymentInput,
): Promise<SupplierPayment> {
  const body: Record<string, unknown> = {
    Amount: input.amount,
    Currency: input.currency,
  };
  if (input.accountId !== undefined) body["AccountID"] = input.accountId;
  if (input.notes !== undefined) body["Notes"] = input.notes;

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
    items: (res.data.items ?? []).filter((item) => Boolean(item?.ID)).map(mapMaterialDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createMaterial(input: CreateMaterialInput): Promise<Material> {
  const body: Record<string, unknown> = {
    Name: input.name,
    Unit: input.unit,
  };
  if (input.sku !== undefined) body["SKU"] = input.sku;
  if (input.minStock !== undefined) body["MinStock"] = input.minStock;
  if (input.pricePerUnit !== undefined) body["PricePerUnit"] = input.pricePerUnit;
  if (input.currency !== undefined) body["Currency"] = input.currency;
  if (input.categoryId !== undefined) body["CategoryID"] = input.categoryId;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<MaterialDto>>("/api/v1/materials", body);
  return mapMaterialDto(res.data);
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput,
): Promise<Material> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["Name"] = input.name;
  if (input.unit !== undefined) body["Unit"] = input.unit;
  if (input.sku !== undefined) body["SKU"] = input.sku;
  if (input.minStock !== undefined) body["MinStock"] = input.minStock;
  if (input.pricePerUnit !== undefined) body["PricePerUnit"] = input.pricePerUnit;
  if (input.currency !== undefined) body["Currency"] = input.currency;
  if (input.categoryId !== undefined) body["CategoryID"] = input.categoryId;
  if (input.notes !== undefined) body["Notes"] = input.notes;

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
    items: (res.data.items ?? []).filter((item) => Boolean(item?.ID)).map(mapStockMovementDto),
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
  };
}

export async function createStockMovement(
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  const body: Record<string, unknown> = {
    MaterialID: input.materialId,
    Type: input.type,
    Quantity: input.quantity,
  };
  if (input.unitPrice !== undefined) body["UnitPrice"] = input.unitPrice;
  if (input.supplierId !== undefined) body["SupplierID"] = input.supplierId;
  if (input.propertyId !== undefined) body["PropertyID"] = input.propertyId;
  if (input.notes !== undefined) body["Notes"] = input.notes;

  const res = await apiClient.post<SingleResponseDto<StockMovementDto>>(
    "/api/v1/stock-movements",
    body,
  );
  return mapStockMovementDto(res.data);
}
