"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import type {
  CpaLossBreakdownSegment,
  CpaLossByReasonItem,
  CpaLossByTypeItem,
} from "@/lib/cpa/vehicle-losses-report/types";
import { formatLossMoney } from "@/lib/cpa/vehicle-losses-report/utils";
import { cn } from "@/lib/utils";

const CHART_CARD_CLASS =
  "flex h-full flex-col rounded-lg border-slate-700/80 bg-card p-4 shadow-none";

const BAR_BLUE = "#3b82f6";
const BAR_TRACK = "rgba(30, 41, 59, 0.9)";

function LossBreakdownPanel({
  segments,
  total,
}: {
  segments: CpaLossBreakdownSegment[];
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartSegments = segments
    .filter((segment) => segment.id !== "total-losses")
    .map((segment) => ({
      ...segment,
      chartAmount: Math.abs(segment.amount),
    }));
  const listSegments = segments.filter((segment) => segment.id !== "total-losses");
  const totalSegment = segments.find((segment) => segment.id === "total-losses");

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="LOSS BREAKDOWN" />
      <div className="flex min-h-0 flex-1 flex-col gap-5 md:flex-row md:items-center md:gap-6">
        <ul className="min-w-0 flex-1 space-y-3">
          {listSegments.map((segment) => (
            <li
              key={segment.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 text-[11px]"
            >
              <span className="truncate text-slate-400">{segment.label}</span>
              <span className="whitespace-nowrap tabular-nums text-red-400">
                {formatLossMoney(segment.amount)}
              </span>
              <span className="w-12 text-right font-medium tabular-nums text-white">
                {segment.percent.toFixed(1)}%
              </span>
            </li>
          ))}

          {totalSegment ? (
            <li className="border-t border-slate-700/80 pt-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 text-[11px] font-semibold text-red-400">
                <span className="truncate">{totalSegment.label}</span>
                <span className="whitespace-nowrap tabular-nums">
                  {formatLossMoney(totalSegment.amount)}
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
                dataKey="chartAmount"
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
                formatter={(value) => formatLossMoney(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[17px] font-bold tabular-nums text-red-400">
              {formatLossMoney(total)}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">Total Losses</div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function LossByReasonPanel({ items }: { items: CpaLossByReasonItem[] }) {
  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="LOSS BY REASON" />
      <ul className="flex min-h-0 flex-1 flex-col justify-center space-y-3.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 text-[11px]"
          >
            <span className="truncate text-slate-300">{item.label}</span>
            <span className="whitespace-nowrap tabular-nums text-red-400">
              {formatLossMoney(item.amount)}
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

function LossByVehicleTypePanel({ items }: { items: CpaLossByTypeItem[] }) {
  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="LOSS BY VEHICLE TYPE" />
      {items.length > 0 ? (
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
                    backgroundColor: BAR_BLUE,
                  }}
                />
              </div>
              <span className="whitespace-nowrap tabular-nums text-red-400">
                {formatLossMoney(item.amount)}
              </span>
              <span className="w-12 text-right font-medium tabular-nums text-white">
                {item.percent.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="text-[11px] text-slate-500">No vehicle loss data found.</span>
        </div>
      )}
    </CardShell>
  );
}

export default function CpaVehicleLossesReportChartsRow({
  lossBreakdown,
  lossBreakdownTotal,
  lossByReason,
  lossByVehicleType,
}: {
  lossBreakdown: CpaLossBreakdownSegment[];
  lossBreakdownTotal: number;
  lossByReason: CpaLossByReasonItem[];
  lossByVehicleType: CpaLossByTypeItem[];
}) {
  return (
    <div
      className={cn(
        "mb-4 w-full",
      )}
    >
      {/* <LossBreakdownPanel segments={lossBreakdown} total={lossBreakdownTotal} />
      <LossByReasonPanel items={lossByReason} /> */}
      <LossByVehicleTypePanel items={lossByVehicleType} />
    </div>
  );
}
