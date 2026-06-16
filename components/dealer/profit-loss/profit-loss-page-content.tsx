"use client";

import { useState } from "react";
import type {
  DealerPlTimeframe,
  DealerProfitLossData,
} from "@/lib/dealer/profit-loss/types";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import ProfitLossBreakdownBars from "./profit-loss-breakdown-bars";
import ProfitLossExpenseDonut from "./profit-loss-expense-donut";
import ProfitLossHeaderToolbar from "./profit-loss-header-toolbar";
import ProfitLossKpiStrip from "./profit-loss-kpi-strip";
import ProfitLossOverviewChart from "./profit-loss-overview-chart";
import ProfitLossSummaryTable from "./profit-loss-summary-table";

type Props = Pick<
  DealerProfitLossData,
  | "period"
  | "kpis"
  | "statementRows"
  | "monthlyTrend"
  | "expenseSegments"
  | "expenseTotal"
  | "topIncomeSources"
  | "topExpenseCategories"
  | "timeframeOptions"
>;

export default function ProfitLossPageContent({
  period,
  kpis,
  statementRows,
  monthlyTrend,
  expenseSegments,
  expenseTotal,
  topIncomeSources,
  topExpenseCategories,
  timeframeOptions,
}: Props) {
  const [timeframe, setTimeframe] = useState<DealerPlTimeframe>("this_month");

  return (
    <DealerPageShell
      headerSection={
        <section className="mb-3.5 px-0.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <PageHeaderTitle
                title="Profit & Loss"
                subtitle="Track income, expenses, and net profit for your wholesale operation."
                subtitleClassName="max-w-xl text-[12.5px] text-slate-500"
              />
              <ProfitLossKpiStrip kpis={kpis} />
            </div>

            <ProfitLossHeaderToolbar
              period={period}
              timeframeOptions={timeframeOptions}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </div>
        </section>
      }
    >
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ProfitLossSummaryTable rows={statementRows} period={period} />
        <div className="space-y-3.5">
          <ProfitLossOverviewChart data={monthlyTrend} />
          <ProfitLossExpenseDonut segments={expenseSegments} total={expenseTotal} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <ProfitLossBreakdownBars
          title="Top Income Sources"
          items={topIncomeSources}
          variant="income"
        />
        <ProfitLossBreakdownBars
          title="Top Expense Categories"
          items={topExpenseCategories}
          variant="expense"
        />
      </div>
    </DealerPageShell>
  );
}
