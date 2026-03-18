"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
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
import { AppActionMenu } from "@/shared/ui/primitives/action-menu";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppInput } from "@/shared/ui/primitives/input";
import { AppSelect } from "@/shared/ui/primitives/select";

import type {
  ActiveFilterChip,
  AppDataTableColumn,
  AppDataTableFilterOperator,
  AppDataTableFilterRule,
  AppDataTableProps,
  ColumnRuntimeState,
  SummaryRowModel,
} from "./types";
import {
  alignToGrid,
  applyPinnedOrder,
  areFilterRulesEqual,
  areFilterValueMapsEqual,
  areStringArraysEqual,
  evaluateOperator,
  formatExportValue,
  getColumnConfiguredWidth,
  getDefaultOperators,
  getSummaryValue,
  isSummaryRowModel,
  normalizeAdvancedRules,
  normalizeColumnOrder,
  normalizeColumnState,
  normalizeFilterFields,
  normalizeQuickFilterValues,
  readPersistedState,
  sanitizeSpreadsheetCellValue,
  savePersistedState,
  shouldIgnoreRowClick,
  toComparableValue,
} from "./utils";
import { ExportIcon, ExpandIcon, PinnedIcon, SearchIcon, SettingsIcon } from "./icons";
import { FilterDialog } from "./filter-dialog";
import { SettingsDialog } from "./settings-dialog";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 20, 50, 100] as const;
const FILTER_RULES_PARAM_SUFFIX = "rules";
const FILTER_QUICK_PARAM_SUFFIX = "quick";
const SUMMARY_ROW_ID = "__app_table_summary__";

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

  // ---------------------------------------------------------------------------
  // Filter fields normalization
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Page size normalization
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Core state
  // ---------------------------------------------------------------------------

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: resolvedInitialPageSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  // ---------------------------------------------------------------------------
  // Column settings state
  // ---------------------------------------------------------------------------

  const [columnState, setColumnState] = useState<Record<string, ColumnRuntimeState>>(() =>
    normalizeColumnState(columns),
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() => normalizeColumnOrder(columns));
  const [settingsDraft, setSettingsDraft] = useState<Record<string, ColumnRuntimeState>>(() =>
    normalizeColumnState(columns),
  );
  const [settingsDraftOrder, setSettingsDraftOrder] = useState<string[]>(() =>
    normalizeColumnOrder(columns),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Filter state
  // ---------------------------------------------------------------------------

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickFiltersDraft, setQuickFiltersDraft] = useState<Record<string, string>>({});
  const [quickFiltersApplied, setQuickFiltersApplied] = useState<Record<string, string>>({});
  const [advancedRulesDraft, setAdvancedRulesDraft] = useState<AppDataTableFilterRule[]>([]);
  const [advancedRulesApplied, setAdvancedRulesApplied] = useState<AppDataTableFilterRule[]>([]);
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLElement | null>(null);

  // ---------------------------------------------------------------------------
  // FIX #2: Escape key exits fullscreen
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // ---------------------------------------------------------------------------
  // Persistence effects
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Filter sync effects
  // ---------------------------------------------------------------------------

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
        setQuickFiltersApplied((current) =>
          areFilterValueMapsEqual(current, normalized) ? current : normalized,
        );
        setQuickFiltersDraft((current) =>
          areFilterValueMapsEqual(current, normalized) ? current : normalized,
        );
      } catch {
        // Ignore malformed url filters.
      }
    }

    if (rulesRaw) {
      try {
        const decoded = JSON.parse(rulesRaw) as AppDataTableFilterRule[];
        const normalized = normalizeAdvancedRules(normalizedFilterFields, decoded);
        setAdvancedRulesApplied((current) =>
          areFilterRulesEqual(current, normalized) ? current : normalized,
        );
        setAdvancedRulesDraft((current) =>
          areFilterRulesEqual(current, normalized) ? current : normalized,
        );
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

  // ---------------------------------------------------------------------------
  // Column computations
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // FIX #1: Deferred search for better performance on large datasets
  // ---------------------------------------------------------------------------

  const filteredRows = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    return data.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        activeColumns.some((column) => {
          const text =
            column.searchAccessor?.(row) ??
            (typeof column.sortAccessor?.(row) === "number" ||
            typeof column.sortAccessor?.(row) === "string"
              ? String(column.sortAccessor?.(row))
              : "");
          return text.toLowerCase().includes(normalizedSearch);
        });

      if (!matchesSearch) {
        return false;
      }

      const matchesQuickFilters = Object.entries(quickFiltersApplied).every(
        ([fieldId, filterValue]) => {
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
        },
      );

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
  }, [activeColumns, advancedRulesApplied, data, deferredSearch, filterFieldById, quickFiltersApplied]);

  // ---------------------------------------------------------------------------
  // Sorting & pagination
  // ---------------------------------------------------------------------------

  const collator = useMemo(
    () => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }),
    [],
  );
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
      .filter(
        (item): item is { column: AppDataTableColumn<TData>; direction: 1 | -1 } => Boolean(item),
      );

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
    const maxPage = Math.max(
      0,
      Math.ceil(sortedFilteredRows.length / paginationModel.pageSize) - 1,
    );
    if (paginationModel.page <= maxPage) {
      return;
    }

    setPaginationModel((current) => ({
      ...current,
      page: maxPage,
    }));
  }, [paginationModel.page, paginationModel.pageSize, sortedFilteredRows.length]);

  // ---------------------------------------------------------------------------
  // Row numbering
  // ---------------------------------------------------------------------------

  const rowOrderNumberById = useMemo(() => {
    return sortedFilteredRows.reduce<Map<string, number>>((acc, row, index) => {
      acc.set(rowKey(row), index + 1);
      return acc;
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

  // ---------------------------------------------------------------------------
  // Pinned column offsets
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Grid columns definition
  // ---------------------------------------------------------------------------

  const gridColumns = useMemo<GridColDef[]>(() => {
    const mappedColumns = orderedColumns.map((column) => {
      const isPinned =
        column.canPin !== false && (columnState[column.id]?.pinned ?? false);
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
          return (
            column.sortAccessor?.(casted) ??
            column.searchAccessor?.(casted) ??
            column.exportAccessor?.(casted) ??
            ""
          );
        },
        sortComparator: (left: unknown, right: unknown) => {
          const leftValue = toComparableValue(
            left as string | number | Date | null | undefined,
          );
          const rightValue = toComparableValue(
            right as string | number | Date | null | undefined,
          );

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

    const withNumberColumn = hasExplicitIndexColumn
      ? mappedColumns
      : [rowNumberColumn, ...mappedColumns];

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

  // ---------------------------------------------------------------------------
  // Pinned sticky styles
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Visibility & selection
  // ---------------------------------------------------------------------------

  const columnVisibilityModel = useMemo(() => {
    const base = orderedColumns.reduce<Record<string, boolean>>((acc, column) => {
      acc[column.id] = columnState[column.id]?.visible ?? true;
      return acc;
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

  // ---------------------------------------------------------------------------
  // Totals / summary row
  // ---------------------------------------------------------------------------

  const totalsByNumericColumns = useMemo(() => {
    if (!showTotals) {
      return [] as Array<{ id: string; header: string; total: number }>;
    }

    return activeColumns.reduce<Array<{ id: string; header: string; total: number }>>(
      (acc, column) => {
        const normalizedHeader = column.header.trim();
        if (column.id === "index" || normalizedHeader === "#" || normalizedHeader === "№") {
          return acc;
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
          return acc;
        }

        acc.push({ id: column.id, header: column.header, total });
        return acc;
      },
      [],
    );
  }, [activeColumns, filteredRows, showTotals]);

  const totalsByColumnId = useMemo(() => {
    return totalsByNumericColumns.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = item.total;
      return acc;
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

  // ---------------------------------------------------------------------------
  // FIX #4: Use proper equality helpers instead of JSON.stringify
  // ---------------------------------------------------------------------------

  const hasFilters = normalizedFilterFields.length > 0;
  const canApplyFilters = useMemo(() => {
    if (!hasFilters) {
      return false;
    }
    const quickDraftNormalized = normalizeQuickFilterValues(normalizedFilterFields, quickFiltersDraft);
    const quickAppliedNormalized = normalizeQuickFilterValues(normalizedFilterFields, quickFiltersApplied);
    if (!areFilterValueMapsEqual(quickDraftNormalized, quickAppliedNormalized)) {
      return true;
    }
    const rulesDraftNormalized = normalizeAdvancedRules(normalizedFilterFields, advancedRulesDraft);
    const rulesAppliedNormalized = normalizeAdvancedRules(normalizedFilterFields, advancedRulesApplied);
    return !areFilterRulesEqual(rulesDraftNormalized, rulesAppliedNormalized);
  }, [
    advancedRulesApplied,
    advancedRulesDraft,
    hasFilters,
    normalizedFilterFields,
    quickFiltersApplied,
    quickFiltersDraft,
  ]);

  // ---------------------------------------------------------------------------
  // Operator labels
  // ---------------------------------------------------------------------------

  const operatorLabels = useMemo<Record<AppDataTableFilterOperator, string>>(
    () => ({
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
    }),
    [t],
  );

  // ---------------------------------------------------------------------------
  // Filter chips
  // ---------------------------------------------------------------------------

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const quickChips: ActiveFilterChip[] = Object.entries(quickFiltersApplied).map(
      ([fieldId, value]) => {
        const field = filterFieldById.get(fieldId);
        return {
          id: `quick:${fieldId}`,
          label: field ? `${field.label}: ${value}` : value,
          fieldId,
          isRule: false,
        };
      },
    );

    const advancedChips: ActiveFilterChip[] = advancedRulesApplied.map((rule) => {
      const field = filterFieldById.get(rule.fieldId);
      const operatorLabel = operatorLabels[rule.operator] ?? rule.operator;
      const valueLabel =
        rule.operator === "isTrue" || rule.operator === "isFalse"
          ? ""
          : rule.operator === "between"
            ? `${rule.value} - ${rule.valueTo ?? ""}`
            : rule.value;
      return {
        id: `rule:${rule.id}`,
        label: field
          ? `${field.label} ${operatorLabel}${valueLabel ? ` ${valueLabel}` : ""}`
          : operatorLabel,
        fieldId: rule.fieldId,
        ruleId: rule.id,
        isRule: true,
      };
    });

    return [...quickChips, ...advancedChips];
  }, [advancedRulesApplied, filterFieldById, operatorLabels, quickFiltersApplied]);

  // ---------------------------------------------------------------------------
  // Settings handlers
  // ---------------------------------------------------------------------------

  const handleOpenSettings = useCallback(() => {
    setSettingsDraft(normalizeColumnState(columns, columnState));
    setSettingsDraftOrder(normalizeColumnOrder(columns, columnOrder));
    setSettingsOpen(true);
  }, [columnOrder, columnState, columns]);

  const handleApplySettings = useCallback(() => {
    const orderedWithPinned = applyPinnedOrder(settingsDraftOrder, settingsDraft, columnsById);
    setColumnState(settingsDraft);
    setColumnOrder(orderedWithPinned);
    setSettingsOpen(false);
  }, [columnsById, settingsDraft, settingsDraftOrder]);

  const handleToggleVisible = useCallback(
    (columnId: string, next: boolean) => {
      setSettingsDraft((current) => ({
        ...current,
        [columnId]: {
          ...(current[columnId] ?? { visible: true, pinned: false }),
          visible: next,
        },
      }));
    },
    [],
  );

  const handleTogglePinned = useCallback(
    (columnId: string, next: boolean) => {
      setSettingsDraft((current) => ({
        ...current,
        [columnId]: {
          ...(current[columnId] ?? { visible: true, pinned: false }),
          pinned: next,
        },
      }));
    },
    [],
  );

  const handleMoveColumn = useCallback((columnId: string, direction: "up" | "down") => {
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
  }, []);

  const handleResetSettings = useCallback(() => {
    setSettingsDraft(normalizeColumnState(columns));
    setSettingsDraftOrder(normalizeColumnOrder(columns));
  }, [columns]);

  // ---------------------------------------------------------------------------
  // Filter handlers
  // ---------------------------------------------------------------------------

  const handleOpenFilters = useCallback(() => {
    setQuickFiltersDraft(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersApplied));
    setAdvancedRulesDraft(
      normalizeAdvancedRules(normalizedFilterFields, advancedRulesApplied),
    );
    setFiltersOpen(true);
  }, [advancedRulesApplied, normalizedFilterFields, quickFiltersApplied]);

  const handleApplyFilters = useCallback(() => {
    setQuickFiltersApplied(normalizeQuickFilterValues(normalizedFilterFields, quickFiltersDraft));
    setAdvancedRulesApplied(normalizeAdvancedRules(normalizedFilterFields, advancedRulesDraft));
    setPaginationModel((current) => ({ ...current, page: 0 }));
    setFiltersOpen(false);
  }, [advancedRulesDraft, normalizedFilterFields, quickFiltersDraft]);

  const handleResetFilters = useCallback(() => {
    setQuickFiltersDraft({});
    setQuickFiltersApplied({});
    setAdvancedRulesDraft([]);
    setAdvancedRulesApplied([]);
    setPaginationModel((current) => ({ ...current, page: 0 }));
    setFiltersOpen(false);
  }, []);

  const handleAddAdvancedRule = useCallback(() => {
    const field = normalizedFilterFields[0];
    if (!field) {
      return;
    }
    setAdvancedRulesDraft((current) => [
      ...current,
      {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fieldId: field.id,
        operator: field.operators[0],
        value: "",
      },
    ]);
  }, [normalizedFilterFields]);

  const handleUpdateAdvancedRule = useCallback(
    (
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
          const nextOperator =
            update.operator ?? (nextFieldId !== rule.fieldId ? nextOperators[0] : rule.operator);
          const expectsValue = nextOperator !== "isTrue" && nextOperator !== "isFalse";
          const nextValue = expectsValue ? (update.value ?? rule.value) : "";
          const nextValueTo =
            nextOperator === "between" ? (update.valueTo ?? rule.valueTo ?? "") : undefined;

          return {
            id: rule.id,
            fieldId: nextFieldId,
            operator: nextOperator,
            value: nextValue,
            ...(nextValueTo ? { valueTo: nextValueTo } : {}),
          };
        });
      });
    },
    [filterFieldById],
  );

  const handleRemoveAdvancedRule = useCallback((ruleId: string) => {
    setAdvancedRulesDraft((current) => current.filter((rule) => rule.id !== ruleId));
  }, []);

  // ---------------------------------------------------------------------------
  // FIX #3: Export with loading indicator
  // ---------------------------------------------------------------------------

  const exportRows = useMemo(() => {
    const selectedIdSet = new Set(Array.from(selectionModel.ids).map((id) => String(id)));
    const sourceRows =
      selectedCount > 0
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
          column.exportAccessor?.(row) ??
          column.searchAccessor?.(row) ??
          column.sortAccessor?.(row) ??
          "";
        record[column.header] = formatExportValue(exportValue);
        return record;
      }, {});
    });
  }, [activeColumns, filteredRows, rowKey, selectedCount, selectionModel]);

  const handleExportExcel = useCallback(async () => {
    if (exportRows.length === 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const safeExportRows = exportRows.map((row) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, rawValue]) => [
            key,
            sanitizeSpreadsheetCellValue(rawValue),
          ]),
        );
      });

      const xlsx = await import("xlsx");
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(safeExportRows);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Data");
      xlsx.writeFileXLSX(workbook, `${fileNameBase}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  }, [exportRows, fileNameBase, isExporting]);

  const handleExportPdf = useCallback(async () => {
    if (exportRows.length === 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = (autoTableModule.default ?? autoTableModule) as (
        doc: InstanceType<typeof jsPDF>,
        options: {
          head: string[][];
          body: string[][];
          styles?: Record<string, unknown>;
          headStyles?: Record<string, unknown>;
        },
      ) => void;

      const pdf = new jsPDF({ orientation: "landscape" });
      const head = [activeColumns.map((column) => column.header)];
      const body = exportRows.map((row) =>
        activeColumns.map((column) => row[column.header] ?? ""),
      );

      autoTable(pdf, {
        head,
        body,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [245, 179, 1], textColor: [17, 24, 39] },
      });

      pdf.save(`${fileNameBase}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }, [activeColumns, exportRows, fileNameBase, isExporting]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const rowHeight = 40;
  const columnHeaderHeight = 40;

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

      {/* ---- Toolbar ---- */}
      <Stack
        alignItems={{ md: "center" }}
        direction={{ xs: "column", md: "row" }}
        flexWrap="wrap"
        gap={0.75}
      >
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
                    ...field.options.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
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
                  setQuickFiltersApplied(
                    normalizeQuickFilterValues(normalizedFilterFields, quickFiltersDraft),
                  );
                  setAdvancedRulesApplied(
                    normalizeAdvancedRules(normalizedFilterFields, advancedRulesDraft),
                  );
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
              <Tooltip title={isExporting ? t("table.exporting") : t("table.export")}>
                <span>
                  <IconButton
                    disabled={isExporting}
                    onClick={(event) => setExportAnchorEl(event.currentTarget)}
                    sx={{ border: 1, borderColor: "divider" }}
                  >
                    {isExporting ? <CircularProgress size={20} /> : <ExportIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Menu
                anchorEl={exportAnchorEl}
                onClose={() => setExportAnchorEl(null)}
                open={Boolean(exportAnchorEl)}
              >
                <MenuItem
                  disabled={isExporting}
                  onClick={() => {
                    setExportAnchorEl(null);
                    void handleExportPdf();
                  }}
                >
                  {t("table.exportPdf")}
                </MenuItem>
                <MenuItem
                  disabled={isExporting}
                  onClick={() => {
                    setExportAnchorEl(null);
                    void handleExportExcel();
                  }}
                >
                  {t("table.exportExcel")}
                </MenuItem>
              </Menu>
            </>
          ) : null}

          {enableSettings ? (
            <Tooltip title={t("table.settings")}>
              <IconButton
                onClick={handleOpenSettings}
                sx={{ border: 1, borderColor: "divider" }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title={isFullscreen ? t("table.exitFullscreen") : t("table.fullscreen")}>
            <IconButton
              onClick={() => setIsFullscreen((current) => !current)}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <ExpandIcon expanded={isFullscreen} />
            </IconButton>
          </Tooltip>

          {addAction ? (
            <AppButton label={addAction.label} onClick={addAction.onClick} variant="primary" />
          ) : null}
        </Stack>
      </Stack>

      {/* ---- Active filter chips ---- */}
      {activeFilterChips.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {activeFilterChips.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              onDelete={() => {
                if (chip.isRule) {
                  setAdvancedRulesApplied((current) =>
                    current.filter((rule) => rule.id !== chip.ruleId),
                  );
                  setAdvancedRulesDraft((current) =>
                    current.filter((rule) => rule.id !== chip.ruleId),
                  );
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
          <AppButton
            label={t("datePicker.clear")}
            onClick={handleResetFilters}
            size="sm"
            variant="text"
          />
        </Stack>
      ) : null}

      {/* ---- Data Grid ---- */}
      <Paper sx={{ p: 0.5, width: "100%", minWidth: 0, overflow: "hidden" }}>
        <Box sx={isFullscreen ? { height: "calc(100vh - 230px)" } : undefined}>
          <DataGrid
            autoHeight={!isFullscreen}
            checkboxSelection={enableSelection}
            columnHeaderHeight={columnHeaderHeight}
            columnVisibilityModel={columnVisibilityModel}
            columns={gridColumns}
            disableColumnFilter
            disableColumnResize
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            getRowClassName={(params) => {
              if (isSummaryRowModel(params.row)) {
                return "app-row-summary";
              }
              return params.indexRelativeToCurrentPage % 2 === 0
                ? "app-row-even"
                : "app-row-odd";
            }}
            getRowId={(row) =>
              isSummaryRowModel(row) ? SUMMARY_ROW_ID : rowKey(row as TData)
            }
            isRowSelectable={(params) => !isSummaryRowModel(params.row)}
            onPaginationModelChange={setPaginationModel}
            onRowClick={(params, event) => {
              if (
                !onRowClick ||
                shouldIgnoreRowClick(event.target) ||
                isSummaryRowModel(params.row)
              ) {
                return;
              }
              onRowClick(params.row as TData);
            }}
            onRowSelectionModelChange={setSelectionModel}
            onSortModelChange={setSortModel}
            pageSizeOptions={[...normalizedPageSizeOptions]}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={sortedFilteredRows.length}
            rowHeight={rowHeight}
            rowSelectionModel={selectionModel}
            rows={gridRows as readonly Record<string, unknown>[]}
            slotProps={{
              pagination: {
                labelRowsPerPage: t("table.rowsPerPage"),
                SelectProps: { size: "small" },
              },
            }}
            sortModel={sortModel}
            sortingMode="server"
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
          />
        </Box>
      </Paper>

      {/* ---- Dialogs ---- */}
      <FilterDialog
        advancedRulesDraft={advancedRulesDraft}
        canApply={canApplyFilters}
        filterFieldById={filterFieldById}
        filterFields={normalizedFilterFields}
        onAddRule={handleAddAdvancedRule}
        onApply={handleApplyFilters}
        onClose={() => setFiltersOpen(false)}
        onRemoveRule={handleRemoveAdvancedRule}
        onReset={handleResetFilters}
        onUpdateRule={handleUpdateAdvancedRule}
        open={filtersOpen}
        operatorLabels={operatorLabels}
        t={t}
      />

      <SettingsDialog
        columnsById={columnsById}
        onApply={handleApplySettings}
        onClose={() => setSettingsOpen(false)}
        onMoveColumn={handleMoveColumn}
        onReset={handleResetSettings}
        onTogglePinned={handleTogglePinned}
        onToggleVisible={handleToggleVisible}
        open={settingsOpen}
        settingsDraft={settingsDraft}
        settingsDraftOrder={settingsDraftOrder}
        t={t}
      />
    </Box>
  );
}
