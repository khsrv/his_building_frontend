"use client";

import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { LandParcel } from "@/shared/types/entities";
import type { LandDealType, LandStatus } from "@/shared/types/enums";
import { CURRENCY_CONFIG } from "@/shared/types/enums";

// ─── Status helpers ──────────────────────────────────────────────────────────

const LAND_STATUS_LABEL: Record<LandStatus, string> = {
  searching: "Поиск",
  negotiation: "Переговоры",
  acquired: "Приобретён",
  in_development: "В разработке",
  completed: "Завершён",
};

const LAND_STATUS_TONE: Record<LandStatus, AppStatusTone> = {
  searching: "muted",
  negotiation: "warning",
  acquired: "success",
  in_development: "info",
  completed: "default",
};

const LAND_DEAL_TYPE_LABEL: Record<LandDealType, string> = {
  monetary: "Денежная",
  barter: "Бартер",
  combined: "Комбинированная",
};

// ─── Mock data ──────────────────────────────────────────────────────────────
// TODO: replace with real API hook (e.g. useLandParcelsQuery)

const MOCK_PARCELS: readonly LandParcel[] = [
  {
    id: "l1",
    tenantId: "t1",
    address: "г. Душанбе, ул. Рудаки 100",
    cadastralNumber: "01:01:0001:001",
    areaSqm: 4500,
    status: "acquired",
    dealType: "monetary",
    sellerName: "Раджабов А.",
    totalCost: 2_500_000,
    currency: "TJS",
  },
  {
    id: "l2",
    tenantId: "t1",
    address: "г. Душанбе, пр. Сомони 55",
    cadastralNumber: "01:01:0002:015",
    areaSqm: 3200,
    status: "negotiation",
    dealType: "barter",
    sellerName: "Каримов Б.",
    totalCost: 1_800_000,
    currency: "TJS",
  },
  {
    id: "l3",
    tenantId: "t1",
    address: "г. Худжанд, ул. Ленина 30",
    cadastralNumber: "03:05:0010:042",
    areaSqm: 6000,
    status: "in_development",
    dealType: "combined",
    sellerName: "Назаров В.",
    totalCost: 150_000,
    currency: "USD",
  },
  {
    id: "l4",
    tenantId: "t1",
    address: "г. Бохтар, ул. Мирзо Турсунзода 12",
    cadastralNumber: "02:03:0008:007",
    areaSqm: 2800,
    status: "searching",
    dealType: "monetary",
    sellerName: "Ходжаев Г.",
    totalCost: 900_000,
    currency: "TJS",
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCost(amount: number, currency: LandParcel["currency"]): string {
  const cfg = CURRENCY_CONFIG[currency];
  return `${amount.toLocaleString("ru-RU")} ${cfg.symbol}`;
}

// ─── Columns ────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<LandParcel>[] = [
  {
    id: "address",
    header: "Адрес",
    cell: (row) => row.address,
    sortAccessor: (row) => row.address,
    searchAccessor: (row) => row.address,
  },
  {
    id: "cadastralNumber",
    header: "Кадастровый №",
    cell: (row) => row.cadastralNumber,
    searchAccessor: (row) => row.cadastralNumber,
  },
  {
    id: "areaSqm",
    header: "Площадь (м\u00B2)",
    cell: (row) => row.areaSqm.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.areaSqm,
    align: "right",
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge
        label={LAND_STATUS_LABEL[row.status]}
        tone={LAND_STATUS_TONE[row.status]}
      />
    ),
    sortAccessor: (row) => row.status,
  },
  {
    id: "dealType",
    header: "Тип сделки",
    cell: (row) => LAND_DEAL_TYPE_LABEL[row.dealType],
    sortAccessor: (row) => row.dealType,
  },
  {
    id: "sellerName",
    header: "Продавец",
    cell: (row) => row.sellerName,
    searchAccessor: (row) => row.sellerName,
  },
  {
    id: "totalCost",
    header: "Стоимость",
    cell: (row) => formatCost(row.totalCost, row.currency),
    sortAccessor: (row) => row.totalCost,
    align: "right",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandPage() {
  // TODO: replace with real API hook
  const data = MOCK_PARCELS;

  const total = data.length;
  const acquired = data.filter((p) => p.status === "acquired" || p.status === "in_development" || p.status === "completed").length;
  const inNegotiation = data.filter((p) => p.status === "negotiation").length;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Земельные участки"
            subtitle={`${total} участков`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "land", label: "Земля" },
            ]}
            actions={
              <AppButton label="Добавить участок" variant="primary" size="md" />
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={3}
            items={[
              { title: "Всего участков", value: total },
              { title: "Приобретено", value: acquired, deltaTone: "success" },
              { title: "В переговорах", value: inNegotiation, deltaTone: "warning" },
            ]}
          />
        }
        content={
          <AppDataTable<LandParcel>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Земельные участки"
            searchPlaceholder="Поиск по адресу, кадастровому номеру или продавцу..."
            enableExport
            enableSettings
          />
        }
      />
    </main>
  );
}
