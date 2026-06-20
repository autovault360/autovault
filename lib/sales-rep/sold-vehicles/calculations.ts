import type {
  ISalesRepSoldVehicle,
  ISalesRepSoldVehicleKpiSummary,
  SoldVehicleDateRange,
  SoldVehicleFilterState,
  SoldVehicleTab,
} from "./types";

export function getVehicleLabel(vehicle: ISalesRepSoldVehicle): string {
  const trim = vehicle.trim ? ` ${vehicle.trim}` : "";
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${trim}`;
}

export function formatSoldDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMonthRange(year: number, month: number): SoldVehicleDateRange {
  const d = new Date(year, month - 1, 1);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return {
    start: `${y}-${String(m).padStart(2, "0")}-01`,
    end: `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function getTabDateRange(tab: SoldVehicleTab): SoldVehicleDateRange | null {
  if (tab === "custom") return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (tab === "this_month") return getMonthRange(year, month);
  if (tab === "last_month") return getMonthRange(year, month - 1);
  if (tab === "this_year") return { start: `${year}-01-01`, end: `${year}-12-31` };

  return getMonthRange(year, month);
}

export function isDateInRange(
  iso: string,
  range: SoldVehicleDateRange,
): boolean {
  return iso >= range.start && iso <= range.end;
}

export function filterSoldVehicles(
  vehicles: ISalesRepSoldVehicle[],
  options: {
    tab: SoldVehicleTab;
    customRange?: SoldVehicleDateRange | null;
    filters: SoldVehicleFilterState;
  },
): ISalesRepSoldVehicle[] {
  const { tab, customRange, filters } = options;
  const searchValidation = validateSearchQuery(filters.search);
  const query =
    searchValidation === null ? filters.search.trim().toLowerCase() : "";

  let dateRange = getTabDateRange(tab);
  if (tab === "custom" && customRange) {
    dateRange = customRange;
  }

  return vehicles.filter((v) => {
    if (dateRange && !isDateInRange(v.soldDate, dateRange)) return false;
    if (filters.make !== "all" && v.make !== filters.make) return false;
    if (filters.model !== "all" && v.model !== filters.model) return false;
    if (filters.status !== "all" && v.status !== filters.status) return false;

    if (!query) return true;

    const label = getVehicleLabel(v).toLowerCase();
    return (
      label.includes(query) ||
      v.make.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.stockNumber.toLowerCase().includes(query) ||
      v.customerName.toLowerCase().includes(query)
    );
  });
}

export function buildSoldVehicleKpiSummary(
  vehicles: ISalesRepSoldVehicle[],
): ISalesRepSoldVehicleKpiSummary {
  const count = vehicles.length;
  const grossProfit = vehicles.reduce((sum, v) => sum + v.grossProfit, 0);
  const commissionEarned = vehicles.reduce((sum, v) => sum + v.commission, 0);
  const avgGrossProfit = count > 0 ? Math.round(grossProfit / count) : 0;
  const completed = vehicles.filter((v) => v.status === "completed").length;
  const closingRate =
    count > 0 ? Math.round((completed / count) * 100) : 0;

  return {
    vehiclesSold: count,
    grossProfit,
    commissionEarned,
    avgGrossProfit,
    closingRate,
    vehiclesSoldTrend: "�†‘ 20% vs last month",
    grossProfitTrend: "�†‘ 18% vs last month",
    commissionTrend: "�†‘ 15% vs last month",
    avgGrossProfitTrend: "�†‘ 8% vs last month",
    closingRateTrend: "�†‘ 6% vs last month",
  };
}

export function getUniqueMakes(vehicles: ISalesRepSoldVehicle[]): string[] {
  return [...new Set(vehicles.map((v) => v.make))].sort();
}

export function getUniqueModels(
  vehicles: ISalesRepSoldVehicle[],
  make: string,
): string[] {
  const source =
    make === "all" ? vehicles : vehicles.filter((v) => v.make === make);
  return [...new Set(source.map((v) => v.model))].sort();
}

export function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < 2) return "Enter at least 2 characters to search.";
  if (trimmed.length > 100) return "Search query must be 100 characters or less.";
  return null;
}

export function getSoldVehicleTabCounts(
  vehicles: ISalesRepSoldVehicle[],
): Record<SoldVehicleTab, number> {
  const now = new Date();
  const year = now.getFullYear();
  const thisMonthStr = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const lastMonthYear = now.getMonth() === 0 ? year - 1 : year;
  const lastMonthStr = `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}`;
  const thisYearStr = `${year}`;

  const thisMonth = vehicles.filter((v) => v.soldDate.startsWith(thisMonthStr)).length;
  const lastMonthV = vehicles.filter((v) => v.soldDate.startsWith(lastMonthStr)).length;
  const thisYear = vehicles.filter((v) => v.soldDate.startsWith(thisYearStr)).length;

  return {
    all: vehicles.length,
    this_month: thisMonth,
    last_month: lastMonthV,
    this_year: thisYear,
    custom: 0,
  };
}

export function validateDateRange(
  range: SoldVehicleDateRange,
): string | null {
  if (!range.start || !range.end) {
    return "Both start and end dates are required.";
  }
  if (range.start > range.end) {
    return "Start date must be before or equal to end date.";
  }
  const today = new Date().toISOString().split("T")[0]!;
  if (range.end > today) {
    return "End date cannot be in the future.";
  }
  return null;
}
