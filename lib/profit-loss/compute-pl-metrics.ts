import type { ProfitLossReport } from "./types";
import { formatCurrency, formatPercent } from "./types";

export function getReportSummary(report: ProfitLossReport) {
  const revenue = report.kpis.find((k) => k.id === "total_revenue");
  const netProfit = report.kpis.find((k) => k.id === "net_profit");
  const margin = report.kpis.find((k) => k.id === "net_profit_margin");

  return {
    revenue: revenue?.valueFormatted ?? formatCurrency(0),
    netProfit: netProfit?.valueFormatted ?? formatCurrency(0),
    margin: margin?.valueFormatted ?? formatPercent(0),
    period: report.period.label,
    comparison: report.comparisonPeriod.label,
  };
}

export function formatTableValue(value: number | null, isPercent = false): string {
  if (value === null) return "";
  if (isPercent) return formatPercent(value);
  return formatCurrency(value);
}
