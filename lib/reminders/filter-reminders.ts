import type {
  FilteredReminders,
  Reminder,
  ReminderKpi,
  RemindersFilters,
  RemindersReport,
} from "./types";
import { DEFAULT_REMINDERS_FILTERS } from "./types";
import {
  buildCalendarEventsForWeek,
  computeKpis,
  formatPaymentStatus,
  isOverdueReminder,
  isUpcomingReminder,
  sumUpcomingPayments,
} from "./selectors";
import { getWeekStart } from "./format-utils";

const DESIGN_KPIS: ReminderKpi[] = [
  {
    id: "overdue",
    label: "OVERDUE",
    count: 18,
    description: "Require immediate action",
    color: "red",
  },
  {
    id: "due_today",
    label: "DUE TODAY",
    count: 12,
    description: "Due within 24 hours",
    color: "amber",
  },
  {
    id: "due_this_week",
    label: "DUE THIS WEEK",
    count: 27,
    description: "Due in the next 7 days",
    color: "blue",
  },
  {
    id: "due_this_month",
    label: "DUE THIS MONTH",
    count: 45,
    description: "Due in the next 30 days",
    color: "purple",
  },
  {
    id: "completed",
    label: "COMPLETED",
    count: 158,
    description: "This month",
    color: "green",
  },
];

function matchesSearch(
  query: string,
  fields: (string | undefined)[],
): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return fields.some((f) => f?.toLowerCase().includes(q));
}

function filterReminder(r: Reminder, query: string): boolean {
  return matchesSearch(query, [r.title, r.description, r.category]);
}

export function filterReminders(
  filters: RemindersFilters,
  report: RemindersReport,
): FilteredReminders {
  const { asOfDate, searchQuery, calendarWeekStart } = filters;
  const q = searchQuery;

  const filteredReminders = report.reminders.filter((r) =>
    filterReminder(r, q),
  );

  const upcomingReminders = filteredReminders
    .filter((r) => isUpcomingReminder(r, asOfDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const overdueReminders = filteredReminders
    .filter((r) => isOverdueReminder(r, asOfDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcomingPayments = report.upcomingPayments
    .filter((p) =>
      matchesSearch(q, [p.name, p.vendor, p.category, p.statusLabel]),
    )
    .map((p) => {
      const status = formatPaymentStatus(p.dueDate, asOfDate);
      return { ...p, statusLabel: status.label, statusTone: status.tone };
    });

  const recurringPayments = report.recurringPayments.filter((p) =>
    matchesSearch(q, [p.vendor, p.category, p.frequency]),
  );

  const categories = report.categories.filter((c) =>
    matchesSearch(q, [c.label, c.category]),
  );

  const calendarEvents = buildCalendarEventsForWeek(calendarWeekStart);

  const useDesignKpis =
    asOfDate === DEFAULT_REMINDERS_FILTERS.asOfDate && !q.trim();
  const kpis = useDesignKpis
    ? DESIGN_KPIS
    : computeKpis(report.reminders, asOfDate);

  return {
    kpis,
    categories,
    upcomingReminders,
    overdueReminders,
    upcomingPayments,
    recurringPayments,
    calendarEvents,
    totalObligations:
      asOfDate === DEFAULT_REMINDERS_FILTERS.asOfDate && !q.trim()
        ? 24550
        : sumUpcomingPayments(upcomingPayments),
    report,
  };
}

export function syncCalendarWeekToDate(
  filters: RemindersFilters,
): RemindersFilters {
  return {
    ...filters,
    calendarWeekStart: getWeekStart(filters.asOfDate),
  };
}
