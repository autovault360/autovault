import type { DealJacketListItem } from "./types";
import {
  formatCommissionStatus,
  formatCurrency,
  formatDisplayDate,
  formatPaymentMethod,
  getVehicleDisplayName,
} from "./types";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildDealJacketsCsv(items: DealJacketListItem[]): string {
  const headers = [
    "Vehicle",
    "Stock #",
    "VIN",
    "Customer",
    "Phone",
    "Sale Date",
    "Sale Price",
    "Total Profit",
    "Sales Rep",
    "Commission",
    "Commission Status",
    "Payment Method",
    "Status",
  ];

  const rows = items.map((item) => [
    getVehicleDisplayName(item),
    item.stockNumber,
    item.vin,
    item.customerName,
    item.customerPhone,
    formatDisplayDate(item.saleDate),
    formatCurrency(item.salePrice),
    formatCurrency(item.totalProfit),
    item.salesRepName,
    formatCurrency(item.commissionAmount),
    formatCommissionStatus(item.commissionStatus),
    formatPaymentMethod(item.paymentMethod),
    "Sold",
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export function downloadDealJacketsCsv(
  items: DealJacketListItem[],
  filename?: string,
) {
  const csv = buildDealJacketsCsv(items);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename ?? `deal-jackets-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
