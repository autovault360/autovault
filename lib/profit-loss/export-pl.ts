import type { PlTableRow, ProfitLossReport } from "./types";
import { formatCurrency, formatPercent } from "./types";
import { enrichTableRows } from "./filter-pl-data";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getExportRows(report: ProfitLossReport) {
  return enrichTableRows(report.statementRows).filter(
    (row) => row.kind !== "section-header",
  );
}

export function buildPlCsv(report: ProfitLossReport): string {
  const headers = [
    "Category",
    report.period.columnLabel,
    report.comparisonPeriod.columnLabel,
    "$ Change",
    "% Change",
  ];

  const rows = getExportRows(report).map((row) => [
    row.label,
    row.thisMonth !== null ? formatCurrency(row.thisMonth) : "",
    row.lastMonth !== null ? formatCurrency(row.lastMonth) : "",
    row.dollarChangeFormatted,
    row.percentChangeFormatted,
  ]);

  const bom = "\uFEFF";
  return (
    bom +
    [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
  );
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadPlCsv(report: ProfitLossReport, filename?: string) {
  const csv = buildPlCsv(report);
  downloadBlob(
    csv,
    filename ?? `profit-loss-${report.period.start}.csv`,
    "text/csv;charset=utf-8;",
  );
}

export function downloadPlExcel(report: ProfitLossReport, filename?: string) {
  const csv = buildPlCsv(report);
  downloadBlob(
    csv,
    filename ?? `profit-loss-${report.period.start}.xls`,
    "application/vnd.ms-excel;charset=utf-8;",
  );
}

export function exportPlPdf() {
  window.print();
}

export function buildPlBreakdownCsv(
  items: { label: string; amount: number; lastMonth: number; percentOfTotal: number }[],
  title: string,
): string {
  const headers = ["Category", "This Period", "Last Period", "% of Total"];
  const rows = items.map((item) => [
    item.label,
    formatCurrency(item.amount),
    formatCurrency(item.lastMonth),
    formatPercent(item.percentOfTotal),
  ]);
  const bom = "\uFEFF";
  return (
    bom +
    [`# ${title}`, ""]
      .concat([headers.join(",")])
      .concat(rows.map((row) => row.map(escapeCsv).join(",")))
      .join("\n")
  );
}

export type { PlTableRow };
