export function formatAvMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatAvSignedMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}

export function formatAvPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatAvShortDate(isoDate: string): string {
  const date = new Date(`${isoDate.split("T")[0]}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatAvTableDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("T")[0]?.split("-").map(Number) ?? [];
  if (!y || !m || !d) return isoDate;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export function daysBetweenDates(
  start: string | null | undefined,
  end: string,
): number {
  if (!start) return 1;
  const startMs = new Date(`${start.split("T")[0]}T12:00:00`).getTime();
  const endMs = new Date(`${end.split("T")[0]}T12:00:00`).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 1;
  return Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
}
