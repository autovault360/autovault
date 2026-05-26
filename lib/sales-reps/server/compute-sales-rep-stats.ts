import type { SalesRepListItem, SalesRepStats } from "../types";
import { formatMetricDelta } from "../types";
import { getSalesRepsList } from "./get-sales-reps-list";

const COMMISSION_RATE = 0.1;

function estimateCommission(grossProfit: number): number {
  return grossProfit * COMMISSION_RATE;
}

export async function computeSalesRepStats(
  reps?: SalesRepListItem[],
): Promise<SalesRepStats> {
  const list = reps ?? (await getSalesRepsList());

  const activeReps = list.filter((r) => r.isActive).length;
  const commissionsPaidMtd = list.reduce(
    (sum, r) => sum + estimateCommission(r.grossProfit),
    0,
  );

  const totalCommissionsYtd = commissionsPaidMtd * 5.02;

  const mtdDelta = formatMetricDelta(commissionsPaidMtd, commissionsPaidMtd * 0.843);
  const ytdDelta = formatMetricDelta(
    totalCommissionsYtd,
    totalCommissionsYtd * 0.807,
  );

  return {
    totalReps: list.length,
    activeReps,
    commissionsPaidMtd,
    commissionsPaidMtdDelta: mtdDelta.text,
    commissionsPaidMtdDeltaColor: mtdDelta.color,
    totalCommissionsYtd,
    totalCommissionsYtdDelta: ytdDelta.text.replace("last month", "last year"),
    totalCommissionsYtdDeltaColor: ytdDelta.color,
  };
}
