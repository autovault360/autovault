"use client";

import { TrendingDown } from "lucide-react";
import type { CpaVehicleLossStats } from "@/lib/cpa/types";
import CpaPanelShell, {
  CpaPanelStatCell,
  CpaPanelStatGrid,
} from "./cpa-panel-shell";
import {
  formatMoney,
  formatPercent,
  vehicleHighlightText,
} from "./cpa-dashboard-utils";

export default function CpaVehiclesByLossPanel({
  stats,
}: {
  stats: CpaVehicleLossStats;
}) {
  return (
    <CpaPanelShell
      icon={TrendingDown}
      iconClassName="text-white"
      iconBgClassName="bg-red-500"
      viewDetailsLinkClass="border border-red-500 text-red-500"
      title="Vehicles by Loss"
      subtitle="Overview of vehicles sold at a loss"
      viewDetailsHref="/cpa/vehicles"
      viewDetailsDisabled
    >
      <CpaPanelStatGrid>
        <CpaPanelStatCell
          label="Vehicles Sold With Loss"
          value={stats.lossCount}
          valueClassName="text-red-400"
        />
        <CpaPanelStatCell label="Loss %" value={formatPercent(stats.lossPct)} />
        <CpaPanelStatCell
          label="Total Loss"
          value={formatMoney(stats.totalLoss)}
          valueClassName="text-red-400"
        />
        <CpaPanelStatCell
          label="Avg Loss Per Vehicle"
          value={formatMoney(stats.avgLossPerVehicle)}
          valueClassName="text-red-400"
        />
        <CpaPanelStatCell
          label="Highest Loss"
          value={vehicleHighlightText(stats.highestLoss)}
          valueClassName="text-[13px] font-semibold text-red-400"
        />
        <CpaPanelStatCell
          label="Lowest Loss"
          value={vehicleHighlightText(stats.lowestLoss)}
          valueClassName="text-[13px] font-semibold"
        />
        <CpaPanelStatCell
          label="Returned to Auction"
          value={stats.returnedToAuction}
        />
        <CpaPanelStatCell
          label="Loss Impact %"
          value={formatPercent(stats.lossImpactPct)}
          valueClassName="text-red-400"
        />
      </CpaPanelStatGrid>
    </CpaPanelShell>
  );
}
