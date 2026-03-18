"use client";

import { useState } from "react";
import { AppPageHeader, AppStepWizard, type AppStepWizardStep } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

// ---------------------------------------------------------------------------
// Mock options
// ---------------------------------------------------------------------------

const BUILDINGS = [
  { value: "", label: "-- Выберите ЖК --" },
  { value: "b-1", label: 'ЖК "Сомон"' },
  { value: "b-2", label: 'ЖК "Истиклол"' },
  { value: "b-3", label: 'ЖК "Душанбе Сити"' },
] as const;

const UNITS: Record<string, readonly { value: string; label: string }[]> = {
  "b-1": [
    { value: "u-1", label: "Кв. 12, 2-этаж, 2к, 65 м²" },
    { value: "u-2", label: "Кв. 42, 3-этаж, 3к, 95 м²" },
    { value: "u-3", label: "Кв. 78, 8-этаж, 1к, 42 м²" },
  ],
  "b-2": [
    { value: "u-4", label: "Кв. 15, 7-этаж, 2к, 72 м²" },
    { value: "u-5", label: "Кв. 33, 5-этаж, 3к, 105 м²" },
  ],
  "b-3": [
    { value: "u-6", label: "Кв. 88, 12-этаж, 4к, 140 м²" },
  ],
};

const CLIENTS = [
  { value: "", label: "-- Выберите клиента --" },
  { value: "cl-1", label: "Рахимов Фаррух — +992 93 123 4567" },
  { value: "cl-2", label: "Каримов Бахром — +992 91 987 6543" },
  { value: "cl-3", label: "Назарова Малика — +992 90 555 1234" },
] as const;

const PAYMENT_TYPES = [
  { value: "", label: "-- Тип оплаты --" },
  { value: "full", label: "Полная оплата" },
  { value: "installment", label: "Рассрочка" },
  { value: "mortgage", label: "Ипотека" },
] as const;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DealCreatePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [building, setBuilding] = useState("");
  const [unit, setUnit] = useState("");
  const [client, setClient] = useState("");
  const [paymentType, setPaymentType] = useState("");

  const availableUnits = building ? (UNITS[building] ?? []) : [];

  const selectedBuildingLabel =
    BUILDINGS.find((b) => b.value === building)?.label ?? "—";
  const selectedUnitLabel =
    availableUnits.find((u) => u.value === unit)?.label ?? "—";
  const selectedClientLabel =
    CLIENTS.find((c) => c.value === client)?.label ?? "—";
  const selectedPaymentLabel =
    PAYMENT_TYPES.find((p) => p.value === paymentType)?.label ?? "—";

  const steps: readonly AppStepWizardStep[] = [
    {
      id: "unit",
      label: "Выбор квартиры",
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
                  <option key={u.value} value={u.value}>{u.label}</option>
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
        <div>
          {/* TODO: replace with AppSearchableSelect */}
          <label className="mb-1 block text-sm font-medium text-foreground">Клиент</label>
          <select
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            {CLIENTS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      id: "payment",
      label: "Условия оплаты",
      content: (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Тип оплаты</label>
            <select
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              {PAYMENT_TYPES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Стоимость квартиры</p>
            <p className="text-xl font-bold text-foreground">450 000 USD</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Цена за м² : 4 737 USD
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "confirm",
      label: "Подтверждение",
      content: (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="text-sm font-semibold text-foreground">Итого по сделке</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">ЖК</p>
              <p className="text-sm font-medium text-foreground">{selectedBuildingLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Квартира</p>
              <p className="text-sm font-medium text-foreground">{selectedUnitLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Клиент</p>
              <p className="text-sm font-medium text-foreground">{selectedClientLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Тип оплаты</p>
              <p className="text-sm font-medium text-foreground">{selectedPaymentLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Сумма</p>
              <p className="text-sm font-bold text-foreground">450 000 USD</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleComplete = (): void => {
    // TODO: submit deal creation mutation
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Новая сделка"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "deals", label: "Сделки", href: routes.deals },
          { id: "new", label: "Новая" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <AppStepWizard
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onComplete={handleComplete}
          completeLabel="Создать сделку"
        />
      </div>
    </div>
  );
}
