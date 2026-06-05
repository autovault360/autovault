import type { CpaMetricTrend } from "@/lib/cpa/types";

export function formatMoney(n: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(n);
}

export function formatMetricTrend(
  metric: CpaMetricTrend,
  prevLabel: string,
  invertColor = false,
): { text: string; positive: boolean } {
  const arrow = metric.trend === "up" ? "\u25B2" : "\u25BC";
  const rawPositive = metric.trend === "up";
  const positive = invertColor ? !rawPositive : rawPositive;
  return {
    text: `${arrow} ${metric.changePct}% vs ${prevLabel}`,
    positive,
  };
}

export const RIBBON_STYLES = {
  blue: "border-l-blue-500 bg-blue-500/10",
  green: "border-l-emerald-500 bg-emerald-500/10",
  amber: "border-l-amber-500 bg-amber-500/10",
} as const;

export function mapMonthlyNotesToPreview(notes: import("@/lib/cpa/types").CpaMonthlyNoteItem[]): import("@/lib/cpa/types").CpaNotePreview[] {
  const statusMap = {
    blue: "OPEN",
    green: "RESOLVED",
    amber: "IN_PROGRESS",
  } as const;
  const priorityMap = {
    blue: "MEDIUM",
    green: "LOW",
    amber: "HIGH",
  } as const;

  return notes.map((note) => ({
    id: note.id,
    title: note.content,
    date: note.date,
    creator: note.author,
    status: statusMap[note.ribbon],
    priority: priorityMap[note.ribbon],
  }));
}
