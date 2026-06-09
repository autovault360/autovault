import type { KPIIconName } from "@/components/ui/kpi-card";

export type MissingTitleStatus = "in_progress" | "pending" | "overdue" | "resolved";

export type MissingTitleRecord = {
  id: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  imageUrl?: string;
  dateAcquired: string;
  daysMissing: number;
  reason: string;
  lastUpdate: string;
  status: MissingTitleStatus;
  location: string;
};

export type MissingTitlesStats = {
  totalMissing: number;
  totalMissingDelta: string;
  over30Days: number;
  over30DaysDelta: string;
  over60Days: number;
  over60DaysDelta: string;
  over90Days: number;
  over90DaysDelta: string;
  avgDaysMissing: number;
  avgDaysMissingDelta: string;
};

export type MissingTitlesDashboardData = {
  records: MissingTitleRecord[];
  stats: MissingTitlesStats;
  locations: string[];
};

export type DaysMissingFilter = "all" | "over_30" | "over_60" | "over_90";

export const MISSING_TITLE_STATUSES: MissingTitleStatus[] = [
  "in_progress",
  "pending",
  "overdue",
  "resolved",
];

const STATUS_LABELS: Record<MissingTitleStatus, string> = {
  in_progress: "In Progress",
  pending: "Pending",
  overdue: "Overdue",
  resolved: "Resolved",
};

export function formatMissingTitleStatus(status: MissingTitleStatus): string {
  return STATUS_LABELS[status];
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export function getMissingTitleVehicleName(record: MissingTitleRecord): string {
  const base = `${record.year} ${record.make} ${record.model}`;
  return record.trim ? `${base} ${record.trim}` : base;
}

export function getDaysMissingColor(days: number): string {
  if (days >= 30) return "text-orange-400";
  return "text-emerald-400";
}

export function buildMissingTitlesStatsCards(stats: MissingTitlesStats) {
  return [
    {
      icon: "car" as KPIIconName,
      color: "blue",
      label: "Total Missing Titles",
      value: String(stats.totalMissing),
      unit: "Vehicles",
      delta: stats.totalMissingDelta,
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints:
        "0,38 25,32 50,30 75,28 100,24 125,22 150,18 175,14 200,12 220,8",
    },
    {
      icon: "trending-up" as KPIIconName,
      color: "orange",
      label: "Over 30 Days",
      value: String(stats.over30Days),
      unit: "Vehicles",
      delta: stats.over30DaysDelta,
      link: "",
      sparkColor: "#f97316",
      sparkPoints:
        "0,36 25,34 50,30 75,28 100,26 125,22 150,18 175,16 200,12 220,10",
    },
    {
      icon: "trending-up" as KPIIconName,
      color: "amber",
      label: "Over 60 Days",
      value: String(stats.over60Days),
      unit: "Vehicles",
      delta: stats.over60DaysDelta,
      link: "",
      sparkColor: "#eab308",
      sparkPoints:
        "0,34 25,32 50,28 75,26 100,24 125,20 150,18 175,14 200,12 220,10",
    },
    {
      icon: "trending-down" as KPIIconName,
      color: "red",
      label: "Over 90 Days",
      value: String(stats.over90Days),
      unit: "Vehicles",
      delta: stats.over90DaysDelta,
      link: "",
      sparkColor: "#ef4444",
      sparkPoints:
        "0,32 25,30 50,28 75,26 100,24 125,22 150,20 175,18 200,14 220,12",
      deltaColor: "red" as const,
    },
    {
      icon: "bar-chart-3" as KPIIconName,
      color: "violet",
      label: "Avg Days Missing",
      value: String(stats.avgDaysMissing),
      unit: "Days",
      delta: stats.avgDaysMissingDelta,
      link: "",
      sparkColor: "#a855f7",
      sparkPoints:
        "0,40 25,36 50,32 75,30 100,26 125,22 150,18 175,14 200,10 220,8",
    },
  ];
}
