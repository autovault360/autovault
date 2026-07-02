import type { HtmlVehicleCategory } from "@/lib/financials/vehicles-report/category-meta";
import type { AvAccent } from "@/lib/ui/autovault-design-tokens";
import type { StatKpiData } from "@/components/ui/kpi-card";
import type { TopPerformerKpiData } from "@/components/ui/kpi-card";

export type VehiclesReportVehicleRow = {
  id: string;
  vin: string;
  soldDate: string;
  year: number;
  make: string;
  model: string;
  category: HtmlVehicleCategory;
  purchasePrice: number;
  soldPrice: number;
  grossProfit: number;
  netProfit: number;
  roi: number;
  salesRep: string;
  daysOnLot: number;
  customerName?: string | null;
  totalVehicleCost: number;
  commission: number;
  repairs: number;
  flooringCost: number;
  fees: number;
  addOns: number;
  salesTax: number;
  regFees: number;
  sold: boolean;
};

export type VehiclesReportCategoryCard = TopPerformerKpiData & {
  id: HtmlVehicleCategory;
};

export type VehiclesByProfitReportData = {
  periodLabel: string;
  summaryKpis: StatKpiData[];
  categoryCards: VehiclesReportCategoryCard[];
  vehicles: VehiclesReportVehicleRow[];
  rowCountSubtitle: string;
};

export type VehiclesByLossReportData = {
  periodLabel: string;
  summaryKpis: StatKpiData[];
  categoryCards: VehiclesReportCategoryCard[];
  vehicles: VehiclesReportVehicleRow[];
  rowCountSubtitle: string;
};

export type VehiclesReportPeriodParams = {
  view: "monthly" | "yearly";
  month: number;
  year: number;
};

export const SUMMARY_ACCENT: Record<string, AvAccent> = {
  green: "green",
  blue: "blue",
  orange: "orange",
  purple: "purple",
  red: "red",
};
