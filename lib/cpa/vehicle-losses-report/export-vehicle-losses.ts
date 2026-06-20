import type { CpaVehicleLossRow } from "./types";

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildVehicleLossesCsv(rows: CpaVehicleLossRow[]): string {
  const headers = [
    "Stock #",
    "Year / Make / Model",
    "VIN",
    "Date",
    "Status",
    "Cost of Vehicle",
    "Reconditioning",
    "Total Cost",
    "Sale Price / Result",
    "Loss ($)",
    "Loss %",
    "Loss Reason",
  ];

  const lines = rows.map((row) =>
    [
      row.stockNumber,
      row.yearMakeModel,
      row.vin,
      row.date,
      row.status,
      row.vehicleCost.toFixed(2),
      row.reconditioning.toFixed(2),
      row.totalCost.toFixed(2),
      row.salePriceOrResult.toFixed(2),
      row.lossAmount.toFixed(2),
      row.lossPct.toFixed(1),
      row.lossReason,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return `\uFEFF${[headers.join(","), ...lines].join("\n")}`;
}

export function downloadVehicleLossesCsv(rows: CpaVehicleLossRow[], filename: string) {
  const csv = buildVehicleLossesCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
