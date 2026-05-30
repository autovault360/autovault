import type { CustomerProfileSummary, CustomerStatus } from "./types";

export type DealForSummary = {
  saleDate: string;
  totalPriceOtd: number;
  totalCollected: number;
  balanceDue?: number;
};

export function computeCustomerProfileSummary(
  deals: DealForSummary[],
  customerStatus: CustomerStatus,
): CustomerProfileSummary {
  const count = deals.length;
  const totalSpent = deals.reduce((sum, d) => sum + d.totalPriceOtd, 0);

  let lastPurchaseDate: string | null = null;
  let firstPurchaseDate: string | null = null;
  if (count > 0) {
    const dates = deals.map((d) => d.saleDate).sort();
    firstPurchaseDate = dates[0] ?? null;
    lastPurchaseDate = dates[dates.length - 1] ?? null;
  }

  const averagePurchaseAmount = count > 0 ? totalSpent / count : 0;

  const dealsWithBalance = deals.filter(
    (d) => d.totalPriceOtd > d.totalCollected,
  );
  const dealsInProgress =
    dealsWithBalance.length > 0
      ? dealsWithBalance.length
      : customerStatus === "active_deal"
        ? 1
        : 0;

  const jacketBalance = deals.reduce((sum, d) => sum + (d.balanceDue ?? 0), 0);
  const dealBalance = deals.reduce(
    (sum, d) => sum + Math.max(0, d.totalPriceOtd - d.totalCollected),
    0,
  );
  const openBalance = jacketBalance > 0 ? jacketBalance : dealBalance;

  return {
    totalVehiclesPurchased: count,
    totalSpent,
    lastPurchaseDate,
    firstPurchaseDate,
    averagePurchaseAmount,
    dealsInProgress,
    openBalance,
  };
}
