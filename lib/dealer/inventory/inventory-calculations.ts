import type { KPICardData } from "@/components/ui/kpi-card";
import {
  formatCurrency,
  formatCurrencyExact,
  totalVehicleCost,
} from "@/lib/dealer/dashboard/calculations";
import type {
  InventoryKpiFilterKey,
  InventoryKpiStrip,
  VehicleCondition,
  WholesaleInventoryStatus,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

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

export function isActiveInventory(vehicle: WholesaleVehicle): boolean {
  return (
    vehicle.inventoryStatus === "in_stock" ||
    vehicle.inventoryStatus === "pending_sale"
  );
}

export function matchesKpiFilter(
  vehicle: WholesaleVehicle,
  filter: InventoryKpiFilterKey,
): boolean {
  switch (filter) {
    case "missing_titles":
      return vehicle.titleStatus === "missing";
    case "pending_sale":
      return vehicle.inventoryStatus === "pending_sale";
    case "sold_this_month":
      return (
        vehicle.inventoryStatus === "sold" && isInCurrentMonth(vehicle.soldAt)
      );
    default:
      return true;
  }
}

export function filterInventory(
  vehicles: WholesaleVehicle[],
  filters: {
    search?: string;
    inventoryStatus?: WholesaleInventoryStatus | "all";
    location?: string;
    condition?: VehicleCondition | "all";
    kpiFilter?: InventoryKpiFilterKey;
  },
): WholesaleVehicle[] {
  const q = filters.search?.trim().toLowerCase() ?? "";

  return vehicles.filter((vehicle) => {
    if (
      filters.inventoryStatus &&
      filters.inventoryStatus !== "all" &&
      vehicle.inventoryStatus !== filters.inventoryStatus
    ) {
      return false;
    }
    if (
      filters.location &&
      filters.location !== "all" &&
      vehicle.location !== filters.location
    ) {
      return false;
    }
    if (
      filters.condition &&
      filters.condition !== "all" &&
      vehicle.condition !== filters.condition
    ) {
      return false;
    }
    if (
      filters.kpiFilter &&
      filters.kpiFilter !== "all" &&
      !matchesKpiFilter(vehicle, filters.kpiFilter)
    ) {
      return false;
    }
    if (!q) return true;
    return (
      vehicle.vin.toLowerCase().includes(q) ||
      vehicle.stockNumber.toLowerCase().includes(q) ||
      vehicle.make.toLowerCase().includes(q) ||
      vehicle.model.toLowerCase().includes(q) ||
      `${vehicle.year}`.includes(q) ||
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(q)
    );
  });
}

export function computeInventoryStats(vehicles: WholesaleVehicle[]) {
  const active = vehicles.filter(isActiveInventory);
  const missingTitles = vehicles.filter((v) => v.titleStatus === "missing");
  const pendingSale = vehicles.filter(
    (v) => v.inventoryStatus === "pending_sale",
  );
  const soldThisMonth = vehicles.filter(
    (v) => v.inventoryStatus === "sold" && isInCurrentMonth(v.soldAt),
  );

  const totalValue = active.reduce(
    (sum, v) => sum + totalVehicleCost(v.costs),
    0,
  );
  const avgDays =
    active.length > 0
      ? Math.round(
          active.reduce((sum, v) => sum + v.daysInLot, 0) / active.length,
        )
      : 0;

  const onHoldPayments = missingTitles
    .filter((v) => v.inventoryStatus === "sold")
    .reduce((sum, v) => sum + (v.soldPrice ?? 0), 0);

  const avgDaysTitlePending =
    missingTitles.length > 0
      ? Math.round(
          missingTitles.reduce(
            (sum, v) => sum + (v.daysSinceTitlePending ?? 0),
            0,
          ) / missingTitles.length,
        )
      : 0;

  return {
    totalInInventory: active.length,
    totalInventoryValue: totalValue,
    avgDaysInInventory: avgDays,
    missingTitles: missingTitles.length,
    pendingSale: pendingSale.length,
    soldThisMonth: soldThisMonth.length,
    onHoldPayments,
    avgDaysTitlePending,
    missingTitlesValue: missingTitles.reduce(
      (sum, v) => sum + totalVehicleCost(v.costs),
      0,
    ),
  };
}

export function buildInventoryKpiStrip(
  vehicles: WholesaleVehicle[],
): InventoryKpiStrip {
  const stats = computeInventoryStats(vehicles);

  const base = (label: string): Partial<KPICardData> => ({
    label,
    link: "#",
    sparkColor: "#3b82f6",
    sparkPoints,
  });

  return {
    totalInInventory: {
      ...base("Total in Inventory"),
      icon: "car",
      color: "blue",
      value: String(stats.totalInInventory),
      unit: "Vehicles",
      delta: "vs last month",
    } as InventoryKpiStrip["totalInInventory"],
    totalInventoryValue: {
      ...base("Total Inventory Value"),
      icon: "dollar-sign",
      color: "green",
      value: formatCurrency(stats.totalInventoryValue),
      delta: "vs last month",
    } as InventoryKpiStrip["totalInventoryValue"],
    avgDaysInInventory: {
      ...base("Avg Days in Inventory"),
      icon: "refresh-cw",
      color: "violet",
      value: String(stats.avgDaysInInventory),
      unit: "Days",
      delta: "vs last month",
    } as InventoryKpiStrip["avgDaysInInventory"],
    missingTitles: {
      ...base("Missing Titles"),
      icon: "triangle-alert",
      color: "red",
      value: String(stats.missingTitles),
      unit: "Vehicles",
      delta: "vs last month",
    } as InventoryKpiStrip["missingTitles"],
    pendingSale: {
      ...base("Pending Sale"),
      icon: "gavel",
      color: "violet",
      value: String(stats.pendingSale),
      unit: "Vehicles",
      delta: "vs last month",
    } as InventoryKpiStrip["pendingSale"],
    soldThisMonth: {
      ...base("Sold This Month"),
      icon: "shopping-cart",
      color: "green",
      value: String(stats.soldThisMonth),
      delta: "vs last month",
    } as InventoryKpiStrip["soldThisMonth"],
  };
}

export function computeInventoryTableFooter(vehicles: WholesaleVehicle[]) {
  const count = vehicles.length;
  const totalCost = vehicles.reduce(
    (sum, v) => sum + totalVehicleCost(v.costs),
    0,
  );
  const totalWholesaleValue = vehicles.reduce(
    (sum, v) => sum + v.wholesaleValue,
    0,
  );
  const totalProfit = vehicles.reduce((sum, v) => sum + (v.profit ?? 0), 0);

  return {
    count,
    totalCost,
    totalWholesaleValue,
    totalProfit,
    formatted: {
      totalCost: formatCurrencyExact(totalCost),
      totalWholesaleValue: formatCurrencyExact(totalWholesaleValue),
      totalProfit: formatCurrencyExact(totalProfit),
    },
  };
}

export function getUniqueLocations(vehicles: WholesaleVehicle[]): string[] {
  return [...new Set(vehicles.map((v) => v.location).filter(Boolean))].sort();
}

export function getPendingSaleVehicles(
  vehicles: WholesaleVehicle[],
): WholesaleVehicle[] {
  return vehicles.filter((v) => v.inventoryStatus === "pending_sale");
}

export function getMissingTitleVehicles(
  vehicles: WholesaleVehicle[],
): WholesaleVehicle[] {
  return vehicles.filter((v) => v.titleStatus === "missing");
}

export function getSoldThisMonthVehicles(
  vehicles: WholesaleVehicle[],
): WholesaleVehicle[] {
  return vehicles.filter(
    (v) => v.inventoryStatus === "sold" && isInCurrentMonth(v.soldAt),
  );
}
