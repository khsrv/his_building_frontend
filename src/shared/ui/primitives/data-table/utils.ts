import { parseISO, isValid } from "date-fns";
import type {
  AppDataTableColumn,
  AppDataTableFilterOperator,
  AppDataTableFilterRule,
  AppDataTableFilterField,
  ColumnAlign,
  ColumnRuntimeState,
  ExportPrimitive,
  FilterInputType,
  FilterPrimitive,
  NonEmptyOperators,
  NormalizedFilterField,
  PersistedTableState,
  SummaryRowModel,
} from "./types";

// ---------------------------------------------------------------------------
// Operator defaults
// ---------------------------------------------------------------------------

export function getDefaultOperators(type: FilterInputType): NonEmptyOperators {
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

function normalizeOperators(
  type: FilterInputType,
  operators: readonly AppDataTableFilterOperator[] | undefined,
): NonEmptyOperators {
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

// ---------------------------------------------------------------------------
// Filter field normalization
// ---------------------------------------------------------------------------

export function normalizeFilterFields<TData>(
  fields: readonly AppDataTableFilterField<TData>[] | undefined,
): NormalizedFilterField<TData>[] {
  return (fields ?? []).map((field) => {
    const options =
      field.type === "boolean"
        ? [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ]
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

export function normalizeQuickFilterValues<TData>(
  fields: readonly NormalizedFilterField<TData>[],
  input: Record<string, string> | undefined,
): Record<string, string> {
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

export function normalizeAdvancedRules<TData>(
  fields: readonly NormalizedFilterField<TData>[],
  input: readonly AppDataTableFilterRule[] | undefined,
): AppDataTableFilterRule[] {
  const fieldById = new Map(fields.map((field) => [field.id, field]));
  const normalized: AppDataTableFilterRule[] = [];

  for (const item of input ?? []) {
    const field = fieldById.get(item.fieldId);
    if (!field) {
      continue;
    }
    const operator = field.operators.includes(item.operator) ? item.operator : field.operators[0];
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

// ---------------------------------------------------------------------------
// Filter evaluation (uses date-fns for safe date parsing)
// ---------------------------------------------------------------------------

function toFilterTextValue(value: FilterPrimitive): string {
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

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateTimeSafe(value: string): number | null {
  const date = parseISO(value);
  if (isValid(date)) {
    return date.getTime();
  }
  return null;
}

function compareAsDate(left: string, right: string): number | null {
  const leftTime = parseDateTimeSafe(left);
  const rightTime = parseDateTimeSafe(right);
  if (leftTime === null || rightTime === null) {
    return null;
  }
  return leftTime - rightTime;
}

export function evaluateOperator(
  operator: AppDataTableFilterOperator,
  rawValue: FilterPrimitive,
  value: string,
  valueTo?: string,
): boolean {
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

    const leftDate = parseDateTimeSafe(left);
    const rightDate = parseDateTimeSafe(right);
    const rightDateTo = parseDateTimeSafe(rightTo);
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

// ---------------------------------------------------------------------------
// Column state helpers
// ---------------------------------------------------------------------------

export function normalizeColumnState<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  current?: Record<string, ColumnRuntimeState>,
): Record<string, ColumnRuntimeState> {
  return columns.reduce<Record<string, ColumnRuntimeState>>((acc, column) => {
    acc[column.id] = current?.[column.id] ?? {
      visible: column.defaultVisible ?? true,
      pinned: false,
    };
    return acc;
  }, {});
}

export function normalizeColumnOrder<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  current?: readonly string[],
): string[] {
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

// ---------------------------------------------------------------------------
// Equality helpers
// ---------------------------------------------------------------------------

export function areStringArraysEqual(left: readonly string[], right: readonly string[]): boolean {
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

export function areFilterValueMapsEqual(
  left: Record<string, string>,
  right: Record<string, string>,
): boolean {
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

export function areFilterRulesEqual(
  left: readonly AppDataTableFilterRule[],
  right: readonly AppDataTableFilterRule[],
): boolean {
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
      leftRule.id !== rightRule.id ||
      leftRule.fieldId !== rightRule.fieldId ||
      leftRule.operator !== rightRule.operator ||
      leftRule.value !== rightRule.value ||
      (leftRule.valueTo ?? "") !== (rightRule.valueTo ?? "")
    ) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Row / cell helpers
// ---------------------------------------------------------------------------

export function shouldIgnoreRowClick(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    target.closest(
      "button, a, input, textarea, select, label, [role='button'], [data-no-row-click='true']",
    ),
  );
}

export function applyPinnedOrder<TData>(
  order: readonly string[],
  state: Record<string, ColumnRuntimeState>,
  columnsById: Map<string, AppDataTableColumn<TData>>,
): string[] {
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

export function isSummaryRowModel(row: unknown): row is SummaryRowModel {
  if (!row || typeof row !== "object") {
    return false;
  }
  return (row as { __summary?: boolean }).__summary === true;
}

export function toComparableValue(
  value: string | number | Date | null | undefined,
): string | number | null | undefined {
  if (value instanceof Date) {
    return value.getTime();
  }
  return value;
}

export function formatExportValue(value: ExportPrimitive): string {
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

export function getSummaryValue<TData>(
  column: AppDataTableColumn<TData>,
  row: TData,
): number | null {
  const rawValue =
    column.sortAccessor?.(row) ?? column.exportAccessor?.(row) ?? column.searchAccessor?.(row) ?? null;
  return parseSummaryNumber(rawValue);
}

export function sanitizeSpreadsheetCellValue(value: string): string {
  if (!value) {
    return value;
  }
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export function alignToGrid(align: ColumnAlign | undefined): "left" | "center" | "right" {
  if (align === "center") {
    return "center";
  }
  if (align === "right") {
    return "right";
  }
  return "left";
}

function parseTailwindWidthClassName(value: string | undefined): number | null {
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

export function getColumnConfiguredWidth<TData>(
  column: AppDataTableColumn<TData>,
  isPinned: boolean,
): number | null {
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

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export function readPersistedState<TData>(
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

    return { pageSize, columnState, columnOrder };
  } catch {
    return null;
  }
}

export function savePersistedState(storageNamespace: string, state: PersistedTableState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(`app-data-table:${storageNamespace}`, JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}
