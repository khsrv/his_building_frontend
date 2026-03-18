"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AppPageHeader,
  AppStatCard,
  AppDataTable,
  AppStatusBadge,
  AppButton,
} from "@/shared/ui";
import type { PageHeaderCrumb, AppDataTableColumn, AppStatusTone } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

/* ---------- Mock data ---------- */

interface BuildingUnit {
  id: string;
  number: string;
  floor: number;
  rooms: number;
  areaSqm: number;
  pricePerSqm: number;
  totalPrice: number;
  status: "free" | "booked" | "sold" | "reserved";
}

const STATUS_LABEL: Record<BuildingUnit["status"], string> = {
  free: "Свободна",
  booked: "Забронирована",
  sold: "Продана",
  reserved: "Резерв",
};

const STATUS_TONE: Record<BuildingUnit["status"], AppStatusTone> = {
  free: "success",
  booked: "warning",
  sold: "danger",
  reserved: "muted",
};

const MOCK_UNITS: readonly BuildingUnit[] = [
  { id: "u1", number: "101", floor: 1, rooms: 1, areaSqm: 42, pricePerSqm: 5500, totalPrice: 231000, status: "sold" },
  { id: "u2", number: "102", floor: 1, rooms: 2, areaSqm: 65, pricePerSqm: 5200, totalPrice: 338000, status: "free" },
  { id: "u3", number: "201", floor: 2, rooms: 2, areaSqm: 68, pricePerSqm: 5300, totalPrice: 360400, status: "booked" },
  { id: "u4", number: "202", floor: 2, rooms: 3, areaSqm: 85, pricePerSqm: 5100, totalPrice: 433500, status: "free" },
  { id: "u5", number: "301", floor: 3, rooms: 1, areaSqm: 40, pricePerSqm: 5600, totalPrice: 224000, status: "free" },
  { id: "u6", number: "302", floor: 3, rooms: 2, areaSqm: 63, pricePerSqm: 5400, totalPrice: 340200, status: "reserved" },
  { id: "u7", number: "401", floor: 4, rooms: 3, areaSqm: 90, pricePerSqm: 5000, totalPrice: 450000, status: "sold" },
  { id: "u8", number: "402", floor: 4, rooms: 2, areaSqm: 66, pricePerSqm: 5300, totalPrice: 349800, status: "free" },
];

/* ---------- Table columns ---------- */

const columns: readonly AppDataTableColumn<BuildingUnit>[] = [
  { id: "number", header: "Номер", cell: (row) => row.number },
  { id: "floor", header: "Этаж", cell: (row) => row.floor, align: "center" },
  { id: "rooms", header: "Комнат", cell: (row) => row.rooms, align: "center" },
  { id: "areaSqm", header: "Площадь, м²", cell: (row) => row.areaSqm, align: "right" },
  {
    id: "pricePerSqm",
    header: "Цена/м²",
    cell: (row) => row.pricePerSqm.toLocaleString("ru-RU"),
    align: "right",
  },
  {
    id: "totalPrice",
    header: "Общая цена",
    cell: (row) => row.totalPrice.toLocaleString("ru-RU") + " SM",
    align: "right",
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge label={STATUS_LABEL[row.status]} tone={STATUS_TONE[row.status]} />
    ),
  },
];

/* ---------- Component ---------- */

export default function BuildingDetailPage() {
  const params = useParams<{ id: string }>();
  const buildingId = params.id;

  // TODO: Fetch real building data via TanStack Query hook
  const buildingName = "ЖК Сомон";

  const breadcrumbs: readonly PageHeaderCrumb[] = [
    { id: "dashboard", label: "Панель", href: routes.dashboard },
    { id: "buildings", label: "Объекты", href: routes.buildings },
    { id: "detail", label: buildingName },
  ];

  const freeCount = MOCK_UNITS.filter((u) => u.status === "free").length;

  return (
    <div className="space-y-6">
      <AppPageHeader
        actions={
          <div className="flex items-center gap-2">
            <AppButton label="Редактировать" variant="outline" />
            <Link href={routes.buildingChessGrid(buildingId)}>
              <AppButton label="Шахматка" variant="primary" />
            </Link>
          </div>
        }
        breadcrumbs={breadcrumbs}
        title={buildingName}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AppStatCard title="Блоков" value="2" />
        <AppStatCard title="Этажей" value="9" />
        <AppStatCard title="Всего квартир" value={String(MOCK_UNITS.length)} />
        <AppStatCard
          delta={`${freeCount} свободных`}
          deltaTone="success"
          title="Свободных"
          value={String(freeCount)}
        />
      </div>

      {/* Units table */}
      <AppDataTable<BuildingUnit>
        columns={columns}
        data={MOCK_UNITS}
        rowKey={(row) => row.id}
        searchPlaceholder="Поиск квартир..."
        title="Квартиры"
      />
    </div>
  );
}
