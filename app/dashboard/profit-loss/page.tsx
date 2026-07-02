import ProfitLossPageContent from "@/components/profit-loss/profit-loss-page-content";
import { getProfitLossReport } from "@/lib/profit-loss/server/get-profit-loss-report";
import { DEFAULT_PL_FILTERS } from "@/lib/profit-loss/types";

const now = new Date();

export default async function ProfitLossPage() {
  const initialReport = await getProfitLossReport(DEFAULT_PL_FILTERS, {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    view: "monthly",
  });

  return <ProfitLossPageContent initialReport={initialReport} />;
}
