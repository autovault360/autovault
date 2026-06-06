"use client";

import Link from "next/link";
import { ReportCardHeaderWithLink, ReportCardShell } from "@/components/reports-reminders/report-card-primitives";
import { formatCurrency } from "@/lib/sales-reps/types";
import { formatProfileDate } from "@/lib/sales-reps/profile-types";
import type {
  SalesRepVehicleSale,
  SalesRepVehicleSalesSummary,
} from "@/lib/sales-reps/profile-types";

type Props = {
  sales: SalesRepVehicleSale[];
  summary: SalesRepVehicleSalesSummary;
};

export default function SalesRepVehiclesSoldTable({ sales, summary }: Props) {
  return (
    <ReportCardShell className="h-full">
      <ReportCardHeaderWithLink
        title="Vehicles Sold"
        linkLabel="View All Deals"
      />
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-2 text-left">Date</th>
              <th className="pb-2 pr-2 text-left">Stock #</th>
              <th className="pb-2 pr-2 text-left">Vehicle</th>
              <th className="pb-2 pr-2 text-left">Customer</th>
              <th className="pb-2 pr-2 text-right">Sale Price</th>
              <th className="pb-2 pr-2 text-right">Gross Profit</th>
              <th className="pb-2 text-right">Commission</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-800/50 last:border-0"
              >
                <td className="py-2 pr-2 text-slate-400 tabular-nums">
                  {formatProfileDate(row.date)}
                </td>
                <td className="py-2 pr-2">
                  <Link
                    href={row.vehicleId ? `/dashboard/vehicles/${row.vehicleId}` : "#"}
                    className="font-medium text-blue-400 hover:text-blue-300"
                  >
                    {row.stockNumber}
                  </Link>
                </td>
                <td className="py-2 pr-2 text-slate-200">{row.vehicle}</td>
                <td className="py-2 pr-2 text-slate-200">{row.customer}</td>
                <td className="py-2 pr-2 text-right text-slate-200 tabular-nums">
                  {formatCurrency(row.salePrice)}
                </td>
                <td className="py-2 pr-2 text-right font-medium text-emerald-400 tabular-nums">
                  {formatCurrency(row.grossProfit)}
                </td>
                <td className="py-2 text-right font-medium text-blue-400 tabular-nums">
                  {formatCurrency(row.commission)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700 bg-slate-800/20">
              <td
                colSpan={4}
                className="py-2.5 pr-2 text-[11px] font-semibold text-slate-300"
              >
                Total ({summary.count})
              </td>
              <td className="py-2.5 pr-2 text-right text-[11px] font-semibold text-white tabular-nums">
                {formatCurrency(summary.totalSalePrice)}
              </td>
              <td className="py-2.5 pr-2 text-right text-[11px] font-semibold text-emerald-400 tabular-nums">
                {formatCurrency(summary.totalGrossProfit)}
              </td>
              <td className="py-2.5 text-right text-[11px] font-semibold text-blue-400 tabular-nums">
                {formatCurrency(summary.totalCommission)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </ReportCardShell>
  );
}
