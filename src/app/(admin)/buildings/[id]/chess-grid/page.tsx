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
import { useUnitDetailQuery } from "@/modules/properties/presentation/hooks/use-unit-detail-query";
import { useCreateUnitMutation } from "@/modules/properties/presentation/hooks/use-create-unit-mutation";

import { useCreateBlockMutation } from "@/modules/properties/presentation/hooks/use-create-block-mutation";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useClientDetailQuery } from "@/modules/clients/presentation/hooks/use-client-detail-query";
import { createFloor, deleteFloor, duplicateFloor, fetchFloors } from "@/modules/properties/infrastructure/properties-repository";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { useNotifier } from "@/shared/providers/notifier-provider";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import { UnitPhotoManager } from "@/modules/properties/presentation/components/unit-photo-manager";
import { UnitFormDrawer, EMPTY_UNIT_FORM } from "@/modules/properties/presentation/components/unit-form-drawer";
import type { UnitFormValues } from "@/modules/properties/presentation/components/unit-form-drawer";
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

// UnitFormValues & EMPTY_UNIT_FORM imported from shared UnitFormDrawer

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
  const [unitForm, setUnitForm] = useState<UnitFormValues>(EMPTY_UNIT_FORM);

  // Copy floor state
  const [copyFloorPending, setCopyFloorPending] = useState(false);
  const [copyFloorConfirm, setCopyFloorConfirm] = useState<{
    block: ChessBlock;
    floor: ChessFloor;
  } | null>(null);

  // Create block state
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [blockName, setBlockName] = useState("");
  const [blockFloorsCount, setBlockFloorsCount] = useState("1");

  // Create empty floor state
  const [createFloorBlockId, setCreateFloorBlockId] = useState("");

  // Delete floor state
  const [deleteFloorConfirm, setDeleteFloorConfirm] = useState<{
    block: ChessBlock;
    floorId: string;
    floorNumber: number;
  } | null>(null);

  const apiFilters = toApiFilters(localFilters);

  const propertyQuery = usePropertyDetailQuery(propertyId);
  const chessBoardQuery = useChessBoardQuery(propertyId, apiFilters);

  const createUnitMutation = useCreateUnitMutation(propertyId);
  const createBlockMutation = useCreateBlockMutation(propertyId);

  // Full unit detail (for photos in drawer)
  const unitDetailQuery = useUnitDetailQuery(selectedUnit?.id ?? "");
  const unitDetail = unitDetailQuery.data;
  const bookingClientQuery = useClientDetailQuery(unitDetail?.clientId ?? "");
  const bookingClient = bookingClientQuery.data;

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
    const livingArea = parseFloat(unitForm.livingArea);
    if (!isNaN(livingArea)) input.livingArea = livingArea;
    const kitchenArea = parseFloat(unitForm.kitchenArea);
    if (!isNaN(kitchenArea)) input.kitchenArea = kitchenArea;
    const balconyArea = parseFloat(unitForm.balconyArea);
    if (!isNaN(balconyArea)) input.balconyArea = balconyArea;
    const pricePerSqm = parseFloat(unitForm.pricePerSqm);
    if (!isNaN(pricePerSqm)) input.pricePerSqm = pricePerSqm;
    if (unitForm.finishing) input.finishing = unitForm.finishing;
    if (unitForm.description) input.description = unitForm.description;

    await createUnitMutation.mutateAsync(input);
    setCreateUnitOpen(false);
    setCreateUnitContext(null);
    setUnitForm(EMPTY_UNIT_FORM);
  }

  // ─── Create empty floor ──────────────────────────────────────────

  async function handleCreateEmptyFloor(block: ChessBlock): Promise<void> {
    setCreateFloorBlockId(block.id);
    try {
      const created = await createFloor(propertyId, block.id);
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(propertyId, block.id) });
      notifier.success(`Этаж ${created.floorNumber} успешно создан`);
    } catch (error) {
      notifier.error(normalizeErrorMessage(error));
    } finally {
      setCreateFloorBlockId("");
    }
  }

  // ─── Delete empty floor ──────────────────────────────────────────

  function handleRowDeleteClick(block: ChessBlock, row: AppColorGridRow): void {
    const match = row.label.match(/-?\d+/);
    if (!match) return;
    const floorNumber = parseInt(match[0], 10);
    const floor = block.floors.find((f) => f.floorNumber === floorNumber);
    if (!floor?.floorId) return;
    setDeleteFloorConfirm({ block, floorId: floor.floorId, floorNumber });
  }

  async function handleConfirmDeleteFloor(): Promise<void> {
    if (!deleteFloorConfirm) return;
    const { block, floorId, floorNumber } = deleteFloorConfirm;
    try {
      await deleteFloor(propertyId, block.id, floorId);
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(propertyId, block.id) });
      notifier.success(`Этаж ${floorNumber} удалён`);
    } catch (error) {
      notifier.error(normalizeErrorMessage(error));
    } finally {
      setDeleteFloorConfirm(null);
    }
  }

  // ─── Copy floor ───────────────────────────────────────────────────

  async function handleCopyFloor(): Promise<void> {
    if (!copyFloorConfirm) return;
    const { block, floor } = copyFloorConfirm;
    setCopyFloorPending(true);

    try {
      await duplicateFloor(propertyId, block.id, floor.floorId ?? "");

      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(propertyId, block.id) });
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
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
            <AppButton
              label="Создать блок"
              variant="outline"
              size="sm"
              onClick={() => setCreateBlockOpen(true)}
              isLoading={createBlockMutation.isPending}
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
                    onRowDeleteClick={(row) => handleRowDeleteClick(block, row)}
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

        </div>
      )}

      {/* ─── Unit info drawer (lightweight) ──────────────────────────── */}
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

                {/* Photos from full unit detail */}
                {unitDetail && unitDetail.photoUrls.length > 0 ? (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <UnitPhotoManager
                      unitId={unitDetail.id}
                      propertyId={propertyId}
                      photoUrls={unitDetail.photoUrls}
                      readOnly
                    />
                  </div>
                ) : null}

                {/* Booking/reserve info */}
                {unitDetail && (unitDetail.status === "booked" || unitDetail.status === "reserved") && (unitDetail.clientId || unitDetail.comment) ? (
                  <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {unitDetail.status === "booked" ? "Бронь" : "Резерв"}
                    </p>
                    <div className="space-y-1.5">
                      {bookingClient ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Клиент</span>
                            <span className="font-semibold">{bookingClient.fullName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Телефон</span>
                            <span className="font-semibold">{bookingClient.phone}</span>
                          </div>
                        </>
                      ) : null}
                      {unitDetail.bookedUntil ? (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">До</span>
                          <span className="font-semibold">{new Date(unitDetail.bookedUntil).toLocaleDateString("ru-RU")}</span>
                        </div>
                      ) : null}
                      {unitDetail.comment ? (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Комментарий</span>
                          <span className="font-semibold">{unitDetail.comment}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

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
            {selectedUnit ? (
              <AppButton
                label="Подробнее"
                variant="primary"
                fullWidth
                onClick={() => {
                  router.push(routes.unitDetail(propertyId, selectedUnit.id));
                  handleCloseDrawer();
                }}
              />
            ) : null}

            {unitNeedsDeal && unitDealQuery.data && unitDealQuery.data.length > 0 ? (
              <AppButton
                label="Открыть сделку"
                variant="outline"
                fullWidth
                onClick={() => {
                  const deal = unitDealQuery.data[0]!;
                  router.push(routes.dealDetail(deal.id));
                  handleCloseDrawer();
                }}
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

      {/* ─── Create unit drawer (shared) ──────────────────────────────── */}
      <UnitFormDrawer
        open={createUnitOpen}
        mode="create"
        title="Новая квартира"
        subtitle={
          createUnitContext
            ? `${createUnitContext.block.name}, Этаж ${createUnitContext.floor.floorNumber}`
            : undefined
        }
        values={unitForm}
        onChange={setUnitForm}
        onSave={() => void handleSaveUnit()}
        onClose={() => {
          setCreateUnitOpen(false);
          setCreateUnitContext(null);
          setUnitForm(EMPTY_UNIT_FORM);
        }}
        isSaving={createUnitMutation.isPending}
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

      {/* ─── Delete floor confirm ─────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteFloorConfirm !== null}
        title="Удалить этаж?"
        message={
          deleteFloorConfirm
            ? `Вы уверены, что хотите удалить этаж ${deleteFloorConfirm.floorNumber}? Этаж пустой и будет удалён безвозвратно.`
            : ""
        }
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={() => void handleConfirmDeleteFloor()}
        onClose={() => setDeleteFloorConfirm(null)}
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
