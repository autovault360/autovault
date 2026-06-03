import type { CalendarReport } from "./types";
import { formatCurrency } from "@/lib/profit-loss/types";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCalendarCsv(report: CalendarReport, year: number): string {
  const headers = [
    "Date",
    "Units Sold",
    "Total Gross",
    "Total Commissions",
    "Sales Reps",
  ];

  const rows = report.dailyActivity
    .filter((d) => d.date.startsWith(String(year)))
    .map((d) => [
      d.date,
      d.unitsSold,
      formatCurrency(d.totalGross),
      formatCurrency(d.totalCommissions),
      d.salesReps.map((r) => `${r.repName} (${r.unitsSold})`).join("; "),
    ]);

  const bom = "\uFEFF";
  return (
    bom +
    [`Calendar Report ${year}`, ""]
      .concat([headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))])
      .join("\n")
  );
}

export function downloadCalendarCsv(report: CalendarReport, year: number) {
  const csv = buildCalendarCsv(report, year);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `calendar-${year}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportCalendarPdf() {
  window.print();
}
