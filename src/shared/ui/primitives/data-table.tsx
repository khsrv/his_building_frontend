"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

interface SortState {
  columnId: string;
  direction: SortDirection;
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

function clampPage(page: number, totalPages: number) {
  if (totalPages <= 0) {
    return 1;
  }

  if (page < 1) {
    return 1;
  }

  if (page > totalPages) {
    return totalPages;
  }

  return page;
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
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [columnState, setColumnState] = useState<Record<string, ColumnRuntimeState>>(() =>
    normalizeColumnState(columns),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Record<string, ColumnRuntimeState>>(() =>
    normalizeColumnState(columns),
  );
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    setColumnState((current) => normalizeColumnState(columns, current));
    setSettingsDraft((current) => normalizeColumnState(columns, current));
  }, [columns]);

  useEffect(() => {
    if (!exportMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !exportMenuRef.current?.contains(target)) {
        setExportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [exportMenuOpen]);

  const activeColumns = useMemo(() => {
    const visibleColumns = columns.filter((column) => columnState[column.id]?.visible ?? true);

    return [...visibleColumns].sort((left, right) => {
      const leftPinned = columnState[left.id]?.pinned ?? false;
      const rightPinned = columnState[right.id]?.pinned ?? false;

      if (leftPinned === rightPinned) {
        return 0;
      }

      return leftPinned ? -1 : 1;
    });
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

  const sortedRows = useMemo(() => {
    if (!sortState) {
      return filteredRows;
    }

    const sortColumn = columns.find((column) => column.id === sortState.columnId);
    if (!sortColumn?.sortAccessor) {
      return filteredRows;
    }

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const directionFactor = sortState.direction === "asc" ? 1 : -1;

    return [...filteredRows].sort((left, right) => {
      const leftValue = toComparableValue(sortColumn.sortAccessor?.(left));
      const rightValue = toComparableValue(sortColumn.sortAccessor?.(right));

      if (leftValue === null || leftValue === undefined) {
        return 1;
      }

      if (rightValue === null || rightValue === undefined) {
        return -1;
      }

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * directionFactor;
      }

      return collator.compare(String(leftValue), String(rightValue)) * directionFactor;
    });
  }, [columns, filteredRows, sortState]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = clampPage(page, totalPages);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [pageSize, safePage, sortedRows]);

  const allPageSelected = pageRows.length > 0 && pageRows.every((row) => selectedKeys.has(rowKey(row)));
  const somePageSelected = pageRows.some((row) => selectedKeys.has(rowKey(row)));

  const showingFrom = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = totalRows === 0 ? 0 : Math.min(totalRows, safePage * pageSize);

  const pageButtons = getPageButtons(safePage, totalPages);

  const toggleSort = (columnId: string) => {
    setSortState((current) => {
      if (!current || current.columnId !== columnId) {
        return { columnId, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { columnId, direction: "desc" };
      }

      return null;
    });
  };

  const toggleSelectAllOnPage = (next: boolean) => {
    setSelectedKeys((current) => {
      const nextKeys = new Set(current);

      pageRows.forEach((row) => {
        const key = rowKey(row);
        if (next) {
          nextKeys.add(key);
        } else {
          nextKeys.delete(key);
        }
      });

      return nextKeys;
    });
  };

  const toggleRowSelection = (key: string, next: boolean) => {
    setSelectedKeys((current) => {
      const nextKeys = new Set(current);
      if (next) {
        nextKeys.add(key);
      } else {
        nextKeys.delete(key);
      }
      return nextKeys;
    });
  };

  const openSettings = () => {
    setSettingsDraft(normalizeColumnState(columns, columnState));
    setSettingsOpen(true);
  };

  const applySettings = () => {
    setColumnState(settingsDraft);
    setSettingsOpen(false);
    setPage(1);
  };

  const resetSettings = () => {
    setSettingsDraft(resetColumnState(columns));
  };

  const exportColumns = activeColumns;

  const exportRows = sortedRows.map((row) => {
    return exportColumns.reduce<Record<string, string>>((record, column) => {
      const exportValue =
        column.exportAccessor?.(row) ??
        column.searchAccessor?.(row) ??
        column.sortAccessor?.(row) ??
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
    setExportMenuOpen(false);
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
    setExportMenuOpen(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {title ? <h3 className="text-xl font-semibold text-foreground">{title}</h3> : null}

      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-11 min-w-20 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          onChange={(event) => {
            const nextPageSize = Number(event.target.value);
            setPageSize(nextPageSize);
            setPage(1);
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
              setPage(1);
            }}
            placeholder={searchPlaceholder ?? t("table.searchPlaceholder")}
            prefix={<SearchIcon />}
            value={search}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {enableExport ? (
            <div className="relative" ref={exportMenuRef}>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setExportMenuOpen((current) => !current)}
                title={t("table.export")}
                type="button"
              >
                <ExportIcon />
              </button>

              {exportMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-44 rounded-xl border border-border bg-card p-2 shadow-md">
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={handleExportPdf}
                    type="button"
                  >
                    {t("table.exportPdf")}
                  </button>
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={handleExportExcel}
                    type="button"
                  >
                    {t("table.exportExcel")}
                  </button>
                </div>
              ) : null}
            </div>
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
                      onChange={toggleSelectAllOnPage}
                    />
                  </th>
                ) : null}

                {activeColumns.map((column) => {
                  const isSortable = Boolean(column.sortAccessor);
                  const isActiveSort = sortState?.columnId === column.id ? sortState.direction : null;

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
                          onClick={() => toggleSort(column.id)}
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
                  <td className="px-4 py-12 text-center text-sm text-muted-foreground" colSpan={activeColumns.length + (enableSelection ? 1 : 0)}>
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const key = rowKey(row);

                  return (
                    <tr className="border-b border-border/80 transition-colors hover:bg-muted/40" key={key}>
                      {enableSelection ? (
                        <td className="px-3 py-3 align-middle">
                          <Checkbox
                            checked={selectedKeys.has(key)}
                            onChange={(next) => toggleRowSelection(key, next)}
                          />
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
                          {column.cell(row)}
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
            disabled={safePage <= 1}
            onClick={() => setPage(1)}
            type="button"
          >
            <ChevronLeftIcon />
            <ChevronLeftIcon />
          </button>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => clampPage(current - 1, totalPages))}
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
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => clampPage(current + 1, totalPages))}
            type="button"
          >
            <ChevronRightIcon />
          </button>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50"
            disabled={safePage >= totalPages}
            onClick={() => setPage(totalPages)}
            type="button"
          >
            <ChevronRightIcon />
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h4 className="text-lg font-semibold text-foreground">{t("table.settingsTitle")}</h4>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setSettingsOpen(false)}
                type="button"
              >
                ×
              </button>
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
