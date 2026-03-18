"use client";

import { useState } from "react";
import {
  AppChartWidget,
  AppColorGrid,
  type AppColorGridRow,
  AppCommentThread,
  type AppComment,
  AppCountdownBadge,
  AppCurrencyDisplay,
  AppKanbanBoard,
  type AppKanbanCard,
  type AppKanbanColumn,
  AppMoneyInput,
  AppNotificationCenter,
  type AppNotification,
  AppPaymentTimeline,
  type AppPaymentInstallment,
  AppProgressBar,
  AppSearchableSelect,
  type AppSearchableSelectOption,
  AppStepWizard,
  type AppStepWizardStep,
  AppTagInput,
  type AppTagOption,
  AppTreeList,
  type AppTreeNode,
} from "@/shared/ui";
import type { AppCurrencyOption } from "@/shared/ui/primitives/money-input";
import { AppInput } from "@/shared/ui/primitives/input";

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-base font-bold text-primary">{title}</p>
      {children}
    </div>
  );
}

// ─── Sample data ─────────────────────────────────────────────────────────────

const CHART_DATA = [
  { label: "Янв", продажи: 12, бронь: 4 },
  { label: "Фев", продажи: 18, бронь: 7 },
  { label: "Мар", продажи: 9, бронь: 3 },
  { label: "Апр", продажи: 24, бронь: 11 },
  { label: "Май", продажи: 30, бронь: 8 },
  { label: "Июн", продажи: 21, бронь: 5 },
];

const CHART_SERIES = [
  { key: "продажи", label: "Продажи" },
  { key: "бронь", label: "Бронь" },
];

const PIE_DATA = [
  { label: "Свободно", value: 42 },
  { label: "Бронь", value: 15 },
  { label: "Продано", value: 38 },
  { label: "Резерв", value: 5 },
];

const COLOR_GRID_ROWS: readonly AppColorGridRow[] = [
  {
    id: "fl4", label: "4 эт.",
    cells: [
      { id: "4-1", label: "41", status: "free" },
      { id: "4-2", label: "42", status: "booked", tooltip: "Клиент: Иванов" },
      { id: "4-3", label: "43", status: "sold" },
      { id: "4-4", label: "44", status: "free" },
      { id: "4-5", label: "45", status: "reserved" },
    ],
  },
  {
    id: "fl3", label: "3 эт.",
    cells: [
      { id: "3-1", label: "31", status: "sold" },
      { id: "3-2", label: "32", status: "sold" },
      { id: "3-3", label: "33", status: "booked" },
      { id: "3-4", label: "34", status: "free" },
      { id: "3-5", label: "35", status: "free" },
    ],
  },
  {
    id: "fl2", label: "2 эт.",
    cells: [
      { id: "2-1", label: "21", status: "free" },
      { id: "2-2", label: "22", status: "booked" },
      { id: "2-3", label: "23", status: "unavailable" },
      { id: "2-4", label: "24", status: "sold" },
      { id: "2-5", label: "25", status: "free" },
    ],
  },
  {
    id: "fl1", label: "1 эт.",
    cells: [
      { id: "1-1", label: "11", status: "sold" },
      { id: "1-2", label: "12", status: "sold" },
      { id: "1-3", label: "13", status: "sold" },
      { id: "1-4", label: "14", status: "booked" },
      { id: "1-5", label: "15", status: "free" },
    ],
  },
];

interface DealCard extends AppKanbanCard {
  title: string;
  client: string;
  amount: number;
}

const KANBAN_COLUMNS: readonly AppKanbanColumn[] = [
  { id: "new", label: "Новые", color: "var(--color-info)" },
  { id: "negotiation", label: "Переговоры", color: "var(--color-warning)" },
  { id: "reserved", label: "Резерв", color: "var(--color-secondary)" },
  { id: "closed", label: "Закрыто", color: "var(--color-success)" },
];

const INITIAL_KANBAN_CARDS: readonly DealCard[] = [
  { id: "c1", columnId: "new", title: "кв. 41, 3-комн", client: "Иванов А.А.", amount: 850000 },
  { id: "c2", columnId: "new", title: "кв. 22, 1-комн", client: "Петрова М.И.", amount: 320000 },
  { id: "c3", columnId: "negotiation", title: "кв. 33, 2-комн", client: "Сидоров В.П.", amount: 560000 },
  { id: "c4", columnId: "reserved", title: "кв. 15, 2-комн", client: "Назаров Х.Б.", amount: 490000 },
  { id: "c5", columnId: "closed", title: "кв. 12, 1-комн", client: "Рахимов Дж.", amount: 280000 },
];

