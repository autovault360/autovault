import type { VehicleDetail } from "@/lib/vehicles/detail-types";

export function formatCurrencyDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyInput(value: number): string {
  if (Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type MarketStats = {
  marketAverage: number;
  marketLow: number;
  marketHigh: number;
  yourPriceVsAvg: number;
  yourPriceVsAvgPct: number;
  compareToMarketText: string;
  isBelowMarket: boolean;
};

export function computeMarketStats(
  vehicle: VehicleDetail,
  askingPrice?: number,
): MarketStats {
  const price = askingPrice ?? vehicle.price;
  const comparables = vehicle.comparables;

  let marketAverage: number;
  let marketLow: number;
  let marketHigh: number;

  if (comparables.length > 0) {
    const prices = comparables.map((c) => c.price);
    marketAverage = Math.round(
      prices.reduce((sum, p) => sum + p, 0) / prices.length,
    );
    marketLow = Math.min(...prices);
    marketHigh = Math.max(...prices);
  } else {
    marketAverage = vehicle.marketValue;
    marketLow = Math.round(vehicle.marketValue * 0.92);
    marketHigh = Math.round(vehicle.marketValue * 1.09);
  }

  const yourPriceVsAvg = price - marketAverage;
  const yourPriceVsAvgPct =
    marketAverage > 0 ? (yourPriceVsAvg / marketAverage) * 100 : 0;
  const isBelowMarket = yourPriceVsAvg < 0;
  const absDiff = Math.abs(yourPriceVsAvg);
  const compareToMarketText = isBelowMarket
    ? `$${absDiff.toLocaleString()} below market`
    : yourPriceVsAvg === 0
      ? "At market average"
      : `$${absDiff.toLocaleString()} above market`;

  return {
    marketAverage,
    marketLow,
    marketHigh,
    yourPriceVsAvg,
    yourPriceVsAvgPct,
    compareToMarketText,
    isBelowMarket,
  };
}

export function computePriceChange(current: number, next: number) {
  const delta = next - current;
  const pct = current > 0 ? (delta / current) * 100 : 0;
  return {
    delta,
    pct,
    isNegative: delta < 0,
    isPositive: delta > 0,
    isZero: delta === 0,
  };
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf";
}

export function validateFile(
  file: File,
  options: {
    maxSizeMB: number;
    allowedTypes: string[];
  },
): string | null {
  const maxBytes = options.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File must be under ${options.maxSizeMB}MB`;
  }
  const allowed = options.allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.replace("/*", "/"));
    }
    return file.type === type;
  });
  if (!allowed) {
    return "File type not allowed";
  }
  return null;
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
