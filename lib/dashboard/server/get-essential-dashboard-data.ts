import { getVehicleCount, getInventoryValue } from "@/services/vehicle.service";
import {
  getDealAggregates,
  getDealJacketStatusCounts,
} from "@/services/deal-jacket.service";
import { getExpenseTotals } from "@/services/expense.service";
import { getAuthContext } from "./auth-context";
import { buildAdminDashboardMock } from "../admin/mock-data";
import { getPeriodRange, getComparisonPeriodRange, buildPeriodLabel } from "./period-utils";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export type EssentialDashboardData = {
  periodLabel: string;
  kpiCards: import("@/components/ui/kpi-card").KPICardData[];
  periodFrom: string;
  periodTo: string;
  today: string;
};

export async function getEssentialDashboardData(
  dealStatusFilter?: string,
  viewMode: "monthly" | "yearly" = "monthly",
  month?: number,
  year?: number,
): Promise<EssentialDashboardData> {
  const auth = await getAuthContext();

  const now = new Date();
  const currentMonth = month ?? now.getMonth() + 1;
  const currentYear = year ?? now.getFullYear();

  const { from: mtdFrom, to: mtdTo } = getPeriodRange(viewMode, currentMonth, currentYear);
  const { from: ltdFrom, to: ltdTo } = getComparisonPeriodRange(viewMode, currentMonth, currentYear);

  if (!auth) {
    const mock = buildAdminDashboardMock();
    return {
      periodLabel: buildPeriodLabel(mtdFrom, mtdTo),
      kpiCards: mock.kpiCards,
      periodFrom: mtdFrom,
      periodTo: mtdTo,
      today: new Date().toISOString().slice(0, 10),
    };
  }

  const [totalInventory, thisMonthAgg, lastMonthAgg, mtdExpenses, ltdExpenses, inventoryValue, statusCounts] =
    await Promise.all([
      getVehicleCount(auth.dealershipId),
      getDealAggregates(auth.dealershipId, mtdFrom, mtdTo),
      getDealAggregates(auth.dealershipId, ltdFrom, ltdTo),
      getExpenseTotals(auth.dealershipId, mtdFrom, mtdTo),
      getExpenseTotals(auth.dealershipId, ltdFrom, ltdTo),
      getInventoryValue(auth.dealershipId),
      getDealJacketStatusCounts(auth.dealershipId),
    ]);

  const grossProfitDelta =
    lastMonthAgg.grossProfit > 0
      ? (
          ((thisMonthAgg.grossProfit - lastMonthAgg.grossProfit) /
            lastMonthAgg.grossProfit) *
          100
        ).toFixed(1)
      : "0";

  const netProfitDelta =
    lastMonthAgg.netProfit > 0
      ? (
          ((thisMonthAgg.netProfit - lastMonthAgg.netProfit) /
            lastMonthAgg.netProfit) *
          100
        ).toFixed(1)
      : "0";

  const expenseDelta =
    ltdExpenses.grandTotal > 0
      ? (
          ((mtdExpenses.grandTotal - ltdExpenses.grandTotal) /
            ltdExpenses.grandTotal) *
          100
        ).toFixed(1)
      : "0";

  const deltaSuffix = viewMode === "yearly" ? "vs last year" : "vs last month";

  return {
    periodLabel: buildPeriodLabel(mtdFrom, mtdTo),
    periodFrom: mtdFrom,
    periodTo: mtdTo,
    today: new Date().toISOString().slice(0, 10),
    kpiCards: [
      {
        icon: "car",
        color: "blue",
        label: "Vehicles in Inventory",
        value: String(totalInventory),
        unit: `Total Value: ${formatCurrency(inventoryValue)}`,
        link: "View Inventory",
        sparkColor: "#3b82f6",
        sparkPoints: "",
      },
      {
        icon: "tag",
        color: "green",
        label: "Vehicles Sold This Month",
        value: String(thisMonthAgg.count),
        unit: `Total Sales: ${formatCurrency(thisMonthAgg.totalSales)}`,
        link: "View Sales",
        sparkColor: "#10b981",
        sparkPoints: "",
      },
      {
        icon: "dollar-sign",
        color: "violet",
        label: "Total Retail Revenue",
        value: formatCurrency(thisMonthAgg.totalSales),
        delta: `... ${grossProfitDelta}% ${deltaSuffix}`,
        link: "View Revenue",
        sparkColor: "#a855f7",
        sparkPoints: "",
      },
      {
        icon: "trending-down",
        color: "red",
        label: "Total Expenses",
        value: formatCurrency(mtdExpenses.grandTotal),
        delta: `... ${expenseDelta}% ${deltaSuffix}`,
        link: "View Expenses",
        sparkColor: "#ef4444",
        sparkPoints: "",
      },
      {
        icon: "dollar-sign",
        color: "amber",
        label: "Gross Profit",
        value: formatCurrency(thisMonthAgg.grossProfit),
        delta: `... ${grossProfitDelta}% ${deltaSuffix}`,
        link: "View Resales",
        sparkColor: "#22c55e",
        sparkPoints: "",
      },
      {
        icon: "pie-chart",
        color: "violet",
        label: "Net Profit",
        value: formatCurrency(thisMonthAgg.netProfit),
        delta: `... ${netProfitDelta}% ${deltaSuffix}`,
        link: "View Report",
        sparkColor: "#a855f7",
        sparkPoints: "",
      },
      {
        icon: "handshake",
        color: "amber",
        label: "Pending Deal Jackets",
        value: String(statusCounts.inProgress),
        unit: "Requires Review",
        link: "View Deal Jackets",
        sparkColor: "#f59e0b",
        sparkPoints: "",
      },
    ],
  };
}
