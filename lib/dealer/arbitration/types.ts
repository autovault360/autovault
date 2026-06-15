import type { KPIIconName } from "@/components/ui/kpi-card";

export type ArbitrationRecord = {
  id: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  exteriorColor?: string;
  imageUrl?: string;
  buyerDealer: string;
  arbitrationReason: string;
  dateListed: string;
  daysInArbitration: number;
  latestNotePreview: string;
  noteCount: number;
  location: string;
};

export type ArbitrationStats = {
  totalArbitration: number;
  listedThisMonth: number;
  withTeamNotes: number;
  uniqueDealers: number;
  avgDaysInArbitration: number;
};

export type ArbitrationDashboardData = {
  records: ArbitrationRecord[];
  stats: ArbitrationStats;
  dealers: string[];
  reasons: string[];
};

export type ArbitrationNote = {
  id: string;
  vehicleId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export function getArbitrationVehicleName(record: ArbitrationRecord): string {
  const base = `${record.year} ${record.make} ${record.model}`;
  return record.trim ? `${base} ${record.trim}` : base;
}

export function getArbitrationVehicleSubtitle(record: ArbitrationRecord): string {
  return record.exteriorColor?.trim() || "";
}

export function buildArbitrationStatsCards(stats: ArbitrationStats) {
  return [
    {
      icon: "car" as KPIIconName,
      color: "blue",
      label: "Arbitration Vehicles",
      value: String(stats.totalArbitration),
      unit: "Total Vehicles",
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "",
    },
    {
      icon: "leaf" as KPIIconName,
      color: "green",
      label: "Listed This Month",
      value: String(stats.listedThisMonth),
      unit: "Vehicles",
      link: "",
      sparkColor: "#10b981",
      sparkPoints: "",
    },
    {
      icon: "bar-chart-3" as KPIIconName,
      color: "violet",
      label: "With Team Notes",
      value: String(stats.withTeamNotes),
      unit: "Vehicles",
      link: "",
      sparkColor: "#a855f7",
      sparkPoints: "",
    },
    {
      icon: "dollar-sign" as KPIIconName,
      color: "orange",
      label: "Unique Dealers",
      value: String(stats.uniqueDealers),
      unit: "Buyers",
      link: "",
      sparkColor: "#f97316",
      sparkPoints: "",
    },
    {
      icon: "tag" as KPIIconName,
      color: "red",
      label: "Avg Days in Arbitration",
      value: String(stats.avgDaysInArbitration),
      unit: "Days",
      link: "",
      sparkColor: "#ef4444",
      sparkPoints: "",
    },
  ];
}

function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(start), end: fmt(end) };
}

export function isInCurrentMonth(date: string | undefined): boolean {
  if (!date) return false;
  const { start, end } = getCurrentMonthRange();
  return date >= start && date <= end;
}

export function computeArbitrationStats(
  records: ArbitrationRecord[],
): ArbitrationStats {
  const listedThisMonth = records.filter((r) =>
    isInCurrentMonth(r.dateListed),
  ).length;
  const withTeamNotes = records.filter((r) => r.noteCount > 0).length;
  const uniqueDealers = new Set(
    records.map((r) => r.buyerDealer).filter(Boolean),
  ).size;
  const avgDaysInArbitration =
    records.length > 0
      ? Math.round(
          records.reduce((sum, r) => sum + r.daysInArbitration, 0) /
            records.length,
        )
      : 0;

  return {
    totalArbitration: records.length,
    listedThisMonth,
    withTeamNotes,
    uniqueDealers,
    avgDaysInArbitration,
  };
}
