import type { KPIIconName } from "@/components/ui/kpi-card";
import type { CpaViewMode } from "@/lib/cpa/types";

export type CpaSalesTaxVehicleStatus = "Paid" | "Pending" | "Unsold";

export type CpaSalesTaxVehicleRow = {
  id: string;
  stockNumber: string;
  vin: string;
  yearMakeModel: string;
  dateSold: string | null;
  salePrice: number;
  taxRate: number;
  salesTaxCollected: number;
  salesTaxRemitted: number;
  adjustments: number;
  taxPayable: number;
  status: CpaSalesTaxVehicleStatus;
  remittedDate: string | null;
  make: string;
  vehicleType: string;
  isSold: boolean;
} & Record<string, unknown>;

export type CpaSalesTaxKpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaColor?: "green" | "red" | "blue" | "orange" | "teal" | "neutral";
  icon: KPIIconName;
  color: string;
};

export type CpaSalesTaxPageData = {
  periodLabel: string;
  comparisonLabel: string;
  periodEndLabel: string;
  dataAsOf: string;
  view: CpaViewMode;
  kpis: CpaSalesTaxKpi[];
  vehicles: CpaSalesTaxVehicleRow[];
  makeOptions: string[];
  typeOptions: string[];
  totals: {
    vehicleCount: number;
    salePrice: number;
    salesTaxCollected: number;
    salesTaxRemitted: number;
    adjustments: number;
    taxPayable: number;
  };
};
