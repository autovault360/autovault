"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getDashboardData as getDashboardDataFromService } from "@/services/report.service";
import type { DashboardData } from "@/services/report.service";

export async function getDashboardData(): Promise<DashboardData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return {
      kpis: {
        totalInventory: { icon: "car", color: "blue", label: "Total Inventory", value: "0", unit: "Vehicles", link: "View Inventory", sparkColor: "#3b82f6", sparkPoints: "" },
        soldThisMonth: { icon: "tag", color: "green", label: "Sold This Month", value: "0", unit: "Vehicles", link: "View Sales", sparkColor: "#10b981", sparkPoints: "" },
        grossProfitMtd: { icon: "dollar-sign", color: "amber", label: "Gross Profit (MTD)", value: "$0", link: "View Resales", sparkColor: "#22c55e", sparkPoints: "" },
        netProfitMtd: { icon: "pie-chart", color: "violet", label: "Net Profit (MTD)", value: "$0", link: "View Report", sparkColor: "#a855f7", sparkPoints: "" },
        monthlyExpenses: { icon: "trending-down", color: "red", label: "Monthly Expenses", value: "$0", link: "View Expenses", sparkColor: "#ef4444", sparkPoints: "" },
      },
      comparison: [],
      profitLoss: { totalIncome: 0, totalExpenses: 0, netProfit: 0, incomeDelta: "0%", expenseDelta: "0%", profitDelta: "0%" },
      expensesBreakdown: { expenses: [], expensesTotal: 0 },
      recentDeals: [],
      topVehicles: [],
      inventoryAging: [],
      inventoryValue: 0,
      dealJacketStatus: { completed: 0, inProgress: 0, funded: 0, total: 0 },
    };
  }

  return getDashboardDataFromService(auth.user.dealershipId);
}
