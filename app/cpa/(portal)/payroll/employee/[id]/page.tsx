import { notFound } from "next/navigation";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import EmployeePayrollShell from "@/components/payroll/employee/employee-payroll-shell";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { getEmployeePayrollProfile } from "@/lib/payroll/employee-mock-data";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CpaEmployeePayrollPage({ params }: Props) {
  const { id } = await params;
  const [profile, session] = await Promise.all([
    Promise.resolve(getEmployeePayrollProfile(id)),
    getCpaSession(),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <CpaHeader />
      <EmployeePayrollShell
        profile={profile}
        readOnly={session?.isReadOnly ?? true}
        showAdminHeader={false}
        basePath="/cpa"
      />
    </>
  );
}
