"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  AppButton,
  AppColorGrid,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import type { AppColorGridRow, AppColorGridCell } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { Building } from "@/shared/types/entities";
import type { BuildingStatus } from "@/shared/types/enums";

// ─── Status helpers ──────────────────────────────────────────────────────────

const BUILDING_STATUS_LABEL: Record<BuildingStatus, string> = {
  planning: "Планирование",
  construction: "Строительство",
  completed: "Завершён",
  selling: "Продажа",
  archived: "Архив",
};

const BUILDING_STATUS_TONE: Record<BuildingStatus, AppStatusTone> = {
  planning: "muted",
  construction: "warning",
  completed: "success",
  selling: "info",
  archived: "muted",
};

// ─── Mock data (replace with API hook) ───────────────────────────────────────

const MOCK_BUILDINGS: readonly Building[] = [
  {
    id: "b1",
    tenantId: "t1",
    name: "ЖК Сомон",
    address: "г. Душанбе, ул. Рудаки 45",
    status: "construction",
    blocksCount: 3,
    floorsCount: 16,
    unitsCount: 192,
    freeUnitsCount: 87,
    imageUrl: null,
    currency: "TJS",
    startDate: "2024-03-01",
    completionDate: "2026-09-01",
  },
  {
    id: "b2",
    tenantId: "t1",
    name: "ЖК Дусти",
    address: "г. Душанбе, пр. Исмоили Сомони 12",
    status: "selling",
    blocksCount: 2,
    floorsCount: 12,
    unitsCount: 96,
    freeUnitsCount: 24,
    imageUrl: null,
    currency: "TJS",
    startDate: "2023-06-01",
    completionDate: "2025-12-01",
  },
  {
    id: "b3",
    tenantId: "t1",
    name: "ЖК Пойтахт",
    address: "г. Душанбе, ул. Айни 78",
    status: "completed",
    blocksCount: 4,
    floorsCount: 20,
    unitsCount: 320,
    freeUnitsCount: 12,
    imageUrl: null,
    currency: "USD",
    startDate: "2022-01-15",
    completionDate: "2025-01-15",
  },
  {
    id: "b4",
    tenantId: "t1",
    name: "ЖК Ситора",
    address: "г. Душанбе, ул. Бохтар 33",
    status: "planning",
    blocksCount: 2,
    floorsCount: 14,
    unitsCount: 112,
    freeUnitsCount: 112,
    imageUrl: null,
    currency: "TJS",
    startDate: null,
    completionDate: null,
  },
  {
    id: "b5",
    tenantId: "t1",
    name: "ЖК Истиклол",
    address: "г. Худжанд, ул. Ленина 56",
    status: "construction",
    blocksCount: 1,
    floorsCount: 9,
    unitsCount: 54,
    freeUnitsCount: 42,
    imageUrl: null,
    currency: "TJS",
    startDate: "2025-01-10",
    completionDate: "2027-06-01",
  },
  {
    id: "b6",
    tenantId: "t1",
    name: "ЖК Навруз",
    address: "г. Бохтар, ул. Мирзо Турсунзода 5",
    status: "selling",
    blocksCount: 2,
    floorsCount: 10,
    unitsCount: 80,
    freeUnitsCount: 31,
    imageUrl: null,
    currency: "TJS",
    startDate: "2023-11-01",
    completionDate: "2026-03-01",
  },
] as const;

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Building>[] = [
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
        label={BUILDING_STATUS_LABEL[row.status]}
        tone={BUILDING_STATUS_TONE[row.status]}
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
    id: "freeUnitsCount",
    header: "Свободных",
    cell: (row) => row.freeUnitsCount,
    sortAccessor: (row) => row.freeUnitsCount,
    align: "right",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

// ─── Chess grid mock data per building ───────────────────────────────────────

function makeChessRows(building: Building): readonly AppColorGridRow[] {
  const statuses: AppColorGridCell["status"][] = [
    "free", "free", "sold", "free", "booked", "free", "reserved", "free",
  ];
  const rows: AppColorGridRow[] = [];
  const floors = Math.min(building.floorsCount, 9);
  const aptsPerFloor = Math.min(Math.ceil(building.unitsCount / floors), 8);

  for (let floor = 1; floor <= floors; floor++) {
    const cells: AppColorGridCell[] = [];
    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      const num = (floor - 1) * aptsPerFloor + apt;
      const status = statuses[(floor * 3 + apt) % statuses.length] ?? "free";
      const rooms = apt % 3 === 0 ? 3 : apt % 2 === 0 ? 2 : 1;
      const area = rooms === 1 ? 42 : rooms === 2 ? 65 : 85;
      cells.push({
        id: `${building.id}-${floor}-${apt}`,
        label: String(num),
        status,
        tooltip: `Кв. ${num}, ${rooms}-комн, ${area} м²`,
      });
    }
    rows.push({ id: `${building.id}-floor-${floor}`, label: `Этаж ${floor}`, cells });
  }
  return rows;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BuildingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isChessView = searchParams.get("view") === "chess";

  // TODO: replace with real API hook (e.g. useBuildingsListQuery)
  const data = MOCK_BUILDINGS;

  const totalBuildings = data.length;
  const inConstruction = data.filter((b) => b.status === "construction").length;
  const selling = data.filter((b) => b.status === "selling").length;
  const totalFreeUnits = data.reduce((sum, b) => sum + b.freeUnitsCount, 0);

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

        {data.map((building) => (
          <div key={building.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{building.name}</h2>
              <AppStatusBadge
                label={BUILDING_STATUS_LABEL[building.status]}
                tone={BUILDING_STATUS_TONE[building.status]}
              />
            </div>
            <AppColorGrid
              cellSize="sm"
              onCellClick={(cell) => {
                // TODO: navigate to unit detail or open drawer
                console.log("Cell clicked:", building.name, cell);
              }}
              rows={makeChessRows(building)}
              showLegend={false}
            />
          </div>
        ))}

        {/* Legend once at the bottom */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-emerald-500" /> Свободна</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-amber-500" /> Бронь</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-red-500" /> Продана</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-blue-500" /> Резерв</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-gray-300" /> Недоступна</span>
        </div>
      </main>
    );
  }

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
                  onClick={() => router.push(routes.buildingCreate)}
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
          <AppDataTable<Building>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Объекты"
            searchPlaceholder="Поиск по названию или адресу..."
            enableExport
            enableSettings
            onRowClick={(row) => router.push(routes.buildingDetail(row.id))}
          />
        }
      />
    </main>
  );
}
