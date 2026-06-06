"use client";

import CommissionStatusBadge from "@/components/deal-jackets/commission-status-badge";
import { ReportCardHeaderWithLink, ReportCardShell } from "@/components/reports-reminders/report-card-primitives";
import { formatCurrency } from "@/lib/sales-reps/types";
import { formatProfileDate } from "@/lib/sales-reps/profile-types";
import type {
  SalesRepCommissionEntry,
  SalesRepCommissionSummary,
} from "@/lib/sales-reps/profile-types";

type Props = {
  entries: SalesRepCommissionEntry[];
  summary: SalesRepCommissionSummary;
};

export default function SalesRepCommissionHistoryTable({
  entries,
  summary,
}: Props) {
  return (
    <ReportCardShell className="h-full">
      <ReportCardHeaderWithLink
        title="Commission History"
        linkLabel="View All"
      />
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[400px] border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-2 text-left">Date</th>
              <th className="pb-2 pr-2 text-left">Vehicle</th>
              <th className="pb-2 pr-2 text-right">Gross Profit</th>
              <th className="pb-2 pr-2 text-right">Commission</th>
              <th className="pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-800/50 last:border-0"
              >
                <td className="py-2 pr-2 text-slate-400 tabular-nums">
                  {formatProfileDate(row.date)}
                </td>
                <td className="max-w-[120px] truncate py-2 pr-2 text-slate-200">
                  {row.vehicle}
                </td>
                <td className="py-2 pr-2 text-right text-slate-200 tabular-nums">
                  {formatCurrency(row.grossProfit)}
                </td>
                <td className="py-2 pr-2 text-right font-medium text-blue-400 tabular-nums">
                  {formatCurrency(row.commission)}
                </td>
                <td className="py-2 text-right">
                  <CommissionStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700 bg-slate-800/20">
              <td colSpan={5} className="py-2.5">
                <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px]">
                  <span>
                    <span className="text-slate-500">Paid Commissions: </span>
                    <span className="font-semibold text-emerald-400">
                      {formatCurrency(summary.paidTotal)}
                    </span>
                  </span>
                  <span>
                    <span className="text-slate-500">Pending Commissions: </span>
                    <span className="font-semibold text-amber-400">
                      {formatCurrency(summary.pendingTotal)}
                    </span>
                  </span>
                  <span>
                    <span className="text-slate-500">Total Earned: </span>
                    <span className="font-semibold text-blue-400">
                      {formatCurrency(summary.earnedTotal)}
                    </span>
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </ReportCardShell>
  );
}
