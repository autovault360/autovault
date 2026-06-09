import type { MissingTitleRecord } from "./types";
import {
  formatDisplayDate,
  formatMissingTitleStatus,
  getMissingTitleVehicleName,
} from "./types";

export function downloadMissingTitlesCsv(records: MissingTitleRecord[]) {
  const headers = [
    "Vehicle",
    "Stock #",
    "VIN",
    "Date Acquired",
    "Days Missing",
    "Reason",
    "Last Update",
    "Status",
    "Location",
  ];

  const rows = records.map((record) => [
    getMissingTitleVehicleName(record),
    record.stockNumber,
    record.vin,
    formatDisplayDate(record.dateAcquired),
    String(record.daysMissing),
    record.reason,
    formatDisplayDate(record.lastUpdate),
    formatMissingTitleStatus(record.status),
    record.location,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `missing-titles-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
