"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFullDate } from "@/lib/calendar/format-utils";
import { getDaySoldVehicles } from "@/lib/calendar/selectors";
import { formatCurrency } from "@/lib/profit-loss/types";
import type { CalendarReport, IDailySalesActivity } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventDate: string | null;
  report: CalendarReport;
};

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-sm border border-slate-700/80 bg-slate-900/40 p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>
      <p className={cn("mt-1 text-[13px] font-bold tabular-nums", color)}>
        {value}
      </p>
    </div>
  );
}

function MiniBar({
  items,
}: {
  items: { label: string; value: number; max: number }[];
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-[10px] text-slate-400">
            {item.label}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-sm bg-slate-800">
            <div
              className="h-full rounded-sm bg-emerald-500 transition-all"
              style={{
                width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="w-16 text-right text-[10px] tabular-nums text-slate-300">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DaySoldDetail({
  open,
  onOpenChange,
  eventDate,
  report,
}: Props) {
  const dailyMap = useMemo(() => {
    return new Map(report.dailyActivity.map((d) => [d.date, d]));
  }, [report.dailyActivity]);

  const activity: IDailySalesActivity | null = eventDate
    ? dailyMap.get(eventDate) ?? null
    : null;

  const dayVehicles = eventDate ? getDaySoldVehicles(eventDate, report) : [];

  const stats = useMemo(() => {
    if (!activity)
      return { units: 0, gross: 0, commissions: 0, avgGross: 0 };
    return {
      units: activity.unitsSold,
      gross: activity.totalGross,
      commissions: activity.totalCommissions,
      avgGross:
        activity.unitsSold > 0
          ? Math.round(activity.totalGross / activity.unitsSold)
          : 0,
    };
  }, [activity]);

  const repBars = useMemo(() => {
    if (!activity) return [];
    const max = Math.max(...activity.salesReps.map((r) => r.unitsSold), 1);
    return activity.salesReps.map((r) => ({
      label: r.repName,
      value: r.unitsSold,
      max,
    }));
  }, [activity]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden border-slate-700 bg-card p-0 text-slate-200 sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <DialogTitle className="text-white">
              {eventDate ? formatFullDate(eventDate) : "Sold Vehicles"}
            </DialogTitle>
            <p className="text-[12px] text-slate-400">
              {stats.units} vehicle{stats.units === 1 ? "" : "s"} sold
            </p>
          </div>
          {stats.units > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              {stats.units} Sold
            </span>
          )}
        </DialogHeader>

        <div className="overflow-y-auto p-5">
          {!activity || stats.units === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-[13px] text-slate-500">No vehicles sold on this day.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <KpiCard
                  label="Total Revenue"
                  value={formatCurrency(stats.gross)}
                  color="text-emerald-400"
                />
                <KpiCard
                  label="Est. Cost"
                  value={formatCurrency(
                    Math.round(stats.gross * 0.78),
                  )}
                  color="text-slate-300"
                />
                <KpiCard
                  label="Gross Profit"
                  value={formatCurrency(
                    Math.round(stats.gross * 0.22),
                  )}
                  color="text-blue-400"
                />
                <KpiCard
                  label="Avg / Unit"
                  value={formatCurrency(stats.avgGross)}
                  color="text-violet-400"
                />
              </div>

              {dayVehicles.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                    VEHICLES SOLD
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-left text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                          <th className="pb-2 pr-3">Vehicle</th>
                          <th className="pb-2 pr-3">Stock #</th>
                          <th className="pb-2 pr-3">Customer</th>
                          <th className="pb-2">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayVehicles.map((v) => (
                          <tr
                            key={v.id}
                            className="border-b border-slate-800/50 last:border-0"
                          >
                            <td className="py-2 pr-3 text-slate-200">
                              {v.vehicle}
                            </td>
                            <td className="py-2 pr-3 tabular-nums text-slate-400">
                              {v.stockNumber}
                            </td>
                            <td className="py-2 pr-3 text-slate-400">
                              {v.customer}
                            </td>
                            <td className="py-2 tabular-nums text-emerald-400">
                              {formatCurrency(v.profit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activity.salesReps.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                    SALES REPS
                  </p>
                  <div className="rounded-sm border border-slate-800/60 bg-slate-900/30 p-3">
                    <MiniBar items={repBars} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {activity.salesReps.map((rep) => (
                      <div
                        key={rep.repId}
                        className="rounded-sm border border-slate-800/60 bg-slate-900/30 p-2"
                      >
                        <p className="truncate text-[10px] font-medium text-slate-200">
                          {rep.repName}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {rep.unitsSold} unit{rep.unitsSold === 1 ? "" : "s"}{" "}
                          &middot;{" "}
                          <span className="text-emerald-400">
                            {formatCurrency(rep.grossProfit)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
