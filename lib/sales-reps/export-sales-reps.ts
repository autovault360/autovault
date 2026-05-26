import type { SalesRepListItem } from "./types";
import { formatCurrency, formatPercent, formatSalesRepStatus } from "./types";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildSalesRepsCsv(reps: SalesRepListItem[]): string {
  const headers = [
    "Name",
    "Email",
    "Active",
    "Units Sold",
    "Gross Profit",
    "Net Profit",
    "Total Sales",
    "Avg Gross Per Unit",
    "Conversion Rate",
    "Goal Amount",
    "Goal Progress",
    "Status",
  ];

  const rows = reps.map((rep) => [
    rep.fullName,
    rep.email,
    rep.isActive ? "Yes" : "No",
    rep.unitsSold,
    formatCurrency(rep.grossProfit),
    formatCurrency(rep.netProfit),
    formatCurrency(rep.totalSales),
    formatCurrency(rep.avgGrossPerUnit),
    formatPercent(rep.conversionRate),
    formatCurrency(rep.goalAmount),
    `${rep.goalProgress}%`,
    formatSalesRepStatus(rep.status),
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export function downloadSalesRepsCsv(reps: SalesRepListItem[], filename?: string) {
  const csv = buildSalesRepsCsv(reps);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename ?? `sales-reps-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
