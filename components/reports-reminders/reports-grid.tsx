"use client";

import type { ReportsRemindersMock } from "@/lib/reports-reminders/types";
import type { ReminderKpi } from "@/lib/reminders/types";
import ReportSummaryCard from "./report-summary-card";
import SalesPerformanceCard from "./sales-performance-card";
import InventoryOverviewCard from "./inventory-overview-card";
import ExpenseReportCard from "./expense-report-card";
import RemindersOverviewCard from "./reminders-overview-card";
import ProfitLossSummaryCard from "./profit-loss-summary-card";
import PayrollCommissionCard from "./payroll-commission-card";
import DealJacketStatusCard from "./deal-jacket-status-card";
import CpaReportCenterCard from "./cpa-report-center-card";
import AuditReadinessCard from "./audit-readiness-card";
import CustomReportBuilderCard from "./custom-report-builder-card";

type Props = {
  report: ReportsRemindersMock;
  reminderKpis: ReminderKpi[];
};

export default function ReportsGrid({ report, reminderKpis }: Props) {
  return (
    <div className="space-y-3.5">
      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-3">
        <ReportSummaryCard rows={report.reportSummary} />
        <SalesPerformanceCard rows={report.salesPerformance} />
        <InventoryOverviewCard inventory={report.inventory} />
      </section>

      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        <ExpenseReportCard bars={report.expenseBars} />
        <RemindersOverviewCard
          kpis={reminderKpis}
          topReminders={report.topReminders}
        />
        <ProfitLossSummaryCard rows={report.profitLossSummary} />
        <PayrollCommissionCard
          payroll={report.payroll}
          commissions={report.commissions}
        />
        <DealJacketStatusCard segments={report.dealJacketStatus} />
        <CpaReportCenterCard />
      </section>

      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        
        <AuditReadinessCard audit={report.auditReadiness} />
        <CustomReportBuilderCard fields={report.customReportFields} />
      </section>
    </div>
  );
}
