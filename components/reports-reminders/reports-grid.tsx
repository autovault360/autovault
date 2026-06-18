"use client";

import type {
  ReportsDrilldownType,
  ReportsRemindersMock,
} from "@/lib/reports-reminders/types";
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
  onOpen: (type: ReportsDrilldownType) => void;
};

export default function ReportsGrid({ report, reminderKpis, onOpen }: Props) {
  return (
    <div className="space-y-3.5">
      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-3">
        <ReportSummaryCard rows={report.reportSummary} onOpen={() => onOpen("report-summary")} />
        <SalesPerformanceCard rows={report.salesPerformance} onOpen={() => onOpen("sales-performance")} />
        <InventoryOverviewCard inventory={report.inventory} onOpen={() => onOpen("inventory-overview")} />
      </section>

      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        <ExpenseReportCard bars={report.expenseBars} onOpen={() => onOpen("expense-report")} />
        <RemindersOverviewCard
          kpis={reminderKpis}
          topReminders={report.topReminders}
          onOpen={() => onOpen("reminders-overview")}
        />
        <ProfitLossSummaryCard rows={report.profitLossSummary} onOpen={() => onOpen("profit-loss-breakdown")} />
        <PayrollCommissionCard
          payroll={report.payroll}
          commissions={report.commissions}
          onOpen={() => onOpen("payroll-commission")}
        />
        <DealJacketStatusCard segments={report.dealJacketStatus} onOpen={() => onOpen("deal-jacket-status")} />
        <CpaReportCenterCard onOpen={() => onOpen("cpa-report-center")} />
      </section>

      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        
        <AuditReadinessCard audit={report.auditReadiness} onOpen={() => onOpen("audit-readiness")} />
        <CustomReportBuilderCard fields={report.customReportFields} onOpen={() => onOpen("custom-report-builder")} />
      </section>
    </div>
  );
}
