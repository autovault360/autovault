"use client";

import { Card } from "@/components/ui/card";
import type { StateTaxReport } from "@/lib/state-tax/types";
import StateTaxKpiCards from "./state-tax-kpi-cards";
import StateTaxYtdSummary from "./state-tax-ytd-summary";
import StateTaxTransactionsTable from "./state-tax-transactions-table";
import TaxByMonthChart from "./tax-by-month-chart";

type Props = { report: StateTaxReport };

export default function StateTaxOverview({ report }: Props) {
  return (
    <div className="space-y-3.5">
      <Card className="flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-sm border border-slate-700 bg-card px-4 py-2.5 shadow-none">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-medium text-slate-500">State:</span>
          <span className="font-semibold text-white">{report.config.state}</span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-medium text-slate-500">Filing Frequency:</span>
          <span className="font-semibold text-white">{report.config.filingFrequency}</span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-medium text-slate-500">Reminder Days:</span>
          <span className="font-semibold text-white">{report.config.filingDueDates}</span>
        </div>
      </Card>

      <StateTaxKpiCards kpis={report.kpis} />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <TaxByMonthChart data={report.monthlyTaxData} />
        <StateTaxYtdSummary summary={report.ytdSummary} />
      </div>
      <StateTaxTransactionsTable transactions={report.transactions} />
    </div>
  );
}
