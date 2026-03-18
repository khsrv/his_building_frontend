"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TextField } from "@mui/material";
import {
  AppButton,
  AppCard,
  AppDataTable,
  type AppDataTableColumn,
  AppDrawerForm,
  AppInput,
  AppPageHeader,
  AppSelect,
  AppStatCard,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  AppTabs,
  AppActionMenu,
  type AppActionMenuGroup,
  ConfirmDialog,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { usePropertyDetailQuery } from "@/modules/properties/presentation/hooks/use-property-detail-query";
import { usePropertyBlocksQuery } from "@/modules/properties/presentation/hooks/use-property-blocks-query";
import { useUpdatePropertyMutation } from "@/modules/properties/presentation/hooks/use-update-property-mutation";
import { useCreateBlockMutation } from "@/modules/properties/presentation/hooks/use-create-block-mutation";
import { useDeleteBlockMutation } from "@/modules/properties/presentation/hooks/use-delete-block-mutation";
import { useUnitsListQuery } from "@/modules/properties/presentation/hooks/use-units-list-query";
import { useCreateUnitMutation } from "@/modules/properties/presentation/hooks/use-create-unit-mutation";
import { useBulkCreateUnitsMutation } from "@/modules/properties/presentation/hooks/use-bulk-create-units-mutation";
import { useUpdateUnitMutation } from "@/modules/properties/presentation/hooks/use-update-unit-mutation";
import { useDeleteUnitMutation } from "@/modules/properties/presentation/hooks/use-delete-unit-mutation";
import { useFloorsQuery } from "@/modules/properties/presentation/hooks/use-floors-query";
import type {
  Property,
  PropertyStatus,
  PropertyBlock,
  Unit,
  UnitStatus,
  UpdatePropertyInput,
  CreateBlockInput,
  CreateUnitInput,
  BulkCreateUnitsInput,
  UpdateUnitInput,
} from "@/modules/properties/domain/property";

// ─── Status helpers ──────────────────────────────────────────────────────────

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

const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Свободна",
  booked: "Забронирована",
  reserved: "Резерв",
  sold: "Продана",
};

const UNIT_STATUS_TONE: Record<UnitStatus, AppStatusTone> = {
  available: "success",
  booked: "warning",
  reserved: "muted",
  sold: "danger",
};

// ─── Block form state ────────────────────────────────────────────────────────

interface BlockFormState {
  name: string;
  floorsCount: string;
  undergroundFloors: string;
}

const EMPTY_BLOCK_FORM: BlockFormState = {
  name: "",
  floorsCount: "",
  undergroundFloors: "0",
};

// ─── Unit form state ─────────────────────────────────────────────────────────

interface UnitFormState {
  blockId: string;
  floorId: string;
  unitNumber: string;
  unitType: string;
  floorNumber: string;
  rooms: string;
  totalArea: string;
  livingArea: string;
  kitchenArea: string;
  balconyArea: string;
  basePrice: string;
  finishing: string;
  description: string;
}

const EMPTY_UNIT_FORM: UnitFormState = {
  blockId: "",
  floorId: "",
  unitNumber: "",
  unitType: "apartment",
  floorNumber: "",
  rooms: "",
  totalArea: "",
  livingArea: "",
  kitchenArea: "",
  balconyArea: "",
  basePrice: "",
  finishing: "",
  description: "",
};

// ─── Bulk unit form state ────────────────────────────────────────────────────

interface BulkUnitFormState {
  blockId: string;
  floorId: string;
  floorNumber: string;
  unitType: string;
  rooms: string;
  totalArea: string;
  basePrice: string;
  numberFrom: string;
  numberTo: string;
  prefix: string;
}

const EMPTY_BULK_FORM: BulkUnitFormState = {
  blockId: "",
  floorId: "",
  floorNumber: "",
  unitType: "apartment",
  rooms: "",
  totalArea: "",
  basePrice: "",
  numberFrom: "",
  numberTo: "",
  prefix: "",
};

// ─── Edit property form state ────────────────────────────────────────────────

interface EditPropertyFormState {
  name: string;
  address: string;
  city: string;
  district: string;
  description: string;
  status: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BuildingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const propertyId = params.id;

