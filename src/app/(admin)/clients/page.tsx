"use client";

import { useRouter } from "next/navigation";
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
import type { Client } from "@/shared/types/entities";
import type { DealSource } from "@/shared/types/enums";

// ─── Source helpers ──────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<DealSource, string> = {
  website: "Сайт",
  phone: "Телефон",
  walk_in: "Визит",
  referral: "Рекомендация",
  broker: "Брокер",
  social_media: "Соцсети",
  advertising: "Реклама",
  other: "Другое",
};

const SOURCE_TONE: Record<DealSource, AppStatusTone> = {
  website: "info",
  phone: "default",
  walk_in: "success",
  referral: "warning",
  broker: "muted",
  social_media: "info",
  advertising: "default",
  other: "muted",
};

// ─── Mock data (replace with API hook) ───────────────────────────────────────

const MOCK_CLIENTS: readonly Client[] = [
  {
    id: "c1",
    tenantId: "t1",
    fullName: "Рахимов Фаррух Сайдуллоевич",
    phone: "+992 93 123 4567",
    email: "rakhimov@mail.tj",
    passportNumber: null,
    source: "website",
    managerId: "m1",
    managerName: "Шарипов А.",
    tags: ["VIP", "ЖК Сомон"],
    createdAt: "2025-12-01T10:00:00Z",
  },
  {
    id: "c2",
    tenantId: "t1",
    fullName: "Каримова Нигина Абдуллоевна",
    phone: "+992 90 987 6543",
    email: "nkarimova@gmail.com",
    passportNumber: null,
    source: "referral",
    managerId: "m2",
    managerName: "Назаров Д.",
    tags: ["Ипотека"],
    createdAt: "2026-01-15T14:30:00Z",
  },
  {
    id: "c3",
    tenantId: "t1",
    fullName: "Саидов Бехруз Рахматуллоевич",
    phone: "+992 91 555 1234",
    email: null,
    passportNumber: null,
    source: "phone",
    managerId: "m1",
    managerName: "Шарипов А.",
    tags: ["2-комн"],
    createdAt: "2026-02-10T09:15:00Z",
  },
  {
    id: "c4",
    tenantId: "t1",
    fullName: "Назарова Мадина Ходжиевна",
    phone: "+992 92 777 8899",
    email: "madina.n@inbox.tj",
    passportNumber: null,
    source: "walk_in",
    managerId: "m3",
    managerName: "Ализода М.",
    tags: ["Рассрочка", "ЖК Дусти"],
    createdAt: "2026-02-20T11:00:00Z",
  },
  {
    id: "c5",
    tenantId: "t1",
    fullName: "Ашуров Далер Комилджонович",
    phone: "+992 93 333 2211",
    email: "ashurov.d@mail.ru",
    passportNumber: null,
    source: "social_media",
    managerId: "m2",
    managerName: "Назаров Д.",
    tags: [],
    createdAt: "2026-03-01T16:45:00Z",
  },
  {
    id: "c6",
    tenantId: "t1",
    fullName: "Джураева Фируза Анваровна",
    phone: "+992 90 111 4455",
    email: null,
    passportNumber: null,
    source: "advertising",
    managerId: "m1",
    managerName: "Шарипов А.",
    tags: ["Коммерция"],
    createdAt: "2026-03-10T08:20:00Z",
  },
] as const;

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Client>[] = [
  {
    id: "fullName",
    header: "ФИО",
    cell: (row) => row.fullName,
    sortAccessor: (row) => row.fullName,
    searchAccessor: (row) => row.fullName,
  },
  {
    id: "phone",
    header: "Телефон",
    cell: (row) => row.phone,
    searchAccessor: (row) => row.phone,
  },
  {
    id: "email",
    header: "Email",
    cell: (row) => row.email ?? "—",
    searchAccessor: (row) => row.email,
  },
  {
    id: "source",
    header: "Источник",
    cell: (row) => (
      <AppStatusBadge
        label={SOURCE_LABEL[row.source]}
        tone={SOURCE_TONE[row.source]}
      />
    ),
    sortAccessor: (row) => row.source,
  },
  {
    id: "managerName",
    header: "Менеджер",
    cell: (row) => row.managerName ?? "—",
    sortAccessor: (row) => row.managerName ?? "",
  },
  {
    id: "tags",
    header: "Теги",
    cell: (row) => row.tags.length > 0 ? row.tags.join(", ") : "—",
  },
  {
    id: "createdAt",
    header: "Дата создания",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter();

  // TODO: replace with real API hook (e.g. useClientsListQuery)
  const data = MOCK_CLIENTS;

  const totalClients = data.length;
  // Mock stats — will come from API summary endpoint
  const newThisMonth = 3;
  const withActiveDeals = 4;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Клиенты"
            subtitle={`${totalClients} клиентов`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "clients", label: "Клиенты" },
            ]}
            actions={
              <AppButton
                label="Добавить клиента"
                variant="primary"
                size="md"
                onClick={() => router.push(routes.clients)}
              />
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={3}
            items={[
              { title: "Всего клиентов", value: totalClients },
              { title: "Новые за месяц", value: newThisMonth, deltaTone: "info" },
              { title: "С активными сделками", value: withActiveDeals, deltaTone: "success" },
            ]}
          />
        }
        content={
          <AppDataTable<Client>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Клиенты"
            searchPlaceholder="Поиск по ФИО или телефону..."
            enableExport
            enableSettings
            onRowClick={(row) => router.push(routes.clientDetail(row.id))}
          />
        }
      />
    </main>
  );
}
