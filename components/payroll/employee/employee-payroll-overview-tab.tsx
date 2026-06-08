import type { EmployeePayrollProfile } from "@/lib/payroll/types";
import PayPeriodSummaryCard from "./pay-period-summary-card";
import EmployeeDeductionsCard from "./employee-deductions-card";
import EmployeeEarningsTable from "./employee-earnings-table";
import EmployeeCommissionSummary from "./employee-commission-summary";
import EmployeePayHistoryTable from "./employee-pay-history-table";
import EmployeePaymentSummaryCard from "./employee-payment-summary-card";
import EmployeeYtdSummaryCard from "./employee-ytd-summary-card";
import EmployeePaycheckMiniCalendar from "./employee-paycheck-mini-calendar";
import EmployeeUpcomingPayDates from "./employee-upcoming-pay-dates";
import EmployeeDocumentsVault from "./employee-documents-vault";

export default function EmployeePayrollOverviewTab({
  profile,
}: {
  profile: EmployeePayrollProfile;
}) {
  return (
    <div className="grid gap-2 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <PayPeriodSummaryCard summary={profile.payPeriodSummary} employeeId={profile.id} />
        <EmployeeDeductionsCard deductions={profile.deductions} />
      </div>
      <div className="xl:col-span-5">
        <EmployeeEarningsTable earnings={profile.earnings} />
        <EmployeeCommissionSummary deals={profile.commissionDeals} />
        <EmployeePayHistoryTable history={profile.payHistory} />
      </div>
      <div className="xl:col-span-4">
        <EmployeePaymentSummaryCard payment={profile.paymentSummary} />
        <EmployeeYtdSummaryCard ytd={profile.ytdSummary} />
        <EmployeePaycheckMiniCalendar events={profile.calendarEvents} />
        <EmployeeUpcomingPayDates dates={profile.upcomingPayDates} />
        <EmployeeDocumentsVault documents={profile.documents} />
      </div>
    </div>
  );
}
