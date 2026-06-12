import { authenticateUser } from "@/lib/vehicles/server/utils";
import { listDealJackets } from "@/services/deal-jacket.service";
import {
  buildSalesRepFilterOptions,
  mapDealJacketListDto,
} from "./map-list-item";
import { computeDealJacketStats } from "./filter-deal-jackets";
import type { DealJacketListItem, DealJacketStats } from "./types";

export type DealJacketsDashboardData = {
  dealJackets: DealJacketListItem[];
  stats: DealJacketStats;
  salesRepFilterOptions: { id: string; label: string }[];
};

export async function getDealJacketsForDashboard(): Promise<DealJacketsDashboardData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return {
      dealJackets: [],
      stats: { totalJackets: 0, totalSaleValue: 0, totalProfit: 0, pendingReview: 0, approved: 0 },
      salesRepFilterOptions: [{ id: "all", label: "All Sales Reps" }],
    };
  }

  const result = await listDealJackets({
    dealershipId: auth.user.dealershipId,
    page: 1,
    pageSize: 100,
  });

  const dealJackets = result.items.map(mapDealJacketListDto);
  return {
    dealJackets,
    stats: computeDealJacketStats(dealJackets),
    salesRepFilterOptions: buildSalesRepFilterOptions(dealJackets),
  };
}
