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
    <div className="relative mx-auto h-[108px] w-[108px] shrink-0 @min-[520px]:mx-0">
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
  onOpen?: () => void;
};

export default function InventoryOverviewCard({ inventory, onOpen }: Props) {
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
    <ReportCardShell className="@container flex min-w-0 flex-col overflow-hidden" onClick={onOpen}>
      <ReportCardHeaderWithLink title="INVENTORY OVERVIEW" onClick={onOpen} />
      <p className="mb-3 text-[9.5px] font-bold tracking-[0.1em] text-slate-500 uppercase">
        Inventory Age Breakdown
      </p>

      <div className="flex min-w-0 flex-col gap-4 @min-[520px]:grid @min-[520px]:grid-cols-[108px_minmax(0,1fr)_auto] @min-[520px]:items-start @min-[520px]:gap-4">
        <InventoryAgeDonut segments={inventory.breakdown} />

        <ul className="min-w-0 space-y-2">
          {inventory.breakdown.map((seg) => (
            <li
              key={seg.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 text-[12px] leading-snug @min-[520px]:text-[13px]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="min-w-0 truncate text-slate-400">{seg.label}:</span>
              <span className="shrink-0 text-right font-semibold text-slate-200 tabular-nums">
                {seg.count}{" "}
                <span className="font-normal text-slate-500">
                  ({seg.percent}%)
                </span>
              </span>
            </li>
          ))}
        </ul>

        <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-800/50 pt-4 @min-[520px]:col-auto @min-[520px]:grid-cols-1 @min-[520px]:border-t-0 @min-[520px]:pt-0 @min-[520px]:min-w-[120px]">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="text-[9.5px] leading-snug text-slate-500">
                {stat.label}
              </dt>
              <dd className="mt-0.5 break-all text-[14px] font-bold leading-tight text-white tabular-nums @min-[520px]:text-[15px] @min-[520px]:break-normal">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ReportViewMore label="View Inventory List" onClick={onOpen} />
    </ReportCardShell>
  );
}
