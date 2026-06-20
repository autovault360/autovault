export type CpaProfitVehicleMargin = "High" | "Medium" | "Low";

export type CpaProfitVehicleRow = {
  id: string;
  stockNumber: string;
  yearMakeModel: string;
  vin: string;
  dateSold: string;
  salePrice: number;
  totalCost: number;
  grossProfit: number;
  grossProfitPct: number;
  profitMargin: CpaProfitVehicleMargin;
  profitPerDay: number;
  vehicleType: string;
  make: string;
} & Record<string, unknown>;

export type CpaProfitVehiclesKpi = {
  id: string;
  label: string;
  value: string;
  subtext: string;
  icon: "dollar-sign" | "tag" | "refresh-cw" | "bar-chart-3" | "percent";
  color: string;
};

export type CpaProfitBreakdownSegment = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type CpaProfitSourceItem = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type CpaProfitByTypeItem = {
  id: string;
  label: string;
  amount: number;
  percent: number;
};

export type CpaProfitVehiclesReportData = {
  periodLabel: string;
  dataAsOf: string;
  kpis: CpaProfitVehiclesKpi[];
  profitBreakdown: CpaProfitBreakdownSegment[];
  profitBreakdownTotal: number;
  profitBySource: CpaProfitSourceItem[];
  profitByVehicleType: CpaProfitByTypeItem[];
  vehicles: CpaProfitVehicleRow[];
  makeOptions: string[];
  vehicleTypeOptions: string[];
};
