"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useI18n } from "@/shared/providers/locale-provider";
import { AppActionMenu, type AppActionMenuGroup } from "@/shared/ui/primitives/action-menu";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppInput } from "@/shared/ui/primitives/input";
import { AppSelect } from "@/shared/ui/primitives/select";

type ColumnAlign = "left" | "center" | "right";
type ExportPrimitive = string | number | boolean | Date | null | undefined;
type FilterPrimitive = string | number | boolean | Date | null | undefined;
type FilterInputType = "text" | "number" | "date" | "select" | "boolean";
type NonEmptyOperators = readonly [AppDataTableFilterOperator, ...AppDataTableFilterOperator[]];

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

interface AppDataTableFilterRule {
  id: string;
  fieldId: string;
  operator: AppDataTableFilterOperator;
  value: string;
  valueTo?: string | undefined;
}

interface NormalizedAppDataTableFilterField<TData> {
  id: string;
  label: string;
  type: FilterInputType;
  getValue: (row: TData) => FilterPrimitive;
  options: readonly AppDataTableFilterOption[];
  quick: boolean;
  operators: NonEmptyOperators;
}

interface ActiveFilterChip {
  id: string;
  label: string;
  fieldId: string;
  isRule: boolean;
  ruleId?: string;
}

interface SummaryRowModel {
  id: string;
  __summary: true;
  __totals: Record<string, number>;
  __labelField: string | null;
}

interface ColumnRuntimeState {
  visible: boolean;
  pinned: boolean;
}

interface PersistedTableState {
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

interface AddAction {
  label: string;
  onClick: () => void;
}

interface AppDataTableProps<TData> {
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

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 20, 50, 100] as const;
const FILTER_RULES_PARAM_SUFFIX = "rules";
const FILTER_QUICK_PARAM_SUFFIX = "quick";
const SUMMARY_ROW_ID = "__app_table_summary__";

function getDefaultOperators(type: FilterInputType): NonEmptyOperators {
  if (type === "text") {
    return ["contains", "equals", "notEquals", "startsWith", "endsWith"];
  }
  if (type === "number") {
    return ["equals", "notEquals", "gt", "gte", "lt", "lte", "between"];
  }
  if (type === "date") {
    return ["on", "before", "after", "between"];
  }
  if (type === "boolean") {
    return ["isTrue", "isFalse"];
  }
  return ["equals", "notEquals"];
}

function normalizeOperators(type: FilterInputType, operators: readonly AppDataTableFilterOperator[] | undefined): NonEmptyOperators {
  if (!operators || operators.length === 0) {
    return getDefaultOperators(type);
  }

  const unique = Array.from(new Set(operators));
  if (unique.length === 0) {
    return getDefaultOperators(type);
  }

  const [first, ...rest] = unique;
  if (!first) {
    return getDefaultOperators(type);
  }

  return [first, ...rest];
}

function normalizeFilterFields<TData>(
  fields: readonly AppDataTableFilterField<TData>[] | undefined,
): NormalizedAppDataTableFilterField<TData>[] {
  return (fields ?? []).map((field) => {
    const options = field.type === "boolean"
      ? [{ label: "True", value: "true" }, { label: "False", value: "false" }]
      : (field.options ?? []);

    return {
      id: field.id,
      label: field.label,
      type: field.type,
      getValue: field.getValue,
      quick: Boolean(field.quick),
      options,
      operators: normalizeOperators(field.type, field.operators),
    };
  });
}

function normalizeQuickFilterValues<TData>(
  fields: readonly NormalizedAppDataTableFilterField<TData>[],
  input: Record<string, string> | undefined,
) {
  const allowedIds = new Set(fields.map((field) => field.id));
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(input ?? {})) {
    if (!allowedIds.has(key) || typeof value !== "string") {
      continue;
    }
    if (!value.trim()) {
      continue;
    }
    normalized[key] = value;
  }

  return normalized;
}

function normalizeAdvancedRules<TData>(
  fields: readonly NormalizedAppDataTableFilterField<TData>[],
  input: readonly AppDataTableFilterRule[] | undefined,
) {
  const fieldById = new Map(fields.map((field) => [field.id, field]));
  const normalized: AppDataTableFilterRule[] = [];

  for (const item of input ?? []) {
    const field = fieldById.get(item.fieldId);
    if (!field) {
      continue;
    }
    const operator = field.operators.includes(item.operator)
      ? item.operator
      : field.operators[0];
    normalized.push({
      id: item.id,
      fieldId: item.fieldId,
      operator,
      value: item.value ?? "",
      valueTo: item.valueTo,
    });
  }

  return normalized;
}

function toFilterTextValue(value: FilterPrimitive) {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareAsDate(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
    return null;
  }
  return leftTime - rightTime;
}

function parseDateTime(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function evaluateOperator(operator: AppDataTableFilterOperator, rawValue: FilterPrimitive, value: string, valueTo?: string) {
  const left = toFilterTextValue(rawValue).trim();
  const right = value.trim();
  const rightTo = (valueTo ?? "").trim();

  if (operator === "isTrue") {
    return left === "true";
  }
  if (operator === "isFalse") {
    return left === "false";
  }
  if (!right && operator !== "notEquals") {
    return true;
  }
  if (operator === "contains") {
    return left.toLowerCase().includes(right.toLowerCase());
  }
  if (operator === "startsWith") {
    return left.toLowerCase().startsWith(right.toLowerCase());
  }
  if (operator === "endsWith") {
    return left.toLowerCase().endsWith(right.toLowerCase());
  }
  if (operator === "equals") {
    return left.toLowerCase() === right.toLowerCase();
  }
  if (operator === "notEquals") {
    return left.toLowerCase() !== right.toLowerCase();
  }
  if (operator === "on") {
    const compared = compareAsDate(left, right);
    return compared === 0;
  }
  if (operator === "before") {
    const compared = compareAsDate(left, right);
    return compared !== null && compared < 0;
  }
  if (operator === "after") {
    const compared = compareAsDate(left, right);
    return compared !== null && compared > 0;
  }
  if (operator === "between") {
    if (!rightTo) {
      return true;
    }

    const leftDate = parseDateTime(left);
    const rightDate = parseDateTime(right);
    const rightDateTo = parseDateTime(rightTo);
    if (leftDate !== null && rightDate !== null && rightDateTo !== null) {
      const from = Math.min(rightDate, rightDateTo);
      const to = Math.max(rightDate, rightDateTo);
      return leftDate >= from && leftDate <= to;
    }

    const leftNumberBetween = parseNumber(left);
    const rightNumberBetween = parseNumber(right);
    const rightNumberToBetween = parseNumber(rightTo);
    if (leftNumberBetween === null || rightNumberBetween === null || rightNumberToBetween === null) {
      return false;
    }
    const from = Math.min(rightNumberBetween, rightNumberToBetween);
    const to = Math.max(rightNumberBetween, rightNumberToBetween);
    return leftNumberBetween >= from && leftNumberBetween <= to;
  }

  const leftNumber = parseNumber(left);
  const rightNumber = parseNumber(right);
  if (leftNumber === null || rightNumber === null) {
    return false;
  }

  if (operator === "gt") {
    return leftNumber > rightNumber;
  }
  if (operator === "gte") {
    return leftNumber >= rightNumber;
  }
  if (operator === "lt") {
    return leftNumber < rightNumber;
  }
  if (operator === "lte") {
    return leftNumber <= rightNumber;
  }
  return true;
}

function normalizeColumnState<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  current?: Record<string, ColumnRuntimeState>,
) {
  return columns.reduce<Record<string, ColumnRuntimeState>>((accumulator, column) => {
    accumulator[column.id] = current?.[column.id] ?? {
      visible: column.defaultVisible ?? true,
      pinned: false,
    };
    return accumulator;
  }, {});
}

