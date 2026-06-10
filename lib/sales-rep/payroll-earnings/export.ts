import { formatSoldDate, getVehicleLabel } from "./calculations";
import {
  formatCommissionCurrency,
  formatCommissionPrice,
} from "@/lib/sales-rep/commissions/format";
import type { IEarningsByVehicle } from "./types";

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
  on_hold: "On Hold",
};

export function exportPayrollEarningsCsv(
  rows: IEarningsByVehicle[],
  filename = "payroll-earnings.csv",
): void {
  const headers = [
    "Vehicle",
    "Stock #",
    "Customer",
    "Phone",
    "Sold Date",
    "Sold Price",
    "Gross Profit",
    "Commission Rate",
    "Commission Earned",
    "Payment Status",
    "Deal Jacket",
    "Employee ID",
    "Invoice Ref",
    "Transaction ID",
  ];

  const data = rows.map((r) => [
    getVehicleLabel(r),
    r.stockNumber,
    r.customerName,
    r.customerPhone,
    formatSoldDate(r.soldDate),
    formatCommissionPrice(r.soldPrice),
    formatCommissionPrice(r.grossProfit),
    `${r.commissionRate}%`,
    formatCommissionCurrency(r.commissionEarned),
    STATUS_LABELS[r.paymentStatus] ?? r.paymentStatus,
    r.dealJacketId,
    r.employeeId,
    r.invoiceRef,
    r.transactionId,
  ]);

  const csvContent = [
    headers.join(","),
    ...data.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPayslipCsv(row: IEarningsByVehicle): void {
  exportPayrollEarningsCsv(
    [row],
    `payslip-${row.dealJacketId}-${new Date().toISOString().split("T")[0]}.csv`,
  );
}
