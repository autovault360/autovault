import type { ArbitrationRecord } from "./types";

export function filterArbitrationRecords(
  records: ArbitrationRecord[],
  {
    search,
    dealer,
    reason,
  }: {
    search: string;
    dealer: string;
    reason: string;
  },
): ArbitrationRecord[] {
  const q = search.trim().toLowerCase();

  return records.filter((record) => {
    if (dealer !== "all" && record.buyerDealer !== dealer) return false;
    if (reason !== "all" && record.arbitrationReason !== reason) return false;

    if (!q) return true;

    return (
      record.vin.toLowerCase().includes(q) ||
      record.stockNumber.toLowerCase().includes(q) ||
      String(record.year).includes(q) ||
      record.make.toLowerCase().includes(q) ||
      record.model.toLowerCase().includes(q) ||
      (record.trim?.toLowerCase().includes(q) ?? false) ||
      record.buyerDealer.toLowerCase().includes(q) ||
      record.arbitrationReason.toLowerCase().includes(q) ||
      record.latestNotePreview.toLowerCase().includes(q) ||
      (record.exteriorColor?.toLowerCase().includes(q) ?? false)
    );
  });
}