  // ─── Data queries ──────────────────────────────────────────────────
  const propertyQuery = usePropertyDetailQuery(propertyId);
  const blocksQuery = usePropertyBlocksQuery(propertyId);
  const unitsQuery = useUnitsListQuery({ propertyId, page: 1, limit: 100 });

  const property = propertyQuery.data;
  const blocks = blocksQuery.data ?? [];
  const units = unitsQuery.data?.items ?? [];

  // ─── Mutations ─────────────────────────────────────────────────────
  const updatePropertyMutation = useUpdatePropertyMutation(propertyId);
  const createBlockMutation = useCreateBlockMutation(propertyId);
  const deleteBlockMutation = useDeleteBlockMutation(propertyId);
  const createUnitMutation = useCreateUnitMutation(propertyId);
  const bulkCreateUnitsMutation = useBulkCreateUnitsMutation(propertyId);
  const deleteUnitMutation = useDeleteUnitMutation();

  // ─── Edit property drawer state ────────────────────────────────────
  const [editPropertyOpen, setEditPropertyOpen] = useState(false);
  const [editPropertyForm, setEditPropertyForm] = useState<EditPropertyFormState>({
    name: "",
    address: "",
    city: "",
    district: "",
    description: "",
    status: "planning",
  });

  // ─── Block drawer state ────────────────────────────────────────────
  const [blockDrawerOpen, setBlockDrawerOpen] = useState(false);
  const [blockForm, setBlockForm] = useState<BlockFormState>(EMPTY_BLOCK_FORM);
  const [deleteBlockTarget, setDeleteBlockTarget] = useState<PropertyBlock | null>(null);

