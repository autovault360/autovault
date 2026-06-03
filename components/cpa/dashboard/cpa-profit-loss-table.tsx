"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CpaProfitLossRow } from "@/lib/cpa/types";

function formatVal(row: CpaProfitLossRow, field: "current" | "previous") {
  const v = row[field];
  if (row.isMargin) return `${v}%`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function CpaProfitLossTable({
  rows,
  monthLabel,
  bare,
}: {
  rows: CpaProfitLossRow[];
  monthLabel: string;
  bare?: boolean;
}) {
  const content = (
    <table className="w-full text-[11px]">
      <thead>
        <tr className="border-b border-slate-800 text-slate-500">
          <th className="py-2 text-left font-medium">Line Item</th>
          <th className="py-2 text-right font-medium">Current</th>
          <th className="py-2 text-right font-medium">Previous</th>
          <th className="py-2 text-right font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-slate-800/50">
            <td className="py-2 text-slate-300">{row.label}</td>
            <td className="py-2 text-right text-white">{formatVal(row, "current")}</td>
            <td className="py-2 text-right text-slate-400">{formatVal(row, "previous")}</td>
            <td className={cn("py-2 text-right font-medium", row.changePct >= 0 ? "text-emerald-400" : "text-red-400")}>
              {row.changePct >= 0 ? "+" : "-"} {Math.abs(row.changePct)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {`MONTHLY PROFIT & LOSS - ${monthLabel}`}
      </h3>
      {content}
    </Card>
  );
}
