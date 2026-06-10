"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { PanelPreview } from "@/components/dashboard/PanelPreview";
import { DealStatusFilter } from "./deal-status-filter";
import { fetchFilteredDeals } from "./actions";
import type { RecentDeal } from "@/services/deal-jacket.service";

function formatCurrencyStr(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

const statusStyle: Record<string, string> = {
  Sold: "bg-emerald-500/15 text-emerald-400",
  Delivered: "bg-blue-500/15 text-blue-400",
  "In Progress": "bg-amber-500/15 text-amber-400",
};

function DealRow({ r }: { r: readonly [string, string, string, string, string, string, string] }) {
  return (
    <tr className="border-b border-slate-800/60 last:border-0">
      <td className="px-1.5 py-2 text-slate-300">{r[0]}</td>
      <td className="px-1.5 py-2 text-slate-200">{r[1]}</td>
      <td className="px-1.5 py-2 text-slate-300">{r[2]}</td>
      <td className="px-1.5 py-2">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-semibold",
            statusStyle[r[3]] || "bg-slate-500/15 text-slate-400",
          )}
        >
          {r[3]}
        </span>
      </td>
      <td className="px-1.5 py-2 text-slate-300">{r[4]}</td>
      <td className="px-1.5 py-2 text-emerald-400">{r[5]}</td>
      <td className="px-1.5 py-2 text-slate-400">{r[6]}</td>
    </tr>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-800/60 last:border-0">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-1.5 py-2">
              <div className="h-3 animate-pulse rounded bg-slate-700/60" style={{ width: `${50 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function RecentDealActivityPanel({
  initialDeals,
  currentFilter,
}: {
  initialDeals: RecentDeal[];
  currentFilter?: string;
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState(currentFilter ?? "all");

  const handleFilterChange = useCallback(async (value: string) => {
    setActiveFilter(value);
    setLoading(true);

    const filtered = await fetchFilteredDeals(value === "all" ? undefined : value);
    setDeals(filtered);
    setLoading(false);
  }, []);

  const dealRows = deals.map((d) =>
    [d.jacketNumber, d.customerName, d.vehicleTitle, d.status, formatCurrencyStr(d.salesPrice), formatCurrencyStr(d.profit), d.dateSold] as const
  );

  const compactCard = (
    <CardShell>
      <div className="flex items-center justify-between pr-1">
        <CardHead title="RECENT DEAL ACTIVITY" pill="This Month" />
        <DealStatusFilter current={activeFilter} onChange={handleFilterChange} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-[11.5px]">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-800">
              {["Deal #", "Customer", "Vehicle", "Status", "Sales Price", "Profit", "Date"].map((h) => (
                <th key={h} className="px-1.5 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <SkeletonRows /> : dealRows.map((r) => <DealRow key={r[0]} r={r} />)}
          </tbody>
        </table>
      </div>
    </CardShell>
  );

  return <PanelPreview title="Recent Deal Activity" expanded={<ExpandedDealActivity deals={deals} activeFilter={activeFilter} onFilterChange={handleFilterChange} />}>{compactCard}</PanelPreview>;
}

function ExpandedDealActivity({
  deals,
  activeFilter,
  onFilterChange,
}: {
  deals: RecentDeal[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
}) {
  const dealRows = deals.map((d) =>
    [d.jacketNumber, d.customerName, d.vehicleTitle, d.status, formatCurrencyStr(d.salesPrice), formatCurrencyStr(d.profit), d.dateSold] as const
  );
  const totalSales = dealRows.reduce((s, r) => s + parseInt(String(r[4]).replace(/[$,]/g, "")) || 0, 0);
  const totalProfit = dealRows.reduce((s, r) => s + parseInt(String(r[5]).replace(/[$,]/g, "")) || 0, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Recent Deal Activity</h2>
          <p className="mt-0.5 text-sm text-slate-500">Complete deal pipeline with sales performance, margins, and transaction history.</p>
        </div>
        <DealStatusFilter current={activeFilter} onChange={onFilterChange} />
      </div>
      <div className="flex gap-4">
        <div className="rounded-lg border border-slate-700 bg-card px-4 py-3">
          <div className="text-xs text-slate-500">Total Deals</div>
          <div className="text-xl font-bold text-white">{deals.length}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-card px-4 py-3">
          <div className="text-xs text-slate-500">Total Sales</div>
          <div className="text-xl font-bold text-emerald-400">${totalSales.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-card px-4 py-3">
          <div className="text-xs text-slate-500">Total Profit</div>
          <div className="text-xl font-bold text-emerald-400">${totalProfit.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-card px-4 py-3">
          <div className="text-xs text-slate-500">Avg Profit/Deal</div>
          <div className="text-xl font-bold text-blue-400">${deals.length > 0 ? Math.round(totalProfit / deals.length).toLocaleString() : "0"}</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              {["Deal #", "Customer", "Vehicle", "Status", "Sales Price", "Profit", "Margin", "Date"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealRows.map((r) => {
              const price = parseInt(String(r[4]).replace(/[$,]/g, "")) || 0;
              const profit = parseInt(String(r[5]).replace(/[$,]/g, "")) || 0;
              const margin = price ? ((profit / price) * 100).toFixed(1) : "0";
              return (
                <tr key={r[0]} className="border-b border-slate-800/60">
                  <td className="px-3 py-2.5 text-slate-300">{r[0]}</td>
                  <td className="px-3 py-2.5 text-slate-200">{r[1]}</td>
                  <td className="px-3 py-2.5 text-slate-300">{r[2]}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", statusStyle[r[3]] || "bg-slate-500/15 text-slate-400")}>{r[3]}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{r[4]}</td>
                  <td className="px-3 py-2.5 text-emerald-400">{r[5]}</td>
                  <td className="px-3 py-2.5 text-slate-400">{margin}%</td>
                  <td className="px-3 py-2.5 text-slate-500">{r[6]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
