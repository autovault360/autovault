"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import type {
  CpaProfitBreakdownSegment,
  CpaProfitByTypeItem,
  CpaProfitSourceItem,
} from "@/lib/cpa/profit-vehicles-report/types";
import { formatReportMoney } from "@/lib/cpa/profit-vehicles-report/utils";
import { cn } from "@/lib/utils";

const CHART_CARD_CLASS =
  "flex h-full min-h-[300px] flex-col rounded-lg border-slate-700/80 bg-card p-4 shadow-none";

const BAR_GREEN = "#22c55e";
const BAR_TRACK = "rgba(30, 41, 59, 0.9)";

function ProfitBreakdownPanel({
  segments,
  total,
}: {
  segments: CpaProfitBreakdownSegment[];
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartSegments = segments.filter((segment) => segment.id !== "total-profit");
  const listSegments = segments.filter((segment) => segment.id !== "total-profit");
  const totalSegment = segments.find((segment) => segment.id === "total-profit");

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="PROFIT BREAKDOWN" />
      <div className="flex min-h-0 flex-1 flex-col gap-5 md:flex-row md:items-center md:gap-6">
        <ul className="min-w-0 flex-1 space-y-3">
          {listSegments.map((segment) => (
            <li
              key={segment.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 text-[11px]"
            >
              <span className="truncate text-slate-400">{segment.label}</span>
              <span className="whitespace-nowrap tabular-nums text-slate-300">
                {formatReportMoney(segment.amount)}
              </span>
              <span className="w-12 text-right font-medium tabular-nums text-white">
                {segment.percent.toFixed(1)}%
              </span>
            </li>
          ))}

          {totalSegment ? (
            <li className="border-t border-slate-700/80 pt-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 text-[11px] font-semibold text-emerald-400">
                <span className="truncate">{totalSegment.label}</span>
                <span className="whitespace-nowrap tabular-nums">
                  {formatReportMoney(totalSegment.amount)}
                </span>
                <span className="w-12 text-right tabular-nums">
                  {totalSegment.percent.toFixed(1)}%
                </span>
              </div>
            </li>
          ) : null}
        </ul>

        <div className="relative mx-auto h-[156px] w-[156px] shrink-0 md:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartSegments}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                dataKey="amount"
                nameKey="label"
                stroke="none"
                paddingAngle={1}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartSegments.map((segment, index) => (
                  <Cell
                    key={segment.id}
                    fill={segment.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0e1626",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => formatReportMoney(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[17px] font-bold tabular-nums text-emerald-400">
              {formatReportMoney(total)}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">Total Profit</div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function ProfitBySourcePanel({ items }: { items: CpaProfitSourceItem[] }) {
  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="PROFIT BY SOURCE" />
      <ul className="flex min-h-0 flex-1 flex-col justify-center divide-y divide-slate-800/90">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 py-3.5 first:pt-0 last:pb-0 text-[11px]"
          >
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-slate-300">{item.label}</span>
            <span className="whitespace-nowrap tabular-nums text-slate-300">
              {formatReportMoney(item.amount)}
            </span>
            <span className="w-12 text-right font-medium tabular-nums text-white">
              {item.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

function ProfitByVehicleTypePanel({ items }: { items: CpaProfitByTypeItem[] }) {
  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="PROFIT BY VEHICLE TYPE" />
      <ul className="flex min-h-0 flex-1 flex-col justify-center space-y-3.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[52px_minmax(0,1fr)_auto_auto] items-center gap-x-3 text-[11px]"
          >
            <span className="truncate font-medium text-slate-300">{item.label}</span>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: BAR_TRACK }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(item.percent, 100)}%`,
                  backgroundColor: BAR_GREEN,
                }}
              />
            </div>
            <span className="whitespace-nowrap tabular-nums text-slate-300">
              {formatReportMoney(item.amount)}
            </span>
            <span className="w-12 text-right font-medium tabular-nums text-white">
              {item.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

export default function CpaProfitVehiclesReportChartsRow({
  profitBreakdown,
  profitBreakdownTotal,
  profitBySource,
  profitByVehicleType,
}: {
  profitBreakdown: CpaProfitBreakdownSegment[];
  profitBreakdownTotal: number;
  profitBySource: CpaProfitSourceItem[];
  profitByVehicleType: CpaProfitByTypeItem[];
}) {
  return (
    <div
      className={cn(
        "mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch",
      )}
    >
      <ProfitBreakdownPanel segments={profitBreakdown} total={profitBreakdownTotal} />
      <ProfitBySourcePanel items={profitBySource} />
      <ProfitByVehicleTypePanel items={profitByVehicleType} />
    </div>
  );
}
