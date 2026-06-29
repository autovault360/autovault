import type { Metadata } from "next";
import CpaExpensesContent from "@/components/cpa/expenses/cpa-expenses-content";

export const metadata: Metadata = {
  title: "Expense Category Report | CPA Portal",
  description:
    "Operating expense breakdown and category reporting for CPA review in AutoVault360.",
};

export default function CpaExpensesPage() {
  return <CpaExpensesContent />;
}
