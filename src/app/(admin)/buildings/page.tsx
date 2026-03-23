"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppDrawerForm,
  AppInput,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  AppActionMenu,
  type AppActionMenuGroup,
  ConfirmDialog,
  ShimmerBox,
} from "@/shared/ui";
import type { AppColorGridRow, AppColorGridCell } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { useCreatePropertyMutation } from "@/modules/properties/presentation/hooks/use-create-property-mutation";
import { useUpdatePropertyMutation } from "@/modules/properties/presentation/hooks/use-update-property-mutation";
import { useDeletePropertyMutation } from "@/modules/properties/presentation/hooks/use-delete-property-mutation";
import { useChessBoardQuery } from "@/modules/properties/presentation/hooks/use-chessboard-query";
import { useCreateUnitMutation } from "@/modules/properties/presentation/hooks/use-create-unit-mutation";

import { useCreateBlockMutation } from "@/modules/properties/presentation/hooks/use-create-block-mutation";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useQueryClient } from "@tanstack/react-query";
import { createFloor, deleteFloor, duplicateFloor, fetchFloors } from "@/modules/properties/infrastructure/properties-repository";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { useNotifier } from "@/shared/providers/notifier-provider";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import { UnitFormDrawer, EMPTY_UNIT_FORM } from "@/modules/properties/presentation/components/unit-form-drawer";
import type { UnitFormValues } from "@/modules/properties/presentation/components/unit-form-drawer";
import { UnitPhotoManager } from "@/modules/properties/presentation/components/unit-photo-manager";
import { useUnitDetailQuery } from "@/modules/properties/presentation/hooks/use-unit-detail-query";
import { useClientDetailQuery } from "@/modules/clients/presentation/hooks/use-client-detail-query";
import type { Property, PropertyStatus, CreatePropertyInput, UpdatePropertyInput, ChessBoardFilters, ChessBlock, ChessFloor, ChessUnit, CreateBlockInput, CreateUnitInput } from "@/modules/properties/domain/property";

// ─── Status helpers ──────────────────────────────────────────────────────────

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

// ─── Chess unit status helpers ────────────────────────────────────────────────

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

// ─── Rooms filter options ──────────────────────────────────────────────────────

const ROOMS_OPTIONS = [
  { label: "Все комнаты", value: "" },
  { label: "1-комн", value: "1" },
  { label: "2-комн", value: "2" },
  { label: "3-комн", value: "3" },
  { label: "4+-комн", value: "4" },
] as const;

// ─── Chess filter state ────────────────────────────────────────────────────────

interface ChessLocalFilters {
  status: ChessBoardFilters["status"] | "";
  rooms: string;
  priceMin: string;
  priceMax: string;
}

const DEFAULT_CHESS_FILTERS: ChessLocalFilters = {
  status: "",
  rooms: "",
  priceMin: "",
  priceMax: "",
};

