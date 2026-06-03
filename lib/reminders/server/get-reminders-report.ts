"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getStateTaxFilingDeadlines } from "@/lib/state-tax/server/get-filing-deadlines";
import { REMINDERS_MOCK_REPORT } from "../mock-data";
import type {
  CalendarEvent,
  Payment,
  RecurringPayment,
  Reminder,
  RemindersReport,
} from "../types";

function daysFromToday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function priorityForDays(days: number): Reminder["priority"] {
  if (days < 0) return "high";
  if (days <= 3) return "high";
  if (days <= 14) return "medium";
  return "low";
}

function iconColorForCategory(category: Reminder["category"]): Reminder["iconColor"] {
  switch (category) {
    case "vehicle":
      return "orange";
    case "deal":
      return "blue";
    case "accounting":
      return "purple";
    case "employee":
      return "green";
    case "business":
      return "cyan";
    default:
      return "amber";
  }
}

function paymentStatusTone(days: number): Payment["statusTone"] {
  if (days < 0) return "red";
  if (days <= 7) return "orange";
  if (days <= 30) return "yellow";
  return "green";
}

function paymentStatusLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function eventColor(type: string): CalendarEvent["color"] {
  if (type === "payroll") return "bg-purple-500/80";
  if (type === "compliance") return "bg-red-500/80";
  if (type === "appointment") return "bg-blue-500/80";
  if (type === "follow_up") return "bg-amber-500/80";
  return "bg-emerald-500/80";
}

export async function getRemindersReport(): Promise<RemindersReport> {
  const auth = await authenticateUser();
  if (!auth.ok) return REMINDERS_MOCK_REPORT;

  const supabase = await createClient();
  const { dealershipId } = auth.user;
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 90);
  const to = horizon.toISOString().slice(0, 10);

  try {
    const [
      recurringResult,
      expiringVehiclesResult,
      pendingCommissionsResult,
      calendarEventsResult,
    ] = await Promise.all([
      supabase
        .from("dealership_expenses")
        .select("id, vendor, category, amount, recurrence_next_due_date, description, recurrence_frequency")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .eq("is_recurring", true)
        .not("recurrence_next_due_date", "is", null)
        .gte("recurrence_next_due_date", today)
        .lte("recurrence_next_due_date", to),
      supabase
        .from("vehicles")
        .select("id, stock_number, make, model, expiration_date")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .not("expiration_date", "is", null)
        .gte("expiration_date", today)
        .lte("expiration_date", to),
      supabase
        .from("deal_jackets")
        .select("id, jacket_number, commission_status, date_sold")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .eq("commission_status", "pending")
        .limit(20),
      supabase
        .from("calendar_events")
        .select("id, event_date, title, event_type")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .gte("event_date", today)
        .lte("event_date", to)
        .order("event_date", { ascending: true }),
    ]);

    const reminders: Reminder[] = [];
    const upcomingPayments: Payment[] = [];
    const recurringPayments: RecurringPayment[] = [];

    for (const exp of recurringResult.data ?? []) {
      const dueDate = exp.recurrence_next_due_date as string;
      const days = daysFromToday(dueDate);
      const category =
        exp.category === "salary_wages"
          ? ("employee" as const)
          : ("business" as const);

      reminders.push({
        id: `exp-${exp.id}`,
        title:
          exp.category === "salary_wages"
            ? `Payroll: ${exp.vendor}`
            : `${exp.vendor} payment due`,
        description: (exp.description as string) ?? "",
        category,
        priority: priorityForDays(days),
        dueDate,
        completed: false,
        iconColor: iconColorForCategory(category),
      });

      upcomingPayments.push({
        id: `pay-${exp.id}`,
        name: (exp.description as string) || String(exp.vendor),
        vendor: String(exp.vendor),
        amount: Number(exp.amount ?? 0),
        dueDate,
        category: String(exp.category),
        statusLabel: paymentStatusLabel(days),
        statusTone: paymentStatusTone(days),
      });

      recurringPayments.push({
        id: `rec-${exp.id}`,
        vendor: String(exp.vendor),
        category: String(exp.category),
        dueDate,
        amount: Number(exp.amount ?? 0),
        frequency: String(exp.recurrence_frequency ?? "monthly"),
      });
    }

    for (const veh of expiringVehiclesResult.data ?? []) {
      const dueDate = veh.expiration_date as string;
      const days = daysFromToday(dueDate);
      reminders.push({
        id: `veh-${veh.id}`,
        title: `Registration/Smog: ${veh.stock_number} ${veh.make} ${veh.model}`,
        description: "Vehicle compliance expiration",
        category: "vehicle",
        priority: priorityForDays(days),
        dueDate,
        completed: false,
        iconColor: "orange",
      });
    }

    for (const jacket of pendingCommissionsResult.data ?? []) {
      const dueDate = (jacket.date_sold as string).slice(0, 10);
      reminders.push({
        id: `jacket-${jacket.id}`,
        title: `Commission pending: ${jacket.jacket_number}`,
        description: "Deal jacket commission not yet paid",
        category: "deal",
        priority: "medium",
        dueDate,
        completed: false,
        iconColor: "blue",
      });
    }

    for (const td of getStateTaxFilingDeadlines(today, to)) {
      const days = daysFromToday(td.date);
      reminders.push({
        id: td.id,
        title: td.title,
        description: td.description ?? "Tax compliance deadline",
        category: "accounting",
        priority: priorityForDays(days),
        dueDate: td.date,
        completed: false,
        iconColor: "purple",
      });
    }

    reminders.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const calendarEvents: CalendarEvent[] = (calendarEventsResult.data ?? []).map(
      (ev, i) => ({
        id: ev.id as string,
        title: ev.title as string,
        start: ev.event_date as string,
        end: ev.event_date as string,
        color: eventColor(ev.event_type as string),
        type: ev.event_type as string,
        dayIndex: i % 7,
        spanDays: 1,
      }),
    );

    const categoryCounts = new Map<Reminder["category"], number>();
    for (const r of reminders) {
      categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1);
    }

    const categoryLabels: Record<Reminder["category"], string> = {
      vehicle: "Vehicle Tasks",
      deal: "Deal & Commission",
      accounting: "Accounting & Tax",
      employee: "Employee & Payroll",
      business: "Business Operations",
      custom: "Custom",
    };

    const categories = [...categoryCounts.entries()].map(([category, count]) => ({
      category,
      label: categoryLabels[category],
      count,
      iconColor: iconColorForCategory(category),
    }));

    return {
      reminders,
      categories,
      upcomingPayments,
      recurringPayments,
      calendarEvents,
      aiSuggestions: REMINDERS_MOCK_REPORT.aiSuggestions,
    };
  } catch (err) {
    console.warn("getRemindersReport fallback to mock:", err);
    return REMINDERS_MOCK_REPORT;
  }
}
