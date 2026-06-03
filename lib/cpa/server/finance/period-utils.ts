import { monthEnd, monthStart } from "@/lib/sales-reps/server/date-ranges";
import type { CpaViewMode } from "@/lib/cpa/types";

export type CpaPeriodBounds = {
  start: string;
  end: string;
  prevStart: string;
  prevEnd: string;
  prevMonth: number;
  prevYear: number;
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** `month` is 1-12 (calendar month). */
export function resolveCpaPeriodBounds(
  view: CpaViewMode,
  month: number,
  year: number,
): CpaPeriodBounds {
  const m = Math.min(12, Math.max(1, month));
  const ref = new Date(year, m - 1, 1);

  if (view === "yearly") {
    const start = formatDate(new Date(year, 0, 1));
    const end = formatDate(new Date(year, 11, 31));
    const prevStart = formatDate(new Date(year - 1, 0, 1));
    const prevEnd = formatDate(new Date(year - 1, 11, 31));
    return {
      start,
      end,
      prevStart,
      prevEnd,
      prevMonth: 12,
      prevYear: year - 1,
    };
  }

  const startDate = monthStart(ref);
  const endDate = monthEnd(ref);
  const prevRef = new Date(year, m - 2, 1);
  const prevStartDate = monthStart(prevRef);
  const prevEndDate = monthEnd(prevRef);

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
    prevStart: formatDate(prevStartDate),
    prevEnd: formatDate(prevEndDate),
    prevMonth: prevRef.getMonth() + 1,
    prevYear: prevRef.getFullYear(),
  };
}

export function monthRangeForTrend(
  view: CpaViewMode,
  month: number,
  year: number,
  lookback = 12,
): Array<{ month: number; year: number; label: string }> {
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (view === "yearly") {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year,
      label: MONTH_NAMES[i],
    }));
  }

  const points: Array<{ month: number; year: number; label: string }> = [];
  let m = month;
  let y = year;
  for (let i = 0; i < lookback; i++) {
    points.unshift({ month: m, year: y, label: MONTH_NAMES[m - 1] });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return points;
}

export function boundsForCalendarMonth(month: number, year: number): {
  start: string;
  end: string;
} {
  const ref = new Date(year, month - 1, 1);
  return {
    start: formatDate(monthStart(ref)),
    end: formatDate(monthEnd(ref)),
  };
}
