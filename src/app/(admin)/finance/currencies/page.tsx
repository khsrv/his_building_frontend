"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppStatusBadge,
  AppActionMenu,
  AppTabs,
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
import { useNotifier } from "@/shared/providers/notifier-provider";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import type { NbtRatesResponse, NbtRate } from "@/app/api/exchange-rates/route";

// ─── Currency metadata for NBT display ───────────────────────────────────────

const CURRENCY_META: Record<string, { flag: string; nameRu: string; color: string }> = {
  USD: { flag: "🇺🇸", nameRu: "Доллар США", color: "text-emerald-600" },
  EUR: { flag: "🇪🇺", nameRu: "Евро", color: "text-blue-600" },
  RUB: { flag: "🇷🇺", nameRu: "Российский рубль", color: "text-red-600" },
  CNY: { flag: "🇨🇳", nameRu: "Китайский юань", color: "text-amber-600" },
  GBP: { flag: "🇬🇧", nameRu: "Фунт стерлингов", color: "text-purple-600" },
  UZS: { flag: "🇺🇿", nameRu: "Узбекский сум", color: "text-cyan-600" },
  KZT: { flag: "🇰🇿", nameRu: "Казахский тенге", color: "text-sky-600" },
  KGS: { flag: "🇰🇬", nameRu: "Кыргызский сом", color: "text-orange-600" },
  TRY: { flag: "🇹🇷", nameRu: "Турецкая лира", color: "text-red-600" },
  AED: { flag: "🇦🇪", nameRu: "Дирхам ОАЭ", color: "text-emerald-600" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CurrenciesPage() {
  const notifier = useNotifier();

  // Currencies state
  const [currDrawerOpen, setCurrDrawerOpen] = useState(false);
  const [currCode, setCurrCode] = useState("");
  const [currName, setCurrName] = useState("");
  const [currSymbol, setCurrSymbol] = useState("");
  const [currIsPrimary, setCurrIsPrimary] = useState(false);
  const [primaryConfirmId, setPrimaryConfirmId] = useState<string | null>(null);

  const currenciesQuery = useCurrenciesQuery();
  const createCurrencyMutation = useCreateCurrencyMutation();
  const setPrimaryMutation = useSetPrimaryCurrencyMutation();
  const ratesQuery = useExchangeRatesQuery();
  const createRateMutation = useCreateExchangeRateMutation();

  const currencies = (currenciesQuery.data ?? []).filter((c) => Boolean(c.id));
  const rates = (ratesQuery.data ?? []).filter((r) => Boolean(r.id));
  const primaryCurrency = currencies.find((c) => c.isPrimary);
  const otherCurrencies = currencies.filter((c) => !c.isPrimary);

  // NBT rates
  const [nbtData, setNbtData] = useState<NbtRatesResponse | null>(null);
  const [nbtLoading, setNbtLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка");
        return res.json() as Promise<NbtRatesResponse>;
      })
      .then(setNbtData)
      .catch(() => {})
      .finally(() => setNbtLoading(false));
  }, []);

  // Get latest rate for each currency pair relative to primary
  const latestRates = useMemo(() => {
    if (!primaryCurrency) return new Map<string, ExchangeRate>();
    const map = new Map<string, ExchangeRate>();
    for (const rate of rates) {
      if (rate.fromCurrency === primaryCurrency.code || rate.toCurrency === primaryCurrency.code) {
        const otherCode = rate.fromCurrency === primaryCurrency.code ? rate.toCurrency : rate.fromCurrency;
        const existing = map.get(otherCode);
        if (!existing || rate.effectiveDate > existing.effectiveDate) {
          map.set(otherCode, rate);
        }
      }
    }
    return map;
  }, [primaryCurrency, rates]);

  function resetCurrForm() {
    setCurrCode("");
    setCurrName("");
    setCurrSymbol("");
    setCurrIsPrimary(false);
  }

  // ─── Quick rate update ────────────────────────────────────────────
  async function handleQuickRateUpdate(fromCurrency: string, toCurrency: string, newRate: number) {
    try {
      const today = new Date().toISOString().split("T")[0]!;
      await createRateMutation.mutateAsync({
        fromCurrency,
        toCurrency,
        rate: newRate,
        effectiveDate: today,
      });
      notifier.success(`Курс ${fromCurrency}/${toCurrency} обновлён`);
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    }
  }

  // ─── Rates tab (default) ──────────────────────────────────────────

  const ratesTab = (
    <div className="space-y-6">
      {/* Quick rate cards */}
      {primaryCurrency && otherCurrencies.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Курсы относительно {primaryCurrency.code}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherCurrencies.map((curr) => (
              <QuickRateCard
                key={curr.id}
                primaryCode={primaryCurrency.code}
                currency={curr}
                currentRate={latestRates.get(curr.code)}
                onSave={(rate) => void handleQuickRateUpdate(primaryCurrency.code, curr.code, rate)}
                isSaving={createRateMutation.isPending}
              />
            ))}
          </div>
        </div>
      ) : primaryCurrency && otherCurrencies.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Нет дополнительных валют"
          description="Добавьте валюты во вкладке «Валюты» чтобы настроить курсы"
        />
      ) : (
        <AppStatePanel
          tone="empty"
          title="Основная валюта не установлена"
          description="Установите основную валюту во вкладке «Валюты»"
        />
      )}

      {/* Full rates history */}
      {rates.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            История курсов
          </h3>
          <AppDataTable<ExchangeRate>
            title=""
            data={rates}
            columns={RATE_COLUMNS}
            rowKey={(row) => row.id}
            enableExport={false}
            enableSettings={false}
          />
        </div>
      ) : null}
    </div>
  );

  // ─── Currencies tab ───────────────────────────────────────────────

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

  // ─── NBT tab ──────────────────────────────────────────────────────

  const nbtTab = (
    <div className="space-y-4">
      {nbtLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShimmerBox key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : nbtData ? (
        <>
          <p className="text-sm text-muted-foreground">
            Нацбанк Таджикистана · {nbtData.date ? new Date(nbtData.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nbtData.rates.map((rate) => {
              const meta = CURRENCY_META[rate.code];
              return (
                <div key={rate.code} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <span className="text-2xl">{meta?.flag ?? "🏳️"}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{rate.code}</p>
                    <p className="text-xs text-muted-foreground">{meta?.nameRu ?? rate.name}</p>
                  </div>
                  <p className={`text-lg font-bold tabular-nums ${meta?.color ?? "text-foreground"}`}>
                    {rate.rate.toFixed(4)}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Источник: nbt.tj. Курсы обновляются ежедневно.
          </p>
        </>
      ) : (
        <AppStatePanel tone="empty" title="Не удалось загрузить" description="Попробуйте обновить страницу" />
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
          { id: "currencies", label: "Валюты и курсы" },
        ]}
      />

      <AppTabs
        initialTabId="rates"
        tabs={[
          { id: "rates", title: "Курсы обмена", content: ratesTab },
          { id: "currencies", title: "Валюты", content: currenciesTab },
          { id: "nbt", title: "Курсы НБТ", content: nbtTab },
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
          <AppInput label="Код валюты" value={currCode} onChange={(e) => setCurrCode(e.target.value)} required placeholder="TJS, USD, RUB" />
          <AppInput label="Название" value={currName} onChange={(e) => setCurrName(e.target.value)} required placeholder="Сомони" />
          <AppInput label="Символ" value={currSymbol} onChange={(e) => setCurrSymbol(e.target.value)} placeholder="SM, $, ₽" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={currIsPrimary} onChange={(e) => setCurrIsPrimary(e.target.checked)} />
            Основная валюта
          </label>
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

// ─── Quick Rate Card ─────────────────────────────────────────────────────────

function QuickRateCard({
  primaryCode,
  currency,
  currentRate,
  onSave,
  isSaving,
}: {
  primaryCode: string;
  currency: Currency;
  currentRate: ExchangeRate | undefined;
  onSave: (rate: number) => void;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const displayRate = currentRate?.rate ?? 0;
  const lastDate = currentRate ? new Date(currentRate.effectiveDate).toLocaleDateString("ru-RU") : null;

  function handleStartEdit() {
    setEditValue(displayRate > 0 ? String(displayRate) : "");
    setEditing(true);
  }

  function handleSave() {
    const num = parseFloat(editValue);
    if (!num || num <= 0) return;
    onSave(num);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">{primaryCode}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-bold">{currency.code}</span>
          {currency.symbol ? <span className="text-xs text-muted-foreground">({currency.symbol})</span> : null}
        </div>
        {lastDate ? (
          <span className="text-xs text-muted-foreground">{lastDate}</span>
        ) : null}
      </div>

      <div className="mt-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.0001"
              className="h-10 flex-1 rounded-lg border border-primary bg-background px-3 text-lg font-bold tabular-nums outline-none focus:ring-2 focus:ring-primary/30"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <AppButton label="OK" variant="primary" size="sm" onClick={handleSave} disabled={isSaving} />
            <AppButton label="✕" variant="outline" size="sm" onClick={() => setEditing(false)} />
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted/40"
            onClick={handleStartEdit}
          >
            <span className="text-2xl font-bold tabular-nums">
              {displayRate > 0 ? displayRate.toFixed(4) : "—"}
            </span>
            <span className="text-xs text-muted-foreground">нажмите для изменения</span>
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        1 {primaryCode} = {displayRate > 0 ? displayRate.toFixed(4) : "?"} {currency.code}
      </p>
    </div>
  );
}

// ─── Table columns ───────────────────────────────────────────────────────────

const CURRENCY_COLUMNS: readonly AppDataTableColumn<Currency>[] = [
  { id: "code", header: "Код", cell: (row) => <span className="font-mono font-semibold">{row.code}</span>, sortAccessor: (row) => row.code },
  { id: "name", header: "Название", cell: (row) => row.name, searchAccessor: (row) => row.name, sortAccessor: (row) => row.name },
  { id: "symbol", header: "Символ", cell: (row) => row.symbol ?? "—" },
  { id: "isPrimary", header: "Основная", cell: (row) => row.isPrimary ? <AppStatusBadge label="Основная" tone="success" /> : null },
];

const RATE_COLUMNS: readonly AppDataTableColumn<ExchangeRate>[] = [
  { id: "fromCurrency", header: "Из", cell: (row) => <span className="font-mono">{row.fromCurrency}</span>, sortAccessor: (row) => row.fromCurrency },
  { id: "toCurrency", header: "В", cell: (row) => <span className="font-mono">{row.toCurrency}</span>, sortAccessor: (row) => row.toCurrency },
  { id: "rate", header: "Курс", cell: (row) => <span className="font-bold tabular-nums">{row.rate.toFixed(4)}</span>, sortAccessor: (row) => row.rate, align: "right" },
  { id: "effectiveDate", header: "Дата", cell: (row) => new Date(row.effectiveDate).toLocaleDateString("ru-RU"), sortAccessor: (row) => row.effectiveDate },
];
