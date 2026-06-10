import { formatSoldDate, getVehicleLabel } from "./calculations";
import { formatCommissionCurrency, formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import type { ISalesRepSoldVehicle } from "./types";

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportSoldVehiclesCsv(
  vehicles: ISalesRepSoldVehicle[],
  filename = "my-sold-vehicles.csv",
): void {
  const headers = [
    "Vehicle",
    "Stock #",
    "Customer",
    "Phone",
    "Sold Date",
    "Sold Price",
    "Cost",
    "Gross Profit",
    "Commission",
    "Status",
    "Deal Jacket #",
  ];

  const rows = vehicles.map((v) => [
    getVehicleLabel(v),
    v.stockNumber,
    v.customerName,
    v.customerPhone,
    formatSoldDate(v.soldDate),
    formatCommissionPrice(v.soldPrice),
    formatCommissionPrice(v.cost),
    formatCommissionPrice(v.grossProfit),
    formatCommissionCurrency(v.commission),
    v.status,
    v.dealJacketId,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
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
