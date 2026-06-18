"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import {
  addDays,
  addMonths,
  formatFullDate,
  formatMonthYear,
  formatShortDate,
} from "@/lib/calendar/format-utils";
import {
  buildDailyMap,
  buildMonthGrid,
  getDailyActivity,
  getDaySoldVehicles,
} from "@/lib/calendar/selectors";
import { formatCurrency } from "@/lib/profit-loss/types";
import type { CalendarEventType, CalendarReport } from "@/lib/calendar/types";
import { fetchCalendarReportAction } from "@/lib/calendar/server/actions";
import { createEvent } from "@/lib/events/server/create-event";
import CalendarMonthGrid from "./calendar-month-grid";
import CalendarWeekGrid from "./calendar-week-grid";
import CalendarMonthStrip from "./calendar-month-strip";
import DayEventsModal, {
  type AddDashboardEventInput,
} from "./day-events-modal";
import DaySoldDetail from "./day-sold-detail";
import { ADMIN_PANEL_INNER_CLASS, ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import {
  ADMIN_EVENT_LEGEND,
  buildFullMonthStrip,
  formatRelativeEventDate,
  formatWeekRange,
  getEventDotClass,
  getWeekDays,
  type WeekDay,
} from "./calendar-utils";

type Props = {
  calendarReport: CalendarReport;
};

type StripEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  type: CalendarEventType;
};

