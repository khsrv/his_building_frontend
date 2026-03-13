"use client";

import { useMemo, useState } from "react";

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

function normalizeStart(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function normalizeEnd(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function useDateRangeFilter(initial?: DateRange) {
  const [range, setRangeState] = useState<DateRange>({
    startDate: normalizeStart(initial?.startDate ?? null),
    endDate: normalizeEnd(initial?.endDate ?? null),
  });

  const setRange = (startDate: Date | null, endDate: Date | null) => {
    const normalizedStart = normalizeStart(startDate);
    const normalizedEnd = normalizeEnd(endDate);

    if (!normalizedStart || !normalizedEnd) {
      setRangeState({ startDate: null, endDate: null });
      return;
    }

    if (normalizedEnd.getTime() < normalizedStart.getTime()) {
      setRangeState({
        startDate: normalizeStart(endDate),
        endDate: normalizeEnd(startDate),
      });
      return;
    }

    setRangeState({
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });
  };

  const setAllTime = () => {
    setRangeState({ startDate: null, endDate: null });
  };

  const hasRange = useMemo(() => Boolean(range.startDate && range.endDate), [range]);

  return {
    ...range,
    hasRange,
    isAllTime: !hasRange,
    setRange,
    setAllTime,
  };
}
