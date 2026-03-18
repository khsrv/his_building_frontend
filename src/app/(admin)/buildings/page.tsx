"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField } from "@mui/material";
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
import type { Property, PropertyStatus, CreatePropertyInput, UpdatePropertyInput } from "@/modules/properties/domain/property";

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

// ─── Chess grid preview rows for a property ──────────────────────────────────

function makeChessPreviewRows(property: Property): readonly AppColorGridRow[] {
  const statuses: AppColorGridCell["status"][] = [
    "free", "free", "sold", "free", "booked", "free", "reserved", "free",
  ];
  const rows: AppColorGridRow[] = [];
  const floors = Math.min(property.floorsCount, 9);
  const aptsPerFloor = Math.min(Math.ceil(property.unitsCount / Math.max(floors, 1)), 8);

  for (let floor = 1; floor <= floors; floor++) {
    const cells: AppColorGridCell[] = [];
    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      const num = (floor - 1) * aptsPerFloor + apt;
      const status = statuses[(floor * 3 + apt) % statuses.length] ?? "free";
      const rooms = apt % 3 === 0 ? 3 : apt % 2 === 0 ? 2 : 1;
      const area = rooms === 1 ? 42 : rooms === 2 ? 65 : 85;
      cells.push({
        id: `${property.id}-${floor}-${apt}`,
        label: String(num),
        status,
        tooltip: `Кв. ${num}, ${rooms}-комн, ${area} м²`,
      });
    }
    rows.push({ id: `${property.id}-floor-${floor}`, label: `Этаж ${floor}`, cells });
  }
  return rows;
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
  propertyType: "residential",
  address: "",
  city: "",
  district: "",
  currency: "TJS",
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
  const inConstruction = properties.filter((p) => p.status === "under_construction").length;
  const selling = properties.filter((p) => p.status === "selling").length;
  const totalFreeUnits = properties.reduce((sum, p) => sum + p.availableUnits, 0);

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
      propertyType: "residential",
      address: property.address,
      city: property.city,
      district: "",
      currency: property.currency,
      constructionStartDate: property.startDate ?? "",
      constructionEndDate: property.completionDate ?? "",
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

  const columns: readonly AppDataTableColumn<Property>[] = [
    {
      id: "name",
      header: "Название",
      cell: (row) => row.name,
      sortAccessor: (row) => row.name,
      searchAccessor: (row) => row.name,
    },
    {
      id: "address",
      header: "Адрес",
      cell: (row) => row.address,
      searchAccessor: (row) => row.address,
    },
    {
      id: "status",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge
          label={PROPERTY_STATUS_LABEL[row.status]}
          tone={PROPERTY_STATUS_TONE[row.status]}
        />
      ),
      sortAccessor: (row) => row.status,
    },
    {
      id: "blocksCount",
      header: "Блоки",
      cell: (row) => row.blocksCount,
      sortAccessor: (row) => row.blocksCount,
      align: "right",
    },
    {
      id: "unitsCount",
      header: "Квартиры",
      cell: (row) => row.unitsCount,
      sortAccessor: (row) => row.unitsCount,
      align: "right",
    },
    {
      id: "availableUnits",
      header: "Свободных",
      cell: (row) => row.availableUnits,
      sortAccessor: (row) => row.availableUnits,
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
                id: "edit",
                label: "Редактировать",
                onClick: () => handleOpenEdit(row),
              },
              {
                id: "detail",
                label: "Подробнее",
                href: routes.buildingDetail(row.id),
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
      <main className="space-y-6 p-6">
        <AppPageHeader
          title="Шахматка объектов"
          subtitle="Визуализация квартир по всем объектам"
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "buildings", label: "Объекты", href: routes.buildings },
            { id: "chess", label: "Шахматка" },
          ]}
          actions={
            <AppButton
              label="Список объектов"
              variant="outline"
              onClick={() => router.push(routes.buildings)}
            />
          }
        />

        {isLoading ? (
          <div className="space-y-4">
            <ShimmerBox className="h-48 w-full rounded-xl" />
            <ShimmerBox className="h-48 w-full rounded-xl" />
          </div>
        ) : isError ? (
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
        ) : (
          properties.map((property) => (
            <div key={property.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{property.name}</h2>
                <div className="flex items-center gap-2">
                  <AppStatusBadge
                    label={PROPERTY_STATUS_LABEL[property.status]}
                    tone={PROPERTY_STATUS_TONE[property.status]}
                  />
                  <AppButton
                    label="Шахматка"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(routes.buildingChessGrid(property.id))}
                  />
                </div>
              </div>
              <AppColorGrid
                cellSize="sm"
                onCellClick={() => undefined}
                rows={makeChessPreviewRows(property)}
                showLegend={false}
              />
            </div>
          ))
        )}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-emerald-500" /> Свободна
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-amber-500" /> Бронь
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-red-500" /> Продана
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-blue-500" /> Резерв
          </span>
        </div>
      </main>
    );
  }

  // ─── List view ──────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-6">
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
              { title: "Всего объектов", value: totalBuildings },
              { title: "В строительстве", value: inConstruction, deltaTone: "warning" },
              { title: "Продаются", value: selling, deltaTone: "info" },
              { title: "Свободных квартир", value: totalFreeUnits, deltaTone: "success" },
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
              { label: "Жилой", value: "residential" },
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
          <TextField
            label="Описание"
            multiline
            minRows={3}
            fullWidth
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
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
