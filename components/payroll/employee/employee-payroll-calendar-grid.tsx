"use client";

import { cn } from "@/lib/utils";
import type { PayrollCalendarEvent, PayrollCycle } from "@/lib/payroll/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getHighlightedDays(cycle: PayrollCycle, month: number, year: number): Map<number, PayrollCalendarEvent["type"]> {
  const map = new Map<number, PayrollCalendarEvent["type"]>();
  const daysInMonth = new Date(year, month, 0).getDate();

  switch (cycle) {
    case "weekly":
      for (let d = 1; d <= daysInMonth; d += 7) {
        map.set(d, "pay_date");
      }
      break;
    case "biweekly":
      map.set(11, "period_start");
      map.set(24, "period_end");
      map.set(28, "pay_date");
      break;
    case "semimonthly":
      map.set(1, "period_start");
      map.set(15, "pay_date");
      map.set(16, "period_start");
      map.set(31, "pay_date");
      break;
    case "monthly":
      map.set(1, "period_start");
      map.set(31, "pay_date");
      break;
  }
  return map;
}

function buildGrid(month: number, year: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function EmployeePayrollCalendarGrid({
  cycle,
  events,
  onDateClick,
}: {
  cycle: PayrollCycle;
  events: PayrollCalendarEvent[];
  onDateClick: (date: string, day: number) => void;
}) {
  const month = 5;
  const year = 2026;
  const cells = buildGrid(month, year);
  const highlights = getHighlightedDays(cycle, month, year);

  const eventMap = new Map<string, PayrollCalendarEvent>();
  events.forEach((e) => eventMap.set(e.date, e));

  return (
    <div className="rounded-sm border border-slate-800/80 bg-card/60 p-4">
      <div className="mb-3 text-center text-[13px] font-semibold text-slate-200">May 2026</div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium text-slate-500">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="min-h-[72px]" />;
          const dateStr = `2026-05-${String(day).padStart(2, "0")}`;
          const hl = highlights.get(day);
          const ev = eventMap.get(dateStr);
          const isClickable = hl === "pay_date" || ev?.type === "pay_date";

          return (
            <button
              key={day}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onDateClick(dateStr, day)}
              className={cn(
                "flex min-h-[72px] flex-col items-start rounded-md border border-slate-800/60 p-1.5 text-left transition",
                hl === "pay_date" && "border-emerald-500/40 bg-emerald-500/10",
                hl === "period_start" && "border-blue-500/40 bg-blue-500/10",
                hl === "period_end" && "border-purple-500/40 bg-purple-500/10",
                isClickable && "cursor-pointer hover:border-slate-600",
                !isClickable && "cursor-default opacity-80",
              )}
            >
              <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-300">{day}</span>
              {hl === "pay_date" && (
                <span className="mt-1 rounded px-1 py-0.5 text-[8px] font-medium text-emerald-400 bg-emerald-500/15">Pay Date</span>
              )}
              {hl === "period_start" && (
                <span className="mt-1 rounded px-1 py-0.5 text-[8px] font-medium text-blue-400 bg-blue-500/15">Period Start</span>
              )}
              {hl === "period_end" && (
                <span className="mt-1 rounded px-1 py-0.5 text-[8px] font-medium text-purple-400 bg-purple-500/15">Period End</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[9.5px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded border border-blue-500/50 bg-blue-500/20" /> Period Start</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded border border-emerald-500/50 bg-emerald-500/20" /> Pay Date</span>
      </div>
    </div>
  );
}
