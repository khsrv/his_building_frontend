"use client";

import type { Locale as DateFnsLocale } from "date-fns";
import { enUS, ru, uz } from "date-fns/locale";
import { DayPicker, type DateRange } from "react-day-picker";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { resolveIntlLocale } from "@/shared/lib/format/intl-locale";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";
import { AppButton } from "@/shared/ui/primitives/button";

export interface AppDateRangeValue {
  startDate: Date | null;
  endDate: Date | null;
}

export type AppDateRangeMode = "single" | "range";

type PresetId =
  | "all"
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear";

interface AppDateRangePickerProps {
  value: AppDateRangeValue;
  onApply: (range: AppDateRangeValue) => void;
  onClear?: () => void;
  mode?: AppDateRangeMode;
  locale?: string;
  className?: string;
  disabled?: boolean;
}

function toStartOfDay(value: Date | null): Date | null {
  if (!value) {
    return null;
  }

  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function toEndOfDay(value: Date | null): Date | null {
  if (!value) {
    return null;
  }

  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}

function createDate(year: number, month: number, day: number) {
  return new Date(year, month, day, 0, 0, 0, 0);
}

function isSameDay(left: Date | null, right: Date | null) {
  if (!left || !right) {
    return false;
  }

  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function formatCompactDate(value: Date) {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();

  return `${day}.${month}.${year}`;
}

function normalizeValue(value: AppDateRangeValue): AppDateRangeValue {
  const start = toStartOfDay(value.startDate);
  const end = toStartOfDay(value.endDate);

  if (!start && !end) {
    return { startDate: null, endDate: null };
  }

  if (start && !end) {
    return { startDate: start, endDate: null };
  }

  if (!start && end) {
    return { startDate: end, endDate: null };
  }

  if (!start || !end) {
    return { startDate: null, endDate: null };
  }

  if (end.getTime() < start.getTime()) {
    return { startDate: end, endDate: start };
  }

  return { startDate: start, endDate: end };
}

function getMonthStart(value: Date) {
  return createDate(value.getFullYear(), value.getMonth(), 1);
}

function getPresetRange(id: PresetId, now: Date): AppDateRangeValue {
  const today = createDate(now.getFullYear(), now.getMonth(), now.getDate());

  switch (id) {
    case "all":
      return { startDate: null, endDate: null };
    case "today":
      return { startDate: today, endDate: today };
    case "yesterday": {
      const yesterday = createDate(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return { startDate: yesterday, endDate: yesterday };
    }
    case "last7": {
      const start = createDate(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      return { startDate: start, endDate: today };
    }
    case "last30": {
      const start = createDate(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      return { startDate: start, endDate: today };
    }
    case "thisMonth": {
      const start = createDate(now.getFullYear(), now.getMonth(), 1);
      return { startDate: start, endDate: today };
    }
    case "lastMonth": {
      const start = createDate(now.getFullYear(), now.getMonth() - 1, 1);
      const end = createDate(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start, endDate: end };
    }
    case "thisYear": {
      const start = createDate(now.getFullYear(), 0, 1);
      return { startDate: start, endDate: today };
    }
    case "lastYear": {
      const start = createDate(now.getFullYear() - 1, 0, 1);
      const end = createDate(now.getFullYear() - 1, 11, 31);
      return { startDate: start, endDate: end };
    }
    default:
      return { startDate: null, endDate: null };
  }
}

function formatTriggerValue(mode: AppDateRangeMode, value: AppDateRangeValue, allLabel: string) {
  const normalized = normalizeValue(value);
  const start = normalized.startDate;
  const end = normalized.endDate;

  if (!start && !end) {
    return allLabel;
  }

  if (mode === "single") {
    return formatCompactDate(start ?? end ?? new Date());
  }

  if (!start) {
    return allLabel;
  }

  if (!end || isSameDay(start, end)) {
    return formatCompactDate(start);
  }

  return `${formatCompactDate(start)} - ${formatCompactDate(end)}`;
}

function resolvePickerLocale(locale: string | undefined): DateFnsLocale {
  const normalized = resolveIntlLocale(locale);

  if (normalized === "ru" || normalized === "tg") {
    return ru;
  }

  if (normalized === "uz") {
    return uz;
  }

  return enUS;
}

function toRangeSelection(value: AppDateRangeValue): DateRange | undefined {
  if (!value.startDate && !value.endDate) {
    return undefined;
  }

  return {
    from: value.startDate ?? undefined,
    to: value.endDate ?? undefined,
  };
}

function CalendarIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="16" rx="2" width="18" x="3" y="5" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string | undefined }) {
  return (
    <svg
      aria-hidden
      className={cn("h-5 w-5 transition-transform", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function AppDateRangePicker({
  value,
  onApply,
  onClear,
  mode = "range",
  locale,
  className,
  disabled = false,
}: AppDateRangePickerProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pickerLocale = useMemo(() => resolvePickerLocale(locale), [locale]);

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<AppDateRangeValue>(() => normalizeValue(value));
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => {
    const initialDate = value.startDate ?? value.endDate ?? new Date();
    return getMonthStart(initialDate);
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const targetNode = event.target as Node | null;

      if (!targetNode || !containerRef.current?.contains(targetNode)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const presets = useMemo(() => {
    if (mode === "single") {
      return [
        { id: "today" as const, label: t("datePicker.today") },
        { id: "yesterday" as const, label: t("datePicker.yesterday") },
      ];
    }

    return [
      { id: "all" as const, label: t("datePicker.all") },
      { id: "today" as const, label: t("datePicker.today") },
      { id: "yesterday" as const, label: t("datePicker.yesterday") },
      { id: "last7" as const, label: t("datePicker.last7") },
      { id: "last30" as const, label: t("datePicker.last30") },
      { id: "thisMonth" as const, label: t("datePicker.thisMonth") },
      { id: "lastMonth" as const, label: t("datePicker.lastMonth") },
      { id: "thisYear" as const, label: t("datePicker.thisYear") },
      { id: "lastYear" as const, label: t("datePicker.lastYear") },
    ];
  }, [mode, t]);

  const draftNormalized = normalizeValue(draft);
  const triggerLabel = formatTriggerValue(mode, value, t("datePicker.all"));
  const selectionSummary = formatTriggerValue(mode, draftNormalized, t("datePicker.all"));
  const draftStart = draftNormalized.startDate;
  const draftEnd = mode === "single" ? draftNormalized.startDate : draftNormalized.endDate;

  const setDraftByPreset = (id: PresetId) => {
    const now = new Date();
    const preset = normalizeValue(getPresetRange(id, now));

    if (mode === "single") {
      const single = preset.startDate ?? preset.endDate ?? createDate(now.getFullYear(), now.getMonth(), now.getDate());
      setDraft({ startDate: single, endDate: single });
      setDisplayedMonth(getMonthStart(single));
      return;
    }

    setDraft(preset);
    setDisplayedMonth(getMonthStart(preset.startDate ?? now));
  };

  const isPresetActive = (id: PresetId) => {
    const now = new Date();
    const preset = normalizeValue(getPresetRange(id, now));

    return isSameDay(preset.startDate, draftNormalized.startDate) && isSameDay(preset.endDate, draftNormalized.endDate);
  };

  const handleSingleSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) {
      setDraft({ startDate: null, endDate: null });
      return;
    }

    const day = toStartOfDay(selectedDay);
    setDraft({ startDate: day, endDate: day });
  };

  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange?.from && !selectedRange?.to) {
      setDraft({ startDate: null, endDate: null });
      return;
    }

    const from = toStartOfDay(selectedRange?.from ?? null);
    const to = toStartOfDay(selectedRange?.to ?? null);

    if (!from && !to) {
      setDraft({ startDate: null, endDate: null });
      return;
    }

    if (from && !to) {
      setDraft({ startDate: from, endDate: null });
      return;
    }

    if (!from && to) {
      setDraft({ startDate: to, endDate: null });
      return;
    }

    if (!from || !to) {
      setDraft({ startDate: null, endDate: null });
      return;
    }

    if (to.getTime() < from.getTime()) {
      setDraft({ startDate: to, endDate: from });
      return;
    }

    setDraft({ startDate: from, endDate: to });
  };

  const applyDraft = () => {
    if (mode === "single") {
      const single = toStartOfDay(draftStart);

      onApply({
        startDate: single,
        endDate: single,
      });

      setIsOpen(false);
      return;
    }

    if (!draftStart || !draftEnd) {
      onApply({ startDate: null, endDate: null });
      setIsOpen(false);
      return;
    }

    onApply({
      startDate: toStartOfDay(draftStart),
      endDate: toEndOfDay(draftEnd),
    });
    setIsOpen(false);
  };

  const clearDraft = () => {
    setDraft({ startDate: null, endDate: null });
    if (onClear) {
      onClear();
    } else {
      onApply({ startDate: null, endDate: null });
    }
    setIsOpen(false);
  };

  const handleTriggerClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (disabled) {
      return;
    }

    setDraft(normalizeValue(value));
    setDisplayedMonth(getMonthStart(value.startDate ?? value.endDate ?? new Date()));
    setIsOpen((current) => !current);
  };

  return (
    <div className={cn("relative w-full max-w-[560px]", className)} ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm transition-colors",
          "border-primary/20 bg-primary/15 text-primary hover:bg-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
        disabled={disabled}
        onClick={handleTriggerClick}
        type="button"
      >
        <span className="flex items-center gap-2 text-sm">
          <CalendarIcon />
          <span className="font-medium">{triggerLabel}</span>
        </span>

        <ChevronDownIcon className={isOpen ? "rotate-180" : undefined} />
      </button>

      {isOpen ? (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+10px)] z-50 w-[min(920px,calc(100vw-2rem))] overflow-hidden rounded-2xl",
            "border border-border bg-card shadow-lg",
          )}
          role="dialog"
        >
          <div className="grid max-h-[72vh] grid-cols-1 overflow-auto md:grid-cols-[260px_1fr]">
            <aside className="border-b border-border p-3 md:border-b-0 md:border-r">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {mode === "single" ? t("datePicker.modeSingle") : t("datePicker.modeRange")}
              </p>

              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isPresetActive(preset.id) ? "bg-primary/20 text-primary" : "text-foreground hover:bg-muted",
                    )}
                    key={preset.id}
                    onClick={() => setDraftByPreset(preset.id)}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="p-3 md:p-5">
              {mode === "single" ? (
                <DayPicker
                  ISOWeek
                  className="text-sm"
                  classNames={{
                    month: "space-y-3",
                    caption: "flex items-center justify-between",
                    caption_label: "text-base font-medium capitalize text-primary",
                    nav: "flex items-center gap-1",
                    button_previous: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-primary/10",
                    button_next: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-primary/10",
                    weekdays: "mt-1",
                    weekday: "text-sm text-muted-foreground",
                    day: "h-10 w-10 p-0",
                    day_button: "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors hover:bg-muted",
                    selected: "rounded-full bg-primary text-primary-foreground shadow-sm",
                    outside: "text-muted-foreground/60",
                  }}
                  locale={pickerLocale}
                  mode="single"
                  month={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  onSelect={handleSingleSelect}
                  selected={draftStart ?? undefined}
                  showOutsideDays
                />
              ) : (
                <DayPicker
                  ISOWeek
                  className="text-sm"
                  classNames={{
                    month: "space-y-3",
                    caption: "flex items-center justify-between",
                    caption_label: "text-base font-medium capitalize text-primary",
                    nav: "flex items-center gap-1",
                    button_previous: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-primary/10",
                    button_next: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-primary/10",
                    weekdays: "mt-1",
                    weekday: "text-sm text-muted-foreground",
                    day: "h-10 w-10 p-0",
                    day_button: "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors hover:bg-muted",
                    selected: "rounded-full bg-primary text-primary-foreground shadow-sm",
                    range_start: "rounded-full bg-primary text-primary-foreground shadow-sm",
                    range_end: "rounded-full bg-primary text-primary-foreground shadow-sm",
                    range_middle: "rounded-none bg-primary/15 text-foreground",
                    outside: "text-muted-foreground/60",
                  }}
                  locale={pickerLocale}
                  mode="range"
                  month={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  onSelect={handleRangeSelect}
                  selected={toRangeSelection(draftNormalized)}
                  showOutsideDays
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">{selectionSummary}</p>

            <div className="flex items-center gap-2">
              <AppButton label={t("datePicker.clear")} onClick={clearDraft} variant="secondary" />
              <AppButton label={t("datePicker.apply")} onClick={applyDraft} variant="primary" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
