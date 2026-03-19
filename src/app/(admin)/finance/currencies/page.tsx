"use client";

import { useState, useMemo } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppStatusBadge,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
} from "@/shared/ui";
import type { Currency, ExchangeRate } from "@/modules/finance/domain/finance";
import { useCurrenciesQuery } from "@/modules/finance/presentation/hooks/use-currencies-query";
import { useCreateCurrencyMutation } from "@/modules/finance/presentation/hooks/use-create-currency-mutation";
import { useSetPrimaryCurrencyMutation } from "@/modules/finance/presentation/hooks/use-set-primary-currency-mutation";
import { useExchangeRatesQuery } from "@/modules/finance/presentation/hooks/use-exchange-rates-query";
import { useCreateExchangeRateMutation } from "@/modules/finance/presentation/hooks/use-create-exchange-rate-mutation";
import { AppTabs } from "@/shared/ui";

// ─── Currency columns ────────────────────────────────────────────────────────

const CURRENCY_COLUMNS: readonly AppDataTableColumn<Currency>[] = [
  {
    id: "code",
    header: "Код",
    cell: (row) => <span className="font-mono font-semibold">{row.code}</span>,
    sortAccessor: (row) => row.code,
  },
  {
    id: "name",
    header: "Название",
    cell: (row) => row.name,
    searchAccessor: (row) => row.name,
    sortAccessor: (row) => row.name,
  },
  {
    id: "symbol",
    header: "Символ",
    cell: (row) => row.symbol ?? "—",
  },
  {
    id: "isPrimary",
    header: "Основная",
    cell: (row) =>
      row.isPrimary ? <AppStatusBadge label="Основная" tone="success" /> : null,
  },
];

// ─── Exchange rate columns ───────────────────────────────────────────────────

