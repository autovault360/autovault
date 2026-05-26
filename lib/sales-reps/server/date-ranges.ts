import type { SalesRepPeriod } from "../types";

export type DateRange = {
  start: Date;
  end: Date;
  label: string;
};

export function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function yearStart(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function quarterStart(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

export function inRange(iso: string, start: Date, end: Date): boolean {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  return d >= start && d <= end;
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function getPeriodRange(period: SalesRepPeriod, now = new Date()): DateRange {
  switch (period) {
    case "last_month": {
      const start = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const end = monthEnd(start);
      return { start, end, label: "last month" };
    }
    case "this_quarter": {
      const start = quarterStart(now);
      return { start, end: now, label: "last quarter" };
    }
    case "ytd": {
      const start = yearStart(now);
      return { start, end: now, label: "last year" };
    }
    case "this_month":
    default: {
      const start = monthStart(now);
      return { start, end: now, label: "last month" };
    }
  }
}

export function getComparisonRange(
  period: SalesRepPeriod,
  now = new Date(),
): DateRange {
  switch (period) {
    case "last_month": {
      const start = monthStart(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      const end = monthEnd(start);
      return { start, end, label: "prior month" };
    }
    case "this_quarter": {
      const current = quarterStart(now);
      const start = new Date(current.getFullYear(), current.getMonth() - 3, 1);
      const end = new Date(current.getTime() - 1);
      return { start, end, label: "prior quarter" };
    }
    case "ytd": {
      const start = yearStart(new Date(now.getFullYear() - 1, 0, 1));
      const end = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start, end, label: "last year" };
    }
    case "this_month":
    default: {
      const start = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const end = monthEnd(start);
      return { start, end, label: "last month" };
    }
  }
}

export function getTrendMonthKeys(count: number, now = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const target = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
  });
}
