"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AppPageHeader,
  AppStatusBadge,
  AppDataTable,
  AppCommentThread,
  AppTagInput,
  type AppDataTableColumn,
  type AppComment,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface ClientDeal {
  id: string;
  unitLabel: string;
  buildingName: string;
  stage: string;
  stageTone: "success" | "warning" | "info" | "default";
  totalAmount: string;
  paidAmount: string;
}

const MOCK_DEALS: readonly ClientDeal[] = [
  {
    id: "d-001",
    unitLabel: "Кв. 42, 3-этаж",
    buildingName: 'ЖК "Сомон"',
    stage: "Договор",
    stageTone: "success",
    totalAmount: "450 000 USD",
    paidAmount: "150 000 USD",
  },
  {
    id: "d-002",
    unitLabel: "Кв. 15, 7-этаж",
    buildingName: 'ЖК "Истиклол"',
    stage: "Бронь",
    stageTone: "warning",
    totalAmount: "320 000 USD",
    paidAmount: "32 000 USD",
  },
  {
    id: "d-003",
    unitLabel: "Кв. 88, 12-этаж",
    buildingName: 'ЖК "Душанбе Сити"',
    stage: "Переговоры",
    stageTone: "info",
    totalAmount: "580 000 USD",
    paidAmount: "0 USD",
  },
] as const;

const DEAL_COLUMNS: readonly AppDataTableColumn<ClientDeal>[] = [
  { id: "unit", header: "Квартира", cell: (row) => row.unitLabel },
  { id: "building", header: "ЖК", cell: (row) => row.buildingName },
  {
    id: "stage",
    header: "Этап",
    cell: (row) => <AppStatusBadge label={row.stage} tone={row.stageTone} />,
  },
  { id: "total", header: "Сумма", cell: (row) => row.totalAmount, align: "right" },
  { id: "paid", header: "Оплачено", cell: (row) => row.paidAmount, align: "right" },
];

const MOCK_COMMENTS: readonly AppComment[] = [
  {
    id: "c-1",
    authorId: "u-1",
    authorName: "Саидов Алишер",
    text: "Клиент заинтересован в 3-комнатной квартире на высоком этаже. Бюджет до 500 000 USD.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "c-2",
    authorId: "u-2",
    authorName: "Каримова Нигина",
    text: "Провели показ ЖК Сомон. Клиенту понравилась кв. 42. Готов внести задаток.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "c-3",
    authorId: "u-1",
    authorName: "Саидов Алишер",
    text: "Задаток получен. Оформляем бронь на 48 часов.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    replyToId: "c-2",
  },
] as const;

const TAG_OPTIONS = [
  { id: "vip", label: "VIP" },
  { id: "investor", label: "Инвестор" },
  { id: "repeat", label: "Повторный" },
  { id: "broker", label: "Через брокера" },
] as const;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ClientDetailPage() {
  const params = useParams();
  const _id = params.id as string;

  const [tags, setTags] = useState<string[]>(["vip"]);

  const handleCommentSubmit = async (_text: string, _replyToId: string | null): Promise<void> => {
    // TODO: mutation
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Рахимов Фаррух"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "clients", label: "Клиенты", href: routes.clients },
          { id: "detail", label: "Рахимов Фаррух" },
        ]}
      />

      {/* Client info card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Информация о клиенте
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Телефон</p>
            <p className="text-sm font-medium text-foreground">+992 93 123 4567</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">rakhimov.f@mail.tj</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Источник</p>
            <p className="text-sm font-medium text-foreground">Рекомендация</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Менеджер</p>
            <p className="text-sm font-medium text-foreground">Саидов Алишер</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Паспорт</p>
            <p className="text-sm font-medium text-foreground">А 1234567</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Теги</p>
            <div className="mt-1">
              <AppTagInput
                value={tags}
                onChange={setTags}
                options={[...TAG_OPTIONS]}
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deals table */}
      <AppDataTable<ClientDeal>
        title="Сделки клиента"
        data={MOCK_DEALS}
        columns={DEAL_COLUMNS}
        rowKey={(row) => row.id}
        enableSelection={false}
        enableExport={false}
        enableSettings={false}
        initialPageSize={5}
      />

      {/* Comments */}
      <AppCommentThread
        title="Заметки и история"
        comments={MOCK_COMMENTS}
        currentUserId="u-1"
        onSubmit={handleCommentSubmit}
      />
    </div>
  );
}
