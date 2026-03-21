"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Divider,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";
import {
  AppButton,
  AppColorGrid,
  AppDrawerForm,
  AppInput,
  AppPageHeader,
  AppSearchableSelect,
  type AppSearchableSelectOption,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  ConfirmDialog,
  ShimmerBox,
} from "@/shared/ui";
import type { AppColorGridCell, AppColorGridRow, PageHeaderCrumb } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { usePropertyDetailQuery } from "@/modules/properties/presentation/hooks/use-property-detail-query";
import { useChessBoardQuery } from "@/modules/properties/presentation/hooks/use-chessboard-query";
import { useBookUnitMutation } from "@/modules/properties/presentation/hooks/use-book-unit-mutation";
import { useReleaseUnitMutation } from "@/modules/properties/presentation/hooks/use-release-unit-mutation";
import { useReserveUnitMutation } from "@/modules/properties/presentation/hooks/use-reserve-unit-mutation";
import { useCreateUnitMutation } from "@/modules/properties/presentation/hooks/use-create-unit-mutation";
import { useDeleteUnitMutation } from "@/modules/properties/presentation/hooks/use-delete-unit-mutation";
import { useCreateFloorMutation } from "@/modules/properties/presentation/hooks/use-create-floor-mutation";
import { useCreateBlockMutation } from "@/modules/properties/presentation/hooks/use-create-block-mutation";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useClientSearchQuery } from "@/modules/deals/presentation/hooks/use-client-search-query";
import { createFloor, fetchFloors } from "@/modules/properties/infrastructure/properties-repository";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { useNotifier } from "@/shared/providers/notifier-provider";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import type {
  ChessBoardFilters,
  ChessBlock,
  ChessFloor,
  ChessUnit,
  CreateBlockInput,
  CreateUnitInput,
  PropertyStatus,
} from "@/modules/properties/domain/property";

// ─── Status helpers ───────────────────────────────────────────────────────────

const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  planning: "Планирование",
  construction: "Строительство",
  completed: "Завершён",
  suspended: "Приостановлен",
};

const PROPERTY_STATUS_TONE: Record<PropertyStatus, AppStatusTone> = {
  planning: "muted",
  construction: "warning",
  completed: "success",
  suspended: "danger",
};

const UNIT_STATUS_LABEL: Record<ChessUnit["status"], string> = {
  free: "Свободна",
  booked: "Забронирована",
  reserved: "Резерв",
  sold: "Продана",
};

const UNIT_STATUS_TONE: Record<ChessUnit["status"], AppStatusTone> = {
  free: "success",
  booked: "warning",
  reserved: "info",
  sold: "danger",
};

// ─── Rooms filter options ─────────────────────────────────────────────────────

