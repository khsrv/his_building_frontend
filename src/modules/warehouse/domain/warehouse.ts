// ─── Warehouse domain types ───────────────────────────────────────────────────

export type MaterialUnit =
  | "tonne"
  | "m3"
  | "m2"
  | "piece"
  | "package"
  | "kg"
  | "litre"
  | "meter";

export type StockMovementType = "income" | "expense" | "write_off" | "return";

// ─── Supplier ─────────────────────────────────────────────────────────────────

export interface Supplier {
  readonly id: string;
  readonly name: string;
  readonly contactPerson: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly notes: string | null;
  readonly isActive: boolean;
  readonly totalPurchased: number;
  readonly totalPaid: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SupplierBalance {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly totalPurchases: number;
  readonly totalPaid: number;
  readonly balance: number;
}

export interface SupplierPayment {
  readonly id: string;
  readonly amount: number;
  readonly currency: string;
  readonly notes: string | null;
  readonly paidAt: string;
  readonly createdByName: string;
}

// ─── Material ─────────────────────────────────────────────────────────────────

export interface Material {
  readonly id: string;
  readonly name: string;
  readonly sku: string | null;
  readonly unit: MaterialUnit;
  readonly currentStock: number;
  readonly minStock: number;
  readonly pricePerUnit: number | null;
  readonly currency: string | null;
  readonly categoryId: string | null;
  readonly notes: string | null;
  /** Kept for backward compat — mapped from notes */
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ─── Stock Movement ───────────────────────────────────────────────────────────

export interface StockMovement {
  readonly id: string;
  readonly materialId: string;
  readonly materialName: string;
  readonly materialUnit: MaterialUnit;
  readonly type: StockMovementType;
  readonly quantity: number;
  readonly unitPrice: number | null;
  readonly totalAmount: number | null;
  readonly supplierId: string | null;
  readonly supplierName: string | null;
  readonly propertyId: string | null;
  readonly propertyName: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly createdByName: string;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateSupplierInput {
  name: string;
  contactPerson?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateSupplierInput {
  name?: string | undefined;
  contactPerson?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  notes?: string | undefined;
}

export interface CreateSupplierPaymentInput {
  amount: number;
  currency: string;
  accountId?: string | undefined;
  notes?: string | undefined;
}

export interface CreateMaterialInput {
  name: string;
  unit: MaterialUnit;
  sku?: string | undefined;
  minStock?: number | undefined;
  pricePerUnit?: number | undefined;
  currency?: string | undefined;
  categoryId?: string | undefined;
  notes?: string | undefined;
  description?: string | undefined;
}

export interface UpdateMaterialInput {
  name?: string | undefined;
  unit?: MaterialUnit | undefined;
  sku?: string | undefined;
  minStock?: number | undefined;
  pricePerUnit?: number | undefined;
  currency?: string | undefined;
  categoryId?: string | undefined;
  notes?: string | undefined;
  description?: string | undefined;
}

export interface CreateStockMovementInput {
  materialId: string;
  type: StockMovementType;
  quantity: number;
  unitPrice?: number | undefined;
  supplierId?: string | undefined;
  propertyId?: string | undefined;
  notes?: string | undefined;
}

export interface SuppliersListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MaterialsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface StockMovementsListParams {
  page?: number;
  limit?: number;
  materialId?: string;
  supplierId?: string;
  type?: StockMovementType;
}
