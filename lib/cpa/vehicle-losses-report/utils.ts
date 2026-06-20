import { normalizeVehicleType } from "@/lib/cpa/profit-vehicles-report/utils";
import type {
  CpaLossBreakdownSegment,
  CpaLossByReasonItem,
  CpaLossByTypeItem,
  CpaLossCategory,
  CpaLossReason,
  CpaLossTab,
  CpaVehicleLossRow,
  CpaVehicleLossesKpi,
} from "./types";

export { normalizeVehicleType };

export function formatReportMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLossMoney(value: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  return value < 0 ? `-${formatted}` : formatted;
}

export function formatLossPercent(value: number): string {
  const abs = Math.abs(value).toFixed(1);
  return value < 0 ? `-${abs}%` : `${abs}%`;
}

export function formatReportDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("T")[0]?.split("-").map(Number) ?? [];
  if (!y || !m || !d) return isoDate;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export function filterVehiclesByTab(
  vehicles: CpaVehicleLossRow[],
  tab: CpaLossTab,
): CpaVehicleLossRow[] {
  if (tab === "all") return vehicles;
  return vehicles.filter((vehicle) => vehicle.lossCategory === tab);
}

export function buildLossKpis(vehicles: CpaVehicleLossRow[]): CpaVehicleLossesKpi[] {
  const totalLoss = vehicles.reduce((sum, row) => sum + row.lossAmount, 0);
  const soldAtLoss = vehicles
    .filter((row) => row.lossCategory === "sold_at_loss")
    .reduce((sum, row) => sum + row.lossAmount, 0);
  const returnedToAuction = vehicles
    .filter((row) => row.lossCategory === "returned_to_auction")
    .reduce((sum, row) => sum + row.lossAmount, 0);
  const count = vehicles.length;
  const avgLoss = count > 0 ? Math.round(totalLoss / count) : 0;
  const largest = [...vehicles].sort((a, b) => a.lossAmount - b.lossAmount)[0];

  return [
    {
      id: "total-losses",
      label: "Total Losses",
      value: formatLossMoney(totalLoss),
      subtext: `${count} Vehicles`,
      icon: "dollar-sign",
      color: "red",
    },
    {
      id: "sold-at-loss",
      label: "Sold at a Loss",
      value: formatLossMoney(soldAtLoss),
      subtext: `${vehicles.filter((row) => row.lossCategory === "sold_at_loss").length} Vehicles`,
      icon: "tag",
      color: "orange",
    },
    {
      id: "returned-to-auction",
      label: "Returned to Auction",
      value: formatLossMoney(returnedToAuction),
      subtext: `${vehicles.filter((row) => row.lossCategory === "returned_to_auction").length} Vehicles`,
      icon: "gavel",
      color: "red",
    },
    {
      id: "avg-loss",
      label: "Average Loss per Vehicle",
      value: formatLossMoney(avgLoss),
      subtext: "Per Vehicle",
      icon: "refresh-cw",
      color: "orange",
    },
    {
      id: "largest-loss",
      label: "Largest Loss",
      value: largest ? formatLossMoney(largest.lossAmount) : formatLossMoney(0),
      subtext: largest?.yearMakeModel ?? "N/A",
      icon: "car",
      color: "violet",
    },
  ];
}

const BREAKDOWN_COLORS: Record<CpaLossCategory, string> = {
  sold_at_loss: "#f97316",
  returned_to_auction: "#3b82f6",
  unsold_inventory: "#22c55e",
  other_adjustments: "#eab308",
};

const BREAKDOWN_LABELS: Record<CpaLossCategory, string> = {
  sold_at_loss: "Sold at a Loss",
  returned_to_auction: "Returned to Auction",
  unsold_inventory: "Unsold Inventory (Written Down)",
  other_adjustments: "Other Adjustments",
};

const REASON_COLORS: Record<CpaLossReason, string> = {
  "Market Depreciation": "#a855f7",
  "Overpaid at Auction": "#f97316",
  "High Reconditioning": "#3b82f6",
  "Mechanical Issues": "#ef4444",
  Other: "#64748b",
};

export function buildLossBreakdown(vehicles: CpaVehicleLossRow[]): {
  segments: CpaLossBreakdownSegment[];
  total: number;
} {
  const categories: CpaLossCategory[] = [
    "sold_at_loss",
    "returned_to_auction",
    "unsold_inventory",
    "other_adjustments",
  ];

  const amounts = categories.map((category) => ({
    category,
    amount: vehicles
      .filter((row) => row.lossCategory === category)
      .reduce((sum, row) => sum + row.lossAmount, 0),
  }));

  const total = vehicles.reduce((sum, row) => sum + row.lossAmount, 0);
  const base = Math.abs(total) > 0 ? Math.abs(total) : 1;

  const segments: CpaLossBreakdownSegment[] = amounts.map(({ category, amount }) => ({
    id: category,
    label: BREAKDOWN_LABELS[category],
    amount,
    percent: Math.round((Math.abs(amount) / base) * 1000) / 10,
    color: BREAKDOWN_COLORS[category],
  }));

  segments.push({
    id: "total-losses",
    label: "Total Losses",
    amount: total,
    percent: 100,
    color: "#ef4444",
  });

  return { segments, total };
}

export function buildLossByReason(vehicles: CpaVehicleLossRow[]): CpaLossByReasonItem[] {
  const reasons: CpaLossReason[] = [
    "Market Depreciation",
    "Overpaid at Auction",
    "High Reconditioning",
    "Mechanical Issues",
    "Other",
  ];

  const total = Math.abs(
    vehicles.reduce((sum, row) => sum + row.lossAmount, 0),
  );
  const base = total > 0 ? total : 1;

  return reasons
    .map((reason) => {
      const amount = vehicles
        .filter((row) => row.lossReason === reason)
        .reduce((sum, row) => sum + row.lossAmount, 0);

      return {
        id: reason.toLowerCase().replace(/\s+/g, "-"),
        label: reason,
        amount,
        percent: Math.round((Math.abs(amount) / base) * 1000) / 10,
        color: REASON_COLORS[reason],
      };
    })
    .filter((item) => item.amount < 0);
}

export function buildLossByVehicleType(vehicles: CpaVehicleLossRow[]): CpaLossByTypeItem[] {
  const map = new Map<string, number>();
  for (const vehicle of vehicles) {
    map.set(
      vehicle.vehicleType,
      (map.get(vehicle.vehicleType) ?? 0) + vehicle.lossAmount,
    );
  }

  const total = Math.abs(
    vehicles.reduce((sum, row) => sum + row.lossAmount, 0),
  );
  const base = total > 0 ? total : 1;

  return Array.from(map.entries())
    .map(([label, amount]) => ({
      id: label.toLowerCase(),
      label,
      amount,
      percent: Math.round((Math.abs(amount) / base) * 1000) / 10,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}
