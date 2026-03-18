"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Divider,
  Drawer,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  AppButton,
  AppColorGrid,
  AppInput,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  ShimmerBox,
} from "@/shared/ui";
import type { AppColorGridCell, AppColorGridRow, PageHeaderCrumb } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { usePropertyDetailQuery } from "@/modules/properties/presentation/hooks/use-property-detail-query";
import { useChessBoardQuery } from "@/modules/properties/presentation/hooks/use-chessboard-query";
import { useBookUnitMutation } from "@/modules/properties/presentation/hooks/use-book-unit-mutation";
import { useReleaseUnitMutation } from "@/modules/properties/presentation/hooks/use-release-unit-mutation";
import { useReserveUnitMutation } from "@/modules/properties/presentation/hooks/use-reserve-unit-mutation";
import type {
  ChessBoardFilters,
  ChessUnit,
  PropertyStatus,
} from "@/modules/properties/domain/property";

// ─── Status helpers ───────────────────────────────────────────────────────────

const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  planning: "Планирование",
  under_construction: "Строительство",
  completed: "Завершён",
  selling: "Продажа",
  archived: "Архив",
};

const PROPERTY_STATUS_TONE: Record<PropertyStatus, AppStatusTone> = {
  planning: "muted",
  under_construction: "warning",
  completed: "success",
  selling: "info",
  archived: "muted",
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

// ─── Map local filters → API filters ─────────────────────────────────────────

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
  const roomsStr = unit.rooms !== null ? `${unit.rooms}-комн` : "";
  const areaStr = unit.totalArea !== null ? `${unit.totalArea}м²` : "";
  const priceStr = unit.basePrice !== null ? `$${unit.basePrice.toLocaleString("ru-RU")}` : "";
  const tooltipParts = [roomsStr, areaStr, priceStr].filter(Boolean).join(", ");

  return {
    id: unit.id,
    label: unit.unitNumber,
    status: unit.status,
    tooltip: tooltipParts || unit.unitNumber,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChessGridPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params.id;

  const [localFilters, setLocalFilters] = useState<LocalFilters>(DEFAULT_FILTERS);
  const [selectedUnit, setSelectedUnit] = useState<ChessUnit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const apiFilters = toApiFilters(localFilters);

  const propertyQuery = usePropertyDetailQuery(propertyId);
  const chessBoardQuery = useChessBoardQuery(propertyId, apiFilters);

  const bookMutation = useBookUnitMutation(propertyId);
  const releaseMutation = useReleaseUnitMutation(propertyId);
  const reserveMutation = useReserveUnitMutation(propertyId);

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

  function handleCellClick(cell: AppColorGridCell): void {
    // Find the unit in the chess board data
    if (!chessBoard) return;
    for (const block of chessBoard.blocks) {
      for (const floor of block.floors) {
        const unit = floor.units.find((u) => u.id === cell.id);
        if (unit) {
          setSelectedUnit(unit);
          setDrawerOpen(true);
          return;
        }
      }
    }
  }

  function handleCloseDrawer(): void {
    setDrawerOpen(false);
    setSelectedUnit(null);
  }

  async function handleBookUnit(): Promise<void> {
    if (!selectedUnit) return;
    await bookMutation.mutateAsync(selectedUnit.id);
    handleCloseDrawer();
  }

  async function handleReleaseUnit(): Promise<void> {
    if (!selectedUnit) return;
    await releaseMutation.mutateAsync(selectedUnit.id);
    handleCloseDrawer();
  }

  async function handleReserveUnit(): Promise<void> {
    if (!selectedUnit) return;
    await reserveMutation.mutateAsync(selectedUnit.id);
    handleCloseDrawer();
  }

  const isActionPending =
    bookMutation.isPending || releaseMutation.isPending || reserveMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AppPageHeader
        breadcrumbs={breadcrumbs}
        title={
          propertyQuery.isLoading
            ? "Загрузка..."
            : `Шахматка — ${property?.name ?? "Объект"}`
        }
        actions={
          property ? (
            <AppStatusBadge
              label={PROPERTY_STATUS_LABEL[property.status]}
              tone={PROPERTY_STATUS_TONE[property.status]}
            />
          ) : undefined
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
        {/* Status filter */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Статус</span>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={localFilters.status}
            onChange={(_, val: LocalFilters["status"] | null) => {
              setLocalFilters((prev) => ({
                ...prev,
                status: val ?? "",
              }));
            }}
          >
            <ToggleButton value="">Все</ToggleButton>
            <ToggleButton value="available">Свободна</ToggleButton>
            <ToggleButton value="booked">Бронь</ToggleButton>
            <ToggleButton value="reserved">Резерв</ToggleButton>
            <ToggleButton value="sold">Продана</ToggleButton>
          </ToggleButtonGroup>
        </div>

        {/* Rooms filter */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Комнаты</span>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={localFilters.rooms}
            onChange={(_, val: string | null) => {
              setLocalFilters((prev) => ({ ...prev, rooms: val ?? "" }));
            }}
          >
            {ROOMS_OPTIONS.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {/* Price range */}
        <div className="flex items-end gap-2">
          <AppInput
            label="Цена от"
            value={localFilters.priceMin}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, priceMin: e.target.value }))
            }
            type="number"
            placeholder="0"
          />
          <AppInput
            label="Цена до"
            value={localFilters.priceMax}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, priceMax: e.target.value }))
            }
            type="number"
            placeholder="999999"
          />
        </div>

        {/* Reset */}
        <AppButton
          label="Сбросить фильтры"
          variant="outline"
          onClick={() => setLocalFilters(DEFAULT_FILTERS)}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500" /> Свободна
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-500" /> Бронь
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-blue-400" /> Резерв
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-500" /> Продана
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
        <AppStatePanel
          tone="empty"
          title="Нет данных"
          description="Данные шахматки не найдены для данного объекта."
        />
      ) : (
        <div className="space-y-8">
          {chessBoard.blocks.map((block) => {
            const rows: AppColorGridRow[] = block.floors.map((floor) => ({
              id: `${block.id}-floor-${floor.floorNumber}`,
              label: `Этаж ${floor.floorNumber}`,
              cells: floor.units.map(unitToCell),
            }));

            return (
              <div key={block.id} className="space-y-3">
                <h2 className="text-lg font-semibold">{block.name}</h2>
                <AppColorGrid
                  cellSize="md"
                  onCellClick={handleCellClick}
                  rows={rows}
                  showLegend={false}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Unit detail drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: "min(420px, 100vw)", display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Drawer header */}
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

          {/* Unit details */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
            {selectedUnit ? (
              <Stack spacing={2}>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Номер</p>
                    <p className="font-semibold">{selectedUnit.unitNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Этаж</p>
                    <p className="font-semibold">{selectedUnit.floorNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Комнат</p>
                    <p className="font-semibold">
                      {selectedUnit.rooms !== null ? selectedUnit.rooms : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Площадь</p>
                    <p className="font-semibold">
                      {selectedUnit.totalArea !== null
                        ? `${selectedUnit.totalArea} м²`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Цена</p>
                    <p className="font-semibold">
                      {selectedUnit.basePrice !== null
                        ? `$${selectedUnit.basePrice.toLocaleString("ru-RU")}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Тип</p>
                    <p className="font-semibold">{selectedUnit.unitType}</p>
                  </div>
                </div>
              </Stack>
            ) : null}
          </Box>

          <Divider />

          {/* Action buttons */}
          <Stack direction="column" spacing={1.5} sx={{ px: 3, py: 2 }}>
            {selectedUnit?.status === "free" ? (
              <>
                <AppButton
                  label="Забронировать"
                  variant="primary"
                  fullWidth
                  isLoading={bookMutation.isPending}
                  disabled={isActionPending}
                  onClick={() => void handleBookUnit()}
                />
                <AppButton
                  label="Резервировать"
                  variant="tonal"
                  fullWidth
                  isLoading={reserveMutation.isPending}
                  disabled={isActionPending}
                  onClick={() => void handleReserveUnit()}
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

            <AppButton
              label="Закрыть"
              variant="outline"
              fullWidth
              onClick={handleCloseDrawer}
            />
          </Stack>
        </Box>
      </Drawer>
    </div>
  );
}
