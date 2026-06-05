"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import type { CpaMonthlyFinancialsData } from "@/lib/cpa/types";
import { formatMoney } from "./utils";

export default function CpaMonthlyTransactionGrid({
  data,
  loading,
}: {
  data: CpaMonthlyFinancialsData;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr_0.7fr]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg border border-slate-700 bg-[#0e1626]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr_0.7fr]">
      {/* Vehicles Sold */}
      <CardShell>
        <CardHead title={`VEHICLES SOLD (${data.vehiclesSold.totalCount})`} pill={data.selectedMonth} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="px-1.5 py-2 text-left font-medium">Date</th>
                <th className="px-1.5 py-2 text-left font-medium">Stock #</th>
                <th className="px-1.5 py-2 text-left font-medium">Vehicle</th>
                <th className="px-1.5 py-2 text-left font-medium">Customer</th>
                <th className="px-1.5 py-2 text-right font-medium">Sale Price</th>
                <th className="px-1.5 py-2 text-right font-medium">COGS</th>
                <th className="px-1.5 py-2 text-right font-medium">Gross Profit</th>
                <th className="px-1.5 py-2 text-left font-medium">Sales Rep</th>
              </tr>
            </thead>
            <tbody>
              {data.vehiclesSold.data.map((v) => (
                <tr key={v.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="px-1.5 py-2 text-slate-400">{v.date}</td>
                  <td className="px-1.5 py-2">
                    <span className="text-blue-400">{v.stockId}</span>
                  </td>
                  <td className="px-1.5 py-2 text-slate-300">{v.vehicle}</td>
                  <td className="px-1.5 py-2 text-slate-300">{v.customer}</td>
                  <td className="px-1.5 py-2 text-right text-white tabular-nums">
                    {formatMoney(v.salePrice)}
                  </td>
                  <td className="px-1.5 py-2 text-right text-slate-300 tabular-nums">
                    {formatMoney(v.cogs)}
                  </td>
                  <td className="px-1.5 py-2 text-right text-emerald-400 tabular-nums">
                    {formatMoney(v.grossProfit)}
                  </td>
                  <td className="px-1.5 py-2 text-slate-300">{v.salesRep}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-700 font-semibold">
                <td colSpan={4} className="px-1.5 py-2 text-slate-400">
                  {`Total (${data.vehiclesSold.totalCount})`}
                </td>
                <td className="px-1.5 py-2 text-right text-white tabular-nums">
                  {formatMoney(data.vehiclesSold.totals.salePrice)}
                </td>
                <td className="px-1.5 py-2 text-right text-slate-300 tabular-nums">
                  {formatMoney(data.vehiclesSold.totals.cogs)}
                </td>
                <td className="px-1.5 py-2 text-right text-emerald-400 tabular-nums">
                  {formatMoney(data.vehiclesSold.totals.grossProfit)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardShell>

      {/* Vehicles Purchased */}
      <CardShell>
        <CardHead title={`VEHICLES PURCHASED (${data.vehiclesPurchased.totalCount})`} pill={data.selectedMonth} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="px-1.5 py-2 text-left font-medium">Date</th>
                <th className="px-1.5 py-2 text-left font-medium">Stock #</th>
                <th className="px-1.5 py-2 text-left font-medium">Vehicle</th>
                <th className="px-1.5 py-2 text-right font-medium">Purchase Price</th>
                <th className="px-1.5 py-2 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.vehiclesPurchased.data.map((v) => (
                <tr key={v.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="px-1.5 py-2 text-slate-400">{v.date}</td>
                  <td className="px-1.5 py-2 text-blue-400">{v.stockId}</td>
                  <td className="px-1.5 py-2 text-slate-300">{v.vehicle}</td>
                  <td className="px-1.5 py-2 text-right text-white tabular-nums">
                    {formatMoney(v.purchasePrice)}
                  </td>
                  <td className="px-1.5 py-2 text-right text-slate-300 tabular-nums">
                    {formatMoney(v.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-700 font-semibold">
                <td colSpan={3} className="px-1.5 py-2 text-slate-400">
                  {`Total (${data.vehiclesPurchased.totalCount})`}
                </td>
                <td className="px-1.5 py-2 text-right text-white tabular-nums">
                  {formatMoney(data.vehiclesPurchased.totals.purchasePrice)}
                </td>
                <td className="px-1.5 py-2 text-right text-slate-300 tabular-nums">
                  {formatMoney(data.vehiclesPurchased.totals.cost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardShell>

      {/* Sales Tax / CDTFA */}
      <CardShell>
        <CardHead title="SALES TAX / CDTFA CENTER" pill={data.selectedMonth} />
        <ul className="space-y-2.5 text-[11px]">
          <li className="flex justify-between">
            <span className="text-slate-500">Taxable Sales</span>
            <span className="text-white tabular-nums">{formatMoney(data.salesTax.taxableSales)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-500">Sales Tax Collected</span>
            <span className="text-white tabular-nums">{formatMoney(data.salesTax.taxCollected)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-500">Sales Tax Paid</span>
            <span className="text-white tabular-nums">{formatMoney(data.salesTax.taxPaymentsMade)}</span>
          </li>
          <li className="flex justify-between rounded-md bg-red-500/10 px-2 py-1.5">
            <span className="text-red-300">Sales Tax Owed</span>
            <span className="font-semibold text-red-400 tabular-nums">
              {formatMoney(data.salesTax.salesTaxOwed)}
            </span>
          </li>
          <li className="flex justify-between pt-1">
            <span className="text-slate-500">Filing Due Date</span>
            <span className="text-white">{data.salesTax.dueDate}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-500">Filing Frequency</span>
            <span className="text-white">{data.salesTax.filingFrequency}</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="text-slate-500">Status</span>
            <Badge
              className={
                data.salesTax.status === "DUE SOON"
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                  : data.salesTax.status === "OVERDUE"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/20"
                    : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              }
            >
              {data.salesTax.status}
            </Badge>
          </li>
        </ul>
        <div className="mt-4 text-center">
          <Link
            href="/cpa/sales-tax"
            className="text-[11px] text-blue-400 hover:underline"
          >
            View CDTFA Report
          </Link>
        </div>
      </CardShell>
    </div>
  );
}
