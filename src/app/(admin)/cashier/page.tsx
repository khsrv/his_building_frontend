"use client";

import { useState } from "react";
import { AppPageHeader, AppStepWizard, AppButton, type AppStepWizardStep } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const BUILDINGS = [
  { value: "", label: "-- Выберите ЖК --" },
  { value: "b-1", label: 'ЖК "Сомон"' },
  { value: "b-2", label: 'ЖК "Истиклол"' },
  { value: "b-3", label: 'ЖК "Душанбе Сити"' },
] as const;

const UNITS: Record<string, readonly { value: string; label: string; price: number }[]> = {
  "b-1": [
    { value: "u-1", label: "Кв. 12, 2-этаж, 2к, 65 м²", price: 310000 },
    { value: "u-2", label: "Кв. 42, 3-этаж, 3к, 95 м²", price: 450000 },
    { value: "u-3", label: "Кв. 78, 8-этаж, 1к, 42 м²", price: 195000 },
  ],
  "b-2": [
    { value: "u-4", label: "Кв. 15, 7-этаж, 2к, 72 м²", price: 340000 },
    { value: "u-5", label: "Кв. 33, 5-этаж, 3к, 105 м²", price: 520000 },
  ],
  "b-3": [
    { value: "u-6", label: "Кв. 88, 12-этаж, 4к, 140 м²", price: 780000 },
  ],
};

const PAYMENT_TYPES = [
  { value: "full", label: "Полная оплата" },
  { value: "installment", label: "Рассрочка" },
  { value: "mortgage", label: "Ипотека" },
  { value: "barter", label: "Бартер" },
  { value: "combined", label: "Комбинированная" },
] as const;

function generateSchedule(totalAmount: number, months: number): readonly { month: number; date: string; amount: number }[] {
  const monthlyAmount = Math.round(totalAmount / months);
  const now = new Date();
  const result: { month: number; date: string; amount: number }[] = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 15);
    result.push({
      month: i + 1,
      date: date.toISOString().slice(0, 10),
      amount: i === months - 1 ? totalAmount - monthlyAmount * (months - 1) : monthlyAmount,
    });
  }

  return result;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0 }).format(amount) + " USD";
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CashierPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [building, setBuilding] = useState("");
  const [unit, setUnit] = useState("");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClient, setSelectedClient] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [paymentType, setPaymentType] = useState("installment");

  const availableUnits = building ? (UNITS[building] ?? []) : [];
  const selectedUnit = availableUnits.find((u) => u.value === unit);
  const totalAmount = selectedUnit?.price ?? 0;
  const schedule = generateSchedule(totalAmount, 12);

  const selectedBuildingLabel = BUILDINGS.find((b) => b.value === building)?.label ?? "—";
  const clientDisplay =
    clientMode === "existing"
      ? selectedClient || "—"
      : newClientName || "—";

  const steps: readonly AppStepWizardStep[] = [
    {
      id: "object",
      label: "Объект и квартира",
      content: (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">ЖК</label>
            <select
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value);
                setUnit("");
              }}
            >
              {BUILDINGS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {building ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Квартира</label>
              <select
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="">-- Выберите квартиру --</option>
                {availableUnits.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label} — {formatMoney(u.price)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "client",
      label: "Клиент",
      content: (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                clientMode === "existing"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setClientMode("existing")}
            >
              Существующий
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                clientMode === "new"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setClientMode("new")}
            >
              Новый клиент
            </button>
          </div>

          {clientMode === "existing" ? (
            <div>
              {/* TODO: replace with AppSearchableSelect */}
              <label className="mb-1 block text-sm font-medium text-foreground">Поиск клиента</label>
              <select
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">-- Выберите клиента --</option>
                <option value="Рахимов Фаррух">Рахимов Фаррух — +992 93 123 4567</option>
                <option value="Каримов Бахром">Каримов Бахром — +992 91 987 6543</option>
                <option value="Назарова Малика">Назарова Малика — +992 90 555 1234</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">ФИО</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                  placeholder="Введите ФИО"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Телефон</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                  placeholder="+992 XX XXX XXXX"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "payment-type",
      label: "Тип оплаты",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PAYMENT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                className={`rounded-xl border p-4 text-left transition-colors ${
                  paymentType === pt.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
                onClick={() => setPaymentType(pt.value)}
              >
                <p className="text-sm font-semibold text-foreground">{pt.label}</p>
              </button>
            ))}
          </div>

          {totalAmount > 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Стоимость квартиры</p>
              <p className="text-xl font-bold text-foreground">{formatMoney(totalAmount)}</p>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "schedule",
      label: "График платежей",
      content: (
        <div>
          {paymentType === "installment" && totalAmount > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Дата</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.month} className="border-b border-border/50">
                      <td className="px-3 py-2 text-foreground">{row.month}</td>
                      <td className="px-3 py-2 text-foreground">{row.date}</td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">
                        {formatMoney(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border">
                    <td colSpan={2} className="px-3 py-2 font-semibold text-foreground">Итого</td>
                    <td className="px-3 py-2 text-right font-bold text-foreground">
                      {formatMoney(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : paymentType === "full" ? (
            <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">Полная оплата</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{formatMoney(totalAmount)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Единовременный платёж</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                График платежей будет рассчитан после согласования условий
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">{formatMoney(totalAmount)}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "contract",
      label: "Договор и подтверждение",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Итого по сделке</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">ЖК</p>
                <p className="text-sm font-medium text-foreground">{selectedBuildingLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Квартира</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedUnit?.label ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Клиент</p>
                <p className="text-sm font-medium text-foreground">{clientDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Тип оплаты</p>
                <p className="text-sm font-medium text-foreground">
                  {PAYMENT_TYPES.find((p) => p.value === paymentType)?.label ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Сумма</p>
                <p className="text-sm font-bold text-foreground">{formatMoney(totalAmount)}</p>
              </div>
              {paymentType === "installment" ? (
                <div>
                  <p className="text-xs text-muted-foreground">Кол-во платежей</p>
                  <p className="text-sm font-medium text-foreground">12</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center">
            {/* TODO: connect to contract generation API */}
            <AppButton
              label="Сформировать договор"
              variant="outline"
              disabled
            />
          </div>
        </div>
      ),
    },
  ];

  const handleComplete = (): void => {
    // TODO: submit cashier deal creation mutation
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Касса — оформление сделки"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "cashier", label: "Касса" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <AppStepWizard
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onComplete={handleComplete}
          completeLabel="Оформить сделку"
        />
      </div>
    </div>
  );
}
