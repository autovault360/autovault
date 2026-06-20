import type { Metadata } from "next";
import CpaPayrollCommissionsContent from "@/components/cpa/payroll-commissions/cpa-payroll-commissions-content";
import { getPayrollCommissionsPageData } from "@/lib/cpa/server/payroll-commissions/get-payroll-commissions-page";

export const metadata: Metadata = {
  title: "Payroll & Commissions | CPA Portal",
  description:
    "Read-only payroll and commission reporting for CPA review in AutoVault360.",
};

export default async function CpaPayrollCommissionsPage() {
  const data = await getPayrollCommissionsPageData();

  return <CpaPayrollCommissionsContent data={data} />;
}
