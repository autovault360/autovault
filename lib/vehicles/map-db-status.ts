import type { VehicleStatus } from "./types";

export type DbVehicleStatus =
  | "in_stock"
  | "needs_attention"
  | "pending_deal"
  | "sold"
  | "loss";

const AVAILABLE_FOR_DEAL: DbVehicleStatus[] = ["in_stock", "needs_attention"];

export function mapDbVehicleStatus(dbStatus: string): VehicleStatus {
  switch (dbStatus) {
    case "in_stock":
      return "In Stock";
    case "needs_attention":
      return "Needs Attention";
    case "pending_deal":
      return "Pending Deal";
    case "sold":
    case "loss":
      return "Marked Sold";
    default:
      return "In Stock";
  }
}

export function isVehicleAvailableForDeal(dbStatus: string): boolean {
  return AVAILABLE_FOR_DEAL.includes(dbStatus as DbVehicleStatus);
}

export function isVehicleCommittedToDeal(dbStatus: string): boolean {
  return dbStatus === "pending_deal" || dbStatus === "sold" || dbStatus === "loss";
}
