import type {
  ISalesRepVehicleAlert,
  IVehicleAlertKpiSummary,
  SortOption,
  VehicleAlertDateRange,
  VehicleAlertFilterState,
  VehicleAlertTab,
} from "./types";

export function getVehicleLabel(alert: ISalesRepVehicleAlert): string {
  const trim = alert.trim ? ` ${alert.trim}` : "";
  return `${alert.year} ${alert.make} ${alert.model}${trim}`;
}

export function formatAlertDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getRelativeTime(iso: string): string {
  const then = new Date(`${iso}T12:00:00`).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function getDaysSince(iso: string): number {
  const then = new Date(`${iso}T12:00:00`).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

export function buildVehicleAlertKpiSummary(
  alerts: ISalesRepVehicleAlert[],
): IVehicleAlertKpiSummary {
  const active = alerts.filter((a) => a.status !== "resolved");
  const totalValue = active.reduce((sum, a) => sum + a.soldPrice, 0);

  const oldest = active.reduce<ISalesRepVehicleAlert | null>((acc, alert) => {
    if (!acc) return alert;
    return alert.pendingSince < acc.pendingSince ? alert : acc;
  }, null);

  const oldestPendingDays = oldest ? getDaysSince(oldest.pendingSince) : 0;

  return {
    pendingCount: active.length,
    totalValue,
    oldestPendingDays,
    oldestPendingDate: oldest
      ? formatAlertDate(oldest.pendingSince)
      : "—",
  };
}

const TAB_STATUS_MAP: Record<VehicleAlertTab, string | null> = {
  all_pending: null,
  pending_documents: "pending_documents",
  under_review: "under_review",
  needs_changes: "needs_changes",
};

export function filterVehicleAlerts(
  alerts: ISalesRepVehicleAlert[],
  options: {
    tab: VehicleAlertTab;
    filters: VehicleAlertFilterState;
    dateRange?: VehicleAlertDateRange | null;
  },
): ISalesRepVehicleAlert[] {
  const { tab, filters, dateRange } = options;
  const searchValidation = validateSearchQuery(filters.search);
  const query =
    searchValidation === null ? filters.search.trim().toLowerCase() : "";

  const tabStatus = TAB_STATUS_MAP[tab];

  let result = alerts.filter((a) => {
    if (a.status === "resolved") return false;
    if (tabStatus && a.status !== tabStatus) return false;
    if (filters.make !== "all" && a.make !== filters.make) return false;
    if (filters.status !== "all" && a.status !== filters.status) return false;
    if (filters.alertType !== "all" && a.alertType !== filters.alertType)
      return false;
    if (filters.priority !== "all" && a.priority !== filters.priority)
      return false;

    if (dateRange) {
      if (a.pendingSince < dateRange.start || a.pendingSince > dateRange.end) {
        return false;
      }
    }

    if (!query) return true;

    return (
      getVehicleLabel(a).toLowerCase().includes(query) ||
      a.vin.toLowerCase().includes(query) ||
      a.stockNumber.toLowerCase().includes(query) ||
      a.customerName.toLowerCase().includes(query) ||
      a.alertTitle.toLowerCase().includes(query) ||
      a.make.toLowerCase().includes(query) ||
      a.model.toLowerCase().includes(query)
    );
  });

  result = sortVehicleAlerts(result, filters.sort);
  return result;
}

export function sortVehicleAlerts(
  alerts: ISalesRepVehicleAlert[],
  sort: SortOption,
): ISalesRepVehicleAlert[] {
  const sorted = [...alerts];
  switch (sort) {
    case "newest_first":
      return sorted.sort((a, b) => b.pendingSince.localeCompare(a.pendingSince));
    case "price_high":
      return sorted.sort((a, b) => b.soldPrice - a.soldPrice);
    case "price_low":
      return sorted.sort((a, b) => a.soldPrice - b.soldPrice);
    case "oldest_first":
    default:
      return sorted.sort((a, b) => a.pendingSince.localeCompare(b.pendingSince));
  }
}

export function getUniqueMakes(alerts: ISalesRepVehicleAlert[]): string[] {
  return [...new Set(alerts.map((a) => a.make))].sort();
}

export function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < 2) return "Enter at least 2 characters to search.";
  if (trimmed.length > 100) return "Search query must be 100 characters or less.";
  return null;
}

export function validateDateRange(
  range: VehicleAlertDateRange,
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
