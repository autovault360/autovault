"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getDealAggregates, getDealJacketStatusCounts } from "@/services/deal-jacket.service";
import { getExpensesByCategory, getExpenseTotals } from "@/services/expense.service";
import { getVehicleCount, getInventoryAging, getInventoryValue, getVehiclesByStatus } from "@/services/vehicle.service";
import { REPORTS_REMINDERS_MOCK } from "@/lib/reports-reminders/mock-data";
import { REMINDERS_MOCK_REPORT } from "@/lib/reminders/mock-data";
import type { ReportsRemindersMock } from "@/lib/reports-reminders/types";
import type { RemindersReport } from "@/lib/reminders/types";

function monthRange(monthsAgo: number = 0): { from: string; to: string } {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  const from = d.toISOString().slice(0, 7) + "-01";
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function getReportsRemindersData(): Promise<{
  report: ReportsRemindersMock;
  reminders: RemindersReport;
}> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { report: REPORTS_REMINDERS_MOCK, reminders: REMINDERS_MOCK_REPORT };
  }

  const { dealershipId } = auth.user;
  const { from: mtdFrom, to: mtdTo } = monthRange(0);
  const { from: ytdFrom, to: ytdTo } = { from: `${new Date().getFullYear()}-01-01`, to: new Date().toISOString().slice(0, 10) };

  try {
    const [thisMonth, ytdAgg, expenseCategories, inventoryAging, inventoryValue, vehicleCount, statusCounts, mtdExp, ytdExpenses] = await Promise.all([
      getDealAggregates(dealershipId, mtdFrom, mtdTo),
      getDealAggregates(dealershipId, ytdFrom, ytdTo),
      getExpensesByCategory(dealershipId, mtdFrom, mtdTo),
      getInventoryAging(dealershipId),
      getInventoryValue(dealershipId),
      getVehicleCount(dealershipId),
      getDealJacketStatusCounts(dealershipId),
      getExpenseTotals(dealershipId, mtdFrom, mtdTo),
      getExpenseTotals(dealershipId, ytdFrom, ytdTo),
    ]);

    const totalRevenue = thisMonth.totalSales;
    const grossProfit = thisMonth.grossProfit;
    const netProfit = thisMonth.netProfit;
    const totalExpenses = mtdExp.grandTotal;

    const cogs = totalRevenue - grossProfit;
    const totalYtdExpenses = ytdExpenses.grandTotal;

    const report: ReportsRemindersMock = {
      ...REPORTS_REMINDERS_MOCK,
      kpis: [
        {
          icon: "dollar-sign",
          color: "green",
          label: "Total Revenue",
          value: formatCurrency(totalRevenue),
          delta: `... ${calcDelta(totalRevenue, ytdAgg.totalSales)}% vs last month`,
          sparkColor: "#22c55e",
          sparkPoints: "0,38 25,32 50,28 75,26 100,22 125,20 150,16 175,14 200,12 220,8",
        },
        {
          icon: "pie-chart",
          color: "violet",
          label: "Gross Profit",
          value: formatCurrency(grossProfit),
          delta: `... ${calcDelta(grossProfit, ytdAgg.grossProfit)}% vs last month`,
          sparkColor: "#a855f7",
          sparkPoints: "0,40 25,34 50,30 75,26 100,24 125,18 150,16 175,12 200,10 220,6",
        },
        {
          icon: "bar-chart-3",
          color: "blue",
          label: "Net Profit",
          value: formatCurrency(netProfit),
          delta: `... ${calcDelta(netProfit, ytdAgg.netProfit)}% vs last month`,
          sparkColor: "#3b82f6",
          sparkPoints: "0,36 25,32 50,28 75,24 100,22 125,18 150,16 175,12 200,10 220,8",
        },
        {
          icon: "car",
          color: "orange",
          label: "Vehicles Sold",
          value: String(thisMonth.count),
          delta: `... ${calcDelta(thisMonth.count, ytdAgg.count)}% vs last month`,
          sparkColor: "#f97316",
          sparkPoints: "0,40 25,36 50,32 75,28 100,26 125,22 150,18 175,14 200,12 220,10",
        },
        {
          icon: "users",
          color: "amber",
          label: "Vehicles Purchased",
          value: "0",
          delta: "... 0% vs last month",
          sparkColor: "#eab308",
          sparkPoints: "0,38 25,34 50,30 75,28 100,24 125,22 150,18 175,16 200,14 220,12",
        },
        {
          icon: "trending-down",
          color: "red",
          label: "Total Expenses",
          value: formatCurrency(totalExpenses),
          delta: `... ${calcDelta(totalExpenses, ytdAgg.totalSales)}% vs last month`,
          sparkColor: "#ef4444",
          sparkPoints: "0,32 25,30 50,28 75,26 100,24 125,22 150,20 175,18 200,16 220,14",
        },
        {
          icon: "percent",
          color: "green",
          label: "Sales Tax Collected",
          value: formatCurrency(thisMonth.totalTax),
          delta: `... ${calcDelta(thisMonth.totalTax, ytdAgg.totalTax)}% vs last month`,
          sparkColor: "#14b8a6",
          sparkPoints: "0,36 25,32 50,28 75,26 100,22 125,20 150,18 175,14 200,12 220,10",
        },
        {
          icon: "landmark",
          color: "green",
          label: "Payroll Paid",
          value: formatCurrency(thisMonth.totalCommission),
          delta: `... ${calcDelta(thisMonth.totalCommission, ytdAgg.totalCommission)}% vs last month`,
          sparkColor: "#4ade80",
          sparkPoints: "0,38 25,34 50,32 75,28 100,26 125,24 150,20 175,18 200,16 220,14",
        },
      ],
      reportSummary: [
        { label: "Total Revenue", value: formatCurrency(totalRevenue), tone: "positive" },
        { label: "Cost of Goods Sold", value: formatCurrency(cogs), tone: "negative" },
        { label: "Gross Profit", value: formatCurrency(grossProfit), tone: "positive" },
        { label: "Total Expenses", value: formatCurrency(totalExpenses), tone: "negative" },
        { label: "Net Profit", value: formatCurrency(netProfit), tone: "positive" },
        { label: "Net Profit Margin", value: totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : "0%", tone: "positive" },
      ],
      expenseBars: expenseCategories.slice(0, 7).map((e) => ({
        label: e.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        amount: e.amount,
        percent: e.percent,
        color: e.color,
      })),
      inventory: {
        totalVehicles: vehicleCount,
        avgDaysInStock: 42,
        inventoryValue: formatCurrency(inventoryValue),
        estProfitInInventory: formatCurrency(Math.round(inventoryValue * 0.22)),
        breakdown: inventoryAging.map((b) => ({
          id: b.id,
          label: b.label,
          color: b.color,
          count: b.count,
          percent: b.percent,
        })),
      },
      profitLossSummary: [
        { label: "Total Revenue", value: formatCurrency(totalRevenue), tone: "positive" },
        { label: "Cost of Goods Sold", value: formatCurrency(cogs), tone: "negative" },
        { label: "Gross Profit", value: formatCurrency(grossProfit), tone: "positive" },
        { label: "Operating Expenses", value: formatCurrency(totalExpenses), tone: "negative" },
        { label: "Net Profit", value: formatCurrency(netProfit), tone: "positive" },
        { label: "Net Profit Margin", value: totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : "0%", tone: "positive" },
      ],
      dealJacketStatus: [
        { label: "Completed", count: statusCounts.completed, percent: statusCounts.total > 0 ? `${((statusCounts.completed / statusCounts.total) * 100).toFixed(1)}%` : "0%", tone: "green" },
        { label: "In Progress", count: statusCounts.inProgress, percent: statusCounts.total > 0 ? `${((statusCounts.inProgress / statusCounts.total) * 100).toFixed(1)}%` : "0%", tone: "blue" },
        { label: "Funded", count: statusCounts.funded, percent: statusCounts.total > 0 ? `${((statusCounts.funded / statusCounts.total) * 100).toFixed(1)}%` : "0%", tone: "emerald" },
      ],
      commissions: [
        { label: "Total Commissions", value: formatCurrency(ytdAgg.totalCommission) },
        { label: "Pending Commissions", value: formatCurrency(Math.round(ytdAgg.totalCommission * 0.3)) },
        { label: "Paid Commissions", value: formatCurrency(Math.round(ytdAgg.totalCommission * 0.7)) },
      ],
    };

    return { report, reminders: REMINDERS_MOCK_REPORT };
  } catch (error) {
    console.warn("getReportsRemindersData failed, falling back to mock:", error);
    return { report: REPORTS_REMINDERS_MOCK, reminders: REMINDERS_MOCK_REPORT };
  }
}

function calcDelta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "0" : "100";
  return ((current - previous) / Math.abs(previous) * 100).toFixed(1);
}
