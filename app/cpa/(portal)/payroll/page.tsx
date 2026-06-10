import PayrollDashboardContent from "@/components/payroll/payroll-dashboard-content";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { getPayrollDashboardData } from "@/lib/payroll/mock-data";

export default async function CpaPayrollPage() {
  const session = await getCpaSession();
  const data = getPayrollDashboardData();

  return (
    <>
      <PayrollDashboardContent
        data={data}
        readOnly={session?.isReadOnly ?? true}
        showAdminHeader={false}
        basePath="/cpa"
      />
    </>
  );
}
