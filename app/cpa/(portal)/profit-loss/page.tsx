import ProfitLossPageContent from "@/components/profit-loss/profit-loss-page-content";
import {
  getProfitLossFilterOptions,
  getProfitLossReport,
} from "@/lib/profit-loss/server/get-profit-loss-report";
import { DEFAULT_PL_FILTERS } from "@/lib/profit-loss/types";

export default async function CpaProfitLossPage() {
  const [filterOptions, initialReport] = await Promise.all([
    getProfitLossFilterOptions(),
    getProfitLossReport(DEFAULT_PL_FILTERS),
  ]);

  return (
    <ProfitLossPageContent
      initialReport={initialReport}
      filterOptions={filterOptions}
    />
  );
}
