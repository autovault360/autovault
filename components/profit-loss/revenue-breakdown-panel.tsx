"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CategoryAmount } from "@/lib/profit-loss/types";
import { formatCurrency, formatPercent } from "@/lib/profit-loss/types";
import ProfitLossTrendBadge from "./profit-loss-trend-badge";

type Props = {
  items: CategoryAmount[];
  title: string;
};

export default function RevenueBreakdownPanel({ items, title }: Props) {
  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Card className="overflow-hidden rounded-sm py-0! border border-slate-700 bg-card shadow-none">
      <div className="border-b border-slate-800 px-3.5 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400">
          {title}
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {["Category", "This Period", "Last Period", "% of Total", "Change"].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 last:text-right"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const delta =
              item.lastMonth === 0
                ? 0
                : ((item.amount - item.lastMonth) / item.lastMonth) * 100;
            return (
              <tr
                key={item.id}
                className="border-b border-slate-800/40 hover:bg-slate-800/20"
              >
                <td className="px-3 py-2.5 text-[11.5px] text-slate-200">
                  {item.label}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-slate-200">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-slate-400">
                  {formatCurrency(item.lastMonth)}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-slate-300">
                  {formatPercent(item.percentOfTotal)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <ProfitLossTrendBadge
                    value={`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
                    sentiment={delta >= 0 ? "positive" : "negative"}
                    direction={delta >= 0 ? "up" : "down"}
                  />
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-slate-700 bg-slate-800/20">
            <td className="px-3 py-2.5 text-[11.5px] font-semibold text-white">
              Total
            </td>
            <td className="px-3 py-2.5 text-[11.5px] font-semibold tabular-nums text-white">
              {formatCurrency(total)}
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

export function ExpenseBreakdownPanel({ items, title }: Props) {
  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Card className="overflow-hidden rounded-sm py-0! border border-slate-700 bg-card shadow-none">
      <div className="border-b border-slate-800 px-3.5 py-3">
        <h3
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.14em] text-orange-400",
          )}
        >
          {title}
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {["Category", "This Period", "Last Period", "% of Total", "Change"].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 last:text-right"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const delta =
              item.lastMonth === 0
                ? 0
                : ((item.amount - item.lastMonth) / item.lastMonth) * 100;
            return (
              <tr
                key={item.id}
                className="border-b border-slate-800/40 hover:bg-slate-800/20"
              >
                <td className="px-3 py-2.5 text-[11.5px] text-slate-200">
                  {item.label}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-slate-200">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-slate-400">
                  {formatCurrency(item.lastMonth)}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-slate-300">
                  {formatPercent(item.percentOfTotal)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <ProfitLossTrendBadge
                    value={`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
                    sentiment={delta >= 0 ? "negative" : "positive"}
                    direction={delta >= 0 ? "up" : "down"}
                  />
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-slate-700 bg-slate-800/20">
            <td className="px-3 py-2.5 text-[11.5px] font-semibold text-white">
              Total
            </td>
            <td className="px-3 py-2.5 text-[11.5px] font-semibold tabular-nums text-white">
              {formatCurrency(total)}
            </td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
