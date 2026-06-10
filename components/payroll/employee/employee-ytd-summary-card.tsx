"use client";

import { useState } from "react";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPayrollCurrency, type YtdSummary } from "@/lib/payroll/types";

export default function EmployeeYtdSummaryCard({
  ytd,
}: {
  ytd: YtdSummary;
}) {
  const [year, setYear] = useState(String(ytd.year));

  return (
    <DetailCard className="mb-2 bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead
        title="YEAR TO DATE SUMMARY"
        action={
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-7 w-20 border-slate-800 bg-slate-900 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-card text-[11px]">
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Gross Earnings</span>
          <span className="font-mono tabular-nums text-slate-300">{formatPayrollCurrency(ytd.grossEarnings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Taxes</span>
          <span className="font-mono tabular-nums text-red-400">-{formatPayrollCurrency(ytd.taxes)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Other Deductions</span>
          <span className="font-mono tabular-nums text-red-400">-{formatPayrollCurrency(ytd.otherDeductions)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-1.5">
          <span className="font-bold uppercase tracking-wide text-slate-500">Net Pay YTD</span>
          <span className="font-mono text-lg font-bold tabular-nums text-emerald-400">{formatPayrollCurrency(ytd.netPayYtd)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Commissions</span>
          <span className="font-mono tabular-nums text-emerald-400">{formatPayrollCurrency(ytd.totalCommissions)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Bonuses</span>
          <span className="font-mono tabular-nums text-purple-400">{formatPayrollCurrency(ytd.totalBonuses)}</span>
        </div>
      </div>
    </DetailCard>
  );
}
