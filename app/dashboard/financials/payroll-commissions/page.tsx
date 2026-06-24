import type { Metadata } from "next";
import { getPayrollCommissionsPageData } from "@/lib/cpa/server/payroll-commissions/get-payroll-commissions-page";
import PayrollCommissionsPage from "@/components/financials/payroll-commissions-page";

export const metadata: Metadata = {
  title: "Payroll & Commissions | Admin Dashboard",
  description: "Payroll and commission reporting for administrative review.",
};

export default async function AdminPayrollCommissionsPage() {
  const data = await getPayrollCommissionsPageData();

  return <PayrollCommissionsPage data={data} />;
}
