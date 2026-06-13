"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import { getInitials } from "@/lib/calendar/format-utils";
import { cn } from "@/lib/utils";
import SalesRepRankCell from "@/components/sales-reps/sales-rep-rank-cell";
import type { AdminSalesRepTableRow } from "@/lib/dashboard/admin/types";
import DashboardExpandableShell from "./dashboard-expandable-shell";
import { ADMIN_PANEL_INNER_CLASS, ADMIN_PANEL_SHELL_CLASS } from "./admin-panel-styles";

function formatCompact(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

function SalesRepSkeleton() {
  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex h-full animate-pulse flex-col gap-1.5 rounded-sm border border-slate-800/50 bg-card p-3 shadow-none"
        >
          <div className="flex items-start gap-2.5">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800/80" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded-md bg-slate-800/80" />
              <div className="h-5 w-20 rounded-md bg-slate-800/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SalesRepSection() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    periodLabel: string;
    kpiCards: KPICardData[];
    tableRows: AdminSalesRepTableRow[];
  } | null>(null);

  const loadData = useCallback(async () => {
    if (data || loading) return;
    setLoading(true);
    try {
      const { getSalesRepSectionData } = await import(
        "@/lib/dashboard/server/get-sales-rep-section-data"
      );
      const result = await getSalesRepSectionData();
      setData(result);
    } catch {
      setData({
        periodLabel: "",
        kpiCards: [],
        tableRows: [],
      });
    } finally {
      setLoading(false);
    }
  }, [data, loading]);

  const handleToggle = useCallback(
    (next: boolean) => {
      setExpanded(next);
      if (next) loadData();
    },
    [loadData],
  );

  const chartRows = (data?.tableRows ?? []).slice(0, 6).map((row) => ({
    initials: getInitials(row.name),
    unitsSold: row.carsSold,
    grossProfit: row.grossProfit,
    grossLabel: formatCompact(row.grossProfit),
  }));

  return (
    <DashboardExpandableShell
      sectionNumber={3}
      title="SALES REP PERFORMANCE"
      subtitle="Track performance and commissions for your sales team."
      defaultExpanded={false}
      onToggle={handleToggle}
    >
      {loading ? (
        <SalesRepSkeleton />
      ) : data ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] text-slate-500">
              SALES REPRESENTATIVE PERFORMANCE
            </p>
            <span className="text-[11px] text-slate-400">{data.periodLabel}</span>
          </div>

          <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
            {data.kpiCards.map((card) => (
              <KPICard
                key={card.label}
                data={card}
                showSparkline={false}
                showLink={false}
                valueClassName={
                  card.label === "Pending Commission"
                    ? "text-amber-400"
                    : card.label.includes("Commission") || card.label.includes("Gross")
                      ? "text-emerald-400"
                      : undefined
                }
                className={ADMIN_PANEL_SHELL_CLASS}
              />
            ))}
          </div>

          <div className="grid gap-3.5 xl:grid-cols-[1fr_320px]">
            <div className="overflow-x-auto rounded-sm border border-slate-800/60">
              <table className="w-full min-w-[640px] text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-card text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-2.5 py-2.5 text-left">Rank</th>
                    <th className="px-2.5 py-2.5 text-left">Sales Rep</th>
                    <th className="px-2.5 py-2.5 text-right">Cars Sold</th>
                    <th className="px-2.5 py-2.5 text-right">Gross Profit</th>
                    <th className="px-2.5 py-2.5 text-right">Commission</th>
                    <th className="px-2.5 py-2.5 text-right">Pending</th>
                    <th className="px-2.5 py-2.5 text-right">Payroll Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800/50 transition-colors last:border-0 hover:bg-slate-800/25"
                    >
                      <td className="px-2.5 py-2.5">
                        <SalesRepRankCell rank={row.rank} />
                      </td>
                      <td className="px-2.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            {row.imageUrl ? (
                              <AvatarImage src={row.imageUrl} alt={row.name} />
                            ) : null}
                            <AvatarFallback className="text-[9px]">
                              {getInitials(row.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-200">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-200">
                        {row.carsSold}
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-200">
                        {formatCurrency(row.grossProfit)}
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-emerald-400">
                        {formatCurrency(row.commissionEarned)}
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-amber-400">
                        {formatCurrency(row.pendingCommission)}
                      </td>
                      <td className="px-2.5 py-2.5 text-right">
                        <Badge
                          className={
                            row.payrollStatus === "Paid"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/15 text-amber-400"
                          }
                        >
                          {row.payrollStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                <div className="mb-2 text-[10px] font-bold tracking-wide text-slate-500">
                  UNITS SOLD
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="initials"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "#0a101d",
                          border: "1px solid #1e293b",
                          borderRadius: 6,
                          fontSize: 11,
                        }}
                      />
                      <Bar
                        dataKey="unitsSold"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                        label={{
                          position: "top",
                          fill: "#94a3b8",
                          fontSize: 10,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={cn("rounded-sm p-3", ADMIN_PANEL_INNER_CLASS)}>
                <div className="mb-2 text-[10px] font-bold tracking-wide text-slate-500">
                  GROSS PROFIT GENERATED
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="initials"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "#0a101d",
                          border: "1px solid #1e293b",
                          borderRadius: 6,
                          fontSize: 11,
                        }}
                        formatter={(v) => [formatCurrency(Number(v)), "Gross Profit"]}
                      />
                      <Bar
                        dataKey="grossLabel"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        label={{
                          position: "top",
                          fill: "#94a3b8",
                          fontSize: 10,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-right">
            <Link
              href="/dashboard/sales-reps"
              className="text-[11px] text-blue-400 hover:underline"
            >
              View all sales reps
            </Link>
          </div>
        </>
      ) : null}
    </DashboardExpandableShell>
  );
}
