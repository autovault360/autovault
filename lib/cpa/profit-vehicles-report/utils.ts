import type { CpaProfitVehicleMargin } from "./types";

export function formatReportMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatReportPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatSoldDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("T")[0]?.split("-").map(Number) ?? [];
  if (!y || !m || !d) return isoDate;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export function normalizeVehicleType(
  bodyStyle: string | null | undefined,
  model: string,
): string {
  const text = `${bodyStyle ?? ""} ${model}`.toLowerCase();
  if (
    text.includes("truck") ||
    text.includes("pickup") ||
    text.includes("f-150") ||
    text.includes("silverado") ||
    text.includes("ram")
  ) {
    return "Truck";
  }
  if (
    text.includes("suv") ||
    text.includes("crossover") ||
    text.includes("wagon") ||
    text.includes("4runner") ||
    text.includes("explorer")
  ) {
    return "SUV";
  }
  if (text.includes("coupe") || text.includes("convertible")) {
    return "Coupe";
  }
  if (text.includes("sedan") || text.includes("car")) {
    return "Sedan";
  }
  return "Other";
}

export function resolveProfitMargin(grossProfitPct: number): CpaProfitVehicleMargin {
  if (grossProfitPct >= 20) return "High";
  if (grossProfitPct >= 10) return "Medium";
  return "Low";
}

export function daysBetween(start: string | null | undefined, end: string): number {
  if (!start) return 1;
  const startMs = new Date(`${start}T12:00:00`).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 1;
  return Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
}
