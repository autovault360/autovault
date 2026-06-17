import {
  DEFAULT_REPORTS_FILTERS,
  type ReportsDrilldownType,
  type ReportsFilters,
} from "@/lib/reports-reminders/types";

export function filtersFromSearchParams(searchParams: URLSearchParams): ReportsFilters {
  const dateRange = searchParams.get("dateRange");
  return {
    ...DEFAULT_REPORTS_FILTERS,
    dateRange: isDateRange(dateRange) ? dateRange : DEFAULT_REPORTS_FILTERS.dateRange,
    customFrom: searchParams.get("customFrom") ?? undefined,
    customTo: searchParams.get("customTo") ?? undefined,
    salesRep: searchParams.get("salesRep") ?? DEFAULT_REPORTS_FILTERS.salesRep,
    vehicle: searchParams.get("vehicle") ?? DEFAULT_REPORTS_FILTERS.vehicle,
    customer: searchParams.get("customer") ?? DEFAULT_REPORTS_FILTERS.customer,
    category: searchParams.get("category") ?? DEFAULT_REPORTS_FILTERS.category,
    dealJacket: searchParams.get("dealJacket") ?? DEFAULT_REPORTS_FILTERS.dealJacket,
    state: searchParams.get("state") ?? DEFAULT_REPORTS_FILTERS.state,
    search: searchParams.get("search") ?? undefined,
  };
}

export function drilldownTypeFromSearchParams(searchParams: URLSearchParams): ReportsDrilldownType {
  const type = searchParams.get("type");
  return isDrilldownType(type) ? type : "report-summary";
}

function isDateRange(value: string | null): value is ReportsFilters["dateRange"] {
  return ["today", "this_week", "this_month", "last_month", "quarter", "year", "custom"].includes(value ?? "");
}

function isDrilldownType(value: string | null): value is ReportsDrilldownType {
  return [
    "total-revenue",
    "gross-profit",
    "net-profit",
    "vehicles-sold",
    "vehicles-purchased",
    "total-expenses",
    "sales-tax-due",
    "payroll-paid",
    "report-summary",
    "sales-performance",
    "inventory-overview",
    "expense-report",
    "reminders-overview",
    "profit-loss-breakdown",
    "payroll-commission",
    "deal-jacket-status",
    "cpa-report-center",
    "audit-readiness",
    "custom-report-builder",
  ].includes(value ?? "");
}
