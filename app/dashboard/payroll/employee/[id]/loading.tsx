import EmployeePayrollSkeleton from "@/components/payroll/employee/employee-payroll-skeleton";
import AdminHeader from "@/components/layout/AdminHeader";

export default function Loading() {
  return (
    <>
      <AdminHeader />
      <EmployeePayrollSkeleton />
    </>
  );
}
