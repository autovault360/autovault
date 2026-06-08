"use client";

import {
  grossProfit,
  netProfitFromCosts,
  formatCurrency,
  formatCurrencyExact,
} from "@/lib/dealer/dashboard/calculations";
import type { InventoryWorkspaceValues } from "@/lib/dealer/dashboard/schemas";
import { cn } from "@/lib/utils";

export default function InventoryProfitDisplay({
  values,
}: {
  values: Pick<
    InventoryWorkspaceValues,
    | "acquisitionCost"
    | "auctionFees"
    | "transportationCosts"
    | "reconRepairDetails"
    | "storageFees"
    | "dealerFees"
    | "marketValue"
  >;
}) {
  const costs = {
    acquisition: values.acquisitionCost,
    auction: values.auctionFees,
    transport: values.transportationCosts,
    recon: values.reconRepairDetails,
    storage: values.storageFees,
    dealerFees: values.dealerFees,
  };

  const gross = grossProfit(values.marketValue, values.acquisitionCost);
  const net = netProfitFromCosts(values.marketValue, costs);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-[#1e293b] bg-[#070c14]/60 p-3">
        <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
          GROSS PROFIT
        </div>
        <div
          className={cn(
            "mt-1 text-[20px] font-bold tabular-nums",
            gross >= 0 ? "text-emerald-400" : "text-red-400",
          )}
        >
          {formatCurrencyExact(gross)}
        </div>
        <div className="mt-1 text-[10px] text-[#475569]">
          Market Value minus Acquisition Cost
        </div>
      </div>
      <div className="rounded-md border border-[#1e293b] bg-[#070c14]/60 p-3">
        <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
          NET PROFIT
        </div>
        <div
          className={cn(
            "mt-1 text-[20px] font-bold tabular-nums",
            net >= 0 ? "text-emerald-400" : "text-red-400",
          )}
        >
          {formatCurrencyExact(net)}
        </div>
        <div className="mt-1 text-[10px] text-[#475569]">
          Market Value minus Total Cost ({formatCurrency(
            costs.acquisition +
              costs.auction +
              costs.transport +
              costs.recon +
              costs.storage +
              costs.dealerFees,
          )})
        </div>
      </div>
    </div>
  );
}
