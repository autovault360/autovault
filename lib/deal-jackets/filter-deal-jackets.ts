import type { DealJacketListItem, DealJacketTab } from "./types";
import {
  isSoldInReferenceMonth,
  isSoldInReferenceYear,
} from "./period-utils";

export function filterByTab(
  items: DealJacketListItem[],
  tab: DealJacketTab,
): DealJacketListItem[] {
  switch (tab) {
    case "sold_this_month":
      return items.filter((i) => isSoldInReferenceMonth(i.saleDate));
    case "sold_this_year":
      return items.filter((i) => isSoldInReferenceYear(i.saleDate));
    case "pending_commission":
      return items.filter((i) =>
        i.commissionStatus !== "paid" && i.commissionStatus !== "rejected"
      );
    case "commission_paid":
      return items.filter((i) => i.commissionStatus === "paid");
    default:
      return items;
  }
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
