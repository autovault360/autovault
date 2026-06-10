import { notFound } from "next/navigation";
import EmployeePayrollShell from "@/components/payroll/employee/employee-payroll-shell";
import { getEmployeePayrollProfile } from "@/lib/payroll/employee-mock-data";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeePayrollPage({ params }: Props) {
  const { id } = await params;
  const profile = getEmployeePayrollProfile(id);

  if (!profile) {
    notFound();
  }

  return <EmployeePayrollShell profile={profile} showAdminHeader={false} />;
}
