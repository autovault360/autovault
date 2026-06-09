import type { KPICardData } from "@/components/ui/kpi-card";
import { formatCurrency, formatCurrencyExact } from "./calculations";
import type {
  SaleType,
  SoldVehicleKpiStrip,
  SoldVehicleRecord,
  TransactionPaymentStatus,
} from "./types";

export function formatSoldDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function filterSoldVehicles(
  records: SoldVehicleRecord[],
  filters: {
    search?: string;
    saleType?: SaleType | "all";
    status?: TransactionPaymentStatus | "all";
    dateStart?: string;
    dateEnd?: string;
  },
): SoldVehicleRecord[] {
  const q = filters.search?.trim().toLowerCase() ?? "";

  return records.filter((row) => {
    if (
      filters.saleType &&
      filters.saleType !== "all" &&
      row.saleType !== filters.saleType
    ) {
      return false;
    }
    if (
      filters.status &&
      filters.status !== "all" &&
      row.paymentStatus !== filters.status
    ) {
      return false;
    }
    if (filters.dateStart && row.dateSold < filters.dateStart) {
      return false;
    }
    if (filters.dateEnd && row.dateSold > filters.dateEnd) {
      return false;
    }
    if (!q) return true;
    return (
      row.vin.toLowerCase().includes(q) ||
      row.stockNumber.toLowerCase().includes(q) ||
      row.buyer.toLowerCase().includes(q) ||
      row.dealNumber.toLowerCase().includes(q) ||
      row.vehicleLabel.toLowerCase().includes(q)
    );
  });
}

export function computeSoldVehicleStats(records: SoldVehicleRecord[]) {
  const pending = records.filter((r) => r.paymentStatus === "pending");
  const thisMonth = records.filter(
    (r) => r.dateSold >= "2024-05-01" && r.dateSold <= "2024-05-31",
  );

  const totalSales = records.reduce((s, r) => s + r.salePrice, 0);
  const totalGrossProfit = records.reduce((s, r) => s + r.grossProfit, 0);
  const pendingAmount = pending.reduce((s, r) => s + r.salePrice, 0);
  const avgGross =
    records.length > 0 ? Math.round(totalGrossProfit / records.length) : 0;

  return {
    total: records.length,
    totalSales,
    totalGrossProfit,
    averageGrossProfit: avgGross,
    soldThisMonth: thisMonth.length,
    pendingCount: pending.length,
    pendingAmount,
  };
}

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

export function buildSoldVehicleKpiStrip(
  records: SoldVehicleRecord[],
): SoldVehicleKpiStrip {
  const stats = computeSoldVehicleStats(records);

  const base = (label: string): Partial<KPICardData> => ({
    label,
    link: "#",
    sparkColor: "#3b82f6",
    sparkPoints,
  });

  return {
    totalSold: {
      ...base("Total Sold"),
      icon: "shopping-cart",
      color: "blue",
      value: String(stats.total),
      delta: "18% vs last month",
    } as SoldVehicleKpiStrip["totalSold"],
    totalSales: {
      ...base("Total Sales"),
      icon: "dollar-sign",
      color: "green",
      value: formatCurrency(stats.totalSales),
      delta: "22% vs last month",
    } as SoldVehicleKpiStrip["totalSales"],
    totalGrossProfit: {
      ...base("Total Gross Profit"),
      icon: "pie-chart",
      color: "violet",
      value: formatCurrency(stats.totalGrossProfit),
      delta: "21% vs last month",
    } as SoldVehicleKpiStrip["totalGrossProfit"],
    averageGrossProfit: {
      ...base("Average Gross Profit"),
      icon: "triangle-alert",
      color: "amber",
      value: formatCurrency(stats.averageGrossProfit),
      delta: "12% vs last month",
    } as SoldVehicleKpiStrip["averageGrossProfit"],
    soldThisMonth: {
      ...base("Sold This Month"),
      icon: "refresh-cw",
      color: "teal",
      value: String(stats.soldThisMonth),
      delta: "14% vs last month",
    } as SoldVehicleKpiStrip["soldThisMonth"],
    pendingPayments: {
      ...base("Pending Payments"),
      icon: "shield",
      color: "orange",
      value: String(stats.pendingCount),
      periodMetrics: [
        { value: String(stats.pendingCount), label: "Vehicles" },
        { value: formatCurrency(stats.pendingAmount), label: "Amount" },
      ],
    } as SoldVehicleKpiStrip["pendingPayments"],
  };
}

export function computeSoldVehicleTableFooter(records: SoldVehicleRecord[]) {
  const stats = computeSoldVehicleStats(records);
  return {
    count: stats.total,
    totalSales: stats.totalSales,
    totalGrossProfit: stats.totalGrossProfit,
    pendingAmount: stats.pendingAmount,
    formatted: {
      totalSales: formatCurrencyExact(stats.totalSales),
      totalGrossProfit: formatCurrencyExact(stats.totalGrossProfit),
      pendingAmount: formatCurrencyExact(stats.pendingAmount),
    },
  };
}
