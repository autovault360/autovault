import { createClient } from "@/lib/supabase/server";
import type { CalendarEventType, UpcomingComplianceEvent } from "../types";
import { getStateTaxFilingDeadlines } from "@/lib/state-tax/server/get-filing-deadlines";

export type CalendarEventRow = {
  id: string;
  event_date: string;
  event_time: string | null;
  title: string;
  event_type: CalendarEventType;
  description: string | null;
};

function formatEventTime(time: string | null): string {
  if (!time) return "All day";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function classifyStatus(dateStr: string): UpcomingComplianceEvent["status"] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "urgent";
  if (diffDays <= 7) return "urgent";
  if (diffDays <= 30) return "upcoming";
  return "scheduled";
}

export async function fetchCalendarEventsFromDb(
  dealershipId: string,
  from: string,
  to: string,
): Promise<CalendarEventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, event_date, event_time, title, event_type, description")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("event_date", from)
    .lte("event_date", to)
    .order("event_date", { ascending: true });

  if (error) {
    console.warn("fetchCalendarEventsFromDb:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    event_date: row.event_date as string,
    event_time: row.event_time as string | null,
    title: row.title as string,
    event_type: row.event_type as CalendarEventType,
    description: (row.description as string) ?? null,
  }));
}

export async function fetchDerivedCalendarEvents(
  dealershipId: string,
  from: string,
  to: string,
): Promise<CalendarEventRow[]> {
  const supabase = await createClient();
  const events: CalendarEventRow[] = [];

  const [communications, recurringExpenses, expiringVehicles] = await Promise.all([
    supabase
      .from("customer_communications")
      .select("id, occurred_at, type, subject")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .gte("occurred_at", `${from}T00:00:00`)
      .lte("occurred_at", `${to}T23:59:59`),
    supabase
      .from("dealership_expenses")
      .select("id, recurrence_next_due_date, vendor, category, description")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .eq("is_recurring", true)
      .not("recurrence_next_due_date", "is", null)
      .gte("recurrence_next_due_date", from)
      .lte("recurrence_next_due_date", to),
    supabase
      .from("vehicles")
      .select("id, expiration_date, stock_number, make, model")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .not("expiration_date", "is", null)
      .gte("expiration_date", from)
      .lte("expiration_date", to),
  ]);

  for (const comm of communications.data ?? []) {
    const date = (comm.occurred_at as string).slice(0, 10);
    const type = comm.type as string;
    events.push({
      id: `comm-${comm.id}`,
      event_date: date,
      event_time: (comm.occurred_at as string).slice(11, 16) || null,
      title: (comm.subject as string) || `${type} appointment`,
      event_type: type === "meeting" ? "appointment" : "follow_up",
      description: null,
    });
  }

  for (const exp of recurringExpenses.data ?? []) {
    events.push({
      id: `exp-${exp.id}`,
      event_date: exp.recurrence_next_due_date as string,
      event_time: null,
      title:
        exp.category === "salary_wages"
          ? `Payroll: ${exp.vendor}`
          : `${exp.vendor} - ${exp.description}`,
      event_type: exp.category === "salary_wages" ? "payroll" : "compliance",
      description: null,
    });
  }

  for (const veh of expiringVehicles.data ?? []) {
    events.push({
      id: `veh-${veh.id}`,
      event_date: veh.expiration_date as string,
      event_time: null,
      title: `Registration/Smog Due: ${veh.stock_number} ${veh.make} ${veh.model}`,
      event_type: "compliance",
      description: null,
    });
  }

  const taxDeadlines = getStateTaxFilingDeadlines(from, to);
  for (const td of taxDeadlines) {
    events.push({
      id: td.id,
      event_date: td.date,
      event_time: null,
      title: td.title,
      event_type: "compliance",
      description: td.description ?? null,
    });
  }

  return events;
}

export function eventsToDailyMap(
  events: CalendarEventRow[],
): Map<string, CalendarEventRow[]> {
  const map = new Map<string, CalendarEventRow[]>();
  for (const ev of events) {
    const list = map.get(ev.event_date) ?? [];
    list.push(ev);
    map.set(ev.event_date, list);
  }
  return map;
}

export function eventsToUpcoming(
  events: CalendarEventRow[],
  limit = 10,
): UpcomingComplianceEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter((e) => e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, limit)
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.event_date,
      status: classifyStatus(e.event_date),
    }));
}

export function eventRowToDailyEvent(row: CalendarEventRow) {
  return {
    id: row.id,
    time: formatEventTime(row.event_time),
    title: row.title,
    type: row.event_type,
    description: row.description ?? undefined,
  };
}

export async function fetchCalendarDayNotes(
  dealershipId: string,
  from: string,
  to: string,
): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_day_notes")
    .select("note_date, body")
    .eq("dealership_id", dealershipId)
    .gte("note_date", from)
    .lte("note_date", to);

  if (error) {
    console.warn("fetchCalendarDayNotes:", error.message);
    return {};
  }

  const notes: Record<string, string> = {};
  for (const row of data ?? []) {
    notes[row.note_date as string] = row.body as string;
  }
  return notes;
}

export async function saveCalendarDayNote(
  dealershipId: string,
  userId: string,
  date: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_day_notes").upsert(
    {
      dealership_id: dealershipId,
      note_date: date,
      body,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "dealership_id,note_date" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveCalendarEvent(
  dealershipId: string,
  userId: string,
  input: {
    date: string;
    time: string;
    title: string;
    type: CalendarEventType;
    description?: string;
  },
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      dealership_id: dealershipId,
      event_date: input.date,
      event_time: input.time || null,
      title: input.title,
      event_type: input.type,
      description: input.description ?? null,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}