const PAYMENT_INSTALLMENTS: readonly AppPaymentInstallment[] = [
  { id: "p1", label: "Первоначальный взнос", dueDate: "2024-01-15", amount: 200000, currency: "SM", status: "paid" },
  { id: "p2", label: "Взнос 2", dueDate: "2024-04-15", amount: 100000, currency: "SM", status: "paid" },
  { id: "p3", label: "Взнос 3", dueDate: "2024-07-15", amount: 100000, currency: "SM", status: "overdue" },
  { id: "p4", label: "Взнос 4", dueDate: "2025-01-15", amount: 100000, currency: "SM", status: "upcoming" },
  { id: "p5", label: "Взнос 5", dueDate: "2025-07-15", amount: 100000, currency: "SM", status: "upcoming" },
  { id: "p6", label: "Финальный платёж", dueDate: "2026-01-15", amount: 150000, currency: "SM", status: "upcoming" },
];

const INITIAL_COMMENTS: readonly AppComment[] = [
  { id: "cm1", authorId: "u1", authorName: "Алишер Назаров", text: "Клиент подтвердил интерес к квартире 41. Ждём документы до пятницы.", createdAt: "2025-03-10T09:15:00Z" },
  { id: "cm2", authorId: "u2", authorName: "Малика Рашидова", text: "Документы получены, передаю на юридическую проверку.", createdAt: "2025-03-11T14:30:00Z", replyToId: null, pinned: true },
  { id: "cm3", authorId: "u1", authorName: "Алишер Назаров", text: "Хорошо, жду результат.", createdAt: "2025-03-11T15:00:00Z", replyToId: "cm2" },
];

const TAG_OPTIONS: readonly AppTagOption[] = [
  { id: "vip", label: "VIP", color: "#f59e0b" },
  { id: "mortgage", label: "Ипотека", color: "#3b82f6" },
  { id: "cash", label: "Наличные", color: "#10b981" },
  { id: "installment", label: "Рассрочка", color: "#8b5cf6" },
  { id: "urgent", label: "Срочно", color: "#ef4444" },
];

const SELECT_OPTIONS: readonly AppSearchableSelectOption[] = [
  { id: "jk1", label: "ЖК Садовый", secondary: "ул. Садовая, 12" },
  { id: "jk2", label: "ЖК Центральный", secondary: "пр. Рудаки, 88" },
  { id: "jk3", label: "ЖК Бизнес Парк", secondary: "ул. Айни, 45" },
  { id: "jk4", label: "ЖК Премиум Плаза", secondary: "пр. Исмоили Сомони, 3" },
];

const TREE_NODES: readonly AppTreeNode[] = [
  {
    id: "jk1", label: "ЖК Садовый", badge: 80, badgeColor: "primary",
    children: [
      { id: "b1", label: "Блок А", badge: 40, children: [
        { id: "b1f1", label: "Этаж 1", badge: 5 },
        { id: "b1f2", label: "Этаж 2", badge: 5 },
        { id: "b1f3", label: "Этаж 3", badge: 5 },
      ] },
      { id: "b2", label: "Блок Б", badge: 40, children: [
        { id: "b2f1", label: "Этаж 1", badge: 5 },
        { id: "b2f2", label: "Этаж 2", badge: 5 },
      ] },
    ],
  },
  {
    id: "jk2", label: "ЖК Центральный", badge: 60, badgeColor: "primary",
    children: [{ id: "jk2b1", label: "Блок А", badge: 60 }],
  },
];

const NOTIFICATIONS: readonly AppNotification[] = [
  { id: "n1", title: "Бронь истекает через 2 часа", body: "Квартира 41 — Иванов А.А.", type: "warning", createdAt: "2026-03-17T09:30:00Z", read: false },
  { id: "n2", title: "Платёж просрочен", body: "Взнос 3 по договору №2024-033.", type: "error", createdAt: "2026-03-17T07:00:00Z", read: false },
  { id: "n3", title: "Новая заявка", body: "Заявка на кв. 22 от Петровой М.И.", type: "info", createdAt: "2026-03-16T10:00:00Z", read: true },
];