function normalizeColumnOrder<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  current?: readonly string[],
) {
  const availableIds = columns.map((column) => column.id);
  const availableSet = new Set(availableIds);
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const id of current ?? []) {
    if (!availableSet.has(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    normalized.push(id);
  }

  for (const id of availableIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    normalized.push(id);
  }

  return normalized;
}

function areStringArraysEqual(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function areFilterValueMapsEqual(left: Record<string, string>, right: Record<string, string>) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
}

function areFilterRulesEqual(left: readonly AppDataTableFilterRule[], right: readonly AppDataTableFilterRule[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftRule = left[index];
    const rightRule = right[index];
    if (!leftRule || !rightRule) {
      return false;
    }
    if (
      leftRule.id !== rightRule.id
      || leftRule.fieldId !== rightRule.fieldId
      || leftRule.operator !== rightRule.operator
      || leftRule.value !== rightRule.value
      || (leftRule.valueTo ?? "") !== (rightRule.valueTo ?? "")
    ) {
      return false;
    }
  }

  return true;
}

function shouldIgnoreRowClick(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "button, a, input, textarea, select, label, [role='button'], [data-no-row-click='true']",
    ),
  );
}

function applyPinnedOrder<TData>(
  order: readonly string[],
  state: Record<string, ColumnRuntimeState>,
  columnsById: Map<string, AppDataTableColumn<TData>>,
) {
  const pinned: string[] = [];
  const regular: string[] = [];

  for (const id of order) {
    const column = columnsById.get(id);
    if (!column) {
      continue;
    }

    const canPin = column.canPin !== false;
    const isPinned = canPin && (state[id]?.pinned ?? false);
    if (isPinned) {
      pinned.push(id);
      continue;
    }
    regular.push(id);
  }

  return [...pinned, ...regular];
}

function isSummaryRowModel(row: unknown): row is SummaryRowModel {
  if (!row || typeof row !== "object") {
    return false;
  }

  return (row as { __summary?: boolean }).__summary === true;
}

function toComparableValue(value: string | number | Date | null | undefined) {
  if (value instanceof Date) {
    return value.getTime();
  }

  return value;
}

function formatExportValue(value: ExportPrimitive) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function parseSummaryNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getSummaryValue<TData>(column: AppDataTableColumn<TData>, row: TData) {
  const rawValue =
    column.sortAccessor?.(row)
    ?? column.exportAccessor?.(row)
    ?? column.searchAccessor?.(row)
    ?? null;

  return parseSummaryNumber(rawValue);
}

