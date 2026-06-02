"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCompactCurrency, formatCurrency } from "@/lib/profit-loss/types";
import type {
  MonthlyTrendPoint,
  SalesRepLeaderboardEntry,
  WeekBreakdownRow,
} from "@/lib/calendar/types";
import { CalendarMetricLineChart } from "../charts/calendar-metric-line-chart";
import { CalendarCardShell, CalendarCardHead } from "../calendar-card-primitives";

export function MonthlySalesByWeekCard({
  weeklyBreakdown,
}: {
  weeklyBreakdown: WeekBreakdownRow[];
}) {
  return (
    <CalendarCardShell>
      <CalendarCardHead title="Monthly Sales by Week" />
      <div className="space-y-2">
        {weeklyBreakdown.map((row) => (
          <div
            key={row.week}
            className="flex items-center justify-between border-b border-slate-800/60 pb-2 text-[11px] last:border-0"
          >
            <span className="text-slate-400">{row.week}</span>
            <div className="flex gap-4 text-right">
              <span className="text-slate-300">{row.unitsSold} units</span>
              <span className="text-emerald-400">
                {formatCompactCurrency(row.gross)}
              </span>
              <span className="text-purple-400">
                {formatCompactCurrency(row.commission)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CalendarCardShell>
  );
}

export function MonthlyTopRepsCard({
  topReps,
}: {
  topReps: SalesRepLeaderboardEntry[];
}) {
  return (
    <CalendarCardShell>
      <CalendarCardHead title="Top Sales Reps (This Month)" />
      <div className="space-y-2.5">
        {topReps.map((rep) => (
          <div key={rep.repId} className="flex items-center gap-2.5">
            <span className="w-4 text-[10px] text-slate-500">{rep.rank}.</span>
            <Avatar className="h-7 w-7">
              <AvatarImage src={rep.avatarUrl} />
              <AvatarFallback className="text-[9px]">
                {rep.repName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-slate-200">
                {rep.repName}
              </div>
              <div className="text-[10px] text-slate-500">
                {rep.unitsSold} units | {formatCurrency(rep.gross)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CalendarCardShell>
  );
}

export function MonthlySalesTrendChart({
  trendData,
}: {
  trendData: MonthlyTrendPoint[];
}) {
  return (
    <CalendarMetricLineChart
      title="Sales Trend (This Month)"
      data={trendData}
      lines={[
        { key: "units", color: "#3B82F6", name: "Units Sold", yAxisId: "left" },
        {
          key: "commission",
          color: "#10B981",
          name: "Commission",
          yAxisId: "right",
        },
      ]}
      height={200}
    />
  );
}
