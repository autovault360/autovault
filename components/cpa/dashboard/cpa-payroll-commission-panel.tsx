"use client";

import { Users } from "lucide-react";
import type { CpaPayrollPanel } from "@/lib/cpa/types";
import CpaPanelShell, { CpaPanelStatCell } from "./cpa-panel-shell";
import { formatMoney } from "./cpa-dashboard-utils";

export default function CpaPayrollCommissionPanel({
  panel,
}: {
  panel: CpaPayrollPanel;
}) {
  return (
    <CpaPanelShell
      icon={Users}
      iconClassName="text-white"
      iconBgClassName="bg-violet-500"
      title="Payroll & Commission"
      subtitle="Total payroll, commissions, bonuses, and deductions"
      viewDetailsLinkClass="border border-violet-500 text-violet-500"
      viewDetailsHref="/cpa/payroll"
    >
      {/* Top Stat Row - Inheriting violet colors for the values */}
      <div className="grid grid-cols-2 border-t border-l border-slate-700 sm:grid-cols-5 text-violet-400">
        <CpaPanelStatCell
          label="Total Payroll"
          value={formatMoney(panel.totalPayroll)}
        />
        <CpaPanelStatCell
          label="Total Commissions"
          value={formatMoney(panel.totalCommissions)}
        />
        <CpaPanelStatCell label="Bonuses" value={formatMoney(panel.bonuses)} />
        <CpaPanelStatCell
          label="Payroll Taxes"
          value={formatMoney(panel.payrollTaxes)}
        />
        <CpaPanelStatCell
          label="Deductions"
          value={formatMoney(panel.deductions)}
        />
      </div>

      {/* Total Payments Hero Section */}
      <div className="py-3 border border-slate-700 text-center border-t-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Total Payments
        </div>
        <div className="mt-1 text-[28px] font-bold tabular-nums text-violet-400">
          {formatMoney(panel.totalPayments)}
        </div>
      </div>

      {/* Breakdown and Top Earners Lists */}
      <div className="p-3 grid grid-cols-1 gap-6 sm:grid-cols-2 border border-slate-700 border-t-0">
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Payroll Breakdown
          </div>
          <ul className="space-y-1.5">
            {panel.payrollBreakdown.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-slate-400">{item.label}</span>
                <span className="font-medium tabular-nums text-white">
                  {formatMoney(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Top Earners <span className="text-slate-400 font-normal opacity-85">(BY COMMISSION)</span>
          </div>
          <ul className="space-y-1.5">
            {panel.topEarners.length === 0 ? (
              <li className="text-[11px] text-slate-500">
                No commission data for this period.
              </li>
            ) : (
              panel.topEarners.map((earner) => (
                <li
                  key={`${earner.rank}-${earner.name}`}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-slate-300">
                    {earner.rank}. {earner.name}
                  </span>
                  <span className="font-medium tabular-nums text-violet-400">
                    {formatMoney(earner.amount)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </CpaPanelShell>
  );
}