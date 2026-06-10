import type {
  IEarningsByVehicle,
  IPayrollEarningsBreakdown,
  IPayrollEarningsKpiSummary,
  PayrollEarningsFilterState,
} from "./types";

export function getVehicleLabel(row: IEarningsByVehicle): string {
  const trim = row.trim ? ` ${row.trim}` : "";
  return `${row.year} ${row.make} ${row.model}${trim}`;
}

export function formatSoldDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < 2) return "Enter at least 2 characters to search.";
  if (trimmed.length > 100) return "Search query must be 100 characters or less.";
  return null;
}

export function filterEarningsByVehicle(
  rows: IEarningsByVehicle[],
  filters: PayrollEarningsFilterState,
): IEarningsByVehicle[] {
  const searchValidation = validateSearchQuery(filters.search);
  const query =
    searchValidation === null ? filters.search.trim().toLowerCase() : "";

  return rows.filter((row) => {
    if (
      filters.paymentStatus !== "all" &&
      row.paymentStatus !== filters.paymentStatus
    ) {
      return false;
    }
    if (
      filters.payrollCycle !== "all" &&
      row.paymentStatus !== filters.payrollCycle
    ) {
      return false;
    }

    if (!query) return true;

    return (
      getVehicleLabel(row).toLowerCase().includes(query) ||
      row.customerName.toLowerCase().includes(query) ||
      row.stockNumber.toLowerCase().includes(query) ||
      row.dealJacketId.toLowerCase().includes(query) ||
      row.employeeId.toLowerCase().includes(query) ||
      row.invoiceRef.toLowerCase().includes(query) ||
      row.transactionId.toLowerCase().includes(query)
    );
  });
}

export function buildKpiFromRows(
  rows: IEarningsByVehicle[],
  base: IPayrollEarningsKpiSummary,
): IPayrollEarningsKpiSummary {
  const total = rows.reduce((sum, r) => sum + r.commissionEarned, 0);
  const count = rows.length;
  return {
    ...base,
    totalEarnings: total,
    totalCommissions: total,
    vehiclesSold: count,
    avgCommissionPerVehicle: count > 0 ? total / count : 0,
  };
}

export function buildBreakdownFromRows(
  rows: IEarningsByVehicle[],
  base: IPayrollEarningsBreakdown,
): IPayrollEarningsBreakdown {
  const totalCommissions = rows.reduce((sum, r) => sum + r.commissionEarned, 0);
  return {
    ...base,
    totalCommissions,
    netPay: totalCommissions + base.otherBonuses + base.adjustments - base.chargebacks,
  };
}
