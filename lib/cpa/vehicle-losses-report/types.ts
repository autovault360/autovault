export type CpaLossCategory =
  | "sold_at_loss"
  | "returned_to_auction"
  | "unsold_inventory"
  | "other_adjustments";

export type CpaLossTab = "all" | CpaLossCategory;

export type CpaLossReason =
  | "Market Depreciation"
  | "Overpaid at Auction"
  | "High Reconditioning"
  | "Mechanical Issues"
  | "Other";

export type CpaVehicleLossRow = {
  id: string;
  stockNumber: string;
  yearMakeModel: string;
  vin: string;
  date: string;
  status: string;
  vehicleCost: number;
  reconditioning: number;
  totalCost: number;
  salePriceOrResult: number;
  lossAmount: number;
  lossPct: number;
  lossReason: CpaLossReason;
  lossCategory: CpaLossCategory;
  vehicleType: string;
  make: string;
} & Record<string, unknown>;

export type CpaVehicleLossesKpi = {
  id: string;
  label: string;
  value: string;
  subtext: string;
  icon: "dollar-sign" | "tag" | "gavel" | "refresh-cw" | "car";
  color: string;
};

export type CpaLossBreakdownSegment = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type CpaLossByReasonItem = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type CpaLossByTypeItem = {
  id: string;
  label: string;
  amount: number;
  percent: number;
};

export type CpaVehicleLossesReportData = {
  periodLabel: string;
  dataAsOf: string;
  vehicles: CpaVehicleLossRow[];
  makeOptions: string[];
  vehicleTypeOptions: string[];
  lossReasonOptions: CpaLossReason[];
  statusOptions: string[];
};
