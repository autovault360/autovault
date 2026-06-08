"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { formatPayrollCurrency, type PayHistoryEntry } from "@/lib/payroll/types";
import PayrollPaymentTypeBadge from "../payroll-payment-type-badge";
import PayrollStatusBadge from "../payroll-status-badge";

export default function EmployeePayHistoryTable({
  history,
}: {
  history: PayHistoryEntry[];
}) {
  return (
    <DetailCard className="bg-[#070c14]/60 border-slate-800/80 h-auto">
      <DetailCardHead title="PAY HISTORY (LAST 6 PAY PERIODS)" />
      <div className="overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9.5px] uppercase tracking-[0.08em] text-slate-500">
              <th className="px-1 pb-2 text-left font-semibold">Pay Period</th>
              <th className="px-1 pb-2 text-left font-semibold">Pay Date</th>
              <th className="px-1 pb-2 text-right font-semibold">Total Pay</th>
              <th className="px-1 pb-2 text-left font-semibold">Status</th>
              <th className="px-1 pb-2 text-left font-semibold">Payment Type</th>
              <th className="px-1 pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id} className="border-b border-slate-800/40">
                <td className="px-1 py-2 text-slate-400">{row.payPeriod}</td>
                <td className="px-1 py-2 font-mono tabular-nums text-slate-400">{row.payDate}</td>
                <td className="px-1 py-2 text-right font-mono tabular-nums text-white">{formatPayrollCurrency(row.totalPay)}</td>
                <td className="px-1 py-2"><PayrollStatusBadge status={row.status} /></td>
                <td className="px-1 py-2"><PayrollPaymentTypeBadge type={row.paymentType} /></td>
                <td className="px-1 py-2">
                  <button type="button" className="text-slate-500 hover:text-white" onClick={() => toast.success("Download started")} aria-label="Download pay stub">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DetailCard>
  );
}