function sanitizeSpreadsheetCellValue(value: string) {
  if (!value) {
    return value;
  }

  // Prevent formula execution when opening the exported sheet in Excel.
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function alignToGrid(align: ColumnAlign | undefined): "left" | "center" | "right" {
  if (align === "center") {
    return "center";
  }

  if (align === "right") {
    return "right";
  }

  return "left";
}

function parseTailwindWidthClassName(value: string | undefined) {
  if (!value) {
    return null;
  }

  const match = value.match(/(?:^|\s)w-(\d+)(?:\s|$)/);
  if (!match) {
    return null;
  }

  const scale = Number(match[1]);
  if (!Number.isFinite(scale) || scale <= 0) {
    return null;
  }

  return scale * 4;
}

function getColumnConfiguredWidth<TData>(column: AppDataTableColumn<TData>, isPinned: boolean) {
  if (typeof column.widthPx === "number" && Number.isFinite(column.widthPx) && column.widthPx > 0) {
    return Math.trunc(column.widthPx);
  }

  const fromClass = parseTailwindWidthClassName(column.widthClassName);
  if (fromClass) {
    return fromClass;
  }

  if (column.id === "index" || column.header.trim() === "#" || column.header.trim() === "№") {
    return 72;
  }

  return isPinned ? 180 : null;
}

function SearchIcon() {
  return (
    <svg aria-hidden fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9a1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6a1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.3.7.7.7H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <path d="M12 3v12" />
      <path d="M7 10l5 5l5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  if (expanded) {
    return (
      <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
        <path d="M9 9H4V4M15 9h5V4M9 15H4v5M15 15h5v5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M12 5l-6 6h12z" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg aria-hidden fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M12 19l6-6H6z" />
    </svg>
  );
}

function PinnedIcon() {
  return (
    <svg aria-hidden fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <path d="M8 4h8l-1.5 5l2.5 2.5h-4V20l-2-2l-2 2v-8.5H5L7.5 9z" />
    </svg>
  );
}

function readPersistedState<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  storageNamespace: string,
): PersistedTableState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`app-data-table:${storageNamespace}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedTableState>;
    const pageSize = typeof parsed.pageSize === "number" ? parsed.pageSize : 20;
    const columnState = normalizeColumnState(columns, parsed.columnState);
    const columnOrder = normalizeColumnOrder(
      columns,
      Array.isArray(parsed.columnOrder)
        ? parsed.columnOrder.filter((id): id is string => typeof id === "string")
        : undefined,
    );

    return {
      pageSize,
      columnState,
      columnOrder,
    };
  } catch {
    return null;
  }
}

function savePersistedState(storageNamespace: string, state: PersistedTableState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(`app-data-table:${storageNamespace}`, JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}

export function AppDataTable<TData>({
  data,
  columns,
  rowKey,
  filterFields,
  syncFiltersToUrl = false,
  onRowClick,
  rowActions,
  rowActionsTriggerLabel,
  rowActionsColumnHeader,
  rowActionsColumnWidth = 170,
  title,
  searchPlaceholder,
  addAction,
  className,
  initialPageSize = 20,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  enableSelection = true,
  pinSelectionColumn = false,
  enableSettings = true,
  enableExport = true,
  showTotals = true,
  fileNameBase = "table-data",
  storageKey,
}: AppDataTableProps<TData>) {
  const { locale, t } = useI18n();
  const storageNamespace = storageKey ?? fileNameBase;
  const normalizedFilterFields = useMemo(() => normalizeFilterFields(filterFields), [filterFields]);
  const filterFieldIdsKey = normalizedFilterFields.map((field) => field.id).join(",");
  const filterFieldById = useMemo(
    () => new Map(normalizedFilterFields.map((field) => [field.id, field])),
    [normalizedFilterFields],
  );
  const quickFilterFields = useMemo(
    () => normalizedFilterFields.filter((field) => field.quick),
    [normalizedFilterFields],
  );
  const normalizedPageSizeOptions = useMemo(() => {
    const normalized = pageSizeOptions
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((value) => Math.trunc(value));

    const deduplicated = Array.from(new Set(normalized));
    return deduplicated.length > 0 ? deduplicated : [5, 20, 50, 100];
  }, [pageSizeOptions]);
  const normalizedPageSizeOptionsKey = normalizedPageSizeOptions.join(",");
  const fallbackPageSize = normalizedPageSizeOptions[0] ?? 20;
  const resolvedInitialPageSize = normalizedPageSizeOptions.includes(initialPageSize)
    ? initialPageSize
    : fallbackPageSize;
  const [search, setSearch] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: resolvedInitialPageSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [columnState, setColumnState] = useState<Record<string, ColumnRuntimeState>>(() => normalizeColumnState(columns));
  const [columnOrder, setColumnOrder] = useState<string[]>(() => normalizeColumnOrder(columns));
  const [settingsDraft, setSettingsDraft] = useState<Record<string, ColumnRuntimeState>>(() => normalizeColumnState(columns));
  const [settingsDraftOrder, setSettingsDraftOrder] = useState<string[]>(() => normalizeColumnOrder(columns));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickFiltersDraft, setQuickFiltersDraft] = useState<Record<string, string>>({});
  const [quickFiltersApplied, setQuickFiltersApplied] = useState<Record<string, string>>({});
  const [advancedRulesDraft, setAdvancedRulesDraft] = useState<AppDataTableFilterRule[]>([]);
  const [advancedRulesApplied, setAdvancedRulesApplied] = useState<AppDataTableFilterRule[]>([]);
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const persisted = readPersistedState(columns, storageNamespace);
    if (!persisted) {
      return;
    }

    const persistedPageSize = normalizedPageSizeOptions.includes(persisted.pageSize)
      ? persisted.pageSize
      : resolvedInitialPageSize;
    setPaginationModel((current) => {
      if (current.page === 0 && current.pageSize === persistedPageSize) {
        return current;
      }
      return { ...current, page: 0, pageSize: persistedPageSize };
    });
    setColumnState((current) => {
      const currentRaw = JSON.stringify(current);
      const nextRaw = JSON.stringify(persisted.columnState);
      if (currentRaw === nextRaw) {
        return current;
      }
      return persisted.columnState;
    });
    setColumnOrder((current) => {
      if (areStringArraysEqual(current, persisted.columnOrder)) {
        return current;
      }
      return persisted.columnOrder;
    });
  }, [columns, normalizedPageSizeOptions, normalizedPageSizeOptionsKey, resolvedInitialPageSize, storageNamespace]);

  useEffect(() => {
    if (normalizedPageSizeOptions.includes(paginationModel.pageSize)) {
      return;
    }
    setPaginationModel((current) => ({
      ...current,
      page: 0,
      pageSize: fallbackPageSize,
    }));
  }, [fallbackPageSize, normalizedPageSizeOptions, normalizedPageSizeOptionsKey, paginationModel.pageSize]);

  useEffect(() => {
    savePersistedState(storageNamespace, {
      pageSize: paginationModel.pageSize,
      columnState,
      columnOrder,
    });
  }, [columnOrder, columnState, paginationModel.pageSize, storageNamespace]);

  useEffect(() => {
    const normalizedOrder = normalizeColumnOrder(columns, columnOrder);
    if (areStringArraysEqual(normalizedOrder, columnOrder)) {
      return;
    }
    setColumnOrder(normalizedOrder);
  }, [columnOrder, columns]);

  useEffect(() => {
    setQuickFiltersDraft((current) => {
      const normalized = normalizeQuickFilterValues(normalizedFilterFields, current);
      return areFilterValueMapsEqual(normalized, current) ? current : normalized;
    });
    setQuickFiltersApplied((current) => {
      const normalized = normalizeQuickFilterValues(normalizedFilterFields, current);
      return areFilterValueMapsEqual(normalized, current) ? current : normalized;
    });
    setAdvancedRulesDraft((current) => {
      const normalized = normalizeAdvancedRules(normalizedFilterFields, current);
      return areFilterRulesEqual(normalized, current) ? current : normalized;
    });
    setAdvancedRulesApplied((current) => {
      const normalized = normalizeAdvancedRules(normalizedFilterFields, current);
      return areFilterRulesEqual(normalized, current) ? current : normalized;
    });
  }, [filterFieldIdsKey, normalizedFilterFields]);

  useEffect(() => {
    if (!syncFiltersToUrl || typeof window === "undefined") {
      return;
    }
    if (normalizedFilterFields.length === 0) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const quickRaw = params.get(`dt_${storageNamespace}_${FILTER_QUICK_PARAM_SUFFIX}`);
    const rulesRaw = params.get(`dt_${storageNamespace}_${FILTER_RULES_PARAM_SUFFIX}`);

    if (quickRaw) {
      try {
        const decoded = JSON.parse(quickRaw) as Record<string, string>;
        const normalized = normalizeQuickFilterValues(normalizedFilterFields, decoded);
        setQuickFiltersApplied((current) => (areFilterValueMapsEqual(current, normalized) ? current : normalized));
        setQuickFiltersDraft((current) => (areFilterValueMapsEqual(current, normalized) ? current : normalized));
      } catch {
        // Ignore malformed url filters.
      }
    }

    if (rulesRaw) {
      try {
        const decoded = JSON.parse(rulesRaw) as AppDataTableFilterRule[];
        const normalized = normalizeAdvancedRules(normalizedFilterFields, decoded);
        setAdvancedRulesApplied((current) => (areFilterRulesEqual(current, normalized) ? current : normalized));
        setAdvancedRulesDraft((current) => (areFilterRulesEqual(current, normalized) ? current : normalized));
      } catch {
        // Ignore malformed url filters.
      }
    }
  }, [normalizedFilterFields, storageNamespace, syncFiltersToUrl]);

  useEffect(() => {
    if (!syncFiltersToUrl || typeof window === "undefined") {
      return;
    }
    if (normalizedFilterFields.length === 0) {
      return;
    }

    const url = new URL(window.location.href);
    const quickKey = `dt_${storageNamespace}_${FILTER_QUICK_PARAM_SUFFIX}`;
    const rulesKey = `dt_${storageNamespace}_${FILTER_RULES_PARAM_SUFFIX}`;

    if (Object.keys(quickFiltersApplied).length > 0) {
      url.searchParams.set(quickKey, JSON.stringify(quickFiltersApplied));
    } else {
      url.searchParams.delete(quickKey);
    }

    if (advancedRulesApplied.length > 0) {
      url.searchParams.set(rulesKey, JSON.stringify(advancedRulesApplied));
    } else {
      url.searchParams.delete(rulesKey);
    }

    const searchText = url.searchParams.toString();
    const nextUrl = `${url.pathname}${searchText ? `?${searchText}` : ""}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [advancedRulesApplied, normalizedFilterFields.length, quickFiltersApplied, storageNamespace, syncFiltersToUrl]);

  const orderedColumns = useMemo(() => {
    const columnById = new Map(columns.map((column) => [column.id, column]));
    const baseOrder = normalizeColumnOrder(columns, columnOrder)
      .map((id) => columnById.get(id))
      .filter((column): column is AppDataTableColumn<TData> => Boolean(column));

    const pinnedColumns = baseOrder.filter((column) => {
      if (column.canPin === false) {
        return false;
      }
      return columnState[column.id]?.pinned ?? false;
    });

    const regularColumns = baseOrder.filter((column) => {
      if (column.canPin === false) {
        return true;
      }
      return !(columnState[column.id]?.pinned ?? false);
    });

    return [...pinnedColumns, ...regularColumns];
  }, [columnOrder, columnState, columns]);

  const activeColumns = useMemo(() => {
    return orderedColumns.filter((column) => columnState[column.id]?.visible ?? true);
  }, [columnState, orderedColumns]);

  const columnsById = useMemo(() => {
    return new Map(columns.map((column) => [column.id, column]));
  }, [columns]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return data.filter((row) => {
      const matchesSearch = normalizedSearch.length === 0 || activeColumns.some((column) => {
        const text =
          column.searchAccessor?.(row)
          ?? (typeof column.sortAccessor?.(row) === "number" || typeof column.sortAccessor?.(row) === "string"
            ? String(column.sortAccessor?.(row))
            : "");
        return text.toLowerCase().includes(normalizedSearch);
      });

      if (!matchesSearch) {
        return false;
      }

      const matchesQuickFilters = Object.entries(quickFiltersApplied).every(([fieldId, filterValue]) => {
        const field = filterFieldById.get(fieldId);
        if (!field) {
          return true;
        }
        if (!filterValue.trim()) {
          return true;
        }
        if (field.type === "boolean") {
          const expected = filterValue === "true";
          return Boolean(field.getValue(row)) === expected;
        }
        if (field.type === "number") {
          return evaluateOperator("equals", field.getValue(row), filterValue);
        }
        if (field.type === "date") {
          return evaluateOperator("on", field.getValue(row), filterValue);
        }
        return evaluateOperator("contains", field.getValue(row), filterValue);
      });

      if (!matchesQuickFilters) {
        return false;
      }

      return advancedRulesApplied.every((rule) => {
        const field = filterFieldById.get(rule.fieldId);
        if (!field) {
          return true;
        }
        return evaluateOperator(rule.operator, field.getValue(row), rule.value, rule.valueTo);
      });
    });
  }, [activeColumns, advancedRulesApplied, data, filterFieldById, quickFiltersApplied, search]);

  const collator = useMemo(() => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }), []);
  const totalsFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const sortedFilteredRows = useMemo(() => {
    if (sortModel.length === 0) {
      return filteredRows;
    }

    const sortingEntries = sortModel
      .map((item) => {
        if (!item.sort) {
          return null;
        }
        const column = columnsById.get(item.field);
        if (!column || !column.sortAccessor) {
          return null;
        }
        return {
          column,
          direction: item.sort === "desc" ? -1 : 1,
        };
      })
      .filter((item): item is { column: AppDataTableColumn<TData>; direction: 1 | -1 } => Boolean(item));

    if (sortingEntries.length === 0) {
      return filteredRows;
    }

    const sorted = [...filteredRows];
    sorted.sort((leftRow, rightRow) => {
      for (const entry of sortingEntries) {
        const leftValue = toComparableValue(entry.column.sortAccessor?.(leftRow) ?? null);
        const rightValue = toComparableValue(entry.column.sortAccessor?.(rightRow) ?? null);

        let comparison = 0;
        if (leftValue === null || leftValue === undefined) {
          comparison = rightValue === null || rightValue === undefined ? 0 : 1;
        } else if (rightValue === null || rightValue === undefined) {
          comparison = -1;
        } else if (typeof leftValue === "number" && typeof rightValue === "number") {
          comparison = leftValue - rightValue;
        } else {
          comparison = collator.compare(String(leftValue), String(rightValue));
        }

        if (comparison !== 0) {
          return comparison * entry.direction;
        }
      }
      return 0;
    });

    return sorted;
  }, [collator, columnsById, filteredRows, sortModel]);

  const currentPageRows = useMemo(() => {
    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;
    return sortedFilteredRows.slice(startIndex, endIndex);
  }, [paginationModel.page, paginationModel.pageSize, sortedFilteredRows]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(sortedFilteredRows.length / paginationModel.pageSize) - 1);
    if (paginationModel.page <= maxPage) {
      return;
    }

    setPaginationModel((current) => ({
      ...current,
      page: maxPage,
    }));
  }, [paginationModel.page, paginationModel.pageSize, sortedFilteredRows.length]);

  const rowOrderNumberById = useMemo(() => {
    return sortedFilteredRows.reduce<Map<string, number>>((accumulator, row, index) => {
      accumulator.set(rowKey(row), index + 1);
      return accumulator;
    }, new Map<string, number>());
  }, [rowKey, sortedFilteredRows]);

  const rowNumberColumn = useMemo<GridColDef>(() => {
    return {
      field: "__rowNumber",
      headerName: "#",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "right",
      headerAlign: "right",
      width: 64,
      resizable: false,
      renderCell: (params) => {
        if (isSummaryRowModel(params.row)) {
          return "Σ";
        }
        const rowId = String(params.id);
        const absoluteIndex = rowOrderNumberById.get(rowId);
        return absoluteIndex ?? "";
      },
    };
  }, [rowOrderNumberById]);

  const pinnedColumnOffsets = useMemo(() => {
    let leftOffset = enableSelection && pinSelectionColumn ? 48 : 0;
    const pinnedOffsets: Array<{ id: string; left: number }> = [];

    for (const column of orderedColumns) {
      const isVisible = columnState[column.id]?.visible ?? true;
      const isPinned = column.canPin !== false && (columnState[column.id]?.pinned ?? false);
      if (!isVisible || !isPinned) {
        continue;
      }

      const width = getColumnConfiguredWidth(column, true) ?? 180;
      pinnedOffsets.push({ id: column.id, left: leftOffset });
      leftOffset += width;
    }

    return pinnedOffsets;
  }, [columnState, enableSelection, orderedColumns, pinSelectionColumn]);

  const gridColumns = useMemo<GridColDef[]>(() => {
    const mappedColumns = orderedColumns.map((column) => {
      const isPinned = column.canPin !== false && (columnState[column.id]?.pinned ?? false);
      const configuredWidth = getColumnConfiguredWidth(column, isPinned);
      const columnDef: GridColDef = {
        field: column.id,
        headerName: column.header,
        sortable: Boolean(column.sortAccessor),
        filterable: false,
        disableColumnMenu: true,
        align: alignToGrid(column.align),
        headerAlign: alignToGrid(column.align),
        ...(typeof configuredWidth === "number"
          ? {
              width: configuredWidth,
              minWidth: configuredWidth,
              maxWidth: configuredWidth,
            }
          : {
              flex: 1,
              minWidth: 140,
            }),
        renderHeader: () => (
          <Stack alignItems="center" direction="row" gap={0.5}>
            {isPinned ? <PinnedIcon /> : null}
            <span>{column.header}</span>
          </Stack>
        ),
        valueGetter: (_value: unknown, row: unknown) => {
          if (isSummaryRowModel(row)) {
            if (typeof row.__totals[column.id] === "number") {
              return row.__totals[column.id];
            }
            if (row.__labelField === column.id) {
              return t("table.totals");
            }
            return "";
          }
          const casted = row as TData;
          return column.sortAccessor?.(casted)
            ?? column.searchAccessor?.(casted)
            ?? column.exportAccessor?.(casted)
            ?? "";
        },
        sortComparator: (left: unknown, right: unknown) => {
          const leftValue = toComparableValue(left as string | number | Date | null | undefined);
          const rightValue = toComparableValue(right as string | number | Date | null | undefined);

          if (leftValue === null || leftValue === undefined) {
            return 1;
          }
          if (rightValue === null || rightValue === undefined) {
            return -1;
          }
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            return leftValue - rightValue;
          }
          return collator.compare(String(leftValue), String(rightValue));
        },
        renderCell: (params: { row: unknown }) => {
          if (isSummaryRowModel(params.row)) {
            const total = params.row.__totals[column.id];
            if (typeof total === "number") {
              return <strong>{totalsFormatter.format(total)}</strong>;
            }
            if (params.row.__labelField === column.id) {
              return <strong>{t("table.totals")}</strong>;
            }
            return "";
          }

          return column.cell(params.row as TData);
        },
        ...(isPinned
          ? { headerClassName: "app-pinned-col-header", cellClassName: "app-pinned-col-cell" }
          : {}),
      };

      return columnDef;
    });

    const hasExplicitIndexColumn = orderedColumns.some((column) => {
      const normalizedHeader = column.header.trim();
      return column.id === "index" || normalizedHeader === "#" || normalizedHeader === "№";
    });

    const withNumberColumn = hasExplicitIndexColumn ? mappedColumns : [rowNumberColumn, ...mappedColumns];

    if (!rowActions) {
      return withNumberColumn;
    }

    return [
      ...withNumberColumn,
      {
        field: "__rowActions",
        headerName: rowActionsColumnHeader ?? t("actionMenu.trigger"),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        width: rowActionsColumnWidth,
        resizable: false,
        renderCell: (params: { row: unknown }) => {
          if (isSummaryRowModel(params.row)) {
            return null;
          }
          const groups = rowActions(params.row as TData);
          return (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <AppActionMenu
                align="left"
                groups={groups}
                triggerLabel={rowActionsTriggerLabel ?? t("actionMenu.trigger")}
              />
            </Box>
          );
        },
      } satisfies GridColDef,
    ];
  }, [
    columnState,
    collator,
    orderedColumns,
    rowNumberColumn,
    rowActions,
    rowActionsColumnHeader,
    rowActionsColumnWidth,
    rowActionsTriggerLabel,
    totalsFormatter,
    t,
  ]);

  const pinnedStickyStyles = useMemo<Record<string, Record<string, string | number>>>(() => {
    const styles: Record<string, Record<string, string | number>> = {};

    if (enableSelection && pinSelectionColumn) {
      styles["& .MuiDataGrid-columnHeaderCheckbox"] = {
        position: "sticky",
        left: 0,
        zIndex: 90,
        backgroundColor: "rgb(var(--card))",
        backgroundImage: "none",
        backdropFilter: "none",
        opacity: 1,
        boxShadow: "1px 0 0 rgb(var(--border))",
      };
      styles["& .MuiDataGrid-cellCheckbox"] = {
        position: "sticky",
        left: 0,
        zIndex: 80,
        backgroundColor: "rgb(var(--card))",
        backgroundImage: "none",
        backdropFilter: "none",
        opacity: 1,
        boxShadow: "1px 0 0 rgb(var(--border))",
      };
    }

    for (const pinned of pinnedColumnOffsets) {
      styles[`& .MuiDataGrid-columnHeader[data-field="${pinned.id}"]`] = {
        position: "sticky",
        left: pinned.left,
        zIndex: 90,
        backgroundColor: "rgb(var(--card)) !important",
        backgroundImage: "none !important",
        backdropFilter: "none",
        opacity: 1,
        boxShadow: "1px 0 0 rgb(var(--border))",
        overflow: "hidden",
      };
      styles[`& .MuiDataGrid-cell[data-field="${pinned.id}"]`] = {
        position: "sticky",
        left: pinned.left,
        zIndex: 80,
        backgroundColor: "rgb(var(--card)) !important",
        backgroundImage: "none !important",
        backdropFilter: "none",
        opacity: 1,
        boxShadow: "1px 0 0 rgb(var(--border))",
        overflow: "hidden",
      };
    }

    return styles;
  }, [enableSelection, pinnedColumnOffsets, pinSelectionColumn]);

  const columnVisibilityModel = useMemo(() => {
    const base = orderedColumns.reduce<Record<string, boolean>>((accumulator, column) => {
      accumulator[column.id] = columnState[column.id]?.visible ?? true;
      return accumulator;
    }, {});
    base.__rowNumber = true;
    return base;
  }, [columnState, orderedColumns]);

  const selectedCount = useMemo(() => {
    if (selectionModel.type === "include") {
      return selectionModel.ids.size;
    }
    return Math.max(0, filteredRows.length - selectionModel.ids.size);
  }, [filteredRows.length, selectionModel]);

  const totalsByNumericColumns = useMemo(() => {
    if (!showTotals) {
      return [] as Array<{ id: string; header: string; total: number }>;
    }

    return activeColumns.reduce<Array<{ id: string; header: string; total: number }>>((accumulator, column) => {
      const normalizedHeader = column.header.trim();
      if (column.id === "index" || normalizedHeader === "#" || normalizedHeader === "№") {
        return accumulator;
      }

      let total = 0;
      let hasNumericValue = false;
      for (const row of filteredRows) {
        const numericValue = getSummaryValue(column, row);
        if (numericValue === null) {
          continue;
        }
        hasNumericValue = true;
        total += numericValue;
      }

      if (!hasNumericValue) {
        return accumulator;
      }

      accumulator.push({
        id: column.id,
        header: column.header,
        total,
      });
      return accumulator;
    }, []);
  }, [activeColumns, filteredRows, showTotals]);

  const totalsByColumnId = useMemo(() => {
    return totalsByNumericColumns.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.id] = item.total;
      return accumulator;
    }, {});
  }, [totalsByNumericColumns]);

  const totalsLabelColumnId = useMemo(() => {
    if (totalsByNumericColumns.length === 0) {
      return null;
    }

    const numericIds = new Set(totalsByNumericColumns.map((item) => item.id));
    const labelColumn = activeColumns.find((column) => !numericIds.has(column.id));
    return labelColumn?.id ?? activeColumns[0]?.id ?? null;
  }, [activeColumns, totalsByNumericColumns]);

  const summaryRowModel = useMemo<SummaryRowModel | null>(() => {
    if (!showTotals || totalsByNumericColumns.length === 0) {
      return null;
    }

    return {
      id: SUMMARY_ROW_ID,
      __summary: true,
      __totals: totalsByColumnId,
      __labelField: totalsLabelColumnId,
    };
  }, [showTotals, totalsByColumnId, totalsByNumericColumns.length, totalsLabelColumnId]);

  const gridRows = useMemo(() => {
    if (!summaryRowModel) {
      return currentPageRows;
    }
    return [...currentPageRows, summaryRowModel];
  }, [currentPageRows, summaryRowModel]);

  const hasFilters = normalizedFilterFields.length > 0;
  const canApplyFilters = hasFilters
    && (
      JSON.stringify(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersDraft))
        !== JSON.stringify(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersApplied))
      || JSON.stringify(normalizeAdvancedRules(normalizedFilterFields, advancedRulesDraft))
        !== JSON.stringify(normalizeAdvancedRules(normalizedFilterFields, advancedRulesApplied))
    );

  const operatorLabels = useMemo<Record<AppDataTableFilterOperator, string>>(() => ({
    contains: t("table.filter.operator.contains"),
    equals: t("table.filter.operator.equals"),
    notEquals: t("table.filter.operator.notEquals"),
    startsWith: t("table.filter.operator.startsWith"),
    endsWith: t("table.filter.operator.endsWith"),
    gt: t("table.filter.operator.gt"),
    gte: t("table.filter.operator.gte"),
    lt: t("table.filter.operator.lt"),
    lte: t("table.filter.operator.lte"),
    between: t("table.filter.operator.between"),
    on: t("table.filter.operator.on"),
    before: t("table.filter.operator.before"),
    after: t("table.filter.operator.after"),
    isTrue: t("table.filter.operator.isTrue"),
    isFalse: t("table.filter.operator.isFalse"),
  }), [t]);

  const createDefaultRule = () => {
    const field = normalizedFilterFields[0];
    if (!field) {
      return null;
    }
    return {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fieldId: field.id,
      operator: field.operators[0],
      value: "",
    };
  };

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const quickChips: ActiveFilterChip[] = Object.entries(quickFiltersApplied).map(([fieldId, value]) => {
      const field = filterFieldById.get(fieldId);
      return {
        id: `quick:${fieldId}`,
        label: field ? `${field.label}: ${value}` : value,
        fieldId,
        isRule: false,
      };
    });

    const advancedChips: ActiveFilterChip[] = advancedRulesApplied.map((rule) => {
      const field = filterFieldById.get(rule.fieldId);
      const operatorLabel = operatorLabels[rule.operator] ?? rule.operator;
      const valueLabel = rule.operator === "isTrue" || rule.operator === "isFalse"
        ? ""
        : rule.operator === "between"
          ? `${rule.value} - ${rule.valueTo ?? ""}`
          : rule.value;
      return {
        id: `rule:${rule.id}`,
        label: field ? `${field.label} ${operatorLabel}${valueLabel ? ` ${valueLabel}` : ""}` : operatorLabel,
        fieldId: rule.fieldId,
        ruleId: rule.id,
        isRule: true,
      };
    });

    return [...quickChips, ...advancedChips];
  }, [advancedRulesApplied, filterFieldById, operatorLabels, quickFiltersApplied]);

  const handleOpenSettings = () => {
    setSettingsDraft(normalizeColumnState(columns, columnState));
    setSettingsDraftOrder(normalizeColumnOrder(columns, columnOrder));
    setSettingsOpen(true);
  };

  const handleOpenFilters = () => {
    setQuickFiltersDraft(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersApplied));
    setAdvancedRulesDraft(normalizeAdvancedRules(normalizedFilterFields, advancedRulesApplied));
    setFiltersOpen(true);
  };

  const handleApplyFilters = () => {
    setQuickFiltersApplied(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersDraft));
    setAdvancedRulesApplied(normalizeAdvancedRules(normalizedFilterFields, advancedRulesDraft));
    setPaginationModel((current) => ({ ...current, page: 0 }));
    setFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setQuickFiltersDraft({});
    setQuickFiltersApplied({});
    setAdvancedRulesDraft([]);
    setAdvancedRulesApplied([]);
    setPaginationModel((current) => ({ ...current, page: 0 }));
    setFiltersOpen(false);
  };

  const handleApplySettings = () => {
    const orderedWithPinned = applyPinnedOrder(settingsDraftOrder, settingsDraft, columnsById);
    setColumnState(settingsDraft);
    setColumnOrder(orderedWithPinned);
    setSettingsOpen(false);
  };

  const moveDraftColumn = (columnId: string, direction: "up" | "down") => {
    setSettingsDraftOrder((current) => {
      const index = current.indexOf(columnId);
      if (index < 0) {
        return current;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const sourceValue = next[index];
      const targetValue = next[targetIndex];
      if (!sourceValue || !targetValue) {
        return current;
      }
      next[index] = targetValue;
      next[targetIndex] = sourceValue;
      return next;
    });
  };

  const handleAddAdvancedRule = () => {
    const nextRule = createDefaultRule();
    if (!nextRule) {
      return;
    }
    setAdvancedRulesDraft((current) => [...current, nextRule]);
  };

  const handleUpdateAdvancedRule = (
    ruleId: string,
    update: Partial<Pick<AppDataTableFilterRule, "fieldId" | "operator" | "value" | "valueTo">>,
  ) => {
    setAdvancedRulesDraft((current) => {
      return current.map((rule) => {
        if (rule.id !== ruleId) {
          return rule;
        }

        const nextFieldId = update.fieldId ?? rule.fieldId;
        const nextField = filterFieldById.get(nextFieldId);
        const nextOperators = nextField?.operators ?? getDefaultOperators("text");
        const nextOperator = update.operator
          ?? (nextFieldId !== rule.fieldId ? nextOperators[0] : rule.operator);
        const expectsValue = nextOperator !== "isTrue" && nextOperator !== "isFalse";
        const nextValue = expectsValue ? (update.value ?? rule.value) : "";

        const nextValueTo = nextOperator === "between"
          ? (update.valueTo ?? rule.valueTo ?? "")
          : undefined;

        const nextRule: AppDataTableFilterRule = {
          id: rule.id,
          fieldId: nextFieldId,
          operator: nextOperator,
          value: nextValue,
          ...(nextValueTo ? { valueTo: nextValueTo } : {}),
        };

        return nextRule;
      });
    });
  };

  const handleRemoveAdvancedRule = (ruleId: string) => {
    setAdvancedRulesDraft((current) => current.filter((rule) => rule.id !== ruleId));
  };

  const exportRows = useMemo(() => {
    const selectedIdSet = new Set(Array.from(selectionModel.ids).map((id) => String(id)));
    const sourceRows = selectedCount > 0
      ? filteredRows.filter((row) => {
          const id = rowKey(row);
          if (selectionModel.type === "include") {
            return selectedIdSet.has(id);
          }
          return !selectedIdSet.has(id);
        })
      : filteredRows;

    return sourceRows.map((row) => {
      return activeColumns.reduce<Record<string, string>>((record, column) => {
        const exportValue =
          column.exportAccessor?.(row)
          ?? column.searchAccessor?.(row)
          ?? column.sortAccessor?.(row)
          ?? "";
        record[column.header] = formatExportValue(exportValue);
        return record;
      }, {});
    });
  }, [activeColumns, filteredRows, rowKey, selectedCount, selectionModel]);

  const handleExportExcel = async () => {
    if (exportRows.length === 0) {
      return;
    }

    const safeExportRows = exportRows.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, rawValue]) => [key, sanitizeSpreadsheetCellValue(rawValue)]),
      );
    });

    const xlsx = await import("xlsx");
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(safeExportRows);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Data");
    xlsx.writeFileXLSX(workbook, `${fileNameBase}.xlsx`);
  };

  const handleExportPdf = async () => {
    if (exportRows.length === 0) {
      return;
    }

    const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const autoTable = (autoTableModule.default ?? autoTableModule) as (
      doc: InstanceType<typeof jsPDF>,
      options: { head: string[][]; body: string[][]; styles?: Record<string, unknown>; headStyles?: Record<string, unknown> },
    ) => void;

    const pdf = new jsPDF({ orientation: "landscape" });
    const head = [activeColumns.map((column) => column.header)];
    const body = exportRows.map((row) => activeColumns.map((column) => row[column.header] ?? ""));

    autoTable(pdf, {
      head,
      body,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [245, 179, 1], textColor: [17, 24, 39] },
    });

    pdf.save(`${fileNameBase}.pdf`);
  };

  const rowHeight = 40;
  const columnHeaderHeight = 40;
  const tableHeight = Math.min(560, Math.max(220, filteredRows.length * rowHeight + columnHeaderHeight + 72));

  return (
    <Box
      className={className}
      sx={{
        display: "grid",
        gap: 1,
        ...(isFullscreen
          ? {
              position: "fixed",
              zIndex: (theme) => theme.zIndex.modal + 1,
              inset: 12,
              p: 1.5,
              bgcolor: "background.default",
              borderRadius: 2,
              boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
            }
          : null),
        width: "100%",
        minWidth: 0,
      }}
    >
      {title ? <Typography variant="h4">{title}</Typography> : null}

      <Stack alignItems={{ md: "center" }} direction={{ xs: "column", md: "row" }} flexWrap="wrap" gap={0.75}>
        <Box sx={{ width: { xs: "100%", md: 300 } }}>
          <AppInput
            onChangeValue={(value) => {
              setSearch(value);
              setPaginationModel((current) => ({ ...current, page: 0 }));
            }}
            placeholder={searchPlaceholder ?? t("table.searchPlaceholder")}
            prefix={<SearchIcon />}
            value={search}
          />
        </Box>

        {quickFilterFields.slice(0, 3).map((field) => {
          if (field.type === "select" || field.type === "boolean") {
            return (
              <Box key={field.id} sx={{ width: { xs: "100%", md: 180 } }}>
                <AppSelect
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setQuickFiltersDraft((current) => ({
                      ...current,
                      [field.id]: nextValue,
                    }));
                  }}
                  options={[
                    { label: t("table.filter.any"), value: "" },
                    ...((field.options ?? []).map((option) => ({ label: option.label, value: option.value }))),
                  ]}
                  value={quickFiltersDraft[field.id] ?? ""}
                />
              </Box>
            );
          }

          return (
            <Box key={field.id} sx={{ width: { xs: "100%", md: 190 } }}>
              <AppInput
                onChangeValue={(nextValue) => {
                  setQuickFiltersDraft((current) => ({
                    ...current,
                    [field.id]: nextValue,
                  }));
                }}
                placeholder={field.label}
                type={field.type === "date" || field.type === "number" ? field.type : "text"}
                value={quickFiltersDraft[field.id] ?? ""}
              />
            </Box>
          );
        })}

        <Stack direction="row" flexWrap="wrap" gap={0.5} ml={{ md: "auto" }}>
          {hasFilters ? (
            <>
              <AppButton
                disabled={!canApplyFilters}
                label={t("datePicker.apply")}
                onClick={() => {
                  setQuickFiltersApplied(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersDraft));
                  setAdvancedRulesApplied(normalizeAdvancedRules(normalizedFilterFields, advancedRulesDraft));
                  setPaginationModel((current) => ({ ...current, page: 0 }));
                }}
                size="sm"
                variant="outline"
              />
              <AppButton
                label={t("table.filter.advanced")}
                onClick={handleOpenFilters}
                size="sm"
                variant="secondary"
              />
            </>
          ) : null}

          {enableExport ? (
            <>
              <Tooltip title={t("table.export")}>
                <IconButton
                  onClick={(event) => setExportAnchorEl(event.currentTarget)}
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={exportAnchorEl} onClose={() => setExportAnchorEl(null)} open={Boolean(exportAnchorEl)}>
                <MenuItem onClick={() => {
                  setExportAnchorEl(null);
                  void handleExportPdf();
                }}>
                  {t("table.exportPdf")}
                </MenuItem>
                <MenuItem onClick={() => {
                  setExportAnchorEl(null);
                  void handleExportExcel();
                }}>
                  {t("table.exportExcel")}
                </MenuItem>
              </Menu>
            </>
          ) : null}

          {enableSettings ? (
            <Tooltip title={t("table.settings")}>
              <IconButton onClick={handleOpenSettings} sx={{ border: 1, borderColor: "divider" }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title={isFullscreen ? t("table.exitFullscreen") : t("table.fullscreen")}>
            <IconButton onClick={() => setIsFullscreen((current) => !current)} sx={{ border: 1, borderColor: "divider" }}>
              <ExpandIcon expanded={isFullscreen} />
            </IconButton>
          </Tooltip>

          {addAction ? <AppButton label={addAction.label} onClick={addAction.onClick} variant="primary" /> : null}
        </Stack>
      </Stack>

      {activeFilterChips.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {activeFilterChips.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              onDelete={() => {
                if (chip.isRule) {
                  setAdvancedRulesApplied((current) => current.filter((rule) => rule.id !== chip.ruleId));
                  setAdvancedRulesDraft((current) => current.filter((rule) => rule.id !== chip.ruleId));
                } else {
                  setQuickFiltersApplied((current) => {
                    const next = { ...current };
                    delete next[chip.fieldId];
                    return next;
                  });
                  setQuickFiltersDraft((current) => {
                    const next = { ...current };
                    delete next[chip.fieldId];
                    return next;
                  });
                }
                setPaginationModel((current) => ({ ...current, page: 0 }));
              }}
              size="small"
              variant="outlined"
            />
          ))}
          <AppButton label={t("datePicker.clear")} onClick={handleResetFilters} size="sm" variant="text" />
        </Stack>
      ) : null}

      <Paper sx={{ p: 0.5, width: "100%", minWidth: 0, overflow: "hidden" }}>
        <Box sx={{ height: isFullscreen ? "calc(100vh - 230px)" : tableHeight }}>
          <DataGrid
            checkboxSelection={enableSelection}
            columnHeaderHeight={columnHeaderHeight}
            columnVisibilityModel={columnVisibilityModel}
            disableColumnFilter
            disableColumnResize
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            getRowId={(row) => (isSummaryRowModel(row) ? SUMMARY_ROW_ID : rowKey(row as TData))}
            getRowClassName={(params) => {
              if (isSummaryRowModel(params.row)) {
                return "app-row-summary";
              }
              return params.indexRelativeToCurrentPage % 2 === 0 ? "app-row-even" : "app-row-odd";
            }}
            isRowSelectable={(params) => !isSummaryRowModel(params.row)}
            onPaginationModelChange={setPaginationModel}
            onSortModelChange={setSortModel}
            onRowClick={(params, event) => {
              if (!onRowClick || shouldIgnoreRowClick(event.target) || isSummaryRowModel(params.row)) {
                return;
              }
              onRowClick(params.row as TData);
            }}
            onRowSelectionModelChange={setSelectionModel}
            pageSizeOptions={[...normalizedPageSizeOptions]}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={sortedFilteredRows.length}
            rowHeight={rowHeight}
            rowSelectionModel={selectionModel}
            rows={gridRows as readonly Record<string, unknown>[]}
            sortingMode="server"
            sortModel={sortModel}
            slotProps={{
              pagination: {
                labelRowsPerPage: t("table.rowsPerPage"),
                SelectProps: { size: "small" },
              },
            }}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                zIndex: 3,
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
                py: 0.25,
              },
              "& .app-pinned-col-header": {
                bgcolor: "background.paper",
                color: "text.primary",
                backgroundColor: "rgb(var(--card)) !important",
                backgroundImage: "none !important",
                backdropFilter: "none",
                isolation: "isolate",
                opacity: 1,
                boxShadow: "1px 0 0 rgb(var(--border))",
                overflow: "hidden",
              },
              "& .app-pinned-col-cell": {
                bgcolor: "background.paper",
                backgroundColor: "rgb(var(--card)) !important",
                backgroundImage: "none !important",
                backdropFilter: "none",
                isolation: "isolate",
                opacity: 1,
                boxShadow: "1px 0 0 rgb(var(--border))",
                overflow: "hidden",
              },
              "& .app-row-odd": {
                bgcolor: "rgba(127,127,127,0.04)",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "action.hover",
              },
              "& .app-row-odd .app-pinned-col-cell": {
                backgroundColor: "rgb(var(--card)) !important",
              },
              "& .MuiDataGrid-row:hover .app-pinned-col-cell": {
                backgroundColor: "rgb(var(--card)) !important",
              },
              "& .app-row-summary .app-pinned-col-cell": {
                backgroundColor: "rgb(var(--card)) !important",
              },
              "& .app-row-summary": {
                bgcolor: "action.selected",
                fontWeight: 700,
                cursor: "default",
              },
              "& .app-row-summary:hover": {
                bgcolor: "action.selected",
              },
              ...(onRowClick
                ? {
                    "& .MuiDataGrid-row": {
                      cursor: "pointer",
                    },
                  }
                : null),
              "& .MuiTablePagination-selectLabel": {
                display: "block !important",
                mb: 0,
                fontSize: 13,
              },
              "& .MuiTablePagination-input": {
                display: "inline-flex !important",
              },
              "& .MuiTablePagination-toolbar": {
                minHeight: 38,
                pl: 0.5,
                pr: 0.5,
              },
              "& .MuiTablePagination-displayedRows": { fontSize: 13, mb: 0 },
              ...pinnedStickyStyles,
            }}
            columns={gridColumns}
          />
        </Box>
      </Paper>

      <Dialog fullWidth maxWidth="lg" onClose={() => setFiltersOpen(false)} open={filtersOpen}>
        <DialogTitle>{t("table.filter.title")}</DialogTitle>
        <DialogContent>
          {normalizedFilterFields.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              {t("table.filter.noFields")}
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {advancedRulesDraft.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  {t("table.filter.noRules")}
                </Typography>
              ) : null}

              {advancedRulesDraft.map((rule) => {
                const field = filterFieldById.get(rule.fieldId) ?? normalizedFilterFields[0];
                if (!field) {
                  return null;
                }
                const isBetween = rule.operator === "between";
                const isBooleanOperator = rule.operator === "isTrue" || rule.operator === "isFalse";
                const valueInputType = field.type === "number" || field.type === "date" ? field.type : "text";
                const operatorOptions = (field.operators ?? []).map((operator) => ({
                  value: operator,
                  label: operatorLabels[operator] ?? operator,
                }));
                const useSelectValueInput = !isBooleanOperator && (field.type === "select" || field.type === "boolean");
                const valueOptions = field.options.map((option) => ({
                  value: option.value,
                  label: option.label,
                }));

                return (
                  <Stack
                    alignItems={{ md: "center" }}
                    direction={{ xs: "column", md: "row" }}
                    key={rule.id}
                    spacing={0.75}
                  >
                    <Box sx={{ width: { xs: "100%", md: 220 } }}>
                      <AppSelect
                        onChange={(event) => handleUpdateAdvancedRule(rule.id, { fieldId: event.target.value })}
                        options={normalizedFilterFields.map((item) => ({
                          value: item.id,
                          label: item.label,
                        }))}
                        value={field.id}
                      />
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: 180 } }}>
                      <AppSelect
                        onChange={(event) => handleUpdateAdvancedRule(rule.id, { operator: event.target.value as AppDataTableFilterOperator })}
                        options={operatorOptions}
                        value={rule.operator}
                      />
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: 220 } }}>
                      {isBooleanOperator ? null : useSelectValueInput ? (
                        <AppSelect
                          onChange={(event) => handleUpdateAdvancedRule(rule.id, { value: event.target.value })}
                          options={valueOptions}
                          value={rule.value}
                        />
                      ) : (
                        <AppInput
                          onChangeValue={(nextValue) => handleUpdateAdvancedRule(rule.id, { value: nextValue })}
                          placeholder={t("table.filter.value")}
                          type={valueInputType}
                          value={rule.value}
                        />
                      )}
                    </Box>
                    {isBetween && !isBooleanOperator ? (
                      <Box sx={{ width: { xs: "100%", md: 220 } }}>
                        <AppInput
                          onChangeValue={(nextValue) => handleUpdateAdvancedRule(rule.id, { valueTo: nextValue })}
                          placeholder={t("table.filter.valueTo")}
                          type={valueInputType}
                          value={rule.valueTo ?? ""}
                        />
                      </Box>
                    ) : null}
                    <IconButton
                      aria-label={t("table.filter.removeRule")}
                      onClick={() => handleRemoveAdvancedRule(rule.id)}
                      sx={{ border: 1, borderColor: "divider" }}
                    >
                      ×
                    </IconButton>
                  </Stack>
                );
              })}

              <Box>
                <AppButton label={t("table.filter.addRule")} onClick={handleAddAdvancedRule} size="sm" variant="outline" />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton label={t("table.reset")} onClick={handleResetFilters} variant="secondary" />
          <AppButton label={t("widget.filter.close")} onClick={() => setFiltersOpen(false)} variant="text" />
          <AppButton
            disabled={!canApplyFilters}
            label={t("datePicker.apply")}
            onClick={handleApplyFilters}
            variant="primary"
          />
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="md" onClose={() => setSettingsOpen(false)} open={settingsOpen}>
        <DialogTitle>{t("table.settingsTitle")}</DialogTitle>
        <DialogContent>
          <Stack divider={<Divider flexItem />} spacing={1}>
            {settingsDraftOrder.map((columnId, index) => {
              const column = columnsById.get(columnId);
              if (!column) {
                return null;
              }

              const state = settingsDraft[column.id] ?? { visible: true, pinned: false };
              return (
                <Stack alignItems="center" direction="row" justifyContent="space-between" key={column.id} py={0.5}>
                  <Typography variant="body2">{column.header}</Typography>
                  <Stack alignItems="center" direction="row" gap={1.5}>
                    <Stack direction="row" gap={0.25}>
                      <IconButton
                        aria-label={`Move ${column.header} up`}
                        disabled={index === 0}
                        onClick={() => moveDraftColumn(column.id, "up")}
                        size="small"
                        sx={{ border: 1, borderColor: "divider" }}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Move ${column.header} down`}
                        disabled={index === settingsDraftOrder.length - 1}
                        onClick={() => moveDraftColumn(column.id, "down")}
                        size="small"
                        sx={{ border: 1, borderColor: "divider" }}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                    </Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={state.visible}
                          disabled={column.canHide === false}
                          onChange={(_event, next) => {
                            setSettingsDraft((current) => ({
                              ...current,
                              [column.id]: {
                                ...(current[column.id] ?? state),
                                visible: next,
                              },
                            }));
                          }}
                        />
                      }
                      label={t("table.columnVisible")}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={state.pinned}
                          disabled={column.canPin === false}
                          onChange={(_event, next) => {
                            setSettingsDraft((current) => ({
                              ...current,
                              [column.id]: {
                                ...(current[column.id] ?? state),
                                pinned: next,
                              },
                            }));
                          }}
                        />
                      }
                      label={t("table.columnPinned")}
                    />
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton
            label={t("table.reset")}
            onClick={() => {
              setSettingsDraft(normalizeColumnState(columns));
              setSettingsDraftOrder(normalizeColumnOrder(columns));
            }}
            variant="secondary"
          />
          <AppButton label={t("table.save")} onClick={handleApplySettings} variant="primary" />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
