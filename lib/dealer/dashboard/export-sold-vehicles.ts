import { formatCurrencyExact } from "./calculations";
import { formatSoldDate } from "./sold-vehicle-calculations";
import {
  PAYMENT_METHOD_LABELS,
  SALE_TYPE_LABELS,
} from "./sold-vehicle-constants";
import type { SoldVehicleRecord } from "./types";

function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportSoldVehiclesCsv(
  records: SoldVehicleRecord[],
  filename = "sold-vehicles.csv",
): void {
  const headers = [
    "Date Sold",
    "Vehicle",
    "Stock #",
    "VIN",
    "Buyer",
    "Sale Type",
    "Sale Price",
    "Gross Profit",
    "Gross Profit %",
    "Payment Status",
    "Payment Method",
    "Deal #",
    "Documents",
    "Notes",
  ];

  const rows = records.map((row) => [
    formatSoldDate(row.dateSold),
    row.vehicleLabel,
    row.stockNumber,
    row.vin,
    row.buyer,
    SALE_TYPE_LABELS[row.saleType],
    formatCurrencyExact(row.salePrice),
    formatCurrencyExact(row.grossProfit),
    `${row.grossProfitPercent}%`,
    row.paymentStatus,
    PAYMENT_METHOD_LABELS[row.paymentMethod],
    row.dealNumber,
    String(row.documents.length),
    row.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
