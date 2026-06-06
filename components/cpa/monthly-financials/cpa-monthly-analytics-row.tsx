"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import type { CpaMonthlyFinancialsData } from "@/lib/cpa/types";
import { formatMoney } from "./utils";

function ExpenseDonut({
  categories,
  total,
}: {
  categories: CpaMonthlyFinancialsData["expenseBreakdown"]["categories"];
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              dataKey="amount"
              nameKey="label"
              stroke="none"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {categories.map((c, i) => (
                <Cell
                  key={c.label}
                  fill={c.color}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0e1626",
                border: "1px solid #1f2937",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => formatMoney(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-white tabular-nums">{formatMoney(total)}</div>
          <div className="text-[9px] text-slate-500">Total</div>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {categories.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-[10.5px]">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: c.color }}
            />
            <span className="flex-1 text-slate-300">{c.label}</span>
            <span className="text-slate-400 tabular-nums">{formatMoney(c.amount)}</span>
            <span className="w-10 text-right font-medium text-white tabular-nums">{c.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CpaMonthlyAnalyticsRow({
  data,
}: {
  data: CpaMonthlyFinancialsData;
}) {
  const pl = data.profitLossSummary;
  const pc = data.payrollCommissions;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-4">
      <CardShell>
        <CardHead title="EXPENSE BREAKDOWN" pill={data.selectedMonth} />
        <ExpenseDonut
          categories={data.expenseBreakdown.categories}
          total={data.expenseBreakdown.total}
        />
      </CardShell>

      <CardShell>
        <CardHead title="PROFIT & LOSS SUMMARY" pill={data.selectedMonth} />
        <ul className="space-y-2 text-[11px]">
          {[
            { label: "Total Revenue", value: formatMoney(pl.totalRevenue), cls: "text-white" },
            { label: "Cost of Goods Sold", value: formatMoney(pl.cogs), cls: "text-slate-300" },
            { label: "Gross Profit", value: formatMoney(pl.grossProfit), cls: "text-emerald-400" },
            { label: "Total Expenses", value: formatMoney(pl.totalExpenses), cls: "text-red-400" },
            { label: "Net Profit", value: formatMoney(pl.netProfit), cls: "text-emerald-400" },
            { label: "Other Income", value: formatMoney(pl.otherIncome), cls: "text-slate-300" },
          ].map((row) => (
            <li key={row.label} className="flex justify-between">
              <span className="text-slate-500">{row.label}</span>
              <span className={row.cls}>{row.value}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-slate-800 pt-2 font-semibold">
            <span className="text-slate-400">Profit Margin</span>
            <span className="text-white">{pl.profitMargin}%</span>
          </li>
        </ul>
      </CardShell>

      <CardShell>
        <CardHead title={`TOP SALES REPS (${data.selectedMonth.toUpperCase()})`} />
        <ul className="space-y-3">
          {data.topSalesReps.length === 0 ? (
            <li className="text-[11px] text-slate-500">No sales rep data for this period.</li>
          ) : (
            data.topSalesReps.map((rep, i) => (
              <li key={rep.id} className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-700 text-[10px] text-white">
                    {rep.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-white">
                    {i + 1}. {rep.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {`${rep.unitsSold} Units - ${formatMoney(rep.grossProfit)} Gross - ${formatMoney(rep.commissions)} Commissions`}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardShell>

      <CardShell>
        <CardHead title="PAYROLL & COMMISSIONS" pill={data.selectedMonth} />
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500">
              PAYROLL SUMMARY
            </p>
            <ul className="space-y-1.5 text-[11px]">
              {[
                { label: "Total Payroll", value: formatMoney(pc.payroll.totalPayroll) },
                { label: "Employees Paid", value: String(pc.payroll.employeesPaid) },
                { label: "Payroll Taxes", value: formatMoney(pc.payroll.payrollTaxes) },
                { label: "Benefits", value: formatMoney(pc.payroll.benefits) },
                { label: "Bonuses", value: formatMoney(pc.payroll.bonuses) },
              ].map((r) => (
                <li key={r.label} className="flex justify-between">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="text-white tabular-nums">{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500">
              COMMISSION SUMMARY
            </p>
            <ul className="space-y-1.5 text-[11px]">
              {[
                { label: "Total Commissions", value: formatMoney(pc.commissions.totalCommissions) },
                { label: "Sales Commissions", value: formatMoney(pc.commissions.salesCommissions) },
                { label: "Finance Commissions", value: formatMoney(pc.commissions.financeCommissions) },
                { label: "Other Commissions", value: formatMoney(pc.commissions.otherCommissions) },
              ].map((r) => (
                <li key={r.label} className="flex justify-between">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="text-white tabular-nums">{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardShell>
    </div>
  );
}
