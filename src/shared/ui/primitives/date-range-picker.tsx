"use client";

import { useMemo, useState, type ElementType, type MouseEvent } from "react";
import { format } from "date-fns";
import { enUS, ru, uz } from "date-fns/locale";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import {
  Box,
  Button,
  Paper,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { resolveIntlLocale } from "@/shared/lib/format/intl-locale";
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

function startOfDay(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function createDate(year: number, month: number, day: number) {
  return new Date(year, month, day, 0, 0, 0, 0);
}

function isSameDay(left: Date | null, right: Date | null) {
  if (!left || !right) {
    return false;
  }

  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function normalizeValue(value: AppDateRangeValue): AppDateRangeValue {
  const start = startOfDay(value.startDate);
  const end = startOfDay(value.endDate);

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

  if (start.getTime() > end.getTime()) {
    return { startDate: end, endDate: start };
  }

  return { startDate: start, endDate: end };
}

function selectRangeDay(current: AppDateRangeValue, nextDay: Date): AppDateRangeValue {
  const selected = startOfDay(nextDay);
  if (!selected) {
    return normalizeValue(current);
  }

  const normalized = normalizeValue(current);

  if (!normalized.startDate || (normalized.startDate && normalized.endDate)) {
    return { startDate: selected, endDate: null };
  }

  if (selected.getTime() < normalized.startDate.getTime()) {
    return { startDate: selected, endDate: normalized.startDate };
  }

  if (selected.getTime() === normalized.startDate.getTime()) {
    return { startDate: selected, endDate: selected };
  }

  return { startDate: normalized.startDate, endDate: selected };
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
    case "last7":
      return { startDate: createDate(now.getFullYear(), now.getMonth(), now.getDate() - 6), endDate: today };
    case "last30":
      return { startDate: createDate(now.getFullYear(), now.getMonth(), now.getDate() - 29), endDate: today };
    case "thisMonth":
      return { startDate: createDate(now.getFullYear(), now.getMonth(), 1), endDate: today };
    case "lastMonth":
      return {
        startDate: createDate(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: createDate(now.getFullYear(), now.getMonth(), 0),
      };
    case "thisYear":
      return { startDate: createDate(now.getFullYear(), 0, 1), endDate: today };
    case "lastYear":
      return {
        startDate: createDate(now.getFullYear() - 1, 0, 1),
        endDate: createDate(now.getFullYear() - 1, 11, 31),
      };
    default:
      return { startDate: null, endDate: null };
  }
}

function resolveDateLocale(locale: string | undefined) {
  const normalized = resolveIntlLocale(locale);
  if (normalized === "ru" || normalized === "tg") {
    return ru;
  }
  if (normalized === "uz") {
    return uz;
  }
  return enUS;
}

function formatDateValue(value: Date | null, locale: string | undefined) {
  if (!value) {
    return "—";
  }

  return format(value, "dd.MM.yyyy", { locale: resolveDateLocale(locale) });
}

function formatTriggerLabel(mode: AppDateRangeMode, value: AppDateRangeValue, allLabel: string, locale: string | undefined) {
  const normalized = normalizeValue(value);

  if (!normalized.startDate && !normalized.endDate) {
    return allLabel;
  }

  if (mode === "single") {
    return formatDateValue(normalized.startDate ?? normalized.endDate, locale);
  }

  if (!normalized.startDate && normalized.endDate) {
    return formatDateValue(normalized.endDate, locale);
  }

  if (!normalized.startDate) {
    return allLabel;
  }

  if (!normalized.endDate || isSameDay(normalized.startDate, normalized.endDate)) {
    return formatDateValue(normalized.startDate, locale);
  }

  return `${formatDateValue(normalized.startDate, locale)} - ${formatDateValue(normalized.endDate, locale)}`;
}

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      sx={{
        borderRadius: 1.25,
        px: 1.25,
        py: 0.7,
        minHeight: 52,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0.25,
      }}
      variant="outlined"
    >
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography variant="subtitle1">{value}</Typography>
    </Paper>
  );
}

interface RangeDayProps extends PickersDayProps {
  startDate?: Date | null;
  endDate?: Date | null;
}

function RangeDay(props: RangeDayProps) {
  const { day, outsideCurrentMonth, startDate, endDate, ...other } = props;
  const current = startOfDay(day);
  const start = startOfDay(startDate ?? null);
  const end = startOfDay(endDate ?? null);

  const isStart = isSameDay(current, start);
  const isEnd = isSameDay(current, end);
  const inRange = Boolean(
    current
      && start
      && end
      && current.getTime() >= start.getTime()
      && current.getTime() <= end.getTime(),
  );

  return (
    <Box
      sx={{
        px: 0.25,
        borderRadius: 0,
        ...(inRange && !outsideCurrentMonth
          ? { bgcolor: "secondary.light" }
          : null),
        ...(isStart && !outsideCurrentMonth
          ? { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 }
          : null),
        ...(isEnd && !outsideCurrentMonth
          ? { borderTopRightRadius: 999, borderBottomRightRadius: 999 }
          : null),
      }}
    >
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        {...other}
        sx={{
          fontSize: 12,
          "&.Mui-selected": {
            bgcolor: "transparent",
            color: "inherit",
          },
          "&.Mui-selected:hover": {
            bgcolor: "transparent",
          },
          ...(isStart || isEnd
            ? {
                bgcolor: "secondary.main !important",
                color: "secondary.contrastText !important",
              }
            : null),
          ...(!isStart && !isEnd && inRange
            ? {
                color: "secondary.main",
              }
            : null),
        }}
      />
    </Box>
  );
}

const calendarSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.25,
  p: 0.35,
  width: 336,
  "& .MuiPickersCalendarHeader-label": { fontWeight: 600 },
  "& .MuiPickersCalendarHeader-root": {
    minHeight: 34,
    margin: 0,
    px: 0.5,
  },
  "& .MuiDayCalendar-header": {
    mt: 0.25,
    mb: 0.25,
  },
  "& .MuiPickersSlideTransition-root": {
    minHeight: 210,
  },
  "& .MuiDayCalendar-weekContainer": {
    my: 0.05,
  },
  "& .MuiPickersDay-root": {
    borderRadius: 1,
    fontSize: 12,
    width: 34,
    height: 34,
    margin: "0 1px",
  },
};

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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<AppDateRangeValue>(() => normalizeValue(value));
  const [activePreset, setActivePreset] = useState<PresetId | null>(null);

  const open = Boolean(anchorEl);
  const triggerLabel = formatTriggerLabel(mode, value, t("datePicker.all"), locale);

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

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setDraft(normalizeValue(value));
    setActivePreset(null);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        className={className}
        disabled={disabled}
        endIcon={(
          <Box sx={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 120ms ease" }}>
            <svg aria-hidden fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M6 9l6 6l6-6" />
            </svg>
          </Box>
        )}
        onClick={handleOpen}
        startIcon={
          <svg aria-hidden fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <rect height="16" rx="2" width="18" x="3" y="5" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        }
        sx={{
          height: 40,
          borderRadius: 1.25,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
          justifyContent: "space-between",
          px: 1.5,
          "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
        }}
        variant="outlined"
      >
        {triggerLabel}
      </Button>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        onClose={handleClose}
        open={open}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
      >
        <Paper sx={{ width: { xs: 352, md: 708 }, p: 1.15 }}>
          <Stack direction={{ xs: "column", md: "row" }} gap={1.25}>
            <Stack spacing={0.5} sx={{ width: { xs: "100%", md: 176 } }}>
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  onClick={() => {
                    const next = normalizeValue(getPresetRange(preset.id, new Date()));
                    setDraft(next);
                    setActivePreset(preset.id);
                  }}
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: 1.25,
                    color: activePreset === preset.id ? "secondary.main" : "text.primary",
                    bgcolor: activePreset === preset.id ? "secondary.light" : "transparent",
                    "&:hover": { bgcolor: activePreset === preset.id ? "secondary.light" : "action.hover" },
                    py: 0.6,
                  }}
                  variant="text"
                >
                  {preset.label}
                </Button>
              ))}
            </Stack>

            <Stack flex={1} gap={0.9}>
              {mode === "single" ? (
                <>
                  <DateField
                    label={t("datePicker.selectDate")}
                    value={formatDateValue(draft.startDate ?? draft.endDate, locale)}
                  />
                  <DateCalendar
                    onChange={(nextDate) => {
                      const normalized = startOfDay(nextDate);
                      setActivePreset(null);
                      setDraft({ startDate: normalized, endDate: normalized });
                    }}
                    sx={calendarSx}
                    value={draft.startDate}
                  />
                </>
              ) : (
                <>
                  <Stack direction={{ xs: "column", md: "row" }} gap={0.75}>
                    <DateField label={t("datePicker.startDate")} value={formatDateValue(draft.startDate, locale)} />
                    <DateField label={t("datePicker.endDate")} value={formatDateValue(draft.endDate, locale)} />
                  </Stack>

                  <DateCalendar
                    onChange={(nextDate) => {
                      if (!nextDate) {
                        return;
                      }
                      setActivePreset(null);
                      setDraft((current) => normalizeValue(selectRangeDay(current, nextDate)));
                    }}
                    slots={{ day: RangeDay as ElementType<PickersDayProps> }}
                    slotProps={{
                      day: {
                        startDate: draft.startDate,
                        endDate: draft.endDate,
                      } as Record<string, unknown>,
                    }}
                    sx={calendarSx}
                    value={draft.endDate ?? draft.startDate}
                  />
                </>
              )}

              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: 0.85,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  {formatTriggerLabel(mode, draft, t("datePicker.all"), locale)}
                </Typography>

                <Stack direction="row" spacing={1}>
                  {onClear ? (
                    <AppButton
                      label={t("datePicker.clear")}
                      onClick={() => {
                        onClear();
                        handleClose();
                      }}
                      variant="secondary"
                    />
                  ) : null}
                  <AppButton
                    label={t("datePicker.apply")}
                    onClick={() => {
                      onApply(normalizeValue(draft));
                      handleClose();
                    }}
                    variant="primary"
                  />
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}
