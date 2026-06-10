import { cn } from "@/lib/utils";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import type { PayrollCalendarEvent } from "@/lib/payroll/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMay2026Grid() {
  const cells: (number | null)[] = [];
  for (let i = 0; i < 5; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) cells.push(d);
  return cells;
}

export default function EmployeePaycheckMiniCalendar({
  events,
}: {
  events: PayrollCalendarEvent[];
}) {
  const cells = buildMay2026Grid();
  const eventByDay = new Map<number, PayrollCalendarEvent>();
  events.forEach((ev) => {
    const day = parseInt(ev.date.split("-")[2]!, 10);
    if (ev.date.startsWith("2026-05")) eventByDay.set(day, ev);
  });

  return (
    <DetailCard className="mb-2 bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead title="PAYCHECK CALENDAR" />
      <div className="mb-2 text-center text-[11px] font-semibold text-slate-300">May 2026</div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[9px] text-slate-500">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="min-h-[28px]" />;
          const ev = eventByDay.get(day);
          const isPayDate = ev?.type === "pay_date";
          const isPeriodStart = ev?.type === "period_start";
          return (
            <div
              key={day}
              className={cn(
                "flex min-h-[28px] items-center justify-center rounded text-[10px] font-mono tabular-nums",
                isPayDate && "bg-emerald-500/20 font-bold text-emerald-400 ring-1 ring-emerald-500/50",
                isPeriodStart && "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50",
                !ev && "text-slate-500",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[9px] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500/50" /> Pay Period Start</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500/50" /> Pay Date</span>
      </div>
    </DetailCard>
  );
}
