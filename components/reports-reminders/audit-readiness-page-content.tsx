"use client";

import type { ReportsRemindersMock } from "@/lib/reports-reminders/types";
import AuditReadinessCard from "./audit-readiness-card";
import DealJacketStatusCard from "./deal-jacket-status-card";
import PayrollCommissionCard from "./payroll-commission-card";
import ProfitLossSummaryCard from "./profit-loss-summary-card";
import ReportSummaryCard from "./report-summary-card";

type Props = {
  report: ReportsRemindersMock;
  showAdminHeader?: boolean;
};

export default function AuditReadinessPageContent({
  report,
  showAdminHeader: _showAdminHeader = true,
}: Props) {
  return (
    <div className="space-y-3.5">
      <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-h-[280px] [&>div]:h-full">
          <AuditReadinessCard audit={report.auditReadiness} />
        </div>
        <ReportSummaryCard rows={report.reportSummary} />
      </section>

      <section className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        <ProfitLossSummaryCard rows={report.profitLossSummary} />
        <PayrollCommissionCard
          payroll={report.payroll}
          commissions={report.commissions}
        />
        <DealJacketStatusCard segments={report.dealJacketStatus} />
      </section>
    </div>
  );
}
