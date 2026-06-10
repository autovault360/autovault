import AuditReadinessPageContent from "@/components/reports-reminders/audit-readiness-page-content";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { getReportsRemindersData } from "@/lib/reports-reminders/server/get-reports-reminders-data";

export default async function CpaAuditPage() {
  const [{ report }, session] = await Promise.all([
    getReportsRemindersData(),
    getCpaSession(),
  ]);

  return (
    <>
      <AuditReadinessPageContent
        report={report}
        showAdminHeader={false}
      />
      {session?.isReadOnly && (
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Read-only view. Use CPA Notes to add accounting comments without
          changing dealership records.
        </p>
      )}
    </>
  );
}
