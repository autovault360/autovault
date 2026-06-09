import type { Metadata } from "next";
import ProfitLossPageContent from "@/components/dealer/profit-loss/profit-loss-page-content";
import { getDealerProfitLoss } from "@/lib/dealer/profit-loss/server/get-dealer-profit-loss";

export const metadata: Metadata = {
  title: "Profit & Loss | Dealer Dashboard",
  description:
    "Wholesale dealer profit and loss reporting with revenue, expenses, and margin analytics.",
};

export default async function DealerProfitLossPage() {
  const data = await getDealerProfitLoss();

  return (
    <ProfitLossPageContent
      period={data.period}
      kpis={data.kpis}
      statementRows={data.statementRows}
      monthlyTrend={data.monthlyTrend}
      expenseSegments={data.expenseSegments}
      expenseTotal={data.expenseTotal}
      topIncomeSources={data.topIncomeSources}
      topExpenseCategories={data.topExpenseCategories}
      timeframeOptions={data.timeframeOptions}
    />
  );
}
