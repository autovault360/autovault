"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import type { CalendarEventType, CalendarFilters, CalendarReport } from "../types";
import { getCalendarReport } from "./get-calendar-report";
import {
  saveCalendarDayNote,
  saveCalendarEvent,
} from "./fetch-calendar-events";

export async function fetchCalendarReportAction(
  year: number,
): Promise<CalendarReport> {
  return getCalendarReport(year);
}

export async function saveCalendarEventAction(input: {
  date: string;
  time: string;
  title: string;
  type: CalendarEventType;
  description?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const auth = await authenticateUser();
  if (!auth.ok) return { ok: false, error: "Not authenticated" };

  const result = await saveCalendarEvent(
    auth.user.dealershipId,
    auth.user.userId,
    input,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function saveCalendarDayNoteAction(
  date: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await authenticateUser();
  if (!auth.ok) return { ok: false, error: "Not authenticated" };

  return saveCalendarDayNote(auth.user.dealershipId, auth.user.userId, date, body);
}

export type CalendarExportPayload = {
  year: number;
  filters: CalendarFilters;
  report: CalendarReport;
};
