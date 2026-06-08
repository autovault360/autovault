"use client";

import type { InventoryOverview } from "@/lib/reports-reminders/types";
import {
  ReportCardHeaderWithLink,
  ReportCardShell,
  ReportViewMore,
} from "./report-card-primitives";

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = 50;
const STROKE = 8;

function InventoryAgeDonut({
  segments,
}: {
  segments: InventoryOverview["breakdown"];
}) {
  let cumulativeOffset = 0;
  const chartSegments = segments.map((s) => {
    const offset = cumulativeOffset;
    cumulativeOffset += (s.percent / 100) * CIRCUMFERENCE;
    return { ...s, offset };
  });

  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgb(30 41 59)"
          strokeWidth={STROKE}
        />
        {chartSegments.map((s) => {
          if (s.percent === 0) return null;
          const length = (s.percent / 100) * CIRCUMFERENCE;
          return (
            <circle
              key={s.id}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
    </div>
  );
}

type Props = {
  inventory: InventoryOverview;
};

export default function InventoryOverviewCard({ inventory }: Props) {
  const stats = [
    { label: "Total Vehicles", value: String(inventory.totalVehicles) },
    { label: "Avg. Days in Stock", value: String(inventory.avgDaysInStock) },
    { label: "Inventory Value", value: inventory.inventoryValue },
    {
      label: "Est. Profit in Inventory",
      value: inventory.estProfitInInventory,
    },
  ];

  return (
    <ReportCardShell className="flex flex-col">
      <ReportCardHeaderWithLink title="INVENTORY OVERVIEW" />
      <p className="mb-3 text-[9.5px] font-bold tracking-[0.1em] text-slate-500 uppercase">
        Inventory Age Breakdown
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[108px_1fr_auto] sm:items-center">
        <InventoryAgeDonut segments={inventory.breakdown} />

        <ul className="min-w-0 space-y-2">
          {inventory.breakdown.map((seg) => (
            <li
              key={seg.id}
              className="flex items-center gap-2 text-[13px] leading-tight"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="min-w-0 flex-1 text-slate-400">{seg.label}:</span>
              <span className="shrink-0 font-semibold text-slate-200 tabular-nums">
                {seg.count}{" "}
                <span className="font-normal text-slate-500">
                  ({seg.percent}%)
                </span>
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-3 sm:min-w-[120px]">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[9.5px] text-slate-500">{stat.label}</dt>
              <dd className="mt-0.5 text-[15px] font-bold leading-tight text-white tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ReportViewMore label="View Inventory List" />
    </ReportCardShell>
  );
}
