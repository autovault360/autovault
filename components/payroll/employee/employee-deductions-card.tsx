import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { formatPayrollCurrency, type DeductionLine } from "@/lib/payroll/types";

export default function EmployeeDeductionsCard({
  deductions,
}: {
  deductions: DeductionLine[];
}) {
  const total = deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <DetailCard className="bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead title="DEDUCTIONS" />
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-800 text-[9.5px] uppercase tracking-[0.08em] text-slate-500">
            <th className="pb-2 text-left font-semibold">Type</th>
            <th className="pb-2 text-left font-semibold">Description</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {deductions.map((d) => (
            <tr key={d.type} className="border-b border-slate-800/40">
              <td className="py-2 text-slate-300">{d.type}</td>
              <td className="py-2 text-slate-500">{d.description}</td>
              <td className="py-2 text-right font-mono tabular-nums tracking-wide text-red-400">
                {formatPayrollCurrency(d.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Total Deductions</span>
        <span className="font-mono text-[13px] font-bold tabular-nums tracking-wide text-red-400">
          {formatPayrollCurrency(total)}
        </span>
      </div>
    </DetailCard>
  );
}
