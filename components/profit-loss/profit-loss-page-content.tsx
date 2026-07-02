"use client";

import { Download } from "lucide-react";
import StatKpiCard from "@/components/ui/stat-kpi-card";
import AutovaultPageHead from "@/components/layout/autovault-page-head";
import FinPeriodCalendar from "@/components/ui/fin-period-calendar";
import SectionHeading from "@/components/ui/section-heading";
import PnlStatement from "./pnl-statement";
import RevenueAllocation from "./revenue-allocation";
import PnlNetExplain from "./pnl-net-explain";
import { useProfitLossReport } from "./use-profit-loss-report";
import type { ProfitLossReport } from "@/lib/profit-loss/types";
import { AV } from "@/lib/ui/autovault-design-tokens";

type Props = {
  initialReport: ProfitLossReport;
};

export default function ProfitLossPageContent({
  initialReport,
}: Props) {
  const { report, loading, month, year, mode, setMonth, setYear, setMode } =
    useProfitLossReport({ initialReport });

  const kpiRevenue = report.kpis.find((k) => k.id === "total_revenue");
  const kpiGross = report.kpis.find((k) => k.id === "gross_profit");
  const kpiExpenses = report.kpis.find((k) => k.id === "total_expenses");
  const kpiNet = report.kpis.find((k) => k.id === "net_profit");

  const totalRevenue = kpiRevenue?.value ?? 0;
  const totalCogs = report.kpis.find((k) => k.id === "total_cogs")?.value ?? 0;
  const totalExpenses = kpiExpenses?.value ?? 0;
  const netProfit = kpiNet?.value ?? 0;

  const grossMargin =
    totalRevenue > 0
      ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% net margin`
      : "—";

  const statementAsOf = report.meta?.generatedAt
    ? `As of ${report.meta.generatedAt}`
    : "";

  return (
    <div className="profit-loss-page relative">
      {loading && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-blue-500/80 animate-pulse" />
      )}

      <AutovaultPageHead
        eyebrow="FINANCIALS"
        title="PROFIT & LOSS"
        subtitle="Consolidated income statement — vehicle sales, cost of goods, commissions, and dealership overhead."
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border px-[14px] py-[7px] text-[12.5px] font-bold transition-colors hover:bg-white/5"
            style={{
              backgroundColor: "transparent",
              borderColor: AV.border,
              color: AV.muted,
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Print / Export
          </button>
        }
      />

      <FinPeriodCalendar
        year={year}
        month={month}
        mode={mode}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onModeChange={setMode}
      />

      {/* KPI Grid */}
      <section className="mb-[22px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        <StatKpiCard
          kpiKey="total_revenue"
          accent={AV.blue}
          defaultAccent={AV.blue}
          label="Total Revenue"
          value={kpiRevenue?.valueFormatted ?? "$0"}
          footer="vehicle sales + add-ons"
        />
        <StatKpiCard
          kpiKey="gross_profit"
          accent={AV.green}
          defaultAccent={AV.green}
          label="Gross Profit"
          value={kpiGross?.valueFormatted ?? "$0"}
          footer={grossMargin}
        />
        <StatKpiCard
          kpiKey="total_expenses"
          accent={AV.orange}
          defaultAccent={AV.orange}
          label="Total Expenses"
          value={kpiExpenses?.valueFormatted ?? "$0"}
          footer="COGS + commissions + overhead"
        />
        <StatKpiCard
          kpiKey="net_profit"
          accent={AV.purple}
          defaultAccent={AV.purple}
          label="Net Profit"
          value={kpiNet?.valueFormatted ?? "$0"}
          footer={grossMargin}
        />
      </section>

      <style>{`
        @media (max-width: 1100px) {
          .pnl-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="pnl-body" style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "26px", alignItems: "start" }}>
        {/* Left column */}
        <div className="pnl-left">
          <SectionHeading
            title="Profit & Loss Statement"
            subtitle="Full income statement"
          />
          <PnlStatement
            rows={report.statementRows}
            asOf={statementAsOf}
          />
        </div>

        {/* Right column */}
        <div className="pnl-right">
          <SectionHeading
            title="Revenue Allocation"
            subtitle="Where every dollar goes"
          />
          <RevenueAllocation
            revenueBreakdown={report.revenueBreakdown}
            expenseBreakdown={report.expenseBreakdown}
            netProfit={netProfit}
            totalRevenue={totalRevenue}
          />
          <PnlNetExplain
            totalRevenue={totalRevenue}
            totalCogs={totalCogs}
            totalExpenses={totalExpenses}
            netProfit={netProfit}
          />
        </div>
      </div>
    </div>
  );
}