const RATE_COLUMNS: readonly AppDataTableColumn<ExchangeRate>[] = [
  {
    id: "fromCurrency",
    header: "Из",
    cell: (row) => <span className="font-mono">{row.fromCurrency}</span>,
    sortAccessor: (row) => row.fromCurrency,
  },
  {
    id: "toCurrency",
    header: "В",
    cell: (row) => <span className="font-mono">{row.toCurrency}</span>,
    sortAccessor: (row) => row.toCurrency,
  },
  {
    id: "rate",
    header: "Курс",
    cell: (row) => row.rate.toFixed(4),
    sortAccessor: (row) => row.rate,
    align: "right",
  },
  {
    id: "effectiveDate",
    header: "Дата",
    cell: (row) => new Date(row.effectiveDate).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.effectiveDate,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CurrenciesPage() {
  // Currencies state
  const [currDrawerOpen, setCurrDrawerOpen] = useState(false);
  const [currCode, setCurrCode] = useState("");
  const [currName, setCurrName] = useState("");
  const [currSymbol, setCurrSymbol] = useState("");
  const [currIsPrimary, setCurrIsPrimary] = useState(false);
  const [primaryConfirmId, setPrimaryConfirmId] = useState<string | null>(null);

  // Exchange rates state
  const [rateDrawerOpen, setRateDrawerOpen] = useState(false);
  const [rateFrom, setRateFrom] = useState("");
  const [rateTo, setRateTo] = useState("");
  const [rateValue, setRateValue] = useState("");
  const [rateDate, setRateDate] = useState("");

  const currenciesQuery = useCurrenciesQuery();
  const createCurrencyMutation = useCreateCurrencyMutation();
  const setPrimaryMutation = useSetPrimaryCurrencyMutation();
  const ratesQuery = useExchangeRatesQuery();
  const createRateMutation = useCreateExchangeRateMutation();

  const currencies = (currenciesQuery.data ?? []).filter((c) => Boolean(c.id));
  const rates = (ratesQuery.data ?? []).filter((r) => Boolean(r.id));

  // Currency options for rate form
  const currencyOptions = useMemo(
    () => currencies.map((c) => c.code),
    [currencies],
  );

  function resetCurrForm() {
    setCurrCode("");
    setCurrName("");
    setCurrSymbol("");
    setCurrIsPrimary(false);
  }

  function resetRateForm() {
    setRateFrom("");
    setRateTo("");
    setRateValue("");
    setRateDate("");
  }

  const currColumnsWithActions: readonly AppDataTableColumn<Currency>[] = [
    ...CURRENCY_COLUMNS,
    {
      id: "actions",
      header: "",
      cell: (row) =>
        row.isPrimary ? null : (
          <AppActionMenu
            triggerLabel="Действия"
            groups={[
              {
                id: "main",
                items: [
                  {
                    id: "set-primary",
                    label: "Сделать основной",
                    onClick: () => setPrimaryConfirmId(row.id),
                  },
                ],
              },
            ]}
          />
        ),
      align: "right",
    },
  ];

  const currenciesTab = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AppButton
          label="Добавить валюту"
          variant="primary"
          onClick={() => { resetCurrForm(); setCurrDrawerOpen(true); }}
        />
      </div>

      {currenciesQuery.isLoading ? (
        <ShimmerBox className="h-48" />
      ) : currenciesQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить валюты" />
      ) : (
        <AppDataTable<Currency>
          title="Валюты"
          data={currencies}
          columns={currColumnsWithActions}
          rowKey={(row) => row.id}
          enableExport={false}
        />
      )}
    </div>
  );

  const ratesTab = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AppButton
          label="Добавить курс"
          variant="primary"
          onClick={() => { resetRateForm(); setRateDrawerOpen(true); }}
        />
      </div>

      {ratesQuery.isLoading ? (
        <ShimmerBox className="h-48" />
      ) : ratesQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить курсы" />
      ) : (
        <AppDataTable<ExchangeRate>
          title="Курсы обмена"
          data={rates}
          columns={RATE_COLUMNS}
          rowKey={(row) => row.id}
          enableExport={false}
        />
      )}
    </div>
  );

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Валюты и курсы"
        subtitle="Управление валютами и курсами обмена"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "finance", label: "Финансы", href: "/finance" },
          { id: "currencies", label: "Валюты" },
        ]}
      />

      <AppTabs
        tabs={[
          { id: "currencies", title: "Валюты", content: currenciesTab },
          { id: "rates", title: "Курсы обмена", content: ratesTab },
        ]}
      />

      {/* Create currency drawer */}
      <AppDrawerForm
        open={currDrawerOpen}
        onClose={() => setCurrDrawerOpen(false)}
        title="Новая валюта"
        onSave={() => {
          if (!currCode || !currName) return;
          createCurrencyMutation.mutate(
            {
              code: currCode.toUpperCase(),
              name: currName,
              symbol: currSymbol || undefined,
              isPrimary: currIsPrimary,
            },
            { onSuccess: () => { setCurrDrawerOpen(false); resetCurrForm(); } },
          );
        }}
        saveLabel="Создать"
        isSaving={createCurrencyMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="curr-code"
            label="Код валюты"
            value={currCode}
            onChange={(e) => setCurrCode(e.target.value)}
            required
            placeholder="TJS, USD, RUB"
          />
          <AppInput
            id="curr-name"
            label="Название"
            value={currName}
            onChange={(e) => setCurrName(e.target.value)}
            required
            placeholder="Сомони"
          />
          <AppInput
            id="curr-symbol"
            label="Символ"
            value={currSymbol}
            onChange={(e) => setCurrSymbol(e.target.value)}
            placeholder="SM, $, ₽"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={currIsPrimary}
              onChange={(e) => setCurrIsPrimary(e.target.checked)}
            />
            Основная валюта
          </label>
        </div>
      </AppDrawerForm>

      {/* Create exchange rate drawer */}
      <AppDrawerForm
        open={rateDrawerOpen}
        onClose={() => setRateDrawerOpen(false)}
        title="Новый курс"
        onSave={() => {
          if (!rateFrom || !rateTo || !rateValue || !rateDate) return;
          createRateMutation.mutate(
            {
              fromCurrency: rateFrom.toUpperCase(),
              toCurrency: rateTo.toUpperCase(),
              rate: Number(rateValue),
              effectiveDate: rateDate,
            },
            { onSuccess: () => { setRateDrawerOpen(false); resetRateForm(); } },
          );
        }}
        saveLabel="Создать"
        isSaving={createRateMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="rate-from"
            label="Из валюты"
            value={rateFrom}
            onChange={(e) => setRateFrom(e.target.value)}
            required
            placeholder="USD"
          />
          <AppInput
            id="rate-to"
            label="В валюту"
            value={rateTo}
            onChange={(e) => setRateTo(e.target.value)}
            required
            placeholder="TJS"
          />
          <AppInput
            id="rate-value"
            label="Курс"
            type="number"
            value={rateValue}
            onChange={(e) => setRateValue(e.target.value)}
            required
            placeholder="10.85"
          />
          <AppInput
            id="rate-date"
            label="Дата вступления"
            type="date"
            value={rateDate}
            onChange={(e) => setRateDate(e.target.value)}
            required
          />
        </div>
      </AppDrawerForm>

      {/* Set primary confirmation */}
      <ConfirmDialog
        open={primaryConfirmId !== null}
        title="Сделать основной"
        message="Сделать эту валюту основной? Текущая основная валюта будет заменена."
        confirmText="Подтвердить"
        cancelText="Отмена"
        onConfirm={() => {
          if (primaryConfirmId) {
            setPrimaryMutation.mutate(primaryConfirmId, {
              onSuccess: () => setPrimaryConfirmId(null),
            });
          }
        }}
        onClose={() => setPrimaryConfirmId(null)}
      />
    </main>
  );
}
