import type {
  DealJacketListItem,
  DealJacketStats,
  DealJacketTab,
  DealJacketTabCounts,
} from "./types";
import { DEAL_JACKET_STATUSES } from "./types";

export function computeDealJacketStats(
  items: DealJacketListItem[],
): DealJacketStats {
  return {
    totalJackets: items.length,
    totalSaleValue: items.reduce((sum, i) => sum + i.salePrice, 0),
    totalProfit: items.reduce((sum, i) => sum + i.totalProfit, 0),
    pendingReview: items.filter((i) => i.workflowStatus === "pending_review").length,
    approved: items.filter((i) => i.workflowStatus === "approved").length,
  };
}

export function computeDealJacketTabCounts(
  items: DealJacketListItem[],
): DealJacketTabCounts {
  const counts = {
    all: items.length,
  } as DealJacketTabCounts;

  for (const status of DEAL_JACKET_STATUSES) {
    counts[status] = items.filter((i) => i.workflowStatus === status).length;
  }

  return counts;
}

export function filterByTab(
  items: DealJacketListItem[],
  tab: DealJacketTab,
): DealJacketListItem[] {
  if (tab === "all") return items;
  return items.filter((i) => i.workflowStatus === tab);
}

export function filterDealJackets(
  items: DealJacketListItem[],
  options: {
    tab: DealJacketTab;
    search: string;
    salesRepId: string;
    paymentMethod: string;
  },
): DealJacketListItem[] {
  const q = options.search.toLowerCase().trim();
  return filterByTab(items, options.tab).filter((item) => {
    if (options.salesRepId !== "all" && item.salesRepId !== options.salesRepId) {
      return false;
    }
    if (
      options.paymentMethod !== "all" &&
      item.paymentMethod !== options.paymentMethod
    ) {
      return false;
    }
    if (!q) return true;
    const vehicle = `${item.year} ${item.make} ${item.model}`.toLowerCase();
    return (
      vehicle.includes(q) ||
      item.stockNumber.toLowerCase().includes(q) ||
      item.vin.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q)
    );
  });
}
