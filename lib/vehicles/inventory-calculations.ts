import {
  formatCurrency,
  type Vehicle,
} from "@/lib/vehicles/types";

export type InventoryVehicle = Vehicle & {
  dbStatus: string;
  auctionFees: number;
  registrationFees: number;
  repairs: number;
  flooringCost: number;
  flooringAgeDays: number;
  salesTax: number;
  totalInvestment: number;
  totalVehicleCost: number;
  commissionAmount: number;
  commissionRate: number;
  netProfit: number;
  roiPercent: number;
  salesRepName: string;
  salesRepImage: string;
  soldDate?: string;
  soldThisMonth: boolean;
  addOnRevenue: number;
  addOnItems?: { desc: string; type: string; price: number }[];
};

export type InventoryStats = {
  totalInventory: number;
  activeInventoryCount: number;
  soldThisMonthCount: number;
  totalPurchaseCost: number;
  totalFees: number;
  totalRepairs: number;
  totalVehiclesCost: number;
  totalSalesTax: number;
  avgCommissionRate: number;
  totalCommissions: number;
  missingTitles: number;
  titlesIn: number;
  soldThisMonthProfit: number;
  soldThisMonthRoi: number;
};

export type InventoryTableTotals = {
  purchasePrice: number;
  fees: number;
  repairs: number;
  flooringCost: number;
  salesTax: number;
  regFees: number;
  totalInvestment: number;
  totalVehicleCost: number;
  commission: number;
  netProfit: number;
};

export type InventoryKpiCard = {
  kpiKey: string;
  columnKey?: string;
  defaultColorHex: string;
  label: string;
  value: string;
  footer: string;
};

function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(start), end: fmt(end) };
}

export function isInCurrentMonth(date: string | undefined): boolean {
  if (!date) return false;
  const { start, end } = getCurrentMonthRange();
  return date >= start && date <= end;
}

export function getDisplayStatus(vehicle: InventoryVehicle): string {
  switch (vehicle.dbStatus) {
    case "sold":
      return "Sold";
    case "loss":
      return "Marked Sold";
    case "in_stock":
      return "In Stock";
    case "needs_attention":
      return "Needs Attention";
    case "pending_deal":
      return "Pending Deal";
    default:
      return vehicle.status;
  }
}

export function getDisplayStatusStyle(displayStatus: string): string {
  switch (displayStatus) {
    case "Sold":
    case "In Stock":
      return "bg-emerald-500/15 text-emerald-400";
    case "Needs Attention":
      return "bg-amber-500/15 text-amber-400";
    case "Pending Deal":
      return "bg-blue-500/15 text-blue-400";
    case "Marked Sold":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-slate-500/15 text-slate-400";
  }
}

export function filterInventoryVehicles(
  vehicles: InventoryVehicle[],
  filters: {
    search?: string;
    make?: string;
    model?: string;
    status?: string;
    location?: string;
    salesRep?: string;
  },
): InventoryVehicle[] {
  const query = filters.search?.trim().toLowerCase() ?? "";

  return vehicles.filter((vehicle) => {
    if (filters.make && filters.make !== "all" && vehicle.make !== filters.make) {
      return false;
    }
    if (filters.model && filters.model !== "all" && vehicle.model !== filters.model) {
      return false;
    }
    if (filters.status && filters.status !== "all") {
      const display = getDisplayStatus(vehicle);
      if (display !== filters.status) return false;
    }
    if (
      filters.location &&
      filters.location !== "all" &&
      vehicle.location !== filters.location
    ) {
      return false;
    }
    if (
      filters.salesRep &&
      filters.salesRep !== "all" &&
      vehicle.salesRepName !== filters.salesRep
    ) {
      return false;
    }
    if (!query) return true;
    return (
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.stockNumber.toLowerCase().includes(query) ||
      vehicle.vin.toLowerCase().includes(query) ||
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query)
    );
  });
}

export type SortField =
  | "profit_desc"
  | "roi_desc"
  | "days_desc"
  | "flooring_desc"
  | "";

export function sortInventoryVehicles(
  vehicles: InventoryVehicle[],
  sort: SortField,
): InventoryVehicle[] {
  if (!sort) return vehicles;
  const sorted = [...vehicles];
  switch (sort) {
    case "profit_desc":
      sorted.sort((a, b) => b.netProfit - a.netProfit);
      break;
    case "roi_desc":
      sorted.sort((a, b) => b.roiPercent - a.roiPercent);
      break;
    case "days_desc":
      sorted.sort((a, b) => b.daysInInventory - a.daysInInventory);
      break;
    case "flooring_desc":
      sorted.sort((a, b) => b.flooringCost - a.flooringCost);
      break;
  }
  return sorted;
}

