import type { VehicleCosts, WholesaleVehicle } from "./types";

export function totalVehicleCost(costs: VehicleCosts): number {
  return (
    costs.acquisition +
    costs.auction +
    (costs.registration ?? 0) +
    costs.transport +
    costs.recon +
    costs.storage +
    costs.dealerFees
  );
}

export function grossProfit(marketValue: number, acquisition: number): number {
  return marketValue - acquisition;
}

export function netProfitFromCosts(
  marketValue: number,
  costs: VehicleCosts,
): number {
  return marketValue - totalVehicleCost(costs);
}

export function potentialProfit(vehicle: WholesaleVehicle): number {
  return netProfitFromCosts(vehicle.marketValue, vehicle.costs);
}

export function profitMarginPercent(
  marketValue: number,
  costs: VehicleCosts,
): number {
  if (marketValue <= 0) return 0;
  return (netProfitFromCosts(marketValue, costs) / marketValue) * 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyExact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, signed = true): string {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}
