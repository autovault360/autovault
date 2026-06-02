"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCompactCurrency, formatCurrency } from "@/lib/profit-loss/types";
import { formatShortDate } from "@/lib/calendar/format-utils";
import type {
  BestMonthEntry,
  SalesRepLeaderboardEntry,
  UpcomingComplianceEvent,
} from "@/lib/calendar/types";
import { CalendarCardShell, CalendarCardHead } from "../calendar-card-primitives";

const STATUS_COLORS = {
  urgent: "bg-red-500",
  upcoming: "bg-amber-500",
  scheduled: "bg-emerald-500",
};

type Props = {
  yearSummary: {
    unitsSold: number;
    totalGross: number;
    totalCommissions: number;
    avgGrossPerUnit: number;
    avgCommissionPerUnit: number;
  };
  topReps: SalesRepLeaderboardEntry[];
  bestMonths: BestMonthEntry[];
  yearlyEvents: UpcomingComplianceEvent[];
};

export default function YearlyRightSummary({
  yearSummary,
  topReps,
  bestMonths,
  yearlyEvents,
}: Props) {
  return (
    <div className="space-y-3.5">
      <CalendarCardShell>
        <CalendarCardHead title="Yearly Summary" />
        <div className="space-y-1.5 text-[11px]">
          {[
            { label: "Total Units Sold", value: String(yearSummary.unitsSold) },
            { label: "Total Gross", value: formatCurrency(yearSummary.totalGross) },
            {
              label: "Total Commissions",
              value: formatCurrency(yearSummary.totalCommissions),
            },
            {
              label: "Average Gross Per Unit",
              value: formatCurrency(yearSummary.avgGrossPerUnit),
            },
            {
              label: "Average Commission Per Unit",
              value: formatCurrency(yearSummary.avgCommissionPerUnit),
            },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-2">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-medium text-slate-200">{row.value}</span>
            </div>
          ))}
        </div>
      </CalendarCardShell>

      <CalendarCardShell>
        <CalendarCardHead title="Top Sales Reps (This Year)" />
        <div className="space-y-2.5">
          {topReps.map((rep) => (
            <div key={rep.repId} className="flex items-center gap-2">
              <span className="w-4 text-[10px] text-slate-500">{rep.rank}.</span>
              <Avatar className="h-7 w-7">
                <AvatarImage src={rep.avatarUrl} />
                <AvatarFallback className="text-[9px]">
                  {rep.repName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-slate-200">{rep.repName}</div>
                <div className="text-[10px] text-slate-500">
                  {rep.unitsSold} units | {formatCompactCurrency(rep.gross)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CalendarCardShell>

      <CalendarCardShell>
        <CalendarCardHead title="Best Sales Months" />
        <div className="space-y-2">
          {bestMonths.map((m) => (
            <div key={m.monthId} className="flex items-center gap-2 text-[11px]">
              <span className="w-4 text-slate-500">{m.rank}.</span>
              <div className="flex-1 text-slate-300">{m.monthLabel}</div>
              <div className="text-right text-[10px]">
                <div className="text-slate-400">{m.unitsSold} units</div>
                <div className="text-emerald-400">{formatCompactCurrency(m.gross)}</div>
              </div>
            </div>
          ))}
        </div>
      </CalendarCardShell>

      <CalendarCardShell>
        <CalendarCardHead title="Upcoming Yearly Events" />
        <div className="space-y-2">
          {yearlyEvents.map((ev) => (
            <div key={ev.id} className="flex items-start gap-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLORS[ev.status]}`}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-slate-300">{ev.title}</div>
                <div className="text-[10px] text-slate-500">
                  {formatShortDate(ev.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CalendarCardShell>
    </div>
  );
}