const WIZARD_STEPS: readonly AppStepWizardStep[] = [
  { id: "client", label: "Клиент", description: "Данные покупателя", content: (
    <div className="space-y-3">
      <AppInput label="ФИО клиента" placeholder="Иванов Иван Иванович" />
      <AppInput label="Телефон" placeholder="+992 900 000 000" />
    </div>
  ) },
  { id: "apartment", label: "Квартира", content: (
    <div className="space-y-3">
      <AppInput label="ЖК / Блок / Квартира" placeholder="ЖК Садовый, Блок А, кв. 41" />
      <AppInput label="Площадь (м²)" placeholder="75.5" />
    </div>
  ) },
  { id: "payment", label: "Оплата", content: (
    <div className="space-y-3">
      <AppInput label="Тип оплаты" placeholder="Рассрочка / Ипотека / Наличные" />
    </div>
  ) },
  { id: "docs", label: "Документы", optional: true, content: (
    <p className="py-6 text-center text-sm text-muted-foreground">Загрузка документов (необязательно)</p>
  ) },
];

// ─── Main showcase ────────────────────────────────────────────────────────────
export function NewComponentsShowcase() {
  const [kanbanCards, setKanbanCards] = useState<readonly DealCard[]>(INITIAL_KANBAN_CARDS);
  const [comments, setComments] = useState<readonly AppComment[]>(INITIAL_COMMENTS);
  const [tags, setTags] = useState<string[]>(["vip", "installment"]);
  const [selectedJk, setSelectedJk] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [notifications, setNotifications] = useState<readonly AppNotification[]>(NOTIFICATIONS);
  const [moneyValue, setMoneyValue] = useState<number | null>(750000);
  const [moneyCurrency, setMoneyCurrency] = useState("TJS");

  const currencyOptions: readonly AppCurrencyOption[] = [
    { code: "TJS", symbol: "SM", label: "Сомони" },
    { code: "USD", symbol: "$", label: "Доллар" },
    { code: "EUR", symbol: "€", label: "Евро" },
  ];

  const [bookingExpiry] = useState(() => new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString());
  const [urgentExpiry] = useState(() => new Date(Date.now() + 1000 * 60 * 45).toISOString());
  const [expiredAt] = useState(() => new Date(Date.now() - 1000).toISOString());

  const handleKanbanMove = (cardId: string, _from: string, to: string) => {
    setKanbanCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, columnId: to } : c)));
  };

  const handleCommentSubmit = async (text: string, replyToId: string | null) => {
    const newComment: AppComment = {
      id: `cm${Date.now()}`, authorId: "u1", authorName: "Алишер Назаров",
      text, createdAt: new Date().toISOString(), replyToId,
    };
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <div className="space-y-2 p-2">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground">Новые компоненты — BuildCRM</h2>
        <AppNotificationCenter
          notifications={notifications}
          onRead={(id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))}
          onReadAll={() => setNotifications((p) => p.map((n) => ({ ...n, read: true })))}
        />
      </div>
      <div className="border-b border-border" />

      {/* Деньги */}
      <Section title="AppMoneyInput + AppCurrencyDisplay">
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-[300px]">
            <AppMoneyInput
              currencies={currencyOptions}
              currency={moneyCurrency}
              label="Стоимость квартиры"
              onChangeCurrency={setMoneyCurrency}
              onChangeValue={setMoneyValue}
              secondaryAmount={(moneyValue ?? 0) / 11}
              secondaryCurrency="USD"
              value={moneyValue ?? 0}
            />
          </div>
          <div className="space-y-1 pt-1">
            <AppCurrencyDisplay amount={moneyValue ?? 0} currency="SM" size="xl" />
            <AppCurrencyDisplay amount={moneyValue ?? 0} currency="SM" size="lg" showSign />
            <AppCurrencyDisplay amount={-50000} currency="SM" size="md" showSign />
            <AppCurrencyDisplay amount={moneyValue ?? 0} currency="SM" size="sm" secondaryAmount={(moneyValue ?? 0) / 11} secondaryCurrency="USD" />
          </div>
        </div>
      </Section>

      {/* Таймер */}
      <Section title="AppCountdownBadge — таймер брони">
        <div className="flex flex-wrap items-center gap-3">
          <AppCountdownBadge expiresAt={bookingExpiry} variant="chip" label="Бронь" />
          <AppCountdownBadge expiresAt={urgentExpiry} variant="chip" label="Бронь" />
          <AppCountdownBadge expiresAt={bookingExpiry} variant="inline" label="Осталось" />
          <AppCountdownBadge expiresAt={urgentExpiry} variant="block" label="Бронь истекает" />
          <AppCountdownBadge expiresAt={expiredAt} variant="chip" label="Бронь" expiredLabel="Истекла" />
        </div>
      </Section>

      {/* Теги */}
      <Section title="AppTagInput">
        <div className="max-w-[500px]">
          <AppTagInput label="Метки клиента" onChange={setTags} options={TAG_OPTIONS} value={tags} />
        </div>
      </Section>

      {/* Поиск */}
      <Section title="AppSearchableSelect">
        <div className="flex flex-wrap items-center gap-3">
          <AppSearchableSelect
            dialogTitle="Выбор ЖК"
            onChange={(id) => setSelectedJk(id)}
            options={SELECT_OPTIONS}
            triggerLabel="Выбрать ЖК"
            value={selectedJk}
          />
          {selectedJk ? (
            <span className="text-sm text-muted-foreground">
              Выбрано: {SELECT_OPTIONS.find((o) => o.id === selectedJk)?.label}
            </span>
          ) : null}
        </div>
      </Section>

      {/* Прогресс */}
      <Section title="AppProgressBar — ход строительства">
        <div className="max-w-[600px] space-y-6">
          <AppProgressBar
            title="Статус квартир ЖК Садовый"
            segments={[
              { id: "sold", label: "Продано", value: 38 },
              { id: "booked", label: "Бронь", value: 15 },
              { id: "reserved", label: "Резерв", value: 5 },
              { id: "free", label: "Свободно", value: 42 },
            ]}
            showLabel
            size="lg"
          />
          <AppProgressBar
            title="Готовность строительства"
            segments={[
              { id: "done", label: "Готово", value: 68 },
              { id: "inprogress", label: "В работе", value: 20 },
            ]}
            size="md"
          />
        </div>
      </Section>

      {/* Графики */}
      <Section title="AppChartWidget">
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <AppChartWidget data={CHART_DATA} series={CHART_SERIES} title="Продажи (Bar)" type="bar" />
          <AppChartWidget data={CHART_DATA} series={CHART_SERIES} title="Динамика (Line)" type="line" />
          <AppChartWidget data={PIE_DATA} series={[{ key: "value", label: "Единиц" }]} title="Статусы (Doughnut)" type="doughnut" />
          <AppChartWidget data={CHART_DATA} series={CHART_SERIES} title="Area (stacked)" type="area" stacked />
        </div>
      </Section>

      {/* Шахматка */}
      <Section title="AppColorGrid — шахматка квартир">
        <div className="max-w-[420px]">
          <AppColorGrid cellSize="md" rows={COLOR_GRID_ROWS} title="Блок А, ЖК Садовый" />
        </div>
      </Section>

      {/* Канбан */}
      <Section title="AppKanbanBoard — сделки">
        <AppKanbanBoard
          cards={kanbanCards}
          columns={KANBAN_COLUMNS}
          onCardMove={handleKanbanMove}
          renderCard={(card) => (
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <p className="text-sm font-semibold text-foreground">{card.title}</p>
              <p className="text-xs text-muted-foreground">{card.client}</p>
              <p className="mt-1 text-xs font-semibold text-primary">
                {new Intl.NumberFormat("ru-RU").format(card.amount)} SM
              </p>
            </div>
          )}
        />
      </Section>

      {/* Платежи */}
      <Section title="AppPaymentTimeline — график платежей">
        <div className="max-w-[480px]">
          <AppPaymentTimeline installments={PAYMENT_INSTALLMENTS} showProgress title="График рассрочки — кв. 41" />
        </div>
      </Section>

      {/* Комментарии */}
      <Section title="AppCommentThread — заметки">
        <div className="max-w-[560px]">
          <AppCommentThread comments={comments} currentUserId="u1" onSubmit={handleCommentSubmit} title="История переговоров" />
        </div>
      </Section>

      {/* Дерево */}
      <Section title="AppTreeList — иерархия ЖК">
        <div className="max-w-[320px] rounded-xl border border-border bg-card p-2 shadow-sm">
          <AppTreeList defaultExpanded={["jk1", "b1"]} nodes={TREE_NODES} />
        </div>
      </Section>

      {/* Визард */}
      <Section title="AppStepWizard — оформление сделки">
        <div className="max-w-[560px] rounded-xl border border-border bg-card p-4 shadow-sm">
          <AppStepWizard activeStep={wizardStep} onComplete={() => alert("Сделка оформлена!")} onStepChange={setWizardStep} steps={WIZARD_STEPS} />
        </div>
      </Section>
    </div>
  );
}
