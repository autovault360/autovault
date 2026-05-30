import { authenticateUser } from "@/lib/vehicles/server/utils";
import { listDealJackets } from "@/services/deal-jacket.service";
import {
  buildSalesRepFilterOptions,
  mapDealJacketListDto,
} from "./map-list-item";
import type { DealJacketListItem } from "./types";

export type DealJacketsDashboardData = {
  dealJackets: DealJacketListItem[];
  salesRepFilterOptions: { id: string; label: string }[];
};

export async function getDealJacketsForDashboard(): Promise<DealJacketsDashboardData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { dealJackets: [], salesRepFilterOptions: [{ id: "all", label: "All Sales Reps" }] };
  }

  const result = await listDealJackets({
    dealershipId: auth.user.dealershipId,
    page: 1,
    pageSize: 100,
  });

  const dealJackets = result.items.map(mapDealJacketListDto);
  return {
    dealJackets,
    salesRepFilterOptions: buildSalesRepFilterOptions(dealJackets),
  };
}
