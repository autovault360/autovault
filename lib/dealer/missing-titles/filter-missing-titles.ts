import type { DaysMissingFilter, MissingTitleRecord } from "./types";

function matchesDaysFilter(days: number, filter: DaysMissingFilter): boolean {
  if (filter === "all") return true;
  if (filter === "over_30") return days >= 30;
  if (filter === "over_60") return days >= 60;
  if (filter === "over_90") return days >= 90;
  return true;
}

export function filterMissingTitleRecords(
  records: MissingTitleRecord[],
  {
    search,
    location,
    daysMissing,
  }: {
    search: string;
    location: string;
    daysMissing: DaysMissingFilter;
  },
): MissingTitleRecord[] {
  const q = search.trim().toLowerCase();

  return records.filter((record) => {
    if (location !== "all" && record.location !== location) return false;
    if (!matchesDaysFilter(record.daysMissing, daysMissing)) return false;

    if (!q) return true;

    return (
      record.vin.toLowerCase().includes(q) ||
      record.stockNumber.toLowerCase().includes(q) ||
      String(record.year).includes(q) ||
      record.make.toLowerCase().includes(q) ||
      record.model.toLowerCase().includes(q) ||
      (record.trim?.toLowerCase().includes(q) ?? false) ||
      record.reason.toLowerCase().includes(q)
    );
  });
}
