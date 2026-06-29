"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import type {
  CpaDepartmentCompensation,
  CpaPayrollBreakdownSegment,
  CpaPayrollTrendPoint,
} from "@/lib/cpa/payroll-commissions/types";
import { formatMoney } from "@/lib/cpa/payroll-commissions/mock-data";
import { cn } from "@/lib/utils";

const CHART_CARD_CLASS =
  "flex h-full flex-col rounded-lg border-slate-700/80 bg-card p-4 shadow-none";

const Y_AXIS_TICKS = [0, 20_000, 40_000, 60_000, 80_000, 100_000, 120_000];

function formatAxisMoney(value: number): string {
  if (value === 0) return "$0";
  return `$${Math.round(value / 1000)}K`;
}

function PayrollBreakdownPanel({
  segments,
  total,
}: {
  segments: CpaPayrollBreakdownSegment[];
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="PAYROLL BREAKDOWN" />
      <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-[148px] w-[148px] shrink-0 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                dataKey="amount"
                nameKey="label"
                stroke="none"
                paddingAngle={1}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {segments.map((segment, index) => (
                  <Cell
                    key={segment.id}
                    fill={segment.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
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
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[17px] font-bold tabular-nums text-purple-400">
              {formatMoney(total)}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">Total Payroll</div>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-2.5">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2.5 text-[11px]"
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate text-slate-400">{segment.label}</span>
              <span className="tabular-nums text-slate-300">
                {formatMoney(segment.amount)}
              </span>
              <span className="w-11 text-right font-medium tabular-nums text-white">
                {segment.percent.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CardShell>
  );
}

function TrendPanel({ data }: { data: CpaPayrollTrendPoint[] }) {
  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="PAYROLL & COMMISSIONS TREND" />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-[210px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                stroke="#1e293b"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                domain={[0, 120_000]}
                ticks={Y_AXIS_TICKS}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxisMoney}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  background: "#0e1626",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => formatMoney(Number(value))}
              />
              <Line
                type="monotone"
                dataKey="payroll"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: "#a855f7", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#a855f7", strokeWidth: 0 }}
                name="Payroll"
              />
              <Line
                type="monotone"
                dataKey="commissions"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 0 }}
                name="Commissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center justify-center gap-5 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Payroll
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Commissions
          </span>
        </div>
      </div>
    </CardShell>
  );
}

function DepartmentCompensationPanel({
  rows,
}: {
  rows: CpaDepartmentCompensation[];
}) {
  const kept = rows
    .filter((r) => ["Sales", "Service", "Management"].includes(r.department))
    .map((r) => ({
      ...r,
      department: r.department === "Sales" ? "Sales Rep" : r.department,
    }));
  const maxTotal = Math.max(...kept.map((row) => row.total), 1);
  const totals = kept.reduce(
    (acc, row) => ({
      payroll: acc.payroll + row.payroll,
      commissions: acc.commissions + row.commissions,
      total: acc.total + row.total,
    }),
    { payroll: 0, commissions: 0, total: 0 },
  );

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="COMPENSATION BY DEPARTMENT" />
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead>
            <tr className="text-[10px] text-slate-500">
              <th className="pb-2 pr-2 text-left font-medium">Department</th>
              <th className="pb-2 px-2 text-left font-medium" aria-hidden />
              <th className="pb-2 pl-2 text-right font-medium">Payroll</th>
              <th className="pb-2 text-right font-medium">Commissions</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {kept.map((row) => {
              const barWidth = (row.total / maxTotal) * 100;
              const payrollShare =
                row.total > 0 ? (row.payroll / row.total) * 100 : 0;
              const commissionShare =
                row.total > 0 ? (row.commissions / row.total) * 100 : 0;

              return (  
                <>
                  <tr
                    key={row.id}
                    className="last:border-0"
                  >
                    <td className="py-1 pr-2 text-slate-300">{row.department}</td>
                    <td className="md:hidden" />
                    <td className="hidden md:table-cell w-full px-2 py-1">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
                        <div
                          className="flex h-full overflow-hidden rounded-full"
                          style={{ width: `${barWidth}%` }}
                        >
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${payrollShare}%` }}
                          />
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${commissionShare}%` }}
                          /> 
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pl-2 text-right tabular-nums text-slate-300">
                      {formatMoney(row.payroll)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-slate-300">
                      {formatMoney(row.commissions)}
                    </td>
                    <td className="py-2.5 text-right font-medium tabular-nums text-white">
                      {formatMoney(row.total)}
                    </td>
                  </tr>
                  <tr className="md:hidden w-full mt-1">
                    <td colSpan={5} className="h-2 overflow-hidden rounded-full bg-slate-800/90">
                      <div
                        className="flex h-full overflow-hidden rounded-full"
                        style={{ width: `${barWidth}%` }}
                      >
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${payrollShare}%` }}
                        />
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${commissionShare}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-700/80">
              <td className="pt-3 font-semibold text-purple-400">Total</td>
              <td aria-hidden />
              <td className="pt-3 text-right font-semibold tabular-nums text-white">
                {formatMoney(totals.payroll)}
              </td>
              <td className="pt-3 text-right font-semibold tabular-nums text-white">
                {formatMoney(totals.commissions)}
              </td>
              <td className="pt-3 text-right font-semibold tabular-nums text-white">
                {formatMoney(totals.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CardShell>
  );
}

export default function CpaPayrollCommissionsChartsRow({
  payrollBreakdown,
  payrollBreakdownTotal,
  trend,
  departmentCompensation,
}: {
  payrollBreakdown: CpaPayrollBreakdownSegment[];
  payrollBreakdownTotal: number;
  trend: CpaPayrollTrendPoint[];
  departmentCompensation: CpaDepartmentCompensation[];
}) {
  return (
    <div
      className={cn(
        "mb-4",
      )}
    >
      {/* <PayrollBreakdownPanel segments={payrollBreakdown} total={payrollBreakdownTotal} />
      <TrendPanel data={trend} /> */}
      <DepartmentCompensationPanel rows={departmentCompensation} />
    </div>
  );
}
