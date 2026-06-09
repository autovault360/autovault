"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import {
  addMonths,
  formatMonthYear,
  formatShortDate,
} from "@/lib/calendar/format-utils";
import {
  buildDailyMap,
  buildMonthGrid,
  getDailyActivity,
} from "@/lib/calendar/selectors";
import type { CalendarReport } from "@/lib/calendar/types";
import AdminCalendarMonthGrid from "./admin-calendar-month-grid";
import AdminCalendarMonthStrip from "./admin-calendar-month-strip";
import { ADMIN_PANEL_INNER_CLASS, ADMIN_PANEL_SHELL_CLASS } from "./admin-panel-styles";
import {
  ADMIN_EVENT_LEGEND,
  buildFullMonthStrip,
  formatRelativeEventDate,
  getEventDotClass,
} from "./admin-calendar-utils";

type Props = {
  calendarReport: CalendarReport;
};

type StripEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  type: import("@/lib/calendar/types").CalendarEventType;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarSection({ calendarReport }: Props) {
  const today = todayIso();
  const [expanded, setExpanded] = useState(false);
  const [focusMonth, setFocusMonth] = useState(today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<string | null>(today);

  const year = Number(focusMonth.slice(0, 4));
  const month = Number(focusMonth.slice(5, 7));

  const dailyMap = useMemo(
    () => buildDailyMap(calendarReport.dailyActivity),
    [calendarReport.dailyActivity],
  );

  const monthGrid = useMemo(
    () => buildMonthGrid(year, month, dailyMap),
    [year, month, dailyMap],
  );

  const eventCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of calendarReport.dailyActivity) {
      if (day.date.startsWith(focusMonth)) {
        map.set(day.date, day.events.length);
      }
    }
    return map;
  }, [calendarReport.dailyActivity, focusMonth]);

  const monthStripDays = useMemo(
    () => buildFullMonthStrip(year, month, today, eventCountByDate),
    [year, month, today, eventCountByDate],
  );

  const stripEvents = useMemo((): StripEvent[] => {
    const fromActivity = calendarReport.dailyActivity
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

    return calendarReport.upcomingEvents.slice(0, 5).map((ev) => ({
      id: ev.id,
      date: ev.date,
      time: "All Day",
      title: ev.title,
      type: "task" as const,
    }));
  }, [calendarReport, today]);

  const selectedActivity = selectedDay
    ? getDailyActivity(selectedDay, dailyMap)
    : null;

  const scheduleDay = selectedDay ?? today;
  const scheduleActivity =
    getDailyActivity(scheduleDay, dailyMap) ?? selectedActivity;
  const scheduleEvents = scheduleActivity?.events ?? [];

  return (
    <section className="mb-3.5">
      <CardShell className={ADMIN_PANEL_SHELL_CLASS}>
        {/* Header */}
        <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
            CALENDAR
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setFocusMonth(addMonths(focusMonth, -1))}
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-card text-slate-400 transition hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[120px] text-center text-[13px] font-medium text-slate-200">
              {formatMonthYear(focusMonth)}
            </span>
            <button
              type="button"
              onClick={() => setFocusMonth(addMonths(focusMonth, 1))}
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-card text-slate-400 transition hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            {expanded && (
              <div className="hidden items-center gap-1 text-[10px] sm:flex">
                {["Month", "Week", "Day"].map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "rounded-md px-2.5 py-1 font-medium",
                      i === 0
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-500 hover:text-slate-300",
                    )}
                  >
                    {v}
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

        {/* Collapsed: full-month strip (always visible) */}
        <div className={cn(expanded && "mb-3 border-b border-slate-800/60 pb-3")}>
          <AdminCalendarMonthStrip
            days={monthStripDays}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>

        {/* Collapsed: upcoming events row */}
        {!expanded && (
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

        {/* Expanded: legend + full month grid + bottom panels */}
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

                  <AdminCalendarMonthGrid
                    cells={monthGrid}
                    selectedDay={selectedDay}
                    today={today}
                    onDaySelect={setSelectedDay}
                  />

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
                                    <span
                                      className={cn(
                                        "rounded px-1.5 py-0.5 text-[9px] font-medium",
                                        ev.type === "appointment"
                                          ? "bg-emerald-500/15 text-emerald-400"
                                          : "bg-amber-500/15 text-amber-400",
                                      )}
                                    >
                                      {ev.type === "appointment"
                                        ? "Confirmed"
                                        : "Pending"}
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
                          .
                        </p>
                      )}
                    </div>

                    <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                      <div className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                        UPCOMING EVENTS
                      </div>
                      <ul className="space-y-2">
                        {calendarReport.upcomingEvents.slice(0, 7).map((ev) => (
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
                        {!calendarReport.upcomingEvents.length && (
                          <li className="text-[11px] text-slate-500">
                            No upcoming events.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardShell>
    </section>
  );
}
