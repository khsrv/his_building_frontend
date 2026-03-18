import type {
  SuppliersListParams,
  MaterialsListParams,
  StockMovementsListParams,
} from "@/modules/warehouse/domain/warehouse";

export const warehouseKeys = {
  all: ["warehouse"] as const,

  suppliers: () => ["warehouse", "suppliers"] as const,
  suppliersList: (params?: SuppliersListParams) =>
    ["warehouse", "suppliers", "list", params] as const,
  supplierBalance: (id: string) => ["warehouse", "suppliers", id, "balance"] as const,
  supplierPayments: (id: string) => ["warehouse", "suppliers", id, "payments"] as const,

  materials: () => ["warehouse", "materials"] as const,
  materialsList: (params?: MaterialsListParams) =>
    ["warehouse", "materials", "list", params] as const,

  stockMovements: () => ["warehouse", "stock-movements"] as const,
  stockMovementsList: (params?: StockMovementsListParams) =>
    ["warehouse", "stock-movements", "list", params] as const,
};
