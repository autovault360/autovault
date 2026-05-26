import type { SalesRepDashboardData, SalesRepPeriod } from "../types";
import { getSalesRepsDashboard } from "./get-sales-reps-dashboard";

export async function computeSalesRepStats(
  period: SalesRepPeriod = "this_month",
): Promise<SalesRepDashboardData["stats"]> {
  const data = await getSalesRepsDashboard(period);
  return data.stats;
}

export { getSalesRepsDashboard };
