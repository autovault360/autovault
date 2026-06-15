import {
  formatDisplayDate,
  getArbitrationVehicleName,
  type ArbitrationRecord,
} from "./types";

export function downloadArbitrationCsv(records: ArbitrationRecord[]): void {
  const headers = [
    "Vehicle",
    "Stock #",
    "VIN",
    "Buyer / Dealer",
    "Arbitration Reason",
    "Date Listed",
    "Days in Arbitration",
    "Note Count",
    "Latest Note",
  ];

  const rows = records.map((record) => [
    getArbitrationVehicleName(record),
    record.stockNumber,
    record.vin,
    record.buyerDealer,
    record.arbitrationReason,
    formatDisplayDate(record.dateListed),
    String(record.daysInArbitration),
    String(record.noteCount),
    record.latestNotePreview,
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
  link.download = `arbitration-vehicles-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
