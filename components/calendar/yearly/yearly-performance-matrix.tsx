"use client";

import { cn } from "@/lib/utils";
import { formatCompactCurrency } from "@/lib/profit-loss/types";
import { formatMonthYear, getMonthId } from "@/lib/calendar/format-utils";
import type { FilteredCalendarReport, UnitsColorTier } from "@/lib/calendar/types";
import {
  getMonthCardMetrics,
  getMonthHeatmap,
  buildDailyMap,
} from "@/lib/calendar/selectors";
import CalendarActivityLegend from "../monthly/calendar-activity-legend";
import { CalendarCardShell } from "../calendar-card-primitives";
import MonthHeatmapDots from "./month-heatmap-dots";

type Props = {
  year: number;
  report: FilteredCalendarReport;
  selectedMonthId: string | null;
  onMonthSelect: (monthId: string) => void;
};

export default function YearlyPerformanceMatrix({
  year,
  report,
  selectedMonthId,
  onMonthSelect,
}: Props) {
  const dailyMap = buildDailyMap(report.dailyActivity);

  return (
    <CalendarCardShell>
      <CalendarActivityLegend />
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthId = getMonthId(year, month);
          const metrics = getMonthCardMetrics(monthId, report);
          const heatmap = getMonthHeatmap(monthId, dailyMap);
          const isSelected = selectedMonthId === monthId;

          return (
            <button
              key={monthId}
              type="button"
              onClick={() => onMonthSelect(monthId)}
              className={cn(
                "rounded border border-slate-800 bg-slate-900/20 p-2.5 text-left transition-colors hover:border-slate-600",
                isSelected && "ring-2 ring-blue-500",
              )}
            >
              <div className="mb-2 text-[11px] font-semibold text-slate-200">
                {formatMonthYear(monthId)}
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                <div>
                  <div className="text-slate-500">Units</div>
                  <div className="font-semibold text-white">{metrics.units}</div>
                </div>
                <div>
                  <div className="text-slate-500">Gross</div>
                  <div className="font-semibold text-emerald-400">
                    {formatCompactCurrency(metrics.gross)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Comm.</div>
                  <div className="font-semibold text-purple-400">
                    {formatCompactCurrency(metrics.commissions)}
                  </div>
                </div>
              </div>
              <MonthHeatmapDots tiers={heatmap as UnitsColorTier[]} />
            </button>
          );
        })}
      </div>
    </CalendarCardShell>
  );
}