export function computeInventoryStats(vehicles: InventoryVehicle[]): InventoryStats {
  const soldThisMonth = vehicles.filter((v) => v.soldThisMonth);
  const soldVehicles = vehicles.filter(
    (v) => v.dbStatus === "sold" || v.dbStatus === "loss",
  );
  const commissionVehicles = soldVehicles.filter((v) => v.commissionAmount > 0);
  const avgCommissionRate =
    commissionVehicles.length > 0
      ? commissionVehicles.reduce((sum, v) => sum + v.commissionRate, 0) /
        commissionVehicles.length
      : 0;

  const soldThisMonthInvestment = soldThisMonth.reduce(
    (sum, v) => sum + v.totalInvestment,
    0,
  );
  const soldThisMonthProfit = soldThisMonth.reduce((sum, v) => sum + v.netProfit, 0);
  const soldThisMonthRoi =
    soldThisMonthInvestment > 0
      ? Math.round((soldThisMonthProfit / soldThisMonthInvestment) * 1000) / 10
      : 0;

  return {
    totalInventory: vehicles.length,
    activeInventoryCount: vehicles.filter(
      (v) => v.dbStatus !== "sold" && v.dbStatus !== "loss",
    ).length,
    soldThisMonthCount: soldThisMonth.length,
    totalPurchaseCost: vehicles.reduce((sum, v) => sum + (v.purchasePrice ?? v.cost), 0),
    totalFees: vehicles.reduce((sum, v) => sum + v.auctionFees, 0),
    totalRepairs: vehicles.reduce((sum, v) => sum + v.repairs, 0),
    totalVehiclesCost: vehicles.reduce((sum, v) => sum + v.totalVehicleCost, 0),
    totalSalesTax: soldVehicles.reduce((sum, v) => sum + v.salesTax, 0),
    avgCommissionRate: Math.round(avgCommissionRate * 10) / 10,
    totalCommissions: soldVehicles.reduce((sum, v) => sum + v.commissionAmount, 0),
    missingTitles: vehicles.filter((v) => !v.titleReceived).length,
    titlesIn: vehicles.filter((v) => v.titleReceived).length,
    soldThisMonthProfit,
    soldThisMonthRoi,
  };
}

export function computeTableTotals(vehicles: InventoryVehicle[]): InventoryTableTotals {
  return vehicles.reduce(
    (acc, v) => ({
      purchasePrice: acc.purchasePrice + (v.purchasePrice ?? v.cost),
      fees: acc.fees + v.auctionFees,
      repairs: acc.repairs + v.repairs,
      flooringCost: acc.flooringCost + v.flooringCost,
      salesTax: acc.salesTax + v.salesTax,
      regFees: acc.regFees + v.registrationFees,
      totalInvestment: acc.totalInvestment + v.totalInvestment,
      totalVehicleCost: acc.totalVehicleCost + v.totalVehicleCost,
      commission: acc.commission + v.commissionAmount,
      netProfit: acc.netProfit + v.netProfit,
    }),
    {
      purchasePrice: 0,
      fees: 0,
      repairs: 0,
      flooringCost: 0,
      salesTax: 0,
      regFees: 0,
      totalInvestment: 0,
      totalVehicleCost: 0,
      commission: 0,
      netProfit: 0,
    },
  );
}

export function splitInventorySections(vehicles: InventoryVehicle[]) {
  const soldThisMonth = vehicles.filter((v) => v.soldThisMonth);
  const activeInventory = vehicles.filter((v) => !v.soldThisMonth);
  return { soldThisMonth, activeInventory };
}

export function buildInventoryKpiCards(stats: InventoryStats): InventoryKpiCard[] {
  return [
    {
      kpiKey: "total_inventory",
      columnKey: "vehicle",
      defaultColorHex: "#3aa0ff",
      label: "Total Inventory",
      value: String(stats.activeInventoryCount),
      footer: "vehicles on lot",
    },
    {
      kpiKey: "total_purchase_cost",
      columnKey: "purchase_price",
      defaultColorHex: "#ff9f43",
      label: "Purchase Cost",
      value: formatCurrency(stats.totalPurchaseCost),
      footer: "acquisition spend",
    },
    {
      kpiKey: "total_fees",
      columnKey: "fees",
      defaultColorHex: "#a07bff",
      label: "Total Fees",
      value: formatCurrency(stats.totalFees),
      footer: "title / admin / doc",
    },
    {
      kpiKey: "total_repairs",
      columnKey: "repairs",
      defaultColorHex: "#ff5470",
      label: "Total Repairs",
      value: formatCurrency(stats.totalRepairs),
      footer: "recon + parts",
    },
    {
      kpiKey: "total_vehicles_cost",
      columnKey: "total_vehicle_cost",
      defaultColorHex: "#23d18b",
      label: "Total Vehicle Cost",
      value: formatCurrency(stats.totalVehiclesCost),
      footer: "all-in, incl. flooring",
    },
    {
      kpiKey: "total_sales_tax",
      columnKey: "sales_tax",
      defaultColorHex: "#3aa0ff",
      label: "Sales Tax",
      value: formatCurrency(stats.totalSalesTax),
      footer: "paid at acquisition",
    },
    {
      kpiKey: "commission_overview",
      columnKey: "commission",
      defaultColorHex: "#a07bff",
      label: "Commission",
      value: formatCurrency(stats.totalCommissions),
      footer: "owed to reps",
    },
    {
      kpiKey: "titles",
      columnKey: "title",
      defaultColorHex: "#ff9f43",
      label: "Titles",
      value: `${stats.titlesIn}/${stats.totalInventory}`,
      footer: "in-hand / pending",
    },
    {
      kpiKey: "vehicles_sold_this_month",
      columnKey: "net_vehicle_profit",
      defaultColorHex: "#23d18b",
      label: "Sold This Month",
      value: String(stats.soldThisMonthCount),
      footer: "units moved",
    },
  ];
}

export const INVENTORY_STATUS_OPTIONS = [
  "In Stock",
  "Needs Attention",
  "Pending Deal",
  "Sold",
  "Marked Sold",
] as const;

export type InventoryStatusFilter = (typeof INVENTORY_STATUS_OPTIONS)[number] | "all";

export function matchesStatusFilter(
  vehicle: InventoryVehicle,
  status: InventoryStatusFilter,
): boolean {
  if (status === "all") return true;
  return getDisplayStatus(vehicle) === status;
}
