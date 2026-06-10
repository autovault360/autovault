"use client";

import { CardShell } from "@/components/dashboard/card-shell";
import { formatCommissionCurrency } from "@/lib/sales-rep/commissions/format";
import type { IPaymentHistoryEntry } from "@/lib/sales-rep/payroll-earnings/types";
import PayrollPaymentStatusBadge from "./payroll-payment-status-badge";

type Props = {
  entries: IPaymentHistoryEntry[];
  loading?: boolean;
  onViewAll?: () => void;
};

export default function PayrollEarningsPaymentHistory({
  entries,
  loading,
  onViewAll,
}: Props) {
  if (loading) {
    return (
      <CardShell className="h-[300px] animate-pulse rounded-lg border-slate-700/80 bg-card">
        <div className="h-full bg-slate-800/30" />
      </CardShell>
    );
  }

  return (
    <CardShell className="rounded-lg border-slate-700/80 bg-card backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Payment History</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[12px] font-medium text-blue-400 transition hover:text-blue-300"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-[11px]">
          <thead>
            <tr className="border-b border-slate-800/80 text-[9.5px] uppercase tracking-[0.08em] text-slate-500">
              <th className="pb-2.5 text-left font-semibold">Pay Date</th>
              <th className="pb-2.5 text-left font-semibold">Period</th>
              <th className="pb-2.5 text-right font-semibold">Total Earnings</th>
              <th className="pb-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-slate-800/40 transition hover:bg-slate-800/15"
              >
                <td className="py-3 text-[12px] text-slate-300">{entry.payDate}</td>
                <td className="py-3 text-[12px] text-slate-400">{entry.period}</td>
                <td className="py-3 text-right text-[12px] font-semibold tabular-nums text-emerald-400">
                  {formatCommissionCurrency(entry.totalEarnings)}
                </td>
                <td className="py-3 text-right">
                  <PayrollPaymentStatusBadge
                    status={entry.status === "paid" ? "paid" : "pending"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}
