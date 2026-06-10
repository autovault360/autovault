import Link from "next/link";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { formatPayrollCurrency, type CommissionDealRow } from "@/lib/payroll/types";

export default function EmployeeCommissionSummary({
  deals,
}: {
  deals: CommissionDealRow[];
}) {
  const totalGross = deals.reduce((s, d) => s + d.grossProfit, 0);
  const totalCommission = deals.reduce((s, d) => s + d.commission, 0);

  return (
    <DetailCard className="mb-2 bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead title="COMMISSION SUMMARY (THIS PERIOD)" />
      <div className="overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9.5px] uppercase tracking-[0.08em] text-slate-500">
              <th className="px-1 pb-2 text-left font-semibold">Deal Jacket #</th>
              <th className="px-1 pb-2 text-left font-semibold">Vehicle</th>
              <th className="px-1 pb-2 text-right font-semibold">Gross Profit</th>
              <th className="px-1 pb-2 text-right font-semibold">Rate</th>
              <th className="px-1 pb-2 text-right font-semibold">Commission</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.dealJacketId} className="border-b border-slate-800/40">
                <td className="px-1 py-2">
                  <Link href={`/dashboard/deal-jackets`} className="font-mono text-blue-400 hover:text-blue-300">
                    {deal.dealJacketId}
                  </Link>
                </td>
                <td className="px-1 py-2 text-slate-300">{deal.vehicle}</td>
                <td className="px-1 py-2 text-right font-mono tabular-nums text-slate-300">{formatPayrollCurrency(deal.grossProfit)}</td>
                <td className="px-1 py-2 text-right font-mono tabular-nums text-slate-400">{deal.commissionRate.toFixed(2)}%</td>
                <td className="px-1 py-2 text-right font-mono tabular-nums text-emerald-400">{formatPayrollCurrency(deal.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 space-y-1 border-t border-slate-800 pt-1.5">
        <div className="flex justify-between text-[13px]">
          <span className="font-bold uppercase tracking-wide text-slate-500">Total Gross Profit</span>
          <span className="font-mono tabular-nums text-emerald-400">{formatPayrollCurrency(totalGross)}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="font-bold uppercase tracking-wide text-slate-500">Total Commission</span>
          <span className="font-mono font-bold tabular-nums text-emerald-400">{formatPayrollCurrency(totalCommission)}</span>
        </div>
      </div>
    </DetailCard>
  );
}
