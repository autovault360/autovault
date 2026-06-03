import type {
  CalendarEvent,
  Payment,
  Reminder,
  ReminderKpi,
  ReminderStatus,
} from "./types";
import { addDays, daysBetween, getWeekStart, parseLocalDate } from "./format-utils";
import { REMINDERS_MOCK_REPORT } from "./mock-data";

const DEFAULT_WEEK = "2025-05-20";

export function getReminderStatus(
  reminder: Reminder,
  asOfDate: string,
): ReminderStatus {
  if (reminder.completed) return "completed";

  const diff = daysBetween(asOfDate, reminder.dueDate);

  if (diff < 0) return "overdue";
  if (diff === 0) return "due_today";
  if (diff <= 7) return "due_this_week";
  if (diff <= 30) return "due_this_month";
  return "upcoming";
}

export function computeKpis(reminders: Reminder[], asOfDate: string): ReminderKpi[] {
  let overdue = 0;
  let dueToday = 0;
  let dueThisWeek = 0;
  let dueThisMonth = 0;
  let completed = 0;

  for (const r of reminders) {
    const status = getReminderStatus(r, asOfDate);
    if (status === "overdue") overdue++;
    else if (status === "due_today") dueToday++;
    else if (status === "due_this_week") dueThisWeek++;
    else if (status === "due_this_month") dueThisMonth++;
    else if (status === "completed") completed++;
  }

  return [
    {
      id: "overdue",
      label: "OVERDUE",
      count: overdue,
      description: "Require immediate action",
      color: "red",
    },
    {
      id: "due_today",
      label: "DUE TODAY",
      count: dueToday,
      description: "Due within 24 hours",
      color: "amber",
    },
    {
      id: "due_this_week",
      label: "DUE THIS WEEK",
      count: dueThisWeek,
      description: "Due in the next 7 days",
      color: "blue",
    },
    {
      id: "due_this_month",
      label: "DUE THIS MONTH",
      count: dueThisMonth,
      description: "Due in the next 30 days",
      color: "purple",
    },
    {
      id: "completed",
      label: "COMPLETED",
      count: completed,
      description: "This month",
      color: "green",
    },
  ];
}

export function formatDueStatus(dueDate: string, asOfDate: string): string {
  const diff = daysBetween(asOfDate, dueDate);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due Today";
  if (diff === 1) return "Due Tomorrow";
  return `Due in ${diff} days`;
}

export function formatPaymentStatus(
  dueDate: string,
  asOfDate: string,
): { label: string; tone: Payment["statusTone"] } {
  const diff = daysBetween(asOfDate, dueDate);
  if (diff < 0) return { label: "Overdue", tone: "red" };
  if (diff === 0) return { label: "Due Today", tone: "yellow" };
  if (diff === 1) return { label: "Due Tomorrow", tone: "yellow" };
  if (diff <= 7) return { label: `Due in ${diff} days`, tone: "orange" };
  return { label: `Due in ${diff} days`, tone: "green" };
}

export function sumUpcomingPayments(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function getEventsForWeek(
  events: CalendarEvent[],
  weekStart: string,
): CalendarEvent[] {
  const weekEnd = addDays(weekStart, 6);
  return events.filter((ev) => {
    const start = ev.start;
    const end = ev.end;
    return start <= weekEnd && end >= weekStart;
  });
}

export function getWeekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function buildCalendarEventsForWeek(weekStart: string): CalendarEvent[] {
  if (weekStart === DEFAULT_WEEK) {
    return REMINDERS_MOCK_REPORT.calendarEvents;
  }

  const templates = [
    { title: "Payroll Due", color: "bg-blue-500/80" as const, dayOffset: 2, type: "payment" },
    { title: "Insurance Renewal", color: "bg-purple-500/80" as const, dayOffset: 4, spanDays: 2, type: "business" },
    { title: "Tax Filing", color: "bg-red-500/80" as const, dayOffset: 0, type: "compliance" },
    { title: "Commission Payout", color: "bg-amber-500/80" as const, dayOffset: 5, type: "payment" },
  ];

  return templates.map((t, i) => {
    const start = addDays(weekStart, t.dayOffset);
    const end = addDays(weekStart, t.dayOffset + (t.spanDays ?? 1) - 1);
    return {
      id: `gen-${weekStart}-${i}`,
      title: t.title,
      start,
      end,
      color: t.color,
      type: t.type,
      dayIndex: t.dayOffset,
      spanDays: t.spanDays ?? 1,
    };
  });
}

export function getCalendarWeekStart(asOfDate: string): string {
  return getWeekStart(asOfDate);
}

export function isUpcomingReminder(reminder: Reminder, asOfDate: string): boolean {
  const status = getReminderStatus(reminder, asOfDate);
  return (
    status === "due_today" ||
    status === "due_this_week" ||
    status === "due_this_month" ||
    status === "upcoming"
  );
}

export function isOverdueReminder(reminder: Reminder, asOfDate: string): boolean {
  return getReminderStatus(reminder, asOfDate) === "overdue";
}

export function getDueTodayReminders(
  reminders: Reminder[],
  asOfDate: string,
): Reminder[] {
  return reminders.filter(
    (r) => !r.completed && getReminderStatus(r, asOfDate) === "due_today",
  );
}

export function getOverdueReminders(
  reminders: Reminder[],
  asOfDate: string,
): Reminder[] {
  return reminders.filter(
    (r) => !r.completed && getReminderStatus(r, asOfDate) === "overdue",
  );
}

export function getWeekPaymentsDue(
  payments: Payment[],
  asOfDate: string,
): Payment[] {
  const weekEnd = addDays(asOfDate, 7);
  return payments.filter((p) => {
    const d = parseLocalDate(p.dueDate);
    const a = parseLocalDate(asOfDate);
    const e = parseLocalDate(weekEnd);
    return d >= a && d <= e;
  });
}
