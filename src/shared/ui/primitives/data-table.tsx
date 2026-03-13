"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnPinningState,
  type ColumnSort,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingFn,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppInput } from "@/shared/ui/primitives/input";

type SortDirection = "asc" | "desc";
type ColumnAlign = "left" | "center" | "right";
type ExportPrimitive = string | number | boolean | Date | null | undefined;

interface ColumnRuntimeState {
  visible: boolean;
  pinned: boolean;
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
  title?: string;
  searchPlaceholder?: string;
  addAction?: AddAction;
  className?: string;
  initialPageSize?: number;
  pageSizeOptions?: readonly number[];
  enableSelection?: boolean;
  enableSettings?: boolean;
  enableExport?: boolean;
  fileNameBase?: string;
}

function SearchIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (direction === "asc") {
    return (
      <svg aria-hidden className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 5l-6 6h12z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (direction === "desc") {
    return (
      <svg aria-hidden className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 19l6-6H6z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5l-4 4h8zM12 19l4-4H8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9a1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6a1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.3.7.7.7H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3v12" />
      <path d="M7 10l5 5l5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 18l-6-6l6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 18l6-6l-6-6" />
    </svg>
  );
}

function DotsDragIcon() {
  return (
    <svg aria-hidden className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  );
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full border transition-colors",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
        disabled && "cursor-not-allowed opacity-60",
      )}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-7" : "translate-x-1",
        )}
      />
    </button>
  );
}

function Checkbox({
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
}) {
  return (
    <button
      aria-checked={indeterminate ? "mixed" : checked}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md border text-sm transition-colors",
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-transparent",
        disabled && "cursor-not-allowed opacity-60",
      )}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="checkbox"
      type="button"
    >
      {indeterminate ? "−" : "✓"}
    </button>
  );
}

function normalizeColumnState<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  current?: Record<string, ColumnRuntimeState>,
) {
  return columns.reduce<Record<string, ColumnRuntimeState>>((accumulator, column) => {
    const fallback: ColumnRuntimeState = {
      visible: column.defaultVisible ?? true,
      pinned: column.defaultPinned ?? false,
    };

    accumulator[column.id] = current?.[column.id] ?? fallback;
    return accumulator;
  }, {});
}

