import { monthEnd, monthStart } from "@/lib/sales-reps/server/date-ranges";
import type { PlCompareTo, PlDateRange } from "../types";

export type ResolvedPlPeriod = {
  start: string;
  end: string;
  label: string;
  columnLabel: string;
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatPeriodLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", opts)}`;
  }
  return `${start.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", opts)}`;
}

function offsetMonth(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function resolveCurrentPeriod(
  dateRange: PlDateRange,
  now = new Date(),
): ResolvedPlPeriod {
  let start: Date;
  let end: Date;

  switch (dateRange) {
    case "last_month": {
      const ref = offsetMonth(now, -1);
      start = monthStart(ref);
      end = monthEnd(ref);
      break;
    }
    case "prior_month": {
      const ref = offsetMonth(now, -2);
      start = monthStart(ref);
      end = monthEnd(ref);
      break;
    }
    case "this_month":
    default: {
      start = monthStart(now);
      end = now;
      break;
    }
  }

  const label = formatPeriodLabel(start, end);
  return {
    start: formatDate(start),
    end: formatDate(end),
    label,
    columnLabel: label,
  };
}

export function resolveComparisonPeriod(
  current: ResolvedPlPeriod,
  compareTo: PlCompareTo,
  dateRange: PlDateRange,
  now = new Date(),
): ResolvedPlPeriod {
  if (compareTo === "none") {
    return {
      start: current.start,
      end: current.end,
      label: "No comparison",
      columnLabel: "Prior Period",
    };
  }

  const currentStart = new Date(`${current.start}T12:00:00`);
  const currentEnd = new Date(`${current.end}T12:00:00`);

  if (compareTo === "last_year") {
    const start = new Date(currentStart);
    start.setFullYear(start.getFullYear() - 1);
    const end = new Date(currentEnd);
    end.setFullYear(end.getFullYear() - 1);
    const label = formatPeriodLabel(start, end);
    return {
      start: formatDate(start),
      end: formatDate(end),
      label: `vs ${label}`,
      columnLabel: label,
    };
  }

  // last_month: period immediately before current selection
  let start: Date;
  let end: Date;

  if (dateRange === "this_month") {
    const ref = offsetMonth(now, -1);
    start = monthStart(ref);
    end = monthEnd(ref);
  } else if (dateRange === "last_month") {
    const ref = offsetMonth(now, -2);
    start = monthStart(ref);
    end = monthEnd(ref);
  } else {
    const ref = offsetMonth(now, -3);
    start = monthStart(ref);
    end = monthEnd(ref);
  }

  const label = formatPeriodLabel(start, end);
  return {
    start: formatDate(start),
    end: formatDate(end),
    label: `vs ${label}`,
    columnLabel: label,
  };
}

export function buildDateRangeOptions(now = new Date()) {
  const thisMonth = resolveCurrentPeriod("this_month", now);
  const lastMonth = resolveCurrentPeriod("last_month", now);
  const priorMonth = resolveCurrentPeriod("prior_month", now);

  return [
    { value: "this_month" as const, label: thisMonth.label },
    { value: "last_month" as const, label: lastMonth.label },
    { value: "prior_month" as const, label: priorMonth.label },
  ];
}
