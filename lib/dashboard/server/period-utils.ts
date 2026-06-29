export function getPeriodRange(
  viewMode: "monthly" | "yearly",
  month: number,
  year: number,
): { from: string; to: string } {
  if (viewMode === "yearly") {
    return {
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    };
  }

  const m = Math.max(1, Math.min(12, month));
  const from = `${year}-${String(m).padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, m, 0).getDate();
  const to = `${year}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  return { from, to };
}

export function getComparisonPeriodRange(
  viewMode: "monthly" | "yearly",
  month: number,
  year: number,
): { from: string; to: string } {
  if (viewMode === "yearly") {
    return {
      from: `${year - 1}-01-01`,
      to: `${year - 1}-12-31`,
    };
  }

  let m = month - 1;
  let y = year;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const daysInMonth = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  return { from, to };
}

export function buildPeriodLabel(from: string, to: string): string {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const year = toDate.getFullYear();
  return `${fmt(fromDate)} - ${fmt(toDate)}, ${year}`;
}

export function buildYearLabel(year: number): string {
  return `Year ${year}`;
}