function resetColumnState<TData>(columns: readonly AppDataTableColumn<TData>[]) {
  return columns.reduce<Record<string, ColumnRuntimeState>>((accumulator, column) => {
    accumulator[column.id] = {
      visible: column.defaultVisible ?? true,
      pinned: column.defaultPinned ?? false,
    };
    return accumulator;
  }, {});
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

function getColumnAlignmentClass(align: ColumnAlign | undefined) {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

function getPageButtons(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

function toColumnVisibilityState(columnState: Record<string, ColumnRuntimeState>): VisibilityState {
  return Object.entries(columnState).reduce<VisibilityState>((accumulator, [columnId, state]) => {
    accumulator[columnId] = state.visible;
    return accumulator;
  }, {});
}

function toColumnPinningState(columnState: Record<string, ColumnRuntimeState>): ColumnPinningState {
  const left = Object.entries(columnState)
    .filter(([, state]) => state.pinned)
    .map(([columnId]) => columnId);

  return { left };
}

function getActiveColumns<TData>(
  columns: readonly AppDataTableColumn<TData>[],
  columnState: Record<string, ColumnRuntimeState>,
) {
  const visibleColumns = columns.filter((column) => columnState[column.id]?.visible ?? true);

  return [...visibleColumns].sort((left, right) => {
    const leftPinned = columnState[left.id]?.pinned ?? false;
    const rightPinned = columnState[right.id]?.pinned ?? false;

    if (leftPinned === rightPinned) {
      return 0;
    }

    return leftPinned ? -1 : 1;
  });
}

function triStateSortToggle(columnId: string, sorting: SortingState): SortingState {
  const current = sorting.find((entry) => entry.id === columnId);

  if (!current) {
    return [{ id: columnId, desc: false }];
  }

  if (!current.desc) {
    return [{ id: columnId, desc: true }];
  }

  return [];
}

export function AppDataTable<TData>({
  data,
  columns,
  rowKey,
  title,
  searchPlaceholder,
  addAction,
  className,
  initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  enableSelection = true,
  enableSettings = true,
  enableExport = true,
  fileNameBase = "table-data",
}: AppDataTableProps<TData>) {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnState, setColumnState] = useState<Record<string, ColumnRuntimeState>>(() =>
    normalizeColumnState(columns),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Record<string, ColumnRuntimeState>>(() =>
    normalizeColumnState(columns),
  );

  useEffect(() => {
    setColumnState((current) => normalizeColumnState(columns, current));
    setSettingsDraft((current) => normalizeColumnState(columns, current));
  }, [columns]);

  const activeColumns = useMemo(() => {
    return getActiveColumns(columns, columnState);
  }, [columnState, columns]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return data;
    }

    return data.filter((row) => {
      return activeColumns.some((column) => {
        const explicitSearch = column.searchAccessor?.(row);
        const sortText = column.sortAccessor?.(row);
        const fallbackValue =
          explicitSearch ??
          (typeof sortText === "string" || typeof sortText === "number" ? String(sortText) : "");

        return fallbackValue.toLowerCase().includes(normalizedSearch);
      });
    });
  }, [activeColumns, data, search]);

  const collator = useMemo(() => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }), []);

  const appSort = useMemo<SortingFn<TData>>(
    () =>
      (rowA: Row<TData>, rowB: Row<TData>, columnId: string) => {
        const leftValue = toComparableValue(rowA.getValue(columnId) as string | number | Date | null | undefined);
        const rightValue = toComparableValue(rowB.getValue(columnId) as string | number | Date | null | undefined);

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
    [collator],
  );

  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    return columns.map((column) => ({
      id: column.id,
      accessorFn: (row) => {
        return column.sortAccessor?.(row)
          ?? column.searchAccessor?.(row)
          ?? column.exportAccessor?.(row)
          ?? "";
      },
      enableSorting: Boolean(column.sortAccessor),
      sortingFn: appSort,
    }));
  }, [appSort, columns]);

  const columnVisibility = useMemo(() => {
    return toColumnVisibilityState(columnState);
  }, [columnState]);

  const columnPinning = useMemo(() => {
    return toColumnPinningState(columnState);
  }, [columnState]);

  const table = useReactTable<TData>({
    data: filteredRows as TData[],
    columns: tableColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      columnPinning,
    },
    getRowId: rowKey,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const sortedRows = table.getSortedRowModel().rows;
  const pageRows = table.getPaginationRowModel().rows;
  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, table.getPageCount());
  const safePage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const showingFrom = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = totalRows === 0 ? 0 : Math.min(totalRows, safePage * pageSize);
  const pageButtons = getPageButtons(safePage, totalPages);

  useEffect(() => {
    const pageIndex = table.getState().pagination.pageIndex;
    const maxPageIndex = Math.max(0, totalPages - 1);

    if (pageIndex > maxPageIndex) {
      table.setPageIndex(maxPageIndex);
    }
  }, [table, totalPages]);

  const allPageSelected = enableSelection && table.getIsAllPageRowsSelected();
  const somePageSelected = enableSelection && table.getIsSomePageRowsSelected();

  const openSettings = () => {
    setSettingsDraft(normalizeColumnState(columns, columnState));
    setSettingsOpen(true);
  };

  const applySettings = () => {
    setColumnState(settingsDraft);
    setSettingsOpen(false);
    table.setPageIndex(0);
  };

  const resetSettings = () => {
    setSettingsDraft(resetColumnState(columns));
  };

  const exportColumns = activeColumns;

  const exportRows = sortedRows.map((row) => {
    return exportColumns.reduce<Record<string, string>>((record, column) => {
      const exportValue =
        column.exportAccessor?.(row.original) ??
        column.searchAccessor?.(row.original) ??
        column.sortAccessor?.(row.original) ??
        "";

      record[column.header] = formatExportValue(exportValue);
      return record;
    }, {});
  });

  const handleExportExcel = async () => {
    if (exportRows.length === 0) {
      return;
    }

    const xlsx = await import("xlsx");
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(exportRows);

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
      options: {
        head: string[][];
        body: string[][];
        styles?: Record<string, unknown>;
        headStyles?: Record<string, unknown>;
      },
    ) => void;

    const pdf = new jsPDF({ orientation: "landscape" });
    const head = [exportColumns.map((column) => column.header)];
    const body = exportRows.map((row) => exportColumns.map((column) => row[column.header] ?? ""));

    autoTable(pdf, {
      head,
      body,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [245, 179, 1], textColor: [17, 24, 39] },
    });

    pdf.save(`${fileNameBase}.pdf`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {title ? <h3 className="text-xl font-semibold text-foreground">{title}</h3> : null}

      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-11 min-w-20 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          onChange={(event) => {
            const nextPageSize = Number(event.target.value);
            table.setPageSize(nextPageSize);
            table.setPageIndex(0);
          }}
          value={String(pageSize)}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={String(option)}>
              {option}
            </option>
          ))}
        </select>

        <div className="w-full max-w-[340px]">
          <AppInput
            onChangeValue={(value) => {
              setSearch(value);
              table.setPageIndex(0);
            }}
            placeholder={searchPlaceholder ?? t("table.searchPlaceholder")}
            prefix={<SearchIcon />}
            value={search}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {enableExport ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={t("table.export")}
                  type="button"
                >
                  <ExportIcon />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-30 w-44 rounded-xl border border-border bg-card p-2 shadow-md"
                  sideOffset={8}
                >
                  <DropdownMenu.Item
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors focus:bg-muted data-[highlighted]:bg-muted"
                    onSelect={handleExportPdf}
                  >
                    {t("table.exportPdf")}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors focus:bg-muted data-[highlighted]:bg-muted"
                    onSelect={handleExportExcel}
                  >
                    {t("table.exportExcel")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : null}

          {enableSettings ? (
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={openSettings}
              title={t("table.settings")}
              type="button"
            >
              <SettingsIcon />
            </button>
          ) : null}

          {addAction ? (
            <AppButton label={addAction.label} leading={<PlusIcon />} onClick={addAction.onClick} variant="primary" />
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                {enableSelection ? (
                  <th className="w-14 px-3 py-3 text-left align-middle">
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={!allPageSelected && somePageSelected}
                      onChange={(next) => table.toggleAllPageRowsSelected(next)}
                    />
                  </th>
                ) : null}

                {activeColumns.map((column) => {
                  const isSortable = Boolean(column.sortAccessor);
                  const currentSort = sorting.find((sort) => sort.id === column.id) as ColumnSort | undefined;
                  const isActiveSort: SortDirection | null = currentSort
                    ? (currentSort.desc ? "desc" : "asc")
                    : null;

                  return (
                    <th
                      className={cn(
                        "px-4 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
                        getColumnAlignmentClass(column.align),
                        column.widthClassName,
                      )}
                      key={column.id}
                    >
                      {isSortable ? (
                        <button
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            column.align === "right" && "ml-auto",
                            column.align === "center" && "mx-auto",
                          )}
                          onClick={() => setSorting((current) => triStateSortToggle(column.id, current))}
                          type="button"
                        >
                          <span>{column.header}</span>
                          <SortIcon direction={isActiveSort} />
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                    colSpan={activeColumns.length + (enableSelection ? 1 : 0)}
                  >
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const key = row.id;

                  return (
                    <tr className="border-b border-border/80 transition-colors hover:bg-muted/40" key={key}>
                      {enableSelection ? (
                        <td className="px-3 py-3 align-middle">
                          <Checkbox checked={row.getIsSelected()} onChange={(next) => row.toggleSelected(next)} />
                        </td>
                      ) : null}

                      {activeColumns.map((column) => (
                        <td
                          className={cn(
                            "px-4 py-3 text-sm text-foreground",
                            getColumnAlignmentClass(column.align),
                            column.widthClassName,
                          )}
                          key={`${key}-${column.id}`}
                        >
                          {column.cell(row.original)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>{t("table.showing", { from: showingFrom, to: showingTo, total: totalRows })}</p>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            type="button"
          >
            <ChevronLeftIcon />
            <ChevronLeftIcon />
          </button>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            type="button"
          >
            <ChevronLeftIcon />
          </button>

          {pageButtons.map((pageNumber) => {
            const isActive = pageNumber === safePage;

            return (
              <button
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
                key={pageNumber}
                onClick={() => table.setPageIndex(pageNumber - 1)}
                type="button"
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            type="button"
          >
            <ChevronRightIcon />
          </button>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(totalPages - 1)}
            type="button"
          >
            <ChevronRightIcon />
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <Dialog.Root onOpenChange={setSettingsOpen} open={settingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg focus:outline-none">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-foreground">{t("table.settingsTitle")}</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  type="button"
                >
                  ×
                </button>
              </Dialog.Close>
            </div>

            <div className="max-h-[58vh] overflow-auto px-4 py-2 md:px-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">{t("table.columnName")}</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-muted-foreground">{t("table.columnVisible")}</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-muted-foreground">{t("table.columnPinned")}</th>
                    <th className="w-14 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {columns.map((column) => {
                    const state = settingsDraft[column.id] ?? {
                      visible: column.defaultVisible ?? true,
                      pinned: column.defaultPinned ?? false,
                    };

                    return (
                      <tr className="border-b border-border/80" key={column.id}>
                        <td className="px-3 py-4 text-sm text-foreground">{column.header}</td>
                        <td className="px-3 py-4 text-center">
                          <Toggle
                            checked={state.visible}
                            disabled={column.canHide === false}
                            onChange={(next) => {
                              setSettingsDraft((current) => ({
                                ...current,
                                [column.id]: {
                                  ...state,
                                  visible: next,
                                },
                              }));
                            }}
                          />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <Toggle
                            checked={state.pinned}
                            disabled={column.canPin === false}
                            onChange={(next) => {
                              setSettingsDraft((current) => ({
                                ...current,
                                [column.id]: {
                                  ...state,
                                  pinned: next,
                                },
                              }));
                            }}
                          />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <DotsDragIcon />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-3 border-t border-border px-6 py-4">
              <AppButton label={t("table.reset")} onClick={resetSettings} variant="secondary" />
              <AppButton label={t("table.save")} onClick={applySettings} variant="primary" />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
