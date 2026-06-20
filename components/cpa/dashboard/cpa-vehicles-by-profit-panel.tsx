"use client";

import { TrendingUp } from "lucide-react";
import type { CpaVehicleProfitStats } from "@/lib/cpa/types";
import CpaPanelShell, {
  CpaPanelStatCell,
  CpaPanelStatGrid,
} from "./cpa-panel-shell";
import {
  formatMoney,
  formatPercent,
  vehicleHighlightText,
} from "./cpa-dashboard-utils";

export default function CpaVehiclesByProfitPanel({
  stats,
}: {
  stats: CpaVehicleProfitStats;
}) {
  return (
    <CpaPanelShell
      icon={TrendingUp}
      iconClassName="text-white"
      iconBgClassName="bg-green-700"
      title="Vehicles by Profit"
      viewDetailsLinkClass="text-green-700 border border-green-700"
      subtitle="Performance overview of profitable vehicle sales"
      viewDetailsHref="/cpa/vehicles"
      viewDetailsDisabled
    >
      <CpaPanelStatGrid>
        <CpaPanelStatCell
          label="Total Vehicles Sold"
          value={stats.totalVehiclesSold}
        />
        <CpaPanelStatCell
          label="Profitable Vehicles"
          value={stats.profitableCount}
          valueClassName="text-emerald-400"
        />
        <CpaPanelStatCell
          label="Profit %"
          value={formatPercent(stats.profitPct)}
        />
        <CpaPanelStatCell
          label="Total Profit"
          value={formatMoney(stats.totalProfit)}
          valueClassName="text-emerald-400"
        />
        <CpaPanelStatCell
          label="Average Profit Per Vehicle"
          value={formatMoney(stats.avgProfitPerVehicle)}
        />
        <CpaPanelStatCell
          label="Highest Profit"
          value={vehicleHighlightText(stats.highestProfit)}
          valueClassName="text-[13px] font-semibold"
        />
        <CpaPanelStatCell
          label="Lowest Profit"
          value={vehicleHighlightText(stats.lowestProfit)}
          valueClassName="text-[13px] font-semibold"
        />
        <CpaPanelStatCell
          label="Gross Profit Margin"
          value={formatPercent(stats.grossProfitMargin)}
        />
      </CpaPanelStatGrid>
    </CpaPanelShell>
  );
}
