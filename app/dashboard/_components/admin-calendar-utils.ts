import { addDays } from "@/lib/calendar/format-utils";
import type { CalendarEventType } from "@/lib/calendar/types";

export type AdminCalendarLegendItem = {
  label: string;
  dotClass: string;
  chipClass: string;
};

export const ADMIN_EVENT_LEGEND: AdminCalendarLegendItem[] = [
  {
    label: "Test Drive",
    dotClass: "bg-red-500",
    chipClass: "bg-red-500/15 text-red-300 border-red-500/25",
  },
  {
    label: "Delivery",
    dotClass: "bg-blue-500",
    chipClass: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  },
  {
    label: "Follow Up",
    dotClass: "bg-emerald-500",
    chipClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  },
  {
    label: "Sales Meeting",
    dotClass: "bg-purple-500",
    chipClass: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  },
  {
    label: "DMV",
    dotClass: "bg-orange-500",
    chipClass: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  },
  {
    label: "Payroll",
    dotClass: "bg-teal-500",
    chipClass: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  },
  {
    label: "Other",
    dotClass: "bg-slate-500",
    chipClass: "bg-slate-500/15 text-slate-300 border-slate-500/25",
  },
];

const TYPE_TO_LEGEND: Record<CalendarEventType, number> = {
  appointment: 0,
  compliance: 4,
  follow_up: 2,
  payroll: 5,
  task: 6,
};

export function getEventLegendIndex(type: CalendarEventType): number {
  return TYPE_TO_LEGEND[type] ?? 6;
}

export function getEventDotClass(type: CalendarEventType): string {
  return ADMIN_EVENT_LEGEND[getEventLegendIndex(type)]!.dotClass;
}

export function getEventChipClass(type: CalendarEventType): string {
  return ADMIN_EVENT_LEGEND[getEventLegendIndex(type)]!.chipClass;
}

export function formatRelativeEventDate(date: string, today: string): string {
  if (date === today) return "Today";
  if (date === addDays(today, 1)) return "Tomorrow";
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export type MonthStripDay = {
  date: string;
  day: number;
  weekday: string;
  isWeekend: boolean;
  isToday: boolean;
  eventCount: number;
};

export function buildFullMonthStrip(
  year: number,
  month: number,
  today: string,
  eventCountByDate: Map<string, number>,
): MonthStripDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthId = `${year}-${String(month).padStart(2, "0")}`;
  const days: MonthStripDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthId}-${String(d).padStart(2, "0")}`;
    const weekday = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
    days.push({
      date,
      day: d,
      weekday: weekday.toUpperCase(),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: date === today,
      eventCount: eventCountByDate.get(date) ?? 0,
    });
  }

  return days;
}