function toApiFilters(local: ChessLocalFilters): ChessBoardFilters {
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

const UNIT_TYPE_OPTIONS = [
  { label: "Квартира", value: "apartment" },
  { label: "Студия", value: "studio" },
  { label: "Коммерческое", value: "commercial" },
  { label: "Парковка", value: "parking" },
] as const;

// UnitFormValues & EMPTY_UNIT_FORM imported from shared UnitFormDrawer

async function resolveFloorId(
  propertyId: string,
  blockId: string,
  floor: ChessFloor,
): Promise<string | null> {
  if (floor.floorId) return floor.floorId;
  const floors = await fetchFloors(propertyId, blockId);
  const match = floors.find((f) => f.floorNumber === floor.floorNumber);
  return match?.id ?? null;
}

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

// ─── Empty form state ────────────────────────────────────────────────────────

interface PropertyFormState {
  name: string;
  propertyType: string;
  address: string;
  city: string;
  district: string;
  currency: string;
  constructionStartDate: string;
  constructionEndDate: string;
  description: string;
}

const EMPTY_FORM: PropertyFormState = {
  name: "",
  propertyType: "residential_complex",
  address: "",
  city: "",
  district: "",
  currency: "USD",
  constructionStartDate: "",
  constructionEndDate: "",
  description: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuildingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isChessView = searchParams.get("view") === "chess";

  const { data, isLoading, isError } = usePropertiesListQuery({ page: 1, limit: 50 });
  const createMutation = useCreatePropertyMutation();
  const deleteMutation = useDeletePropertyMutation();

  const properties = data?.items ?? [];
  const totalBuildings = data?.total ?? properties.length;
  const totalAllUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalSold = properties.reduce((sum, p) => sum + p.soldUnits, 0);
  const totalAvailable = properties.reduce((sum, p) => sum + p.availableUnits, 0);
  const totalBooked = properties.reduce((sum, p) => sum + p.bookedUnits, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + p.totalRevenue, 0);
  const overallRealization = totalAllUnits > 0 ? (totalSold / totalAllUnits) * 100 : 0;

  // ─── Drawer state ────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);

  // ─── Delete confirm ──────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setForm({
      name: property.name,
      propertyType: "residential_complex",
      address: property.address,
      city: property.city,
      district: "",
      currency: property.currency,
      constructionStartDate: property.constructionStartDate ?? "",
      constructionEndDate: property.constructionEndDate ?? "",
      description: "",
    });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingProperty(null);
  };

  const handleSave = () => {
    if (editingProperty) {
      const input: UpdatePropertyInput = {
        name: form.name || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        district: form.district || undefined,
        description: form.description || undefined,
      };
      // Use inline mutation since we need the editing property id
      updatePropertyInline(editingProperty.id, input);
    } else {
      const input: CreatePropertyInput = {
        name: form.name,
        propertyType: form.propertyType,
        address: form.address || undefined,
        city: form.city || undefined,
        district: form.district || undefined,
        description: form.description || undefined,
        currency: form.currency || undefined,
        constructionStartDate: form.constructionStartDate || undefined,
        constructionEndDate: form.constructionEndDate || undefined,
      };
      createMutation.mutate(input, {
        onSuccess: () => handleCloseDrawer(),
      });
    }
  };

  // Inline update mutation call
  const updateMutation = useUpdatePropertyMutation(editingProperty?.id ?? "");
  const updatePropertyInline = (id: string, input: UpdatePropertyInput) => {
    updateMutation.mutate(input, {
      onSuccess: () => handleCloseDrawer(),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const setField = (field: keyof PropertyFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Table columns ──────────────────────────────────────────────────

  const fmtMoney = (v: number) => v > 0 ? `$${v.toLocaleString("ru-RU")}` : "—";
  const fmtPct = (v: number) => `${v.toFixed(1)}%`;

  const columns: readonly AppDataTableColumn<Property>[] = [
    {
      id: "name",
      header: "Название",
      cell: (row) => (
        <div>
          <span className="font-medium">{row.name}</span>
          {row.address ? (
            <span className="block text-xs text-muted-foreground">{row.address}</span>
          ) : null}
        </div>
      ),
      sortAccessor: (row) => row.name,
      searchAccessor: (row) => `${row.name} ${row.address}`,
    },
    {
      id: "totalUnits",
      header: "Всего",
      cell: (row) => row.totalUnits,
      sortAccessor: (row) => row.totalUnits,
      align: "right",
    },
    {
      id: "availableUnits",
      header: "Свободных",
      cell: (row) => (
        <span className="text-emerald-600 font-medium">{row.availableUnits}</span>
      ),
      sortAccessor: (row) => row.availableUnits,
      align: "right",
    },
    {
      id: "bookedUnits",
      header: "Бронь",
      cell: (row) => (
        <span className={row.bookedUnits > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
          {row.bookedUnits}
        </span>
      ),
      sortAccessor: (row) => row.bookedUnits,
      align: "right",
    },
    {
      id: "soldUnits",
      header: "Продано",
      cell: (row) => (
        <span className={row.soldUnits > 0 ? "font-semibold" : "text-muted-foreground"}>
          {row.soldUnits}
        </span>
      ),
      sortAccessor: (row) => row.soldUnits,
      align: "right",
    },
    {
      id: "totalRevenue",
      header: "Выручка",
      cell: (row) => (
        <span className="font-medium">{fmtMoney(row.totalRevenue)}</span>
      ),
      sortAccessor: (row) => row.totalRevenue,
      align: "right",
    },
    {
      id: "avgPrice",
      header: "Ср. цена/м²",
      cell: (row) => (
        <span className="text-muted-foreground">{row.avgPricePerSqm > 0 ? `$${Math.round(row.avgPricePerSqm).toLocaleString("ru-RU")}` : "—"}</span>
      ),
      sortAccessor: (row) => row.avgPricePerSqm,
      align: "right",
    },
    {
      id: "realizationPercent",
      header: "Реализация",
      cell: (row) => {
        const pct = row.realizationPercent;
        const color = pct >= 70 ? "text-emerald-600" : pct >= 30 ? "text-amber-600" : "text-muted-foreground";
        return <span className={`font-semibold ${color}`}>{fmtPct(pct)}</span>;
      },
      sortAccessor: (row) => row.realizationPercent,
      align: "right",
    },
    {
      id: "actions",
      header: "",
      cell: (row) => {
        const groups: readonly AppActionMenuGroup[] = [
          {
            id: "main",
            items: [
              {
                id: "detail",
                label: "Подробнее",
                href: routes.buildingDetail(row.id),
              },
              {
                id: "chess",
                label: "Шахматка",
                href: routes.buildingChessGrid(row.id),
              },
              {
                id: "edit",
                label: "Редактировать",
                onClick: () => handleOpenEdit(row),
              },
            ],
          },
          {
            id: "danger",
            items: [
              {
                id: "delete",
                label: "Удалить",
                destructive: true,
                onClick: () => setDeleteTarget(row),
              },
            ],
          },
        ];
        return (
          <AppActionMenu
            triggerLabel="Действия"
            groups={groups}
          />
        );
      },
      align: "right",
    },
  ];

  // ─── Chess view ─────────────────────────────────────────────────────

  if (isChessView) {
    return (
      <ChessViewPage
        properties={properties}
        isLoadingProperties={isLoading}
        isErrorProperties={isError}
      />
    );
  }

  // ─── List view ──────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Объекты строительства"
            subtitle={`${totalBuildings} объектов`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "buildings", label: "Объекты" },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <AppButton
                  label="Шахматка"
                  variant="outline"
                  onClick={() => router.push(`${routes.buildings}?view=chess`)}
                />
                <AppButton
                  label="Добавить объект"
                  variant="primary"
                  size="md"
                  onClick={handleOpenCreate}
                />
              </div>
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={4}
            items={[
              { title: "Всего квартир", value: totalAllUnits },
              { title: "Свободных", value: totalAvailable, deltaTone: "success" },
              { title: "Продано", value: totalSold, delta: `${overallRealization.toFixed(1)}%` },
              { title: "Общая выручка", value: `$${totalRevenue.toLocaleString("ru-RU")}` },
            ]}
          />
        }
        content={
          isLoading ? (
            <ShimmerBox className="h-64 w-full rounded-xl" />
          ) : isError ? (
            <AppStatePanel
              tone="error"
              title="Ошибка загрузки"
              description="Не удалось загрузить список объектов. Попробуйте обновить страницу."
            />
          ) : (
            <AppDataTable<Property>
              data={properties}
              columns={columns}
              rowKey={(row) => row.id}
              title="Объекты"
              searchPlaceholder="Поиск по названию или адресу..."
              enableExport
              enableSettings
              onRowClick={(row) => router.push(routes.buildingDetail(row.id))}
            />
          )
        }
      />

      {/* Create / Edit drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title={editingProperty ? "Редактировать объект" : "Новый объект"}
        subtitle={editingProperty ? `Редактирование: ${editingProperty.name}` : "Заполните данные нового объекта"}
        saveLabel="Сохранить"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending || updateMutation.isPending}
        saveDisabled={!form.name.trim()}
        onClose={handleCloseDrawer}
        onSave={handleSave}
      >
        <div className="space-y-4">
          <AppInput
            label="Название"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
          <AppSelect
            label="Тип объекта"
            value={form.propertyType}
            onChange={(e) => setField("propertyType", e.target.value)}
            options={[
              { label: "Жилой комплекс", value: "residential_complex" },
              { label: "Коммерческий", value: "commercial" },
              { label: "Смешанный", value: "mixed" },
            ]}
          />
          <AppInput
            label="Адрес"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
          <AppInput
            label="Город"
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
          />
          <AppInput
            label="Район"
            value={form.district}
            onChange={(e) => setField("district", e.target.value)}
          />
          <AppSelect
            label="Валюта"
            value={form.currency}
            onChange={(e) => setField("currency", e.target.value)}
            options={[
              { label: "TJS", value: "TJS" },
              { label: "USD", value: "USD" },
              { label: "RUB", value: "RUB" },
            ]}
          />
          <AppInput
            label="Дата начала строительства"
            type="date"
            value={form.constructionStartDate}
            onChange={(e) => setField("constructionStartDate", e.target.value)}
          />
          <AppInput
            label="Дата завершения строительства"
            type="date"
            value={form.constructionEndDate}
            onChange={(e) => setField("constructionEndDate", e.target.value)}
          />
          <AppInput
            label="Описание"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Описание объекта"
          />
        </div>
      </AppDrawerForm>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Удалить объект?"
        message={`Вы уверены, что хотите удалить "${deleteTarget?.name ?? ""}"? Это действие необратимо.`}
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}

// ─── Chess View (full-featured) ──────────────────────────────────────────────

interface ChessViewPageProps {
  properties: readonly Property[];
  isLoadingProperties: boolean;
  isErrorProperties: boolean;
}

function ChessViewPage({ properties, isLoadingProperties, isErrorProperties }: ChessViewPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notifier = useNotifier();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id ?? "",
  );
  const [localFilters, setLocalFilters] = useState<ChessLocalFilters>(DEFAULT_CHESS_FILTERS);
  const [selectedUnit, setSelectedUnit] = useState<ChessUnit | null>(null);
  const [selectedUnitContext, setSelectedUnitContext] = useState<{
    block: ChessBlock;
    floor: ChessFloor;
  } | null>(null);
  const [unitDrawerOpen, setUnitDrawerOpen] = useState(false);

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

  const activePropertyId = selectedPropertyId || (properties[0]?.id ?? "");
  const selectedProperty = properties.find((p) => p.id === activePropertyId);

  const apiFilters = toApiFilters(localFilters);
  const chessBoardQuery = useChessBoardQuery(activePropertyId, apiFilters);
  const chessBoard = chessBoardQuery.data;

  const createUnitMutation = useCreateUnitMutation(activePropertyId);
  const createBlockMutation = useCreateBlockMutation(activePropertyId);

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
    setUnitDrawerOpen(true);
  }

  function handleCloseDrawer(): void {
    setUnitDrawerOpen(false);
    setSelectedUnit(null);
    setSelectedUnitContext(null);
  }

  function handleRowAddClick(row: AppColorGridRow): void {
    if (!chessBoard) return;
    for (const block of chessBoard.blocks) {
      for (const floor of block.floors) {
        if (`${block.id}-floor-${floor.floorNumber}` === row.id) {
          const existingNumbers = floor.units
            .map((u) => parseInt(u.unitNumber.replace(/\D/g, ""), 10))
            .filter((n) => !isNaN(n));
          const nextNumber = existingNumbers.length > 0
            ? Math.max(...existingNumbers) + 1
            : floor.floorNumber * 100 + 1;

          setCreateUnitContext({ block, floor });
          setUnitForm({ ...EMPTY_UNIT_FORM, unitNumber: String(nextNumber) });
          setCreateUnitOpen(true);
          return;
        }
      }
    }
  }

  async function handleSaveUnit(): Promise<void> {
    if (!createUnitContext) return;
    const { block, floor } = createUnitContext;

    const floorId = await resolveFloorId(activePropertyId, block.id, floor);
    if (!floorId) return;

    const input: CreateUnitInput = {
      propertyId: activePropertyId,
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

  async function handleCopyFloor(): Promise<void> {
    if (!copyFloorConfirm) return;
    const { block, floor } = copyFloorConfirm;
    setCopyFloorPending(true);

    try {
      await duplicateFloor(activePropertyId, block.id, floor.floorId ?? "");

      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(activePropertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(activePropertyId, block.id) });
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    } finally {
      setCopyFloorPending(false);
      setCopyFloorConfirm(null);
    }
  }

  async function handleCreateEmptyFloor(block: ChessBlock): Promise<void> {
    setCreateFloorBlockId(block.id);
    try {
      const created = await createFloor(activePropertyId, block.id);
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(activePropertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(activePropertyId, block.id) });
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
      await deleteFloor(activePropertyId, block.id, floorId);
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(activePropertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(activePropertyId, block.id) });
      notifier.success(`Этаж ${floorNumber} удалён`);
    } catch (error) {
      notifier.error(normalizeErrorMessage(error));
    } finally {
      setDeleteFloorConfirm(null);
    }
  }

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
    <main className="space-y-5 p-4 md:p-6">
      <AppPageHeader
        title={selectedProperty ? selectedProperty.name : "Шахматка"}
        subtitle="Шахматка объекта"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "buildings", label: "Объекты", href: routes.buildings },
          { id: "chess", label: "Шахматка" },
        ]}
        actions={
          <div className="flex items-center gap-2">
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

      {/* Property selector + Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="w-56">
          <AppSelect
            label="Объект"
            value={activePropertyId}
            onChange={(e) => {
              setSelectedPropertyId(e.target.value);
              setLocalFilters(DEFAULT_CHESS_FILTERS);
            }}
            options={
              isLoadingProperties
                ? [{ label: "Загрузка...", value: "" }]
                : properties.map((p) => ({ label: p.name, value: p.id }))
            }
          />
        </div>
        <div className="w-44">
          <AppSelect
            label="Статус"
            value={localFilters.status}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, status: e.target.value as ChessLocalFilters["status"] }))
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
              label: opt.label,
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
          onClick={() => setLocalFilters(DEFAULT_CHESS_FILTERS)}
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
      {isLoadingProperties ? (
        <div className="space-y-4">
          <ShimmerBox className="h-48 w-full rounded-xl" />
        </div>
      ) : isErrorProperties ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить список объектов. Попробуйте обновить страницу."
        />
      ) : properties.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Нет объектов"
          description="Объекты строительства не найдены."
        />
      ) : chessBoardQuery.isLoading ? (
        <div className="space-y-4">
          <ShimmerBox className="h-10 w-48 rounded" />
          <ShimmerBox className="h-64 w-full rounded-xl" />
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
                  {block.floors.length > 0 && (() => {
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
                  })()}
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Unit info drawer (lightweight) */}
      <Drawer anchor="right" open={unitDrawerOpen} onClose={handleCloseDrawer}>
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
                      propertyId={activePropertyId}
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
                  router.push(routes.unitDetail(activePropertyId, selectedUnit.id));
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

      {/* Create unit drawer (shared) */}
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

      {/* Copy floor confirm */}
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

      {/* Delete floor confirm */}
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

      {/* Create block drawer */}
      <AppDrawerForm
        open={createBlockOpen}
        title="Новый блок"
        subtitle={selectedProperty?.name ?? "Объект"}
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
    </main>
  );
}