type DailyEvent = CalendarReport["dailyActivity"][number]["events"][number];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addEventToReport(
  report: CalendarReport,
  date: string,
  event: DailyEvent,
): CalendarReport {
  const existingDay = report.dailyActivity.find((day) => day.date === date);

  if (existingDay) {
    return {
      ...report,
      dailyActivity: report.dailyActivity.map((day) =>
        day.date === date ? { ...day, events: [...day.events, event] } : day,
      ),
    };
  }

  return {
    ...report,
    dailyActivity: [
      ...report.dailyActivity,
      {
        id: date,
        date,
        unitsSold: 0,
        totalGross: 0,
        totalCommissions: 0,
        salesReps: [],
        events: [event],
      },
    ].sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export default function CalendarSection({ calendarReport }: Props) {
  const today = todayIso();
  const [report, setReport] = useState(calendarReport);
  const [expanded, setExpanded] = useState(false);
  const [focusMonth, setFocusMonth] = useState(today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<string | null>(today);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [mode, setMode] = useState<"events" | "sold">("events");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<string | null>(null);

  useEffect(() => {
    setReport(calendarReport);
  }, [calendarReport]);

  const year = Number(focusMonth.slice(0, 4));
  const month = Number(focusMonth.slice(5, 7));

  const dailyMap = useMemo(
    () => buildDailyMap(report.dailyActivity),
    [report.dailyActivity],
  );

  const monthGrid = useMemo(
    () => buildMonthGrid(year, month, dailyMap),
    [year, month, dailyMap],
  );

  const eventCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of report.dailyActivity) {
      if (day.date.startsWith(focusMonth)) {
        map.set(day.date, day.events.length);
      }
    }
    return map;
  }, [report.dailyActivity, focusMonth]);

  const soldCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of report.dailyActivity) {
      if (day.date.startsWith(focusMonth) && day.unitsSold > 0) {
        map.set(day.date, day.unitsSold);
      }
    }
    return map;
  }, [report.dailyActivity, focusMonth]);

  const weekDays = useMemo(
    () => (viewMode === "week" ? getWeekDays(selectedDay ?? today) : [] as WeekDay[]),
    [viewMode, selectedDay, today],
  );

  const monthStripDays = useMemo(
    () => buildFullMonthStrip(year, month, today, mode === "events" ? eventCountByDate : soldCountByDate),
    [year, month, today, eventCountByDate, soldCountByDate, mode],
  );

  const stripEvents = useMemo((): StripEvent[] => {
    const fromActivity = report.dailyActivity
      .flatMap((d) =>
        d.events.map((ev) => ({
          id: ev.id,
          date: d.date,
          time: ev.time,
          title: ev.title,
          type: ev.type,
        })),
      )
      .filter((ev) => ev.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (fromActivity.length) return fromActivity.slice(0, 5);

    return report.upcomingEvents.slice(0, 5).map((ev) => ({
      id: ev.id,
      date: ev.date,
      time: "All Day",
      title: ev.title,
      type: "task" as const,
    }));
  }, [report, today]);

  const scheduleDay = selectedDay ?? today;
  const scheduleActivity = getDailyActivity(scheduleDay, dailyMap);
  const scheduleEvents = scheduleActivity?.events ?? [];

  const modalDayEvents = useMemo(() => {
    if (!eventModalDate) return [];
    return getDailyActivity(eventModalDate, dailyMap)?.events ?? [];
  }, [eventModalDate, dailyMap]);

  function handleDayClick(date: string) {
    setSelectedDay(date);
    setEventModalDate(date);
    if (mode === "events") {
      setEventModalOpen(true);
    } else {
      setSoldModalOpen(true);
    }
  }

  async function refreshReport() {
    const fresh = await fetchCalendarReportAction(year);
    setReport(fresh);
  }

  async function handleAddEvent(data: AddDashboardEventInput): Promise<string | null> {
    if (!eventModalDate) return null;

    const snapshot = report;
    const tempId = `pending-${crypto.randomUUID()}`;
    const optimisticEvent: DailyEvent = {
      id: tempId,
      time: "All day",
      title: data.title,
      type: "task",
      description: data.description ?? undefined,
    };

    setReport((prev) => addEventToReport(prev, eventModalDate, optimisticEvent));

    const fd = new FormData();
    fd.append(
      "payload",
      JSON.stringify({
        event_date: eventModalDate,
        title: data.title,
        description: data.description,
      }),
    );

    const result = await createEvent(fd);
    if (result.success) {
      await refreshReport();
      return result.id;
    }
    setReport(snapshot);
    return null;
  }

  return (
    <section className="mb-3.5">
      <CardShell className={ADMIN_PANEL_SHELL_CLASS}>
        <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
            CALENDAR
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (viewMode === "month") {
                  setFocusMonth(addMonths(focusMonth, -1));
                } else if (viewMode === "week") {
                  const prev = addDays(selectedDay ?? today, -7);
                  setSelectedDay(prev);
                  setFocusMonth(prev.slice(0, 7));
                } else {
                  const prev = addDays(selectedDay ?? today, -1);
                  setSelectedDay(prev);
                  setFocusMonth(prev.slice(0, 7));
                }
              }}
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-card text-slate-400 transition hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[140px] text-center text-[13px] font-medium text-slate-200">
              {viewMode === "week"
                ? formatWeekRange(selectedDay ?? today)
                : viewMode === "day"
                  ? formatFullDate(selectedDay ?? today)
                  : formatMonthYear(focusMonth)}
            </span>
            <button
              type="button"
              onClick={() => {
                if (viewMode === "month") {
                  setFocusMonth(addMonths(focusMonth, 1));
                } else if (viewMode === "week") {
                  const next = addDays(selectedDay ?? today, 7);
                  setSelectedDay(next);
                  setFocusMonth(next.slice(0, 7));
                } else {
                  const next = addDays(selectedDay ?? today, 1);
                  setSelectedDay(next);
                  setFocusMonth(next.slice(0, 7));
                }
              }}
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-card text-slate-400 transition hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-sm border border-slate-700/80 bg-card">
              {(["events", "sold"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-medium capitalize transition-colors first:rounded-l-sm last:rounded-r-sm",
                    mode === m
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200",
                    m === "sold" && "border-l border-slate-700/80",
                  )}
                >
                  {m === "events" ? "Events" : "Sold"}
                </button>
              ))}
            </div>
            {expanded && (
              <div className="hidden items-center gap-1 text-[10px] sm:flex">
                {(["month", "week", "day"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => {
                      setViewMode(view);
                      if (view === "month") {
                        setFocusMonth((selectedDay ?? today).slice(0, 7));
                      }
                    }}
                    className={cn(
                      "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
                      viewMode === view
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-500 hover:text-slate-300",
                    )}
                  >
                    {view}
                  </button>
                ))}
              </div>
            )}
            {expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-[11px] font-medium text-blue-400 hover:underline"
              >
                Hide Calendar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-[11px] font-medium text-blue-400 hover:underline"
              >
                View Calendar
              </button>
            )}
          </div>
        </div>

        <div className={cn(expanded && "mb-3 border-b border-slate-800/60 pb-3")}>
          <CalendarMonthStrip
            days={monthStripDays}
            selectedDay={selectedDay}
            onSelectDay={handleDayClick}
            mode={mode}
          />
        </div>

        {!expanded && mode === "events" && (
          <div className="mt-2 border-t border-slate-800/60 pt-2.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {stripEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex min-w-0 items-center gap-2 text-[11px]"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      getEventDotClass(ev.type),
                    )}
                  />
                  <span className="shrink-0 text-slate-500">{ev.time}</span>
                  <span className="truncate text-slate-200">{ev.title}</span>
                  <span className="shrink-0 text-slate-500">
                    {formatRelativeEventDate(ev.date, today)}
                  </span>
                </div>
              ))}
              <Link
                href="/dashboard/calendar"
                className="ml-auto shrink-0 text-[11px] font-medium text-blue-400 hover:underline"
              >
                View Calendar
              </Link>
            </div>
          </div>
        )}

        {!expanded && mode === "sold" && (
          <div className="mt-2 border-t border-slate-800/60 pt-2.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {report.dailyActivity
                .filter((d) => d.date >= today && d.unitsSold > 0)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map((day) => (
                  <div
                    key={day.id}
                    className="flex min-w-0 items-center gap-2 text-[11px]"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    <span className="shrink-0 text-slate-300">
                      {day.unitsSold} sold
                    </span>
                    <span className="truncate text-slate-400">
                      {formatCurrency(day.totalGross)}
                    </span>
                    <span className="shrink-0 text-slate-500">
                      {formatRelativeEventDate(day.date, today)}
                    </span>
                  </div>
                ))}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="ml-auto shrink-0 text-[11px] font-medium text-blue-400 hover:underline"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-250 ease-in-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "transition-opacity duration-250 ease-in-out",
                expanded ? "opacity-100" : "opacity-0",
              )}
            >
              {expanded && (
                <div className="space-y-3 border-t border-slate-800/60 pt-3">
                  {mode === "events" ? (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      {ADMIN_EVENT_LEGEND.map((item) => (
                        <span
                          key={item.label}
                          className="inline-flex items-center gap-1.5 text-[10px] text-slate-500"
                        >
                          <span
                            className={cn("h-2 w-2 rounded-full", item.dotClass)}
                          />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Units Sold
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#d4e157]" />
                        Revenue
                      </span>
                    </div>
                  )}

                  {viewMode === "month" && (
                    <CalendarMonthGrid
                      cells={monthGrid}
                      selectedDay={selectedDay}
                      today={today}
                      onDaySelect={handleDayClick}
                      mode={mode}
                    />
                  )}

                  {viewMode === "week" && (
                    <CalendarWeekGrid
                      days={weekDays}
                      dailyMap={dailyMap}
                      selectedDay={selectedDay}
                      today={today}
                      onDaySelect={handleDayClick}
                      focusMonth={focusMonth}
                      mode={mode}
                    />
                  )}

                  {viewMode === "day" && mode === "events" && (
                    <div className={cn("rounded-sm", ADMIN_PANEL_INNER_CLASS)}>
                      <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3">
                        <div className="text-[13px] font-semibold text-slate-200">
                          {formatFullDate(selectedDay ?? today)}
                        </div>
                        {scheduleEvents.length > 0 && (
                          <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                            {scheduleEvents.length} Event{scheduleEvents.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-slate-800/40 px-4 py-2">
                        {scheduleEvents.length > 0 ? (
                          scheduleEvents.map((ev) => (
                            <div key={ev.id} className="flex items-start gap-3 py-2.5">
                              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-slate-200">
                                    {ev.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{ev.time}</span>
                                </div>
                                {ev.description && (
                                  <p className="mt-0.5 text-[10px] text-slate-500">
                                    {ev.description}
                                  </p>
                                )}
                              </div>
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                                {ev.type === "appointment"
                                  ? "Appointment"
                                  : ev.type === "follow_up"
                                    ? "Follow Up"
                                    : ev.type === "compliance"
                                      ? "Compliance"
                                      : ev.type === "payroll"
                                        ? "Payroll"
                                        : "Task"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="py-6 text-center text-[11px] text-slate-500">
                            No events scheduled for this day. Click a date to add one.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === "day" && mode === "sold" && (
                    <div className={cn("rounded-sm", ADMIN_PANEL_INNER_CLASS)}>
                      <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3">
                        <div className="text-[13px] font-semibold text-slate-200">
                          {formatFullDate(selectedDay ?? today)}
                        </div>
                        {scheduleActivity && scheduleActivity.unitsSold > 0 && (
                          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            {scheduleActivity.unitsSold} Sold
                          </span>
                        )}
                      </div>
                      {scheduleActivity && scheduleActivity.unitsSold > 0 ? (
                        <div className="divide-y divide-slate-800/40 px-4 py-2">
                          <div className="grid grid-cols-3 gap-3 py-2.5">
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Revenue</p>
                              <p className="text-[13px] font-semibold text-emerald-400">{formatCurrency(scheduleActivity.totalGross)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Est. Cost</p>
                              <p className="text-[13px] font-semibold text-slate-300">{formatCurrency(Math.round(scheduleActivity.totalGross * 0.78))}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Gross Profit</p>
                              <p className="text-[13px] font-semibold text-blue-400">{formatCurrency(Math.round(scheduleActivity.totalGross * 0.22))}</p>
                            </div>
                          </div>
                          {scheduleActivity.salesReps.length > 0 && (
                            <div className="py-2.5">
                              <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">Sales Reps</p>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {scheduleActivity.salesReps.map((rep) => (
                                  <div key={rep.repId} className="rounded-sm border border-slate-800/60 bg-slate-900/30 p-2">
                                    <p className="text-[10px] font-medium text-slate-200">{rep.repName}</p>
                                    <p className="text-[9px] text-slate-400">{rep.unitsSold} units &middot; <span className="text-emerald-400">{formatCurrency(rep.grossProfit)}</span></p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="py-6 text-center text-[11px] text-slate-500">
                          No vehicles sold on this day.
                        </p>
                      )}
                    </div>
                  )}

                  {mode === "events" ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                        <div className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                          TODAY&apos;S SCHEDULE
                        </div>
                        {scheduleEvents.length ? (
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-800 text-left text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                                  <th className="pb-2 pr-3">Time</th>
                                  <th className="pb-2 pr-3">Event</th>
                                  <th className="pb-2 pr-3">Details</th>
                                  <th className="pb-2 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {scheduleEvents.map((ev) => (
                                  <tr
                                    key={ev.id}
                                    className="border-b border-slate-800/50 last:border-0"
                                  >
                                    <td className="py-2 pr-3 text-slate-400">
                                      {ev.time}
                                    </td>
                                    <td className="py-2 pr-3 font-medium text-slate-200">
                                      {ev.title}
                                    </td>
                                    <td className="py-2 pr-3 text-slate-500">
                                      {ev.description ?? "-"}
                                    </td>
                                    <td className="py-2 text-right">
                                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                                        Added
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            No events scheduled for{" "}
                            {scheduleDay === today
                              ? "today"
                              : formatShortDate(scheduleDay)}
                            . Click a date to add one.
                          </p>
                        )}
                      </div>

                      <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                        <div className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                          UPCOMING EVENTS
                        </div>
                        <ul className="space-y-2">
                          {report.upcomingEvents.slice(0, 7).map((ev) => (
                            <li
                              key={ev.id}
                              className="flex items-center justify-between gap-3 text-[11px]"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                <span className="truncate text-slate-300">
                                  {ev.title}
                                </span>
                              </div>
                              <span className="shrink-0 text-slate-500">
                                {formatRelativeEventDate(ev.date, today)}
                              </span>
                            </li>
                          ))}
                          {!report.upcomingEvents.length && (
                            <li className="text-[11px] text-slate-500">
                              No upcoming events.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                        <div className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                          MONTHLY SUMMARY
                        </div>
                        {(() => {
                          const monthActivity = report.dailyActivity.filter(
                            (d) => d.date.startsWith(focusMonth),
                          );
                          const totalUnits = monthActivity.reduce((s, d) => s + d.unitsSold, 0);
                          const totalGross = monthActivity.reduce((s, d) => s + d.totalGross, 0);
                          const totalComm = monthActivity.reduce((s, d) => s + d.totalCommissions, 0);
                          return (
                            <div className="grid grid-cols-3 gap-2.5">
                              <div className="rounded-sm border border-slate-800/60 bg-slate-900/30 p-2">
                                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Sold</p>
                                <p className="text-[15px] font-bold text-emerald-400">{totalUnits}</p>
                              </div>
                              <div className="rounded-sm border border-slate-800/60 bg-slate-900/30 p-2">
                                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Revenue</p>
                                <p className="text-[15px] font-bold text-[#d4e157]">{formatCurrency(totalGross)}</p>
                              </div>
                              <div className="rounded-sm border border-slate-800/60 bg-slate-900/30 p-2">
                                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Commissions</p>
                                <p className="text-[15px] font-bold text-violet-400">{formatCurrency(totalComm)}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                        <div className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                          TODAY&apos;S SALES
                        </div>
                        {scheduleActivity && scheduleActivity.unitsSold > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Units Sold</span>
                              <span className="font-semibold text-emerald-400">{scheduleActivity.unitsSold}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Revenue</span>
                              <span className="font-semibold text-[#d4e157]">{formatCurrency(scheduleActivity.totalGross)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Commissions</span>
                              <span className="font-semibold text-violet-400">{formatCurrency(scheduleActivity.totalCommissions)}</span>
                            </div>
                            {getDaySoldVehicles(scheduleDay, report).length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleDayClick(scheduleDay)}
                                className="mt-2 text-[10px] font-medium text-blue-400 hover:underline"
                              >
                                View details
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            No vehicles sold today.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardShell>

      {mode === "events" ? (
        <DayEventsModal
          open={eventModalOpen}
          onOpenChange={setEventModalOpen}
          eventDate={eventModalDate}
          events={modalDayEvents}
          onAdd={handleAddEvent}
        />
      ) : (
        <DaySoldDetail
          open={soldModalOpen}
          onOpenChange={setSoldModalOpen}
          eventDate={eventModalDate}
          report={report}
        />
      )}
    </section>
  );
}
