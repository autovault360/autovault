import type { CpaProfitVehicleRow } from "./types";

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildProfitVehiclesCsv(rows: CpaProfitVehicleRow[]): string {
  const headers = [
    "Stock #",
    "Year / Make / Model",
    "VIN",
    "Date Sold",
    "Sale Price",
    "Total Cost",
    "Gross Profit ($)",
    "Gross Profit (%)",
    "Profit Margin",
    "Profit Per Day",
    "Vehicle Type",
  ];

  const lines = rows.map((row) =>
    [
      row.stockNumber,
      row.yearMakeModel,
      row.vin,
      row.dateSold,
      row.salePrice.toFixed(2),
      row.totalCost.toFixed(2),
      row.grossProfit.toFixed(2),
      row.grossProfitPct.toFixed(1),
      row.profitMargin,
      row.profitPerDay.toFixed(2),
      row.vehicleType,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return `\uFEFF${[headers.join(","), ...lines].join("\n")}`;
}

export function downloadProfitVehiclesCsv(rows: CpaProfitVehicleRow[], filename: string) {
  const csv = buildProfitVehiclesCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