  // ─── Unit drawer state ─────────────────────────────────────────────
  const [unitDrawerOpen, setUnitDrawerOpen] = useState(false);
  const [unitForm, setUnitForm] = useState<UnitFormState>(EMPTY_UNIT_FORM);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteUnitTarget, setDeleteUnitTarget] = useState<Unit | null>(null);

  // ─── Bulk unit drawer state ────────────────────────────────────────
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState<BulkUnitFormState>(EMPTY_BULK_FORM);

  // ─── Floor query for unit forms ────────────────────────────────────
  const selectedBlockIdForUnit = unitDrawerOpen ? unitForm.blockId : bulkForm.blockId;
  const floorsQuery = useFloorsQuery(propertyId, selectedBlockIdForUnit);
  const floors = floorsQuery.data ?? [];

  // ─── Update unit mutation ──────────────────────────────────────────
  const updateUnitMutation = useUpdateUnitMutation(editingUnit?.id ?? "");

  // ─── Edit property handlers ────────────────────────────────────────

  const handleOpenEditProperty = () => {
    if (!property) return;
    setEditPropertyForm({
      name: property.name,
      address: property.address,
      city: property.city,
      district: "",
      description: "",
      status: property.status,
    });
    setEditPropertyOpen(true);
  };

  const handleSaveProperty = () => {
    const input: UpdatePropertyInput = {
      name: editPropertyForm.name || undefined,
      address: editPropertyForm.address || undefined,
      city: editPropertyForm.city || undefined,
      district: editPropertyForm.district || undefined,
      description: editPropertyForm.description || undefined,
      status: editPropertyForm.status || undefined,
    };
    updatePropertyMutation.mutate(input, {
      onSuccess: () => setEditPropertyOpen(false),
    });
  };

  // ─── Block handlers ────────────────────────────────────────────────

  const handleSaveBlock = () => {
    const input: CreateBlockInput = {
      name: blockForm.name,
      floorsCount: Number(blockForm.floorsCount),
      undergroundFloors: blockForm.undergroundFloors ? Number(blockForm.undergroundFloors) : undefined,
    };
    createBlockMutation.mutate(input, {
      onSuccess: () => {
        setBlockDrawerOpen(false);
        setBlockForm(EMPTY_BLOCK_FORM);
      },
    });
  };

  const handleDeleteBlock = () => {
    if (!deleteBlockTarget) return;
    deleteBlockMutation.mutate(deleteBlockTarget.id, {
      onSuccess: () => setDeleteBlockTarget(null),
    });
  };

  // ─── Unit handlers ─────────────────────────────────────────────────

  const handleOpenCreateUnit = () => {
    setEditingUnit(null);
    setUnitForm(EMPTY_UNIT_FORM);
    setUnitDrawerOpen(true);
  };

  const handleOpenEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitForm({
      blockId: unit.blockId,
      floorId: unit.floorId,
      unitNumber: unit.unitNumber,
      unitType: unit.unitType,
      floorNumber: String(unit.floorNumber),
      rooms: unit.rooms !== null ? String(unit.rooms) : "",
      totalArea: unit.totalArea !== null ? String(unit.totalArea) : "",
      livingArea: unit.livingArea !== null ? String(unit.livingArea) : "",
      kitchenArea: unit.kitchenArea !== null ? String(unit.kitchenArea) : "",
      balconyArea: unit.balconyArea !== null ? String(unit.balconyArea) : "",
      basePrice: unit.basePrice !== null ? String(unit.basePrice) : "",
      finishing: unit.finishing ?? "",
      description: unit.description ?? "",
    });
    setUnitDrawerOpen(true);
  };

  const handleSaveUnit = () => {
    if (editingUnit) {
      const input: UpdateUnitInput = {
        rooms: unitForm.rooms ? Number(unitForm.rooms) : undefined,
        totalArea: unitForm.totalArea ? Number(unitForm.totalArea) : undefined,
        livingArea: unitForm.livingArea ? Number(unitForm.livingArea) : undefined,
        kitchenArea: unitForm.kitchenArea ? Number(unitForm.kitchenArea) : undefined,
        balconyArea: unitForm.balconyArea ? Number(unitForm.balconyArea) : undefined,
        basePrice: unitForm.basePrice ? Number(unitForm.basePrice) : undefined,
        finishing: unitForm.finishing || undefined,
        description: unitForm.description || undefined,
      };
      updateUnitMutation.mutate(input, {
        onSuccess: () => {
          setUnitDrawerOpen(false);
          setEditingUnit(null);
        },
      });
    } else {
      const input: CreateUnitInput = {
        propertyId,
        blockId: unitForm.blockId,
        floorId: unitForm.floorId,
        unitNumber: unitForm.unitNumber,
        unitType: unitForm.unitType,
        floorNumber: Number(unitForm.floorNumber),
        rooms: unitForm.rooms ? Number(unitForm.rooms) : undefined,
        totalArea: unitForm.totalArea ? Number(unitForm.totalArea) : undefined,
        livingArea: unitForm.livingArea ? Number(unitForm.livingArea) : undefined,
        kitchenArea: unitForm.kitchenArea ? Number(unitForm.kitchenArea) : undefined,
        balconyArea: unitForm.balconyArea ? Number(unitForm.balconyArea) : undefined,
        basePrice: unitForm.basePrice ? Number(unitForm.basePrice) : undefined,
        finishing: unitForm.finishing || undefined,
        description: unitForm.description || undefined,
      };
      createUnitMutation.mutate(input, {
        onSuccess: () => {
          setUnitDrawerOpen(false);
          setUnitForm(EMPTY_UNIT_FORM);
        },
      });
    }
  };

  const handleDeleteUnit = () => {
    if (!deleteUnitTarget) return;
    deleteUnitMutation.mutate(deleteUnitTarget.id, {
      onSuccess: () => setDeleteUnitTarget(null),
    });
  };

  // ─── Bulk unit handlers ────────────────────────────────────────────

  const handleSaveBulk = () => {
    const input: BulkCreateUnitsInput = {
      propertyId,
      blockId: bulkForm.blockId,
      floorId: bulkForm.floorId,
      floorNumber: Number(bulkForm.floorNumber),
      unitType: bulkForm.unitType,
      rooms: bulkForm.rooms ? Number(bulkForm.rooms) : undefined,
      totalArea: bulkForm.totalArea ? Number(bulkForm.totalArea) : undefined,
      basePrice: bulkForm.basePrice ? Number(bulkForm.basePrice) : undefined,
      numberFrom: Number(bulkForm.numberFrom),
      numberTo: Number(bulkForm.numberTo),
      prefix: bulkForm.prefix || undefined,
    };
    bulkCreateUnitsMutation.mutate(input, {
      onSuccess: () => {
        setBulkDrawerOpen(false);
        setBulkForm(EMPTY_BULK_FORM);
      },
    });
  };

  // ─── Loading / error ───────────────────────────────────────────────

  if (propertyQuery.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <ShimmerBox className="h-8 w-60" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerBox key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <ShimmerBox className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (propertyQuery.isError || !property) {
    return (
      <div className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить данные объекта. Попробуйте обновить страницу."
        />
      </div>
    );
  }

  // ─── Block options for selects ─────────────────────────────────────
  const blockOptions = blocks.map((b) => ({
    label: b.name,
    value: b.id,
  }));

  const floorOptions = floors.map((f) => ({
    label: `Этаж ${f.floorNumber}`,
    value: f.id,
  }));

  // ─── Block table columns ───────────────────────────────────────────

  const blockColumns: readonly AppDataTableColumn<PropertyBlock>[] = [
    {
      id: "name",
      header: "Название",
      cell: (row) => row.name,
      sortAccessor: (row) => row.name,
    },
    {
      id: "floorsCount",
      header: "Этажи",
      cell: (row) => row.floorsCount,
      sortAccessor: (row) => row.floorsCount,
      align: "right",
    },
    {
      id: "actions",
      header: "",
      cell: (row) => {
        const groups: readonly AppActionMenuGroup[] = [
          {
            id: "danger",
            items: [
              {
                id: "delete",
                label: "Удалить",
                destructive: true,
                onClick: () => setDeleteBlockTarget(row),
              },
            ],
          },
        ];
        return <AppActionMenu triggerLabel="Действия" groups={groups} />;
      },
      align: "right",
    },
  ];

  // ─── Unit table columns ────────────────────────────────────────────

  const unitColumns: readonly AppDataTableColumn<Unit>[] = [
    {
      id: "unitNumber",
      header: "Номер",
      cell: (row) => row.unitNumber,
      sortAccessor: (row) => row.unitNumber,
    },
    {
      id: "unitType",
      header: "Тип",
      cell: (row) => row.unitType,
    },
    {
      id: "floorNumber",
      header: "Этаж",
      cell: (row) => row.floorNumber,
      sortAccessor: (row) => row.floorNumber,
      align: "center",
    },
    {
      id: "rooms",
      header: "Комнаты",
      cell: (row) => row.rooms ?? "—",
      sortAccessor: (row) => row.rooms ?? 0,
      align: "center",
    },
    {
      id: "totalArea",
      header: "Площадь, м²",
      cell: (row) => row.totalArea !== null ? row.totalArea.toLocaleString("ru-RU") : "—",
      sortAccessor: (row) => row.totalArea ?? 0,
      align: "right",
    },
    {
      id: "basePrice",
      header: "Цена",
      cell: (row) => row.basePrice !== null ? row.basePrice.toLocaleString("ru-RU") : "—",
      sortAccessor: (row) => row.basePrice ?? 0,
      align: "right",
    },
    {
      id: "status",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge
          label={UNIT_STATUS_LABEL[row.status]}
          tone={UNIT_STATUS_TONE[row.status]}
        />
      ),
      sortAccessor: (row) => row.status,
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
                id: "edit",
                label: "Редактировать",
                onClick: () => handleOpenEditUnit(row),
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
                onClick: () => setDeleteUnitTarget(row),
              },
            ],
          },
        ];
        return <AppActionMenu triggerLabel="Действия" groups={groups} />;
      },
      align: "right",
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────

  const freeCount = units.filter((u) => u.status === "available").length;

  return (
    <div className="space-y-6 p-6">
      <AppPageHeader
        title={property.name}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "buildings", label: "Объекты", href: routes.buildings },
          { id: "detail", label: property.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              label="Редактировать"
              variant="outline"
              onClick={handleOpenEditProperty}
            />
            <AppButton
              label="Шахматка"
              variant="primary"
              onClick={() => router.push(routes.buildingChessGrid(propertyId))}
            />
          </div>
        }
      />

      {/* Info card */}
      <AppCard>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Адрес</p>
            <p className="text-sm font-medium">{property.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Город</p>
            <p className="text-sm font-medium">{property.city || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Статус</p>
            <AppStatusBadge
              label={PROPERTY_STATUS_LABEL[property.status]}
              tone={PROPERTY_STATUS_TONE[property.status]}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Валюта</p>
            <p className="text-sm font-medium">{property.currency}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Начало строительства</p>
            <p className="text-sm font-medium">{property.startDate ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Завершение</p>
            <p className="text-sm font-medium">{property.completionDate ?? "—"}</p>
          </div>
        </div>
      </AppCard>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AppStatCard title="Блоков" value={String(property.blocksCount)} />
        <AppStatCard title="Этажей" value={String(property.floorsCount)} />
        <AppStatCard title="Всего квартир" value={String(property.unitsCount)} />
        <AppStatCard
          delta={`${freeCount} свободных`}
          deltaTone="success"
          title="Свободных"
          value={String(property.availableUnits)}
        />
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          {
            id: "blocks",
            title: "Блоки",
            content: (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <AppButton
                    label="Добавить блок"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setBlockForm(EMPTY_BLOCK_FORM);
                      setBlockDrawerOpen(true);
                    }}
                  />
                </div>
                {blocksQuery.isLoading ? (
                  <ShimmerBox className="h-40 w-full rounded-xl" />
                ) : blocksQuery.isError ? (
                  <AppStatePanel
                    tone="error"
                    title="Ошибка загрузки"
                    description="Не удалось загрузить блоки."
                  />
                ) : blocks.length === 0 ? (
                  <AppStatePanel
                    tone="empty"
                    title="Нет блоков"
                    description="Добавьте первый блок для этого объекта."
                  />
                ) : (
                  <AppDataTable<PropertyBlock>
                    data={blocks}
                    columns={blockColumns}
                    rowKey={(row) => row.id}
                    title="Блоки"
                  />
                )}
              </div>
            ),
          },
          {
            id: "units",
            title: "Квартиры",
            badge: units.length,
            content: (
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <AppButton
                    label="Массовое создание"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkForm(EMPTY_BULK_FORM);
                      setBulkDrawerOpen(true);
                    }}
                  />
                  <AppButton
                    label="Добавить квартиру"
                    variant="primary"
                    size="sm"
                    onClick={handleOpenCreateUnit}
                  />
                </div>
                {unitsQuery.isLoading ? (
                  <ShimmerBox className="h-40 w-full rounded-xl" />
                ) : unitsQuery.isError ? (
                  <AppStatePanel
                    tone="error"
                    title="Ошибка загрузки"
                    description="Не удалось загрузить квартиры."
                  />
                ) : units.length === 0 ? (
                  <AppStatePanel
                    tone="empty"
                    title="Нет квартир"
                    description="Добавьте первую квартиру или используйте массовое создание."
                  />
                ) : (
                  <AppDataTable<Unit>
                    data={units}
                    columns={unitColumns}
                    rowKey={(row) => row.id}
                    title="Квартиры"
                    searchPlaceholder="Поиск по номеру..."
                  />
                )}
              </div>
            ),
          },
          {
            id: "chess",
            title: "Шахматка",
            content: (
              <div className="space-y-4">
                <AppButton
                  label="Открыть шахматку"
                  variant="primary"
                  onClick={() => router.push(routes.buildingChessGrid(propertyId))}
                />
              </div>
            ),
          },
        ]}
      />

      {/* Edit property drawer */}
      <AppDrawerForm
        open={editPropertyOpen}
        title="Редактировать объект"
        subtitle={property.name}
        saveLabel="Сохранить"
        cancelLabel="Отмена"
        isSaving={updatePropertyMutation.isPending}
        onClose={() => setEditPropertyOpen(false)}
        onSave={handleSaveProperty}
      >
        <div className="space-y-4">
          <AppInput
            label="Название"
            value={editPropertyForm.name}
            onChange={(e) => setEditPropertyForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <AppInput
            label="Адрес"
            value={editPropertyForm.address}
            onChange={(e) => setEditPropertyForm((prev) => ({ ...prev, address: e.target.value }))}
          />
          <AppInput
            label="Город"
            value={editPropertyForm.city}
            onChange={(e) => setEditPropertyForm((prev) => ({ ...prev, city: e.target.value }))}
          />
          <AppInput
            label="Район"
            value={editPropertyForm.district}
            onChange={(e) => setEditPropertyForm((prev) => ({ ...prev, district: e.target.value }))}
          />
          <AppSelect
            label="Статус"
            value={editPropertyForm.status}
            onChange={(e) => setEditPropertyForm((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { label: "Планирование", value: "planning" },
              { label: "Строительство", value: "under_construction" },
              { label: "Завершён", value: "completed" },
              { label: "Продажа", value: "selling" },
              { label: "Архив", value: "archived" },
            ]}
          />
          <TextField
            label="Описание"
            multiline
            minRows={3}
            fullWidth
            value={editPropertyForm.description}
            onChange={(e) => setEditPropertyForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </AppDrawerForm>

      {/* Block drawer */}
      <AppDrawerForm
        open={blockDrawerOpen}
        title="Добавить блок"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createBlockMutation.isPending}
        saveDisabled={!blockForm.name.trim() || !blockForm.floorsCount}
        onClose={() => setBlockDrawerOpen(false)}
        onSave={handleSaveBlock}
      >
        <div className="space-y-4">
          <AppInput
            label="Название блока"
            value={blockForm.name}
            onChange={(e) => setBlockForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <AppInput
            label="Количество этажей"
            type="number"
            value={blockForm.floorsCount}
            onChange={(e) => setBlockForm((prev) => ({ ...prev, floorsCount: e.target.value }))}
            required
          />
          <AppInput
            label="Подземные этажи"
            type="number"
            value={blockForm.undergroundFloors}
            onChange={(e) => setBlockForm((prev) => ({ ...prev, undergroundFloors: e.target.value }))}
          />
        </div>
      </AppDrawerForm>

      {/* Unit drawer (create / edit) */}
      <AppDrawerForm
        open={unitDrawerOpen}
        title={editingUnit ? "Редактировать квартиру" : "Добавить квартиру"}
        saveLabel="Сохранить"
        cancelLabel="Отмена"
        isSaving={createUnitMutation.isPending || updateUnitMutation.isPending}
        saveDisabled={!editingUnit && (!unitForm.unitNumber.trim() || !unitForm.blockId)}
        onClose={() => {
          setUnitDrawerOpen(false);
          setEditingUnit(null);
        }}
        onSave={handleSaveUnit}
      >
        <div className="space-y-4">
          {!editingUnit && (
            <>
              <AppSelect
                label="Блок"
                value={unitForm.blockId}
                onChange={(e) => setUnitForm((prev) => ({ ...prev, blockId: e.target.value, floorId: "" }))}
                options={blockOptions}
              />
              {unitForm.blockId && (
                <AppSelect
                  label="Этаж"
                  value={unitForm.floorId}
                  onChange={(e) => setUnitForm((prev) => ({ ...prev, floorId: e.target.value }))}
                  options={floorOptions}
                />
              )}
              <AppInput
                label="Номер квартиры"
                value={unitForm.unitNumber}
                onChange={(e) => setUnitForm((prev) => ({ ...prev, unitNumber: e.target.value }))}
                required
              />
              <AppSelect
                label="Тип"
                value={unitForm.unitType}
                onChange={(e) => setUnitForm((prev) => ({ ...prev, unitType: e.target.value }))}
                options={[
                  { label: "Квартира", value: "apartment" },
                  { label: "Коммерция", value: "commercial" },
                  { label: "Паркинг", value: "parking" },
                  { label: "Кладовая", value: "storage" },
                ]}
              />
              <AppInput
                label="Номер этажа"
                type="number"
                value={unitForm.floorNumber}
                onChange={(e) => setUnitForm((prev) => ({ ...prev, floorNumber: e.target.value }))}
              />
            </>
          )}
          <AppInput
            label="Комнаты"
            type="number"
            value={unitForm.rooms}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, rooms: e.target.value }))}
          />
          <AppInput
            label="Общая площадь, м²"
            type="number"
            value={unitForm.totalArea}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, totalArea: e.target.value }))}
          />
          <AppInput
            label="Жилая площадь, м²"
            type="number"
            value={unitForm.livingArea}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, livingArea: e.target.value }))}
          />
          <AppInput
            label="Кухня, м²"
            type="number"
            value={unitForm.kitchenArea}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, kitchenArea: e.target.value }))}
          />
          <AppInput
            label="Балкон, м²"
            type="number"
            value={unitForm.balconyArea}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, balconyArea: e.target.value }))}
          />
          <AppInput
            label="Базовая цена"
            type="number"
            value={unitForm.basePrice}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, basePrice: e.target.value }))}
          />
          <AppInput
            label="Отделка"
            value={unitForm.finishing}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, finishing: e.target.value }))}
          />
          <TextField
            label="Описание"
            multiline
            minRows={2}
            fullWidth
            value={unitForm.description}
            onChange={(e) => setUnitForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </AppDrawerForm>

      {/* Bulk create drawer */}
      <AppDrawerForm
        open={bulkDrawerOpen}
        title="Массовое создание квартир"
        subtitle="Создание нескольких квартир за раз"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={bulkCreateUnitsMutation.isPending}
        saveDisabled={!bulkForm.blockId || !bulkForm.numberFrom || !bulkForm.numberTo}
        onClose={() => setBulkDrawerOpen(false)}
        onSave={handleSaveBulk}
      >
        <div className="space-y-4">
          <AppSelect
            label="Блок"
            value={bulkForm.blockId}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, blockId: e.target.value, floorId: "" }))}
            options={blockOptions}
          />
          {bulkForm.blockId && (
            <AppSelect
              label="Этаж"
              value={bulkForm.floorId}
              onChange={(e) => setBulkForm((prev) => ({ ...prev, floorId: e.target.value }))}
              options={floorOptions}
            />
          )}
          <AppInput
            label="Номер этажа"
            type="number"
            value={bulkForm.floorNumber}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, floorNumber: e.target.value }))}
            required
          />
          <AppSelect
            label="Тип"
            value={bulkForm.unitType}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, unitType: e.target.value }))}
            options={[
              { label: "Квартира", value: "apartment" },
              { label: "Коммерция", value: "commercial" },
              { label: "Паркинг", value: "parking" },
              { label: "Кладовая", value: "storage" },
            ]}
          />
          <AppInput
            label="Комнаты"
            type="number"
            value={bulkForm.rooms}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, rooms: e.target.value }))}
          />
          <AppInput
            label="Площадь, м²"
            type="number"
            value={bulkForm.totalArea}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, totalArea: e.target.value }))}
          />
          <AppInput
            label="Базовая цена"
            type="number"
            value={bulkForm.basePrice}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, basePrice: e.target.value }))}
          />
          <AppInput
            label="Нумерация от"
            type="number"
            value={bulkForm.numberFrom}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, numberFrom: e.target.value }))}
            required
          />
          <AppInput
            label="Нумерация до"
            type="number"
            value={bulkForm.numberTo}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, numberTo: e.target.value }))}
            required
          />
          <AppInput
            label="Префикс (необязательно)"
            value={bulkForm.prefix}
            onChange={(e) => setBulkForm((prev) => ({ ...prev, prefix: e.target.value }))}
          />
        </div>
      </AppDrawerForm>

      {/* Delete block confirm */}
      <ConfirmDialog
        open={deleteBlockTarget !== null}
        title="Удалить блок?"
        message={`Вы уверены, что хотите удалить блок "${deleteBlockTarget?.name ?? ""}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDeleteBlock}
        onClose={() => setDeleteBlockTarget(null)}
      />

      {/* Delete unit confirm */}
      <ConfirmDialog
        open={deleteUnitTarget !== null}
        title="Удалить квартиру?"
        message={`Вы уверены, что хотите удалить квартиру "${deleteUnitTarget?.unitNumber ?? ""}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDeleteUnit}
        onClose={() => setDeleteUnitTarget(null)}
      />
    </div>
  );
}
