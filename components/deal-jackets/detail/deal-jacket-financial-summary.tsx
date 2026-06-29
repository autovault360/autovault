"use client";

import { Info } from "lucide-react";
import { formatCurrency } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { KPICard, type KPICardData, type KPIIconName } from "@/components/ui/kpi-card";
import {
  DetailCard,
  DetailCardBody,
  DetailCardHead,
} from "./detail-primitives";

function buildFinancialKpis(
  detail: DealJacketDetail,
  metrics: {
    soldPriceBeforeTax: number;
    collectedTax: number;
    registrationFees: number;
    totalVehicleCost: number;
    grossProfit: number;
    commission: number;
    netVehicleProfit: number;
    roi: number;
  },
): KPICardData[] {
  const commissionLabel = `Commission (${detail.salesRep.commissionPercent}%)`;

  return [
    {
      icon: "dollar-sign" as KPIIconName,
      color: "green",
      label: "Sold Price (Before Tax)",
      value: formatCurrency(metrics.soldPriceBeforeTax),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,40 55,35 110,30 165,25 220,20",
    },
    {
      icon: "percent" as KPIIconName,
      color: "blue",
      label: "Sales Tax (Collected)",
      value: formatCurrency(metrics.collectedTax),
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "0,30 55,28 110,26 165,24 220,22",
    },
    {
      icon: "landmark" as KPIIconName,
      color: "orange",
      label: "Registration Fees",
      value: formatCurrency(metrics.registrationFees),
      link: "",
      sparkColor: "#f97316",
      sparkPoints: "0,32 55,30 110,28 165,26 220,24",
    },
    {
      icon: "wallet" as KPIIconName,
      color: "red",
      label: "Total Vehicle Cost",
      value: formatCurrency(metrics.totalVehicleCost),
      link: "",
      sparkColor: "#f87171",
      sparkPoints: "0,20 55,25 110,30 165,35 220,40",
    },
    {
      icon: "bar-chart-3" as KPIIconName,
      color: "violet",
      label: "Gross Profit",
      value: formatCurrency(metrics.grossProfit),
      link: "",
      sparkColor: "#a78bfa",
      sparkPoints: "0,35 55,30 110,28 165,22 220,18",
    },
    {
      icon: "users" as KPIIconName,
      color: "orange",
      label: commissionLabel,
      value: `-${formatCurrency(metrics.commission)}`,
      link: "",
      sparkColor: "#fb923c",
      sparkPoints: "0,22 55,26 110,30 165,34 220,38",
    },
    {
      icon: "percent" as KPIIconName,
      color: "green",
      label: "Net Vehicle Profit",
      value: formatCurrency(metrics.netVehicleProfit),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,38 55,32 110,28 165,24 220,20",
    },
    {
      icon: "trending-up" as KPIIconName,
      color: "green",
      label: "ROI",
      value: `${metrics.roi.toFixed(1)}%`,
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,36 55,30 110,26 165,22 220,18",
    },
  ];
}

export function computeDealJacketFinancials(detail: DealJacketDetail) {
  const soldPriceBeforeTax = detail.sale.soldPrice;
  const collectedTax = detail.sale.salesTax;
  const registrationFees =
    detail.sale.registrationFee + detail.sale.licenseFee + detail.sale.dmvFees;
  const totalVehicleCost = detail.financial.totalInvested;
  const grossProfit = soldPriceBeforeTax - totalVehicleCost;
  const commission = detail.financial.commissionDeduction;
  const netVehicleProfit = grossProfit - commission;
  const roi =
    totalVehicleCost > 0 ? (netVehicleProfit / totalVehicleCost) * 100 : 0;

  return {
    soldPriceBeforeTax,
    collectedTax,
    registrationFees,
    totalVehicleCost,
    grossProfit,
    commission,
    netVehicleProfit,
    roi,
  };
}

export default function DealJacketFinancialSummary({
  detail,
}: {
  detail: DealJacketDetail;
}) {
  const metrics = computeDealJacketFinancials(detail);
  const kpis = buildFinancialKpis(detail, metrics);

  return (
    <DetailCard className="h-full bg-card">
      <DetailCardHead
        title="Financial Summary"
        action={
          <button
            type="button"
            className="text-[12px] font-medium text-blue-400 transition hover:text-blue-300"
          >
            View Pricing Breakdown
          </button>
        }
      />
      <DetailCardBody className="gap-3">
        <div className="grid grid-cols-2 xl:grid-cols-4">
          {kpis.map((data) => (
            <KPICard
              key={data.label}
              data={data}
              showSparkline={false}
              showLink={false}
              valueClassName={
                data.label === "ROI" || data.label === "Net Vehicle Profit"
                  ? "text-emerald-400"
                  : data.label.startsWith("Commission")
                    ? "text-orange-400"
                    : undefined
              }
              className="min-h-[88px] rounded-md border-slate-700/80 bg-transparent border-r border-b-0 border-l-0 border-t-0 p-2.5 flex justify-center items-center"
            />
          ))}
        </div>

        <div className="space-y-1 border-t border-slate-800/60 pt-3 text-[10.5px] leading-relaxed text-slate-500">
          <div className="flex items-center gap-4">
            <p>
              Gross Profit = Sold Price (Before Tax) - Total Vehicle Cost
            </p>
            <p>Net Vehicle Profit = Gross Profit - Commission</p>
          </div>
          <p className="flex items-start gap-1.5 pt-0.5">
            <Info className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
            <span>
              Sales Tax and Registration Fees are not included in profit
              calculations.
            </span>
          </p>
        </div>
      </DetailCardBody>
    </DetailCard>
  );
}
