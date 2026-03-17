import type { ReactNode } from "react";
import type { AppActionMenuGroup } from "@/shared/ui/primitives/action-menu";

export type ColumnAlign = "left" | "center" | "right";
export type ExportPrimitive = string | number | boolean | Date | null | undefined;
export type FilterPrimitive = string | number | boolean | Date | null | undefined;
export type FilterInputType = "text" | "number" | "date" | "select" | "boolean";
export type NonEmptyOperators = readonly [AppDataTableFilterOperator, ...AppDataTableFilterOperator[]];

export type AppDataTableFilterOperator =
  | "contains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "on"
  | "before"
  | "after"
  | "isTrue"
  | "isFalse";

export interface AppDataTableFilterOption {
  label: string;
  value: string;
}

export interface AppDataTableFilterField<TData> {
  id: string;
  label: string;
  type: FilterInputType;
  getValue: (row: TData) => FilterPrimitive;
  options?: readonly AppDataTableFilterOption[] | undefined;
  quick?: boolean;
  operators?: readonly AppDataTableFilterOperator[] | undefined;
}

export interface AppDataTableFilterRule {
  id: string;
  fieldId: string;
  operator: AppDataTableFilterOperator;
  value: string;
  valueTo?: string | undefined;
}

export interface NormalizedFilterField<TData> {
  id: string;
  label: string;
  type: FilterInputType;
  getValue: (row: TData) => FilterPrimitive;
  options: readonly AppDataTableFilterOption[];
  quick: boolean;
  operators: NonEmptyOperators;
}

export interface ActiveFilterChip {
  id: string;
  label: string;
  fieldId: string;
  isRule: boolean;
  ruleId?: string;
}

export interface SummaryRowModel {
  id: string;
  __summary: true;
  __totals: Record<string, number>;
  __labelField: string | null;
}

export interface ColumnRuntimeState {
  visible: boolean;
  pinned: boolean;
}

export interface PersistedTableState {
  pageSize: number;
  columnState: Record<string, ColumnRuntimeState>;
  columnOrder: string[];
}

export interface AppDataTableColumn<TData> {
  id: string;
  header: string;
  cell: (row: TData) => ReactNode;
  sortAccessor?: (row: TData) => string | number | Date | null | undefined;
  searchAccessor?: (row: TData) => string | null | undefined;
  exportAccessor?: (row: TData) => ExportPrimitive;
  align?: ColumnAlign;
  widthClassName?: string;
  widthPx?: number;
  defaultVisible?: boolean;
  canHide?: boolean;
  defaultPinned?: boolean;
  canPin?: boolean;
}

export interface AddAction {
  label: string;
  onClick: () => void;
}

export interface AppDataTableProps<TData> {
  data: readonly TData[];
  columns: readonly AppDataTableColumn<TData>[];
  rowKey: (row: TData) => string;
  filterFields?: readonly AppDataTableFilterField<TData>[];
  syncFiltersToUrl?: boolean;
  onRowClick?: (row: TData) => void;
  rowActions?: (row: TData) => readonly AppActionMenuGroup[];
  rowActionsTriggerLabel?: string;
  rowActionsColumnHeader?: string;
  rowActionsColumnWidth?: number;
  title?: string;
  searchPlaceholder?: string;
  addAction?: AddAction;
  className?: string;
  initialPageSize?: number;
  pageSizeOptions?: readonly number[];
  enableSelection?: boolean;
  pinSelectionColumn?: boolean;
  enableSettings?: boolean;
  enableExport?: boolean;
  showTotals?: boolean;
  fileNameBase?: string;
  storageKey?: string;
}
