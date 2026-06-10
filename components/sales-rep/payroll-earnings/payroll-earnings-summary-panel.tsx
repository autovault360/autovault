"use client";

import BreakdownDonutChart from "@/components/shared/breakdown-donut-chart";
import { CardShell } from "@/components/dashboard/card-shell";
import { formatCommissionCurrency } from "@/lib/sales-rep/commissions/format";
import type { IPayrollEarningsBreakdown } from "@/lib/sales-rep/payroll-earnings/types";

type Props = {
  breakdown: IPayrollEarningsBreakdown;
  loading?: boolean;
};

export default function PayrollEarningsSummaryPanel({
  breakdown,
  loading,
}: Props) {
  if (loading) {
    return (
      <CardShell className="h-[300px] animate-pulse rounded-lg border-slate-700/80 bg-card">
        <div className="h-full bg-slate-800/30" />
      </CardShell>
    );
  }

  const lineItems = [
    {
      label: "Total Commissions",
      value: breakdown.totalCommissions,
      className: "text-emerald-400 font-semibold",
    },
    {
      label: "Other Bonuses",
      value: breakdown.otherBonuses,
      className: "text-slate-300",
    },
    {
      label: "Adjustments",
      value: breakdown.adjustments,
      className: "text-slate-300",
    },
    {
      label: "Chargebacks / Deductions",
      value: breakdown.chargebacks,
      className: "text-slate-300",
    },
  ];

  return (
    <CardShell className="rounded-lg border-slate-700/80 bg-card backdrop-blur-sm">
      <h3 className="mb-4 text-[14px] font-bold text-white">Earnings Summary</h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ul className="min-w-0 flex-1 space-y-3">
          {lineItems.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between text-[12px]"
            >
              <span className="text-slate-500">{item.label}</span>
              <span className={`tabular-nums ${item.className}`}>
                {formatCommissionCurrency(item.value)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 flex-col items-center sm:items-end">
          <BreakdownDonutChart
            segments={[
              {
                id: "commissions",
                label: "Commissions",
                color: "#22c55e",
                percent: 100,
              },
            ]}
            centerPrimary={100}
            centerSecondary="Commissions"
            centerMode="percent"
            className="flex-col items-center gap-3 sm:flex-row sm:items-center"
          >
            <ul className="space-y-1.5 text-[10px]">
              <li className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Commissions
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Bonuses
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Deductions
              </li>
            </ul>
          </BreakdownDonutChart>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800/80 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Net Pay This Month
          </span>
          <span className="text-[22px] font-bold tabular-nums text-emerald-400">
            {formatCommissionCurrency(breakdown.netPay)}
          </span>
        </div>
      </div>
    </CardShell>
  );
}
