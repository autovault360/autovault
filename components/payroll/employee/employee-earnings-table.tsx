import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { formatPayrollCurrency, type EarningsLine } from "@/lib/payroll/types";

export default function EmployeeEarningsTable({
  earnings,
}: {
  earnings: EarningsLine[];
}) {
  const total = earnings.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DetailCard className="mb-2 bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead title="EARNINGS BREAKDOWN" />
      <div className="overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9.5px] uppercase tracking-[0.08em] text-slate-500">
              <th className="px-1 pb-2 text-left font-semibold">Type</th>
              <th className="px-1 pb-2 text-left font-semibold">Reference</th>
              <th className="px-1 pb-2 text-left font-semibold">Description</th>
              <th className="px-1 pb-2 text-right font-semibold">Rate/Amount</th>
              <th className="px-1 pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/40">
                <td className="px-1 py-2 text-slate-300">{row.type}</td>
                <td className="px-1 py-2 font-mono text-blue-400">{row.reference}</td>
                <td className="px-1 py-2 text-slate-400">{row.description}</td>
                <td className="px-1 py-2 text-right font-mono tabular-nums text-slate-400">{row.rateOrAmount}</td>
                <td className="px-1 py-2 text-right font-mono tabular-nums text-emerald-400">{formatPayrollCurrency(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 flex items-center justify-between border-t border-slate-800 pt-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Total Earnings</span>
        <span className="font-mono text-[13px] font-bold tabular-nums tracking-wide text-emerald-400">{formatPayrollCurrency(total)}</span>
      </div>
    </DetailCard>
  );
}
