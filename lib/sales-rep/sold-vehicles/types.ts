export type SoldVehicleStatus = "completed" | "pending" | "processing";

export type SoldVehicleTab =
  | "all"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export type ISalesRepSoldVehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
  vehicleImageUrl: string;
  customerName: string;
  customerPhone: string;
  soldDate: string;
  soldPrice: number;
  cost: number;
  grossProfit: number;
  commission: number;
  commissionRate: number;
  status: SoldVehicleStatus;
  dealJacketId: string;
} & Record<string, unknown>;

export interface ISalesRepSoldVehicleKpiSummary {
  vehiclesSold: number;
  grossProfit: number;
  commissionEarned: number;
  avgGrossProfit: number;
  closingRate: number;
  vehiclesSoldTrend: string;
  grossProfitTrend: string;
  commissionTrend: string;
  avgGrossProfitTrend: string;
  closingRateTrend: string;
}

export interface ISalesRepSoldVehiclesData {
  vehicles: ISalesRepSoldVehicle[];
  tabCounts: Record<SoldVehicleTab, number>;
}

export interface SoldVehicleFilterState {
  search: string;
  make: string;
  model: string;
  status: string;
}

export interface SoldVehicleDateRange {
  start: string;
  end: string;
}
