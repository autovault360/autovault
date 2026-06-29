import type { VehicleDetail } from "@/lib/vehicles/detail-types";

export type VehicleCostBreakdown = {
  purchasePrice: number;
  auctionFees: number;
  repairs: number;
  flooringFees: number;
  otherExpenses: number;
  totalInvestment: number;
};

export function buildVehicleCostBreakdown(
  vehicle: VehicleDetail,
): VehicleCostBreakdown {
  const purchasePrice = vehicle.acquisitionCost;
  const auctionFees =
    (vehicle.registrationFees ?? 0) + (vehicle.auctionFees ?? 0);
  const repairs = vehicle.totalReconditioning;
  const flooringFees = vehicle.flooringFees ?? 0;
  const computedTotal =
    purchasePrice + auctionFees + repairs + flooringFees;
  const storedTotal = vehicle.totalInvested;
  const otherExpenses =
    storedTotal != null && storedTotal > computedTotal
      ? Math.round((storedTotal - computedTotal) * 100) / 100
      : 0;
  const totalInvestment =
    storedTotal != null && storedTotal > 0 ? storedTotal : computedTotal;

  return {
    purchasePrice,
    auctionFees,
    repairs,
    flooringFees,
    otherExpenses,
    totalInvestment,
  };
}

export type MarkAsSoldFinancials = {
  totalPriceWithTaxAndFees: number;
  commissionAmount: number;
  otherPayoutsTotal: number;
  grossProfit: number;
  netProfit: number;
  roiPercent: number;
};

export function calculateMarkAsSoldFinancials(input: {
  totalInvestment: number;
  soldPriceBeforeTax: number;
  salesTaxAmount: number;
  licenseRegistrationFees: number;
  commissionType: "percentage" | "manual";
  commissionRate: number;
  manualCommissionAmount: number;
  dealerPayoutsEnabled: boolean;
  payoutItems: { amount: number }[];
}): MarkAsSoldFinancials {
  const totalPriceWithTaxAndFees =
    input.soldPriceBeforeTax +
    input.salesTaxAmount +
    input.licenseRegistrationFees;

  const grossProfit = input.soldPriceBeforeTax - input.totalInvestment;

  let commissionAmount = 0;
  if (input.commissionType === "manual") {
    commissionAmount = Math.max(0, input.manualCommissionAmount);
  } else if (input.commissionRate > 0) {
    commissionAmount =
      Math.round(input.soldPriceBeforeTax * (input.commissionRate / 100) * 100) /
      100;
  }

  const otherPayoutsTotal = input.dealerPayoutsEnabled
    ? input.payoutItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;

  const netProfit =
    Math.round(
      (input.soldPriceBeforeTax -
        input.totalInvestment -
        commissionAmount -
        otherPayoutsTotal) *
        100,
    ) / 100;

  const roiPercent =
    input.totalInvestment > 0
      ? Math.round((netProfit / input.totalInvestment) * 1000) / 10
      : 0;

  return {
    totalPriceWithTaxAndFees,
    commissionAmount,
    otherPayoutsTotal,
    grossProfit,
    netProfit,
    roiPercent,
  };
}