const ROOMS_OPTIONS = [
  { label: "Все", value: "" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4+", value: "4" },
] as const;

const UNIT_TYPE_OPTIONS = [
  { label: "Квартира", value: "apartment" },
  { label: "Студия", value: "studio" },
  { label: "Коммерческое", value: "commercial" },
  { label: "Парковка", value: "parking" },
] as const;

// ─── Filter state type ────────────────────────────────────────────────────────

interface LocalFilters {
  status: ChessBoardFilters["status"] | "";
  rooms: string;
  priceMin: string;
  priceMax: string;
}

const DEFAULT_FILTERS: LocalFilters = {
  status: "",
  rooms: "",
  priceMin: "",
  priceMax: "",
};

function toApiFilters(local: LocalFilters): ChessBoardFilters {
  const filters: ChessBoardFilters = {};
  if (local.status) filters.status = local.status;
  const roomsNum = parseInt(local.rooms, 10);
  if (!isNaN(roomsNum)) filters.rooms = roomsNum;
  const priceMin = parseFloat(local.priceMin);
  if (!isNaN(priceMin)) filters.priceMin = priceMin;
  const priceMax = parseFloat(local.priceMax);
  if (!isNaN(priceMax)) filters.priceMax = priceMax;
  return filters;
}

// ─── Map ChessUnit to AppColorGridCell ────────────────────────────────────────

function unitToCell(unit: ChessUnit): AppColorGridCell {
  const roomsStr = unit.rooms != null ? `${unit.rooms}-комн` : "";
  const areaStr = unit.totalArea != null ? `${unit.totalArea} м²` : "";
  const priceStr = unit.currentPrice != null ? `$${unit.currentPrice.toLocaleString("ru-RU")}` : "";
  const tooltipParts = [roomsStr, areaStr, priceStr].filter(Boolean).join(", ");

  return {
    id: unit.id,
    label: unit.unitNumber,
    sublabel: areaStr || undefined,
    secondarySublabel: roomsStr || undefined,
    status: unit.status,
    tooltip: tooltipParts || unit.unitNumber,
  };
}

// ─── Create unit form state ──────────────────────────────────────────────────

interface UnitFormState {
  unitNumber: string;
  unitType: string;
  rooms: string;
  totalArea: string;
  basePrice: string;
}

const EMPTY_UNIT_FORM: UnitFormState = {
  unitNumber: "",
  unitType: "apartment",
  rooms: "",
  totalArea: "",
  basePrice: "",
};

// ─── Helper: resolve floorId ─────────────────────────────────────────────────

async function resolveFloorId(
  propertyId: string,
  blockId: string,
  floor: ChessFloor,
): Promise<string | null> {
  if (floor.floorId) return floor.floorId;
  // Fallback: fetch floors and match by number
  const floors = await fetchFloors(propertyId, blockId);
  const match = floors.find((f) => f.floorNumber === floor.floorNumber);
  return match?.id ?? null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChessGridPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notifier = useNotifier();
  const propertyId = params.id;

  const [localFilters, setLocalFilters] = useState<LocalFilters>(DEFAULT_FILTERS);
  const [selectedUnit, setSelectedUnit] = useState<ChessUnit | null>(null);
  const [selectedUnitContext, setSelectedUnitContext] = useState<{
    block: ChessBlock;
    floor: ChessFloor;
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Create unit state
  const [createUnitOpen, setCreateUnitOpen] = useState(false);
  const [createUnitContext, setCreateUnitContext] = useState<{
    block: ChessBlock;
    floor: ChessFloor;
  } | null>(null);
  const [unitForm, setUnitForm] = useState<UnitFormState>(EMPTY_UNIT_FORM);

  // Copy floor state
  const [copyFloorPending, setCopyFloorPending] = useState(false);
  const [copyFloorConfirm, setCopyFloorConfirm] = useState<{
    block: ChessBlock;
    floor: ChessFloor;
  } | null>(null);

  // Delete unit state
  const [deleteUnitConfirm, setDeleteUnitConfirm] = useState(false);

  // Book/Reserve action state
  const [actionType, setActionType] = useState<"book" | "reserve" | null>(null);
  const [actionClientId, setActionClientId] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  // Create block state
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [blockName, setBlockName] = useState("");
  const [blockFloorsCount, setBlockFloorsCount] = useState("1");

  // Create empty floor state
  const [createFloorBlockId, setCreateFloorBlockId] = useState("");

  const apiFilters = toApiFilters(localFilters);

  const propertyQuery = usePropertyDetailQuery(propertyId);
  const chessBoardQuery = useChessBoardQuery(propertyId, apiFilters);

  const bookMutation = useBookUnitMutation(propertyId);
  const releaseMutation = useReleaseUnitMutation(propertyId);
  const reserveMutation = useReserveUnitMutation(propertyId);
  const createUnitMutation = useCreateUnitMutation(propertyId);
  const deleteUnitMutation = useDeleteUnitMutation(propertyId);
  const createBlockMutation = useCreateBlockMutation(propertyId);

  const activeBlockId = createUnitContext?.block.id ?? copyFloorConfirm?.block.id ?? "";
  const createFloorMutation = useCreateFloorMutation(propertyId, activeBlockId);

  const { data: clientResults = [], isLoading: clientsSearching } = useClientSearchQuery(clientSearch);
  const clientOptions: AppSearchableSelectOption[] = clientResults.map((c) => ({
    id: c.id,
    label: c.fullName,
    secondary: c.phone,
  }));

  const unitNeedsDeal =
    selectedUnit?.status === "booked" ||
    selectedUnit?.status === "reserved" ||
    selectedUnit?.status === "sold";

  const unitDealQuery = useDealsListQuery(
    { unitId: selectedUnit?.id ?? "", limit: 1 },
    Boolean(unitNeedsDeal && selectedUnit?.id),
  );

  const property = propertyQuery.data;
  const chessBoard = chessBoardQuery.data;

  const breadcrumbs: readonly PageHeaderCrumb[] = [
    { id: "dashboard", label: "Панель", href: routes.dashboard },
    { id: "buildings", label: "Объекты", href: routes.buildings },
    {
      id: "detail",
      label: property?.name ?? "Объект",
      href: routes.buildingDetail(propertyId),
    },
    { id: "chess", label: "Шахматка" },
  ];

  // ─── Find unit with its context (block + floor) ──────────────────────

  function findUnitWithContext(cellId: string): {
    unit: ChessUnit;
    block: ChessBlock;
    floor: ChessFloor;
  } | null {
    if (!chessBoard) return null;
    for (const block of chessBoard.blocks) {
      for (const floor of block.floors) {
        const unit = floor.units.find((u) => u.id === cellId);
        if (unit) return { unit, block, floor };
      }
    }
    return null;
  }

  function handleCellClick(cell: AppColorGridCell): void {
    const found = findUnitWithContext(cell.id);
    if (!found) return;
    setSelectedUnit(found.unit);
    setSelectedUnitContext({ block: found.block, floor: found.floor });
    setDrawerOpen(true);
  }

  function handleCloseDrawer(): void {
    setDrawerOpen(false);
    setSelectedUnit(null);
    setSelectedUnitContext(null);
  }

  function openActionForm(type: "book" | "reserve"): void {
    setActionType(type);
    setActionClientId("");
    setActionComment("");
    setClientSearch("");
  }

  function closeActionForm(): void {
    setActionType(null);
    setActionClientId("");
    setActionComment("");
    setClientSearch("");
  }

  async function handleSubmitAction(): Promise<void> {
    if (!selectedUnit || !actionType) return;
    const payload = {
      unitId: selectedUnit.id,
      clientId: actionClientId || undefined,
      comment: actionComment.trim() || undefined,
    };
    if (actionType === "book") {
      await bookMutation.mutateAsync(payload);
    } else {
      await reserveMutation.mutateAsync(payload);
    }
    closeActionForm();
    handleCloseDrawer();
  }

  async function handleReleaseUnit(): Promise<void> {
    if (!selectedUnit) return;
    await releaseMutation.mutateAsync(selectedUnit.id);
    handleCloseDrawer();
  }

  const isActionPending =
    bookMutation.isPending || releaseMutation.isPending || reserveMutation.isPending;

  // ─── Add unit on a floor (row "+" click) ─────────────────────────────

  const handleRowAddClick = useCallback(
    (row: AppColorGridRow) => {
      if (!chessBoard) return;
      // Parse block and floor from row ID: "{blockId}-floor-{floorNumber}"
      for (const block of chessBoard.blocks) {
        for (const floor of block.floors) {
          const rowId = `${block.id}-floor-${floor.floorNumber}`;
          if (rowId === row.id) {
            // Generate next unit number
            const existingNumbers = floor.units
              .map((u) => parseInt(u.unitNumber.replace(/\D/g, ""), 10))
              .filter((n) => !isNaN(n));
            const nextNumber = existingNumbers.length > 0
              ? Math.max(...existingNumbers) + 1
              : floor.floorNumber * 100 + 1;

            setCreateUnitContext({ block, floor });
            setUnitForm({
              ...EMPTY_UNIT_FORM,
              unitNumber: String(nextNumber),
            });
            setCreateUnitOpen(true);
            return;
          }
        }
      }
    },
    [chessBoard],
  );

  // ─── Save new unit ────────────────────────────────────────────────────

  async function handleSaveUnit(): Promise<void> {
    if (!createUnitContext) return;
    const { block, floor } = createUnitContext;

    const floorId = await resolveFloorId(propertyId, block.id, floor);
    if (!floorId) return;

    const input: CreateUnitInput = {
      propertyId,
      blockId: block.id,
      floorId,
      unitNumber: unitForm.unitNumber,
      unitType: unitForm.unitType,
      floorNumber: floor.floorNumber,
    };

    const rooms = parseInt(unitForm.rooms, 10);
    if (!isNaN(rooms)) input.rooms = rooms;
    const totalArea = parseFloat(unitForm.totalArea);
    if (!isNaN(totalArea)) input.totalArea = totalArea;
    const basePrice = parseFloat(unitForm.basePrice);
    if (!isNaN(basePrice)) input.basePrice = basePrice;

    await createUnitMutation.mutateAsync(input);
    setCreateUnitOpen(false);
    setCreateUnitContext(null);
    setUnitForm(EMPTY_UNIT_FORM);
  }

  // ─── Copy unit in same floor ──────────────────────────────────────────

  async function handleCopyUnit(): Promise<void> {
    if (!selectedUnit || !selectedUnitContext) return;
    const { block, floor } = selectedUnitContext;

    const floorId = await resolveFloorId(propertyId, block.id, floor);
    if (!floorId) return;

    // Generate next unit number
    const existingNumbers = floor.units
      .map((u) => parseInt(u.unitNumber.replace(/\D/g, ""), 10))
      .filter((n) => !isNaN(n));
    const nextNumber = existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : floor.floorNumber * 100 + floor.units.length + 1;

    const input: CreateUnitInput = {
      propertyId,
      blockId: block.id,
      floorId,
      unitNumber: String(nextNumber),
      unitType: selectedUnit.unitType,
      floorNumber: floor.floorNumber,
    };

    if (selectedUnit.rooms != null) input.rooms = selectedUnit.rooms;
    if (selectedUnit.totalArea != null) input.totalArea = selectedUnit.totalArea;
    if (selectedUnit.currentPrice != null) input.basePrice = selectedUnit.currentPrice;

    await createUnitMutation.mutateAsync(input);
    handleCloseDrawer();
  }

  // ─── Copy floor ───────────────────────────────────────────────────────

  async function handleDeleteUnit(): Promise<void> {
    if (!selectedUnit) return;
    // Safety: only free units can be deleted
    if (selectedUnit.status !== "free") return;
    await deleteUnitMutation.mutateAsync(selectedUnit.id);
    setDeleteUnitConfirm(false);
    handleCloseDrawer();
  }

  // ─── Create empty floor ──────────────────────────────────────────

  async function handleCreateEmptyFloor(block: ChessBlock): Promise<void> {
    const maxFloor = block.floors.length > 0
      ? Math.max(...block.floors.map((f) => f.floorNumber))
      : 0;
    const newFloorNumber = maxFloor + 1;
    setCreateFloorBlockId(block.id);
    try {
      await createFloor(propertyId, block.id, newFloorNumber);
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboard(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(propertyId, block.id) });
      notifier.success(`Этаж ${newFloorNumber} успешно создан`);
    } catch (error) {
      notifier.error(normalizeErrorMessage(error));
    } finally {
      setCreateFloorBlockId("");
    }
  }

  // ─── Copy floor ───────────────────────────────────────────────────

  async function handleCopyFloor(): Promise<void> {
    if (!copyFloorConfirm) return;
    const { block, floor } = copyFloorConfirm;
    setCopyFloorPending(true);

    try {
      const maxFloor = Math.max(...block.floors.map((f) => f.floorNumber));
      const newFloorNumber = maxFloor + 1;

      const newFloor = await createFloorMutation.mutateAsync(newFloorNumber);

      for (const unit of floor.units) {
        const oldNum = unit.unitNumber.replace(/\D/g, "");
        const unitSuffix = oldNum.slice(-2) || oldNum;
        const newUnitNumber = `${newFloorNumber}${unitSuffix.padStart(2, "0")}`;

        const input: CreateUnitInput = {
          propertyId,
          blockId: block.id,
          floorId: newFloor.id,
          unitNumber: newUnitNumber,
          unitType: unit.unitType,
          floorNumber: newFloorNumber,
        };

        if (unit.rooms != null) input.rooms = unit.rooms;
        if (unit.totalArea != null) input.totalArea = unit.totalArea;
        if (unit.currentPrice != null) input.basePrice = unit.currentPrice;

        await createUnitMutation.mutateAsync(input);
      }
    } finally {
      setCopyFloorPending(false);
      setCopyFloorConfirm(null);
    }
  }

  // ─── Create block ─────────────────────────────────────────────────

  async function handleCreateBlock(): Promise<void> {
    if (!blockName.trim()) return;
    const floorsCount = parseInt(blockFloorsCount, 10);
    const input: CreateBlockInput = {
      name: blockName.trim(),
      floorsCount: !isNaN(floorsCount) && floorsCount > 0 ? floorsCount : 1,
    };
    await createBlockMutation.mutateAsync(input);
    setCreateBlockOpen(false);
    setBlockName("");
    setBlockFloorsCount("1");
  }

  const setUnitField = (field: keyof UnitFormState, value: string) => {
    setUnitForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header */}
      <AppPageHeader
        breadcrumbs={breadcrumbs}
        title={
          propertyQuery.isLoading
            ? "Загрузка..."
            : `Шахматка — ${property?.name ?? "Объект"}`
        }
        actions={
          <div className="flex items-center gap-2">
            {property ? (
              <AppStatusBadge
                label={PROPERTY_STATUS_LABEL[property.status]}
                tone={PROPERTY_STATUS_TONE[property.status]}
              />
            ) : null}
            <AppButton
              label="Список объектов"
              variant="outline"
              size="sm"
              onClick={() => router.push(routes.buildings)}
            />
          </div>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="w-44">
          <AppSelect
            label="Статус"
            value={localFilters.status}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, status: e.target.value as LocalFilters["status"] }))
            }
            options={[
              { label: "Все статусы", value: "" },
              { label: "Свободна", value: "available" },
              { label: "Бронь", value: "booked" },
              { label: "Резерв", value: "reserved" },
              { label: "Продана", value: "sold" },
            ]}
          />
        </div>
        <div className="w-36">
          <AppSelect
            label="Комнаты"
            value={localFilters.rooms}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, rooms: e.target.value }))
            }
            options={ROOMS_OPTIONS.map((opt) => ({
              label: opt.value === "" ? "Все комнаты" : `${opt.label}-комн`,
              value: opt.value,
            }))}
          />
        </div>
        <div className="w-36">
          <AppInput
            label="Цена от"
            value={localFilters.priceMin}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, priceMin: e.target.value }))
            }
            type="number"
            placeholder="0"
          />
        </div>
        <div className="w-36">
          <AppInput
            label="Цена до"
            value={localFilters.priceMax}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, priceMax: e.target.value }))
            }
            type="number"
            placeholder="999 999"
          />
        </div>
        <AppButton
          label="Сбросить"
          variant="outline"
          size="sm"
          onClick={() => setLocalFilters(DEFAULT_FILTERS)}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 rounded-lg bg-muted/30 px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" /> Свободна
        </span>
        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-500" /> Бронь
        </span>
        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-500" /> Резерв
        </span>
        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Продана
        </span>
      </div>

      {/* Chess board content */}
      {chessBoardQuery.isLoading ? (
        <div className="space-y-4">
          <ShimmerBox className="h-10 w-48 rounded" />
          <ShimmerBox className="h-64 w-full rounded-xl" />
          <ShimmerBox className="h-10 w-48 rounded" />
          <ShimmerBox className="h-48 w-full rounded-xl" />
        </div>
      ) : chessBoardQuery.isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки шахматки"
          description="Не удалось загрузить данные шахматки. Попробуйте обновить страницу."
        />
      ) : !chessBoard || chessBoard.blocks.length === 0 ? (
        <div className="space-y-4">
          <AppStatePanel
            tone="empty"
            title="Нет блоков"
            description="У данного объекта нет блоков. Создайте первый блок, чтобы начать."
          />
          <AppButton
            label="Создать блок"
            variant="primary"
            onClick={() => setCreateBlockOpen(true)}
            isLoading={createBlockMutation.isPending}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {chessBoard.blocks.map((block, blockIdx) => {
            const rows: AppColorGridRow[] = block.floors.map((floor) => ({
              id: `${block.id}-floor-${floor.floorNumber}`,
              label: `Этаж ${floor.floorNumber}`,
              cells: floor.units.map(unitToCell),
            }));

            return (
              <div key={block.id ?? `block-${blockIdx}`} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{block.name}</h2>
                  <span className="text-xs text-muted-foreground">
                    {block.floors.reduce((sum, f) => sum + f.units.length, 0)} квартир
                  </span>
                </div>
                {block.floors.length > 0 ? (
                  <AppColorGrid
                    cellSize="xl"
                    onCellClick={handleCellClick}
                    onRowAddClick={handleRowAddClick}
                    rows={rows}
                    showLegend={false}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    В блоке пока нет этажей
                  </div>
                )}
                {/* Floor action buttons */}
                <div className="flex gap-2">
                  <AppButton
                    label="Создать новый этаж"
                    variant="outline"
                    size="sm"
                    isLoading={createFloorBlockId === block.id}
                    onClick={() => void handleCreateEmptyFloor(block)}
                  />
                  {block.floors.length > 0 ? (() => {
                    const topFloor = block.floors.reduce((a, b) => a.floorNumber > b.floorNumber ? a : b);
                    const nextFloorNum = topFloor.floorNumber + 1;
                    return (
                      <AppButton
                        label={`Создать копию этажа ${topFloor.floorNumber} → ${nextFloorNum}`}
                        variant="outline"
                        size="sm"
                        isLoading={copyFloorPending && copyFloorConfirm?.block.id === block.id}
                        onClick={() =>
                          setCopyFloorConfirm({ block, floor: topFloor })
                        }
                      />
                    );
                  })() : null}
                </div>
              </div>
            );
          })}

          {/* Create block button */}
          <div className="rounded-xl border border-dashed border-border p-4">
            <AppButton
              label="Создать блок"
              variant="outline"
              onClick={() => setCreateBlockOpen(true)}
              isLoading={createBlockMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* ─── Unit detail drawer ───────────────────────────────────────── */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: "min(420px, 100vw)", display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h5">
              Квартира {selectedUnit?.unitNumber ?? ""}
            </Typography>
            {selectedUnit ? (
              <Box sx={{ mt: 1 }}>
                <AppStatusBadge
                  label={UNIT_STATUS_LABEL[selectedUnit.status]}
                  tone={UNIT_STATUS_TONE[selectedUnit.status]}
                />
              </Box>
            ) : null}
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
            {selectedUnit ? (
              <Stack spacing={2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Номер</p>
                    <p className="font-semibold">{selectedUnit.unitNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Комнат</p>
                    <p className="font-semibold">
                      {selectedUnit.rooms != null ? selectedUnit.rooms : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Площадь</p>
                    <p className="font-semibold">
                      {selectedUnit.totalArea != null ? `${selectedUnit.totalArea} м²` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Цена</p>
                    <p className="font-semibold">
                      {selectedUnit.currentPrice != null
                        ? `$${selectedUnit.currentPrice.toLocaleString("ru-RU")}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Цена за м²</p>
                    <p className="font-semibold">
                      {selectedUnit.pricePerSqm != null
                        ? `$${selectedUnit.pricePerSqm.toLocaleString("ru-RU")}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Тип</p>
                    <p className="font-semibold">{selectedUnit.unitType}</p>
                  </div>
                </div>

                {unitNeedsDeal ? (
                  <div className="rounded-xl border border-border bg-card p-4 text-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Сделка
                    </p>
                    {unitDealQuery.isLoading ? (
                      <div className="space-y-2">
                        <ShimmerBox className="h-4 w-3/4 rounded" />
                        <ShimmerBox className="h-4 w-1/2 rounded" />
                        <ShimmerBox className="h-4 w-2/3 rounded" />
                      </div>
                    ) : unitDealQuery.data && unitDealQuery.data.length > 0 ? (() => {
                      const deal = unitDealQuery.data[0]!;
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">№ сделки</span>
                            <span className="font-semibold">{deal.dealNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Клиент</span>
                            <span className="font-semibold">{deal.clientName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Телефон</span>
                            <span className="font-semibold">{deal.clientPhone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Сумма</span>
                            <span className="font-semibold">
                              {deal.totalAmount.toLocaleString("ru-RU")} {deal.currency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Остаток</span>
                            <span className="font-semibold">
                              {(deal.finalAmount - deal.downPayment).toLocaleString("ru-RU")} {deal.currency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Менеджер</span>
                            <span className="font-semibold">{deal.managerName}</span>
                          </div>
                        </div>
                      );
                    })() : (
                      <p className="text-muted-foreground">Сделка не найдена</p>
                    )}
                  </div>
                ) : null}
              </Stack>
            ) : null}
          </Box>

          <Divider />

          <Stack direction="column" spacing={1.5} sx={{ px: 3, py: 2 }}>
            {unitNeedsDeal && unitDealQuery.data && unitDealQuery.data.length > 0 ? (
              <AppButton
                label="Открыть сделку"
                variant="primary"
                fullWidth
                onClick={() => {
                  const deal = unitDealQuery.data[0]!;
                  router.push(routes.dealDetail(deal.id));
                  handleCloseDrawer();
                }}
              />
            ) : null}

            {selectedUnit?.status === "free" ? (
              <>
                <AppButton
                  label="Забронировать"
                  variant="primary"
                  fullWidth
                  disabled={isActionPending}
                  onClick={() => openActionForm("book")}
                />
                <AppButton
                  label="Резервировать"
                  variant="tonal"
                  fullWidth
                  disabled={isActionPending}
                  onClick={() => openActionForm("reserve")}
                />
                <AppButton
                  label="Создать копию квартиры на этот этаж"
                  variant="outline"
                  fullWidth
                  isLoading={createUnitMutation.isPending}
                  onClick={() => void handleCopyUnit()}
                />
                <AppButton
                  label="Удалить квартиру"
                  variant="destructive"
                  fullWidth
                  onClick={() => setDeleteUnitConfirm(true)}
                />
              </>
            ) : null}

            {selectedUnit?.status === "booked" ? (
              <AppButton
                label="Отменить бронь"
                variant="destructive"
                fullWidth
                isLoading={releaseMutation.isPending}
                disabled={isActionPending}
                onClick={() => void handleReleaseUnit()}
              />
            ) : null}

            {selectedUnit?.status === "reserved" ? (
              <AppButton
                label="Отменить резерв"
                variant="destructive"
                fullWidth
                isLoading={releaseMutation.isPending}
                disabled={isActionPending}
                onClick={() => void handleReleaseUnit()}
              />
            ) : null}

            <AppButton
              label="Закрыть"
              variant="outline"
              fullWidth
              onClick={handleCloseDrawer}
            />
          </Stack>
        </Box>
      </Drawer>

      {/* ─── Create unit drawer ───────────────────────────────────────── */}
      <AppDrawerForm
        open={createUnitOpen}
        title="Новая квартира"
        subtitle={
          createUnitContext
            ? `${createUnitContext.block.name}, Этаж ${createUnitContext.floor.floorNumber}`
            : ""
        }
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createUnitMutation.isPending}
        saveDisabled={!unitForm.unitNumber.trim()}
        onClose={() => {
          setCreateUnitOpen(false);
          setCreateUnitContext(null);
          setUnitForm(EMPTY_UNIT_FORM);
        }}
        onSave={() => void handleSaveUnit()}
      >
        <div className="space-y-4">
          <AppInput
            label="Номер квартиры"
            value={unitForm.unitNumber}
            onChange={(e) => setUnitField("unitNumber", e.target.value)}
            required
          />
          <AppSelect
            label="Тип"
            value={unitForm.unitType}
            onChange={(e) => setUnitField("unitType", e.target.value)}
            options={[...UNIT_TYPE_OPTIONS]}
          />
          <AppInput
            label="Количество комнат"
            value={unitForm.rooms}
            onChange={(e) => setUnitField("rooms", e.target.value)}
            type="number"
            placeholder="1"
          />
          <AppInput
            label="Площадь (м²)"
            value={unitForm.totalArea}
            onChange={(e) => setUnitField("totalArea", e.target.value)}
            type="number"
            placeholder="42"
          />
          <AppInput
            label="Базовая цена ($)"
            value={unitForm.basePrice}
            onChange={(e) => setUnitField("basePrice", e.target.value)}
            type="number"
            placeholder="50000"
          />
        </div>
      </AppDrawerForm>

      {/* ─── Book / Reserve action drawer ──────────────────────────────── */}
      <AppDrawerForm
        open={actionType !== null}
        title={actionType === "book" ? "Забронировать квартиру" : "Резервировать квартиру"}
        subtitle={`Квартира ${selectedUnit?.unitNumber ?? ""}`}
        saveLabel={actionType === "book" ? "Забронировать" : "Резервировать"}
        cancelLabel="Отмена"
        isSaving={bookMutation.isPending || reserveMutation.isPending}
        onClose={closeActionForm}
        onSave={() => void handleSubmitAction()}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium">Клиент (необязательно)</p>
            <AppSearchableSelect
              options={clientOptions}
              value={actionClientId || null}
              onChange={(id) => setActionClientId(id)}
              triggerLabel="Выберите клиента"
              dialogTitle="Поиск клиента"
              searchPlaceholder="Имя или телефон..."
              loading={clientsSearching}
              filterFn={(_option, query) => {
                setClientSearch(query);
                return true;
              }}
              emptyLabel={clientSearch.length < 2 ? "Введите минимум 2 символа" : "Клиент не найден"}
            />
            {actionClientId ? (
              <button
                className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setActionClientId("")}
                type="button"
              >
                Очистить выбор
              </button>
            ) : null}
          </div>
          <AppInput
            label="Комментарий / причина"
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder={
              actionType === "reserve"
                ? "Например: Клиент выбрал, ожидает документы"
                : "Например: Оплата через 3 дня"
            }
          />
        </div>
      </AppDrawerForm>

      {/* ─── Delete unit confirm ───────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteUnitConfirm}
        title="Удалить квартиру?"
        message={`Вы уверены, что хотите удалить квартиру ${selectedUnit?.unitNumber ?? ""}? Это действие необратимо.`}
        confirmText={deleteUnitMutation.isPending ? "Удаление..." : "Удалить"}
        cancelText="Отмена"
        destructive
        onConfirm={() => void handleDeleteUnit()}
        onClose={() => setDeleteUnitConfirm(false)}
      />

      {/* ─── Copy floor confirm ───────────────────────────────────────── */}
      <ConfirmDialog
        open={copyFloorConfirm !== null}
        title="Копировать этаж?"
        message={
          copyFloorConfirm
            ? `Будет создан этаж ${Math.max(...(copyFloorConfirm.block.floors.map((f) => f.floorNumber))) + 1} с ${copyFloorConfirm.floor.units.length} квартирами, скопированными с этажа ${copyFloorConfirm.floor.floorNumber}.`
            : ""
        }
        confirmText={copyFloorPending ? "Создание..." : "Копировать"}
        cancelText="Отмена"
        onConfirm={() => void handleCopyFloor()}
        onClose={() => setCopyFloorConfirm(null)}
      />

      {/* ─── Create block drawer ──────────────────────────────────────── */}
      <AppDrawerForm
        open={createBlockOpen}
        title="Новый блок"
        subtitle={property?.name ?? "Объект"}
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createBlockMutation.isPending}
        saveDisabled={!blockName.trim()}
        onClose={() => {
          setCreateBlockOpen(false);
          setBlockName("");
          setBlockFloorsCount("1");
        }}
        onSave={() => void handleCreateBlock()}
      >
        <div className="space-y-4">
          <AppInput
            label="Название блока"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            required
            placeholder="Блок А"
          />
          <AppInput
            label="Количество этажей"
            value={blockFloorsCount}
            onChange={(e) => setBlockFloorsCount(e.target.value)}
            type="number"
            placeholder="1"
            required
          />
        </div>
      </AppDrawerForm>
    </div>
  );
}
