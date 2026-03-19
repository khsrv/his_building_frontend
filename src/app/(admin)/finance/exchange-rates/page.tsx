"use client";

import { useEffect, useState } from "react";
import { AppPageHeader } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { NbtRatesResponse, NbtRate } from "@/app/api/exchange-rates/route";

// ─── Currency metadata ──────────────────────────────────────────────────────

interface CurrencyMeta {
  symbol: string;
  flag: string;
  color: string;
  bg: string;
  nameRu: string;
}

const CURRENCY_META: Record<string, CurrencyMeta> = {
  USD: { symbol: "$", flag: "🇺🇸", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", nameRu: "Доллар США" },
  EUR: { symbol: "€", flag: "🇪🇺", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", nameRu: "Евро" },
  RUB: { symbol: "₽", flag: "🇷🇺", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", nameRu: "Российский рубль" },
  CNY: { symbol: "¥", flag: "🇨🇳", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", nameRu: "Китайский юань" },
  GBP: { symbol: "£", flag: "🇬🇧", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40", nameRu: "Фунт стерлингов" },
  CHF: { symbol: "Fr", flag: "🇨🇭", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", nameRu: "Швейцарский франк" },
  UZS: { symbol: "сўм", flag: "🇺🇿", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40", nameRu: "Узбекский сум" },
  KGS: { symbol: "сом", flag: "🇰🇬", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", nameRu: "Кыргызский сом" },
  KZT: { symbol: "₸", flag: "🇰🇿", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/40", nameRu: "Казахский тенге" },
  BYN: { symbol: "Br", flag: "🇧🇾", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", nameRu: "Белорусский рубль" },
  TRY: { symbol: "₺", flag: "🇹🇷", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", nameRu: "Турецкая лира" },
  AED: { symbol: "د.إ", flag: "🇦🇪", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", nameRu: "Дирхам ОАЭ" },
};

const DEFAULT_META: CurrencyMeta = {
  symbol: "¤", flag: "🏳️", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/40", nameRu: "",
};

// ─── Priority currencies shown as big cards ─────────────────────────────────

const PRIORITY_CODES = ["USD", "EUR", "RUB"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ExchangeRatesPage() {
  const [data, setData] = useState<NbtRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка загрузки курсов");
        return res.json() as Promise<NbtRatesResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const priorityRates = data?.rates.filter((r) => PRIORITY_CODES.includes(r.code)) ?? [];
  const otherRates = data?.rates.filter((r) => !PRIORITY_CODES.includes(r.code)) ?? [];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Курсы валют"
        subtitle={data ? `Нацбанк Таджикистана · ${formatDate(data.date)}` : "Нацбанк Таджикистана"}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "exchange-rates", label: "Курсы валют" },
        ]}
      />

      {loading && (
        <div className="space-y-6">
          {/* Big cards skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                      <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted ml-auto" />
                  </div>
                </div>
                <div className="mt-3 h-7 w-44 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>

          {/* Other currencies skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-10 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
          {error}. Показаны последние доступные данные.
        </div>
      )}

      {data && (
        <>
          {/* ─── Big cards: USD, EUR, RUB ─── */}
          <div className="grid gap-4 md:grid-cols-3">
            {priorityRates.map((rate) => (
              <BigRateCard key={rate.code} rate={rate} />
            ))}
          </div>

          {/* ─── Other currencies ─── */}
          {otherRates.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Другие валюты
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {otherRates.map((rate) => (
                  <CompactRateCard key={rate.code} rate={rate} />
                ))}
              </div>
            </div>
          )}

          {/* ─── Source note ─── */}
          <p className="text-xs text-muted-foreground">
            Источник: Национальный банк Таджикистана (nbt.tj). Курсы обновляются ежедневно.
          </p>
        </>
      )}
    </main>
  );
}

// ─── Big card for priority currencies ───────────────────────────────────────

function BigRateCard({ rate }: { rate: NbtRate }) {
  const meta = CURRENCY_META[rate.code] ?? DEFAULT_META;
  const perUnit = rate.unit > 1 ? ` за ${rate.unit}` : "";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border ${meta.bg} p-5 transition-shadow hover:shadow-lg`}>
      {/* Flag background */}
      <span className="pointer-events-none absolute -right-2 -top-2 text-6xl opacity-15 select-none">
        {meta.flag}
      </span>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.flag}</span>
            <span className="text-lg font-bold">{rate.code}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {meta.nameRu || rate.name}{perUnit}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-3xl font-extrabold tabular-nums ${meta.color}`}>
            {rate.rate.toFixed(4)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">TJS</p>
        </div>
      </div>

      {/* Symbol badge */}
      <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${meta.color} bg-white/60 dark:bg-black/20`}>
        <span className="text-base">{meta.symbol}</span>
        <span>1{perUnit} = {rate.rate.toFixed(4)} TJS</span>
      </div>
    </div>
  );
}

// ─── Compact card for other currencies ──────────────────────────────────────

function CompactRateCard({ rate }: { rate: NbtRate }) {
  const meta = CURRENCY_META[rate.code] ?? DEFAULT_META;
  const perUnit = rate.unit > 1 ? `${rate.unit} ` : "";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md">
      <span className="text-2xl">{meta.flag}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{rate.code}</p>
        <p className="truncate text-xs text-muted-foreground">
          {perUnit}{meta.nameRu || rate.name}
        </p>
      </div>
      <p className={`text-base font-bold tabular-nums ${meta.color}`}>
        {rate.rate.toFixed(4)}
      </p>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
