"use client";

import { TrendingUp, Trophy } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/dealer/dashboard/calculations";
import type { TopPerformer } from "@/lib/dealer/dashboard/types";

export default function TopPerformersRow({
  data,
}: {
  data: TopPerformer;
}) {
  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <CardShell className="border-[#1e293b] bg-card">
        <div className="flex items-start gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-500/15 text-amber-400">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
              TOP PERFORMING VEHICLE
            </div>
            <div className="mt-1 text-[13px] font-bold text-white">
              {data.topVehicle.label}
            </div>
            <div className="mt-0.5 text-[12px] tabular-nums text-emerald-400">
              Profit: {formatCurrency(data.topVehicle.profit)}
            </div>
          </div>
        </div>
      </CardShell>

      <CardShell className="border-[#1e293b] bg-card">
        <div className="flex items-start gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-500/15 text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
              BEST PROFIT MARGIN
            </div>
            <div className="mt-1 text-[13px] font-bold text-white">
              {data.bestMargin.label}
            </div>
            <div className="mt-0.5 text-[12px] tabular-nums text-emerald-400">
              Margin: {data.bestMargin.margin.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardShell>

      <CardShell className="border-[#1e293b] bg-card">
        <div>
          <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
            YTD NET PROFIT
          </div>
          <div className="mt-1 text-[18px] font-bold tabular-nums text-white">
            {formatCurrency(data.ytdNetProfit.value)}
          </div>
          <div className="mt-0.5 text-[11px] text-emerald-400">
            {formatPercent(data.ytdNetProfit.delta)} vs last year
          </div>
        </div>
      </CardShell>
    </div>
  );
}
