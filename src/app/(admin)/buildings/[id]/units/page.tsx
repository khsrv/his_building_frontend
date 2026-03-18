"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TextField } from "@mui/material";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppDrawerForm,
  AppInput,
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
import { routes } from "@/shared/constants/routes";
import { usePropertyDetailQuery } from "@/modules/properties/presentation/hooks/use-property-detail-query";
import { usePropertyBlocksQuery } from "@/modules/properties/presentation/hooks/use-property-blocks-query";
import { useUnitsListQuery } from "@/modules/properties/presentation/hooks/use-units-list-query";
import { useCreateUnitMutation } from "@/modules/properties/presentation/hooks/use-create-unit-mutation";
import { useUpdateUnitMutation } from "@/modules/properties/presentation/hooks/use-update-unit-mutation";
import { useDeleteUnitMutation } from "@/modules/properties/presentation/hooks/use-delete-unit-mutation";
import { useFloorsQuery } from "@/modules/properties/presentation/hooks/use-floors-query";
import type {
  Unit,
  UnitStatus,
  CreateUnitInput,
  UpdateUnitInput,
} from "@/modules/properties/domain/property";

// ─── Status helpers ──────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function BuildingUnitsPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params.id;

  // ─── Filters ───────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<UnitStatus | "">("");
  const [blockFilter, setBlockFilter] = useState("");
  const [roomsFilter, setRoomsFilter] = useState("");

  // ─── Data queries ──────────────────────────────────────────────────
  const propertyQuery = usePropertyDetailQuery(propertyId);
  const blocksQuery = usePropertyBlocksQuery(propertyId);
  const unitsQuery = useUnitsListQuery({
    propertyId,
    page: 1,
    limit: 200,
    status: statusFilter || undefined,
    blockId: blockFilter || undefined,
    rooms: roomsFilter ? Number(roomsFilter) : undefined,
  });

  const property = propertyQuery.data;
  const blocks = blocksQuery.data ?? [];
  const units = unitsQuery.data?.items ?? [];

  // ─── Mutations ─────────────────────────────────────────────────────
  const createUnitMutation = useCreateUnitMutation(propertyId);
  const deleteUnitMutation = useDeleteUnitMutation();

  // ─── Drawer state ──────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState<UnitFormState>(EMPTY_UNIT_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);

  // ─── Floor query ───────────────────────────────────────────────────
  const floorsQuery = useFloorsQuery(propertyId, unitForm.blockId);
  const floors = floorsQuery.data ?? [];

  // ─── Update unit mutation ──────────────────────────────────────────
  const updateUnitMutation = useUpdateUnitMutation(editingUnit?.id ?? "");

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setUnitForm(EMPTY_UNIT_FORM);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
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
    setDrawerOpen(true);
  };

  const handleSave = () => {
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
          setDrawerOpen(false);
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
          setDrawerOpen(false);
          setUnitForm(EMPTY_UNIT_FORM);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUnitMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  // ─── Block options for filter ──────────────────────────────────────
  const blockOptions = [
    { label: "Все блоки", value: "" },
    ...blocks.map((b) => ({ label: b.name, value: b.id })),
  ];

  const floorOptions = floors.map((f) => ({
    label: `Этаж ${f.floorNumber}`,
    value: f.id,
  }));

  // ─── Table columns ─────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<Unit>[] = [
    {
      id: "unitNumber",
      header: "Номер",
      cell: (row) => row.unitNumber,
      sortAccessor: (row) => row.unitNumber,
      searchAccessor: (row) => row.unitNumber,
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
      header: "Базовая цена",
      cell: (row) => row.basePrice !== null ? row.basePrice.toLocaleString("ru-RU") : "—",
      sortAccessor: (row) => row.basePrice ?? 0,
      align: "right",
    },
    {
      id: "currentPrice",
      header: "Текущая цена",
      cell: (row) => row.currentPrice !== null ? row.currentPrice.toLocaleString("ru-RU") : "—",
      sortAccessor: (row) => row.currentPrice ?? 0,
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
        return <AppActionMenu triggerLabel="Действия" groups={groups} />;
      },
      align: "right",
    },
  ];

  // ─── Loading / error ───────────────────────────────────────────────

  if (propertyQuery.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <ShimmerBox className="h-8 w-60" />
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
          description="Не удалось загрузить данные объекта."
        />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Квартиры"
            subtitle={property.name}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "buildings", label: "Объекты", href: routes.buildings },
              { id: "detail", label: property.name, href: routes.buildingDetail(propertyId) },
              { id: "units", label: "Квартиры" },
            ]}
            actions={
              <AppButton
                label="Добавить квартиру"
                variant="primary"
                onClick={handleOpenCreate}
              />
            }
          />
        }
        filters={
          <div className="flex flex-wrap items-end gap-3">
            <AppSelect
              label="Статус"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UnitStatus | "")}
              options={[
                { label: "Все статусы", value: "" },
                { label: "Свободна", value: "available" },
                { label: "Забронирована", value: "booked" },
                { label: "Резерв", value: "reserved" },
                { label: "Продана", value: "sold" },
              ]}
            />
            <AppSelect
              label="Блок"
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              options={blockOptions}
            />
            <AppSelect
              label="Комнаты"
              value={roomsFilter}
              onChange={(e) => setRoomsFilter(e.target.value)}
              options={[
                { label: "Все", value: "" },
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4+", value: "4" },
              ]}
            />
          </div>
        }
        content={
          unitsQuery.isLoading ? (
            <ShimmerBox className="h-64 w-full rounded-xl" />
          ) : unitsQuery.isError ? (
            <AppStatePanel
              tone="error"
              title="Ошибка загрузки"
              description="Не удалось загрузить список квартир."
            />
          ) : units.length === 0 ? (
            <AppStatePanel
              tone="empty"
              title="Нет квартир"
              description="Квартиры по заданным фильтрам не найдены."
            />
          ) : (
            <AppDataTable<Unit>
              data={units}
              columns={columns}
              rowKey={(row) => row.id}
              title="Квартиры"
              searchPlaceholder="Поиск по номеру квартиры..."
              enableExport
            />
          )
        }
      />

      {/* Create / Edit drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title={editingUnit ? "Редактировать квартиру" : "Добавить квартиру"}
        saveLabel="Сохранить"
        cancelLabel="Отмена"
        isSaving={createUnitMutation.isPending || updateUnitMutation.isPending}
        saveDisabled={!editingUnit && (!unitForm.unitNumber.trim() || !unitForm.blockId)}
        onClose={() => {
          setDrawerOpen(false);
          setEditingUnit(null);
        }}
        onSave={handleSave}
      >
        <div className="space-y-4">
          {!editingUnit && (
            <>
              <AppSelect
                label="Блок"
                value={unitForm.blockId}
                onChange={(e) => setUnitForm((prev) => ({ ...prev, blockId: e.target.value, floorId: "" }))}
                options={blocks.map((b) => ({ label: b.name, value: b.id }))}
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

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Удалить квартиру?"
        message={`Вы уверены, что хотите удалить квартиру "${deleteTarget?.unitNumber ?? ""}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
