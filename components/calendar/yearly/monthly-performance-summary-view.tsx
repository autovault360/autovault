"use client";

import { Check, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/profit-loss/types";
import { formatMonthYear, formatShortDate } from "@/lib/calendar/format-utils";
import type { MonthlyPerformanceSummary } from "@/lib/calendar/types";
import { CalendarCardShell, CalendarCardHead } from "../calendar-card-primitives";
import { toast } from "sonner";

type Props = {
  summary: MonthlyPerformanceSummary;
  onClose: () => void;
};

export default function MonthlyPerformanceSummaryView({ summary, onClose }: Props) {
  const handleDownload = () => {
    toast.success(`${formatMonthYear(summary.monthId)} report exported`);
  };

  const miniMetrics = [
    { label: "Units Sold", value: String(summary.unitsSold) },
    { label: "Units Bought", value: String(summary.unitsBought) },
    { label: "Total Gross", value: formatCurrency(summary.totalGross) },
    { label: "Gross Profit", value: formatCurrency(summary.grossProfit) },
    { label: "Commissions Paid", value: formatCurrency(summary.totalCommissions) },
    { label: "Total Expenses", value: formatCurrency(summary.totalExpenses) },
    { label: "Net Profit", value: formatCurrency(summary.netProfit) },
  ];

  return (
    <CalendarCardShell className="mb-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white">
          {formatMonthYear(summary.monthId)}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1.5 border-slate-700 bg-transparent text-[11px] text-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {miniMetrics.map((m) => (
          <div
            key={m.label}
            className="rounded border border-slate-800 bg-slate-900/30 p-2 text-center"
          >
            <div className="text-[9px] text-slate-500">{m.label}</div>
            <div className="text-[12px] font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-3.5 grid gap-3.5 lg:grid-cols-5">
        <ScorecardTable title="Overview" rows={summary.overviewLines} />
        <ScorecardTable
          title="Sales by Sales Rep"
          headers={["Rep", "Units", "Gross", "Comm."]}
          customRows={summary.salesByRep.map((r) => [
            r.repName,
            String(r.unitsSold),
            formatCurrency(r.grossProfit),
            formatCurrency(r.commissions),
          ])}
        />
        <ScorecardTable
          title="Vehicle Activity"
          headers={["Category", "Count", "Amount"]}
          customRows={summary.vehicleActivity.map((v) => [
            v.category,
            String(v.count),
            formatCurrency(v.amount),
          ])}
        />
        <div>
          <CalendarCardHead title="Top Sold Vehicles" />
          <div className="space-y-2">
            {summary.topVehicles.map((v) => (
              <div key={v.vehicleId} className="flex items-center gap-2">
                <img
                  src={v.imageUrl}
                  alt=""
                  className="h-8 w-10 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10.5px] text-slate-300">
                    {v.makeModel}
                  </div>
                  <div className="text-[9.5px] text-slate-500">
                    {v.unitsSold} units | {formatCurrency(v.grossProfit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ScorecardTable title="Important Totals" rows={summary.importantTotals} />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-3">
        <div>
          <CalendarCardHead title="Recent Sold Vehicles" />
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-1 text-left font-medium">Date</th>
                  <th className="pb-1 text-left font-medium">Stock #</th>
                  <th className="pb-1 text-left font-medium">Vehicle</th>
                  <th className="pb-1 text-left font-medium">Customer</th>
                  <th className="pb-1 text-left font-medium">Rep</th>
                  <th className="pb-1 text-right font-medium">Profit</th>
                  <th className="pb-1 text-right font-medium">Comm.</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentSold.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800/60">
                    <td className="py-1 text-slate-400">
                      {formatShortDate(row.date)}
                    </td>
                    <td className="py-1 text-blue-400">{row.stockNumber}</td>
                    <td className="max-w-[100px] truncate py-1 text-slate-300">
                      {row.vehicle}
                    </td>
                    <td className="max-w-[80px] truncate py-1 text-slate-400">
                      {row.customer}
                    </td>
                    <td className="py-1 text-slate-400">{row.salesRep}</td>
                    <td className="py-1 text-right text-emerald-400">
                      {formatCurrency(row.profit)}
                    </td>
                    <td className="py-1 text-right text-purple-400">
                      {formatCurrency(row.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <CalendarCardHead title="Recent Purchased Vehicles" />
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-1 text-left font-medium">Date</th>
                  <th className="pb-1 text-left font-medium">Stock #</th>
                  <th className="pb-1 text-left font-medium">Vehicle</th>
                  <th className="pb-1 text-right font-medium">Cost</th>
                  <th className="pb-1 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentPurchased.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800/60">
                    <td className="py-1 text-slate-400">
                      {formatShortDate(row.date)}
                    </td>
                    <td className="py-1 text-blue-400">{row.stockNumber}</td>
                    <td className="max-w-[120px] truncate py-1 text-slate-300">
                      {row.vehicle}
                    </td>
                    <td className="py-1 text-right text-slate-300">
                      {formatCurrency(row.cost)}
                    </td>
                    <td className="py-1 text-right">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-medium",
                          row.status === "In Stock"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <CalendarCardHead title="Notes & Highlights" />
          <ul className="space-y-2">
            {summary.notes.map((note, i) => (
              <li key={i} className="flex gap-2 text-[11px] text-slate-400">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CalendarCardShell>
  );
}

function ScorecardTable({
  title,
  rows,
  headers,
  customRows,
}: {
  title: string;
  rows?: Array<{ label: string; value: string }>;
  headers?: string[];
  customRows?: string[][];
}) {
  return (
    <div>
      <CalendarCardHead title={title} />
      {rows ? (
        <div className="space-y-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-2 text-[10.5px]"
            >
              <span className="text-slate-500">{row.label}</span>
              <span className="font-medium text-slate-200">{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-[10px]">
          {headers && (
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                {headers.map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "pb-1 font-medium",
                      h === "Amount" || h === "Gross" || h === "Comm."
                        ? "text-right"
                        : "text-left",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {customRows?.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/60">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "py-1",
                      j > 0 ? "text-right text-slate-300" : "text-slate-400",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
