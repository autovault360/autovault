"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { enrichTableRows } from "@/lib/profit-loss/filter-pl-data";
import type { PlSection, PlTableRow, ProfitLossReport } from "@/lib/profit-loss/types";
import { formatCurrency } from "@/lib/profit-loss/types";
import ProfitLossTrendBadge from "./profit-loss-trend-badge";

type SortKey = "label" | "thisMonth" | "lastMonth" | "dollarChange" | "percentChange";
type SortDir = "asc" | "desc";

const SECTION_COLORS: Record<PlSection, string> = {
  revenue: "text-emerald-400",
  cogs: "text-red-400",
  gross_profit: "text-purple-400",
  operating_expenses: "text-orange-400",
  net_operating_income: "text-emerald-400",
  taxes: "text-blue-400",
  net_profit: "text-emerald-400",
};

type Props = {
  report: ProfitLossReport;
  search?: string;
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 text-slate-600" />;
  return dir === "asc" ? (
    <ChevronUp className="h-3 w-3 text-slate-400" />
  ) : (
    <ChevronDown className="h-3 w-3 text-slate-400" />
  );
}

export default function ProfitLossBreakdownTable({ report, search = "" }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    const enriched = enrichTableRows(report.statementRows);
    const q = search.trim().toLowerCase();

    let filtered = enriched;
    if (q) {
      const visibleIds = new Set<string>();
      let currentSectionId: string | null = null;
      for (const row of enriched) {
        if (row.kind === "section-header") currentSectionId = row.id;
        if (row.kind === "line-item" && row.label.toLowerCase().includes(q)) {
          if (currentSectionId) visibleIds.add(currentSectionId);
          visibleIds.add(row.id);
        }
      }
      filtered = enriched.filter((row) => {
        if (row.kind === "section-header") return visibleIds.has(row.id);
        if (row.kind === "line-item") return visibleIds.has(row.id);
        return true;
      });
    }

    if (!sortKey) return filtered;

    const sortable = filtered.filter((r) => r.kind === "line-item");
    const nonSortable = filtered.filter((r) => r.kind !== "line-item");

    const sorted = [...sortable].sort((a, b) => {
      let av: string | number = a.label;
      let bv: string | number = b.label;
      if (sortKey === "thisMonth") {
        av = a.thisMonth ?? 0;
        bv = b.thisMonth ?? 0;
      } else if (sortKey === "lastMonth") {
        av = a.lastMonth ?? 0;
        bv = b.lastMonth ?? 0;
      } else if (sortKey === "dollarChange") {
        av = a.dollarChange ?? 0;
        bv = b.dollarChange ?? 0;
      } else if (sortKey === "percentChange") {
        av = a.percentChange ?? 0;
        bv = b.percentChange ?? 0;
      }
      if (typeof av === "string") {
        return sortDir === "asc"
          ? av.localeCompare(String(bv))
          : String(bv).localeCompare(av);
      }
      return sortDir === "asc" ? av - (bv as number) : (bv as number) - av;
    });

    if (sortKey === "label") return sorted.concat(nonSortable);

    const result: typeof filtered = [];
    let si = 0;
    for (const row of filtered) {
      if (row.kind === "line-item") {
        result.push(sorted[si]!);
        si++;
      } else {
        result.push(row);
      }
    }
    return result;
  }, [report.statementRows, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const renderRow = (row: ReturnType<typeof enrichTableRows>[number]) => {
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

    const isTotal = row.kind === "total";
    const isSubtotal = row.kind === "subtotal";
    const isLineItem = row.kind === "line-item";

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
          <div
            className={cn(
              "flex items-center gap-1.5",
              isLineItem && "pl-2",
              (isSubtotal || isTotal) && "font-semibold text-white",
              isLineItem && "text-slate-200",
            )}
          >
            {isLineItem && row.showInfo && (
              <Info className="h-3 w-3 shrink-0 text-slate-500" />
            )}
            <span
              className={cn(
                "text-[11.5px]",
                isTotal && "font-bold text-emerald-400",
                isSubtotal && row.section && SECTION_COLORS[row.section],
              )}
            >
              {row.label}
            </span>
          </div>
        </td>
        <td className="px-3 py-2 text-right text-[11.5px] tabular-nums text-slate-200">
          {row.thisMonth !== null ? formatCurrency(row.thisMonth) : ""}
        </td>
        <td className="px-3 py-2 text-right text-[11.5px] tabular-nums text-slate-400">
          {row.lastMonth !== null ? formatCurrency(row.lastMonth) : ""}
        </td>
        <td
          className={cn(
            "px-3 py-2 text-right text-[11.5px] tabular-nums",
            row.changePositive === true && "text-emerald-400",
            row.changePositive === false && "text-red-400",
            row.changePositive === null && "text-slate-400",
          )}
        >
          {row.dollarChangeFormatted}
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end gap-1">
            {row.percentChange !== null && row.percentChangeFormatted !== "-" ? (
              <ProfitLossTrendBadge
                value={row.percentChangeFormatted}
                sentiment={
                  row.changePositive === false
                    ? "negative"
                    : row.changePositive === true
                      ? "positive"
                      : "neutral"
                }
                direction={
                  (row.percentChange ?? 0) >= 0 ? "up" : "down"
                }
              />
            ) : (
              <span className="text-[11.5px] text-slate-500">-</span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <Card className="overflow-hidden rounded-sm py-0! border border-slate-700 bg-card shadow-none">
      <div className="overflow-auto">
        <table className="w-full min-w-[520px]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-slate-800">
              {(
                [
                  ["label", "Category", "text-left"],
                  ["thisMonth", report.period.columnLabel, "text-right"],
                  ["lastMonth", report.comparisonPeriod.columnLabel, "text-right"],
                  ["dollarChange", "$ Change", "text-right"],
                  ["percentChange", "% Change", "text-right"],
                ] as const
              ).map(([key, label, align]) => (
                <th
                  key={key}
                  className={cn(
                    "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500",
                    align,
                    "cursor-pointer select-none hover:text-slate-300",
                  )}
                  onClick={() => toggleSort(key as SortKey)}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    <SortIcon active={sortKey === key} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows.map(renderRow)}</tbody>
        </table>
      </div>
    </Card>
  );
}

export type { PlTableRow };
