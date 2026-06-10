import PayrollDashboardContent from "@/components/payroll/payroll-dashboard-content";
import { getPayrollDashboardData } from "@/lib/payroll/mock-data";

export default function PayrollDashboardPage() {
  const data = getPayrollDashboardData();

  return <PayrollDashboardContent data={data} showAdminHeader={false} />;
}
