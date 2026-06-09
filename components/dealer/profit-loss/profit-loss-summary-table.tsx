"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import {
  computeRowChange,
  formatPercentValue,
  type DealerPlPeriod,
  type DealerPlSection,
  type DealerPlTableRow,
} from "@/lib/dealer/profit-loss/types";

const SECTION_COLORS: Record<DealerPlSection, string> = {
  income: "text-emerald-400",
  cogs: "text-orange-400",
  gross_profit: "text-emerald-400",
  operating_expenses: "text-red-400",
  net_profit: "text-emerald-400",
};

type Props = {
  rows: DealerPlTableRow[];
  period: DealerPlPeriod;
};

function formatCellValue(value: number | null, isPercent?: boolean): string {
  if (value === null) return "";
  if (isPercent) return formatPercentValue(value);
  return formatCurrency(value);
}

function ChangeCell({
  thisMonth,
  lastMonth,
  isPercent,
  invertSentiment,
}: {
  thisMonth: number | null;
  lastMonth: number | null;
  isPercent?: boolean;
  invertSentiment?: boolean;
}) {
  const change = computeRowChange(thisMonth, lastMonth);
  if (change.changePositive === null) {
    return <span className="text-[11.5px] text-slate-500">-</span>;
  }

  let positive = change.changePositive;
  if (invertSentiment) positive = !positive;

  return (
    <span
      className={cn(
        "text-[11.5px] tabular-nums",
        positive ? "text-emerald-400" : "text-red-400",
      )}
    >
      {isPercent ? change.percentFormatted : change.dollarFormatted}
    </span>
  );
}

export default function ProfitLossSummaryTable({ rows, period }: Props) {
  return (
    <Card className="overflow-hidden rounded-sm border border-slate-700 bg-transparent py-0! shadow-none">
      <div className="border-b border-slate-800 px-3.5 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Profit & Loss Summary
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead className="sticky top-0 z-10 bg-[#0a101c]">
            <tr className="border-b border-slate-800">
              {[
                ["Category", "text-left"],
                [period.columnLabel, "text-right"],
                [period.comparisonColumnLabel, "text-right"],
                ["Change", "text-right"],
                ["% Change", "text-right"],
              ].map(([label, align]) => (
                <th
                  key={label}
                  className={cn(
                    "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500",
                    align,
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.kind === "section-header") {
                return (
                  <tr key={row.id} className="border-b border-slate-800/60">
                    <td
                      colSpan={5}
                      className={cn(
                        "px-3 py-2 text-[10px] font-bold tracking-[0.1em]",
                        row.section ? SECTION_COLORS[row.section] : "text-slate-400",
                      )}
                    >
                      {row.label}
                    </td>
                  </tr>
                );
              }

              const isLineItem = row.kind === "line-item";
              const isSubtotal = row.kind === "subtotal";
              const isTotal = row.kind === "total";
              const isMetric = row.kind === "metric";
              const change = computeRowChange(row.thisMonth, row.lastMonth);
              const invertSentiment = row.section === "operating_expenses" || row.section === "cogs";

              let percentPositive = change.changePositive;
              if (invertSentiment && percentPositive !== null) {
                percentPositive = !percentPositive;
              }

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-slate-800/40 transition-colors hover:bg-slate-800/20",
                    isSubtotal && "border-t border-slate-700/80",
                    isTotal && "bg-emerald-500/5",
                  )}
                >
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "text-[11.5px]",
                        isLineItem && "pl-2 text-slate-200",
                        (isSubtotal || isTotal || isMetric) && "font-semibold",
                        isSubtotal && row.section && SECTION_COLORS[row.section],
                        isTotal && "font-bold text-emerald-400",
                        isMetric && "text-emerald-400",
                      )}
                    >
                      {row.label}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right text-[11.5px] tabular-nums",
                      isTotal || isMetric ? "font-bold text-emerald-400" : "text-slate-200",
                      isSubtotal && row.section && SECTION_COLORS[row.section],
                    )}
                  >
                    {formatCellValue(row.thisMonth, row.isPercent)}
                  </td>
                  <td className="px-3 py-2 text-right text-[11.5px] tabular-nums text-slate-400">
                    {formatCellValue(row.lastMonth, row.isPercent)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ChangeCell
                      thisMonth={row.thisMonth}
                      lastMonth={row.lastMonth}
                      isPercent={row.isPercent}
                      invertSentiment={invertSentiment}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {change.percentFormatted !== "-" ? (
                      <span
                        className={cn(
                          "text-[11.5px] tabular-nums",
                          percentPositive === true && "text-emerald-400",
                          percentPositive === false && "text-red-400",
                          percentPositive === null && "text-slate-500",
                        )}
                      >
                        {change.percentFormatted}
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
