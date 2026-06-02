import { SALES_REPS } from "./constants";
import type {
  BestMonthEntry,
  CalendarFilters,
  CalendarKpi,
  FilteredCalendarReport,
  IDailySalesActivity,
  IMonthlySummaryMetrics,
  MonthGridCell,
  MonthlyPerformanceSummary,
  MonthlyTrendPoint,
  QuarterlyMetric,
  SalesRepLeaderboardEntry,
  SoldVehicleRow,
  PurchasedVehicleRow,
  UnitsColorTier,
  WeekBreakdownRow,
} from "./types";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/profit-loss/types";
import {
  formatMonthYear,
  formatMonthYearShort,
  formatShortDate,
  getDaysInMonth,
  getMonthId,
} from "./format-utils";

export function getUnitsColorTier(unitsSold: number): UnitsColorTier {
  if (unitsSold === 0) return "none";
  if (unitsSold <= 2) return "low";
  if (unitsSold <= 4) return "mid";
  return "high";
}

export function getUnitPillLabel(unitsSold: number): string {
  if (unitsSold === 0) return "";
  if (unitsSold <= 2) return `${unitsSold} Unit${unitsSold > 1 ? "s" : ""}`;
  if (unitsSold <= 4) return `${unitsSold} Units`;
  return `${unitsSold} Units`;
}

export function buildMonthGrid(
  year: number,
  month: number,
  dailyMap: Map<string, IDailySalesActivity>,
): MonthGridCell[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const cells: MonthGridCell[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: null, dayNumber: null, activity: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${getMonthId(year, month)}-${String(day).padStart(2, "0")}`;
    cells.push({
      date,
      dayNumber: day,
      activity: dailyMap.get(date) ?? null,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, dayNumber: null, activity: null });
  }
  return cells;
}

export function buildDailyMap(
  dailyActivity: IDailySalesActivity[],
): Map<string, IDailySalesActivity> {
  return new Map(dailyActivity.map((d) => [d.date, d]));
}

export function getDailyActivity(
  date: string,
  dailyMap: Map<string, IDailySalesActivity>,
): IDailySalesActivity | null {
  return dailyMap.get(date) ?? null;
}

function getMonthSummariesForYear(
  report: FilteredCalendarReport,
  year: number,
): IMonthlySummaryMetrics[] {
  return report.monthlySummaries.filter((m) => m.monthId.startsWith(String(year)));
}

function getDailyForMonth(
  dailyMap: Map<string, IDailySalesActivity>,
  monthId: string,
): IDailySalesActivity[] {
  return [...dailyMap.values()].filter((d) => d.date.startsWith(monthId));
}

export function getMonthlyKpis(
  year: number,
  month: number,
  report: FilteredCalendarReport,
): CalendarKpi[] {
  const monthId = getMonthId(year, month);
  const prevMonthId = month === 1 ? getMonthId(year - 1, 12) : getMonthId(year, month - 1);
  const current = report.monthlySummaries.find((m) => m.monthId === monthId);
  const prev = report.monthlySummaries.find((m) => m.monthId === prevMonthId);
  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);

  const unitsSold = current?.unitsSold ?? daily.reduce((s, d) => s + d.unitsSold, 0);
  const totalGross = current?.totalGross ?? daily.reduce((s, d) => s + d.totalGross, 0);
  const totalCommissions =
    current?.totalCommissions ?? daily.reduce((s, d) => s + d.totalCommissions, 0);
  const prevUnits = prev?.unitsSold ?? 0;
  const prevGross = prev?.totalGross ?? 0;
  const prevComm = prev?.totalCommissions ?? 0;

  const unitsPct = prevUnits > 0 ? Math.round(((unitsSold - prevUnits) / prevUnits) * 100) : 0;
  const grossPct = prevGross > 0 ? Math.round(((totalGross - prevGross) / prevGross) * 100) : 0;
  const commPct = prevComm > 0 ? Math.round(((totalCommissions - prevComm) / prevComm) * 100) : 0;

  const bestDay = [...daily].sort((a, b) => b.unitsSold - a.unitsSold)[0];
  const repTotals = aggregateRepTotals(daily);
  const topRep = [...repTotals].sort((a, b) => b.unitsSold - a.unitsSold)[0];

  return [
    {
      id: "units",
      label: "Total Units Sold",
      value: String(unitsSold),
      subtext: "This Month",
      delta: `+${unitsPct}%`,
      deltaDirection: unitsPct >= 0 ? "up" : "down",
      deltaSentiment: unitsPct >= 0 ? "positive" : "negative",
      comparisonLabel: `vs ${formatMonthYearShort(prevMonthId)}`,
      iconColor: "blue",
    },
    {
      id: "gross",
      label: "Total Gross",
      value: formatCurrency(totalGross),
      subtext: "This Month",
      delta: `+${grossPct}%`,
      deltaDirection: grossPct >= 0 ? "up" : "down",
      deltaSentiment: grossPct >= 0 ? "positive" : "negative",
      comparisonLabel: `vs ${formatMonthYearShort(prevMonthId)}`,
      iconColor: "green",
    },
    {
      id: "commissions",
      label: "Total Commissions",
      value: formatCurrency(totalCommissions),
      subtext: "This Month",
      delta: `+${commPct}%`,
      deltaDirection: commPct >= 0 ? "up" : "down",
      deltaSentiment: commPct >= 0 ? "positive" : "negative",
      comparisonLabel: `vs ${formatMonthYearShort(prevMonthId)}`,
      iconColor: "purple",
    },
    {
      id: "best_day",
      label: "Best Sales Day",
      value: bestDay ? formatShortDate(bestDay.date) : "-",
      subtext: bestDay ? `${bestDay.unitsSold} Units Sold` : "",
      delta: "",
      deltaDirection: "flat",
      deltaSentiment: "neutral",
      comparisonLabel: "",
      iconColor: "amber",
    },
    {
      id: "top_rep",
      label: "Top Sales Rep",
      value: topRep?.repName ?? "-",
      subtext: topRep ? `${topRep.unitsSold} Units Sold` : "",
      delta: "",
      deltaDirection: "flat",
      deltaSentiment: "neutral",
      comparisonLabel: "",
      iconColor: "teal",
    },
  ];
}

export function getYearlyKpis(
  year: number,
  report: FilteredCalendarReport,
): CalendarKpi[] {
  const months = getMonthSummariesForYear(report, year);
  const prevMonths = getMonthSummariesForYear(report, year - 1);

  const unitsSold = months.reduce((s, m) => s + m.unitsSold, 0);
  const totalGross = months.reduce((s, m) => s + m.totalGross, 0);
  const totalCommissions = months.reduce((s, m) => s + m.totalCommissions, 0);
  const prevUnits = prevMonths.reduce((s, m) => s + m.unitsSold, 0);
  const prevGross = prevMonths.reduce((s, m) => s + m.totalGross, 0);
  const prevComm = prevMonths.reduce((s, m) => s + m.totalCommissions, 0);

  const unitsPct = prevUnits > 0 ? Math.round(((unitsSold - prevUnits) / prevUnits) * 100) : 0;
  const grossPct = prevGross > 0 ? Math.round(((totalGross - prevGross) / prevGross) * 100) : 0;
  const commPct = prevComm > 0 ? Math.round(((totalCommissions - prevComm) / prevComm) * 100) : 0;

  const bestMonth = [...months].sort((a, b) => b.unitsSold - a.unitsSold)[0];
  const dailyMap = buildDailyMap(report.dailyActivity);
  const yearDaily = [...dailyMap.values()].filter((d) => d.date.startsWith(String(year)));
  const repTotals = aggregateRepTotals(yearDaily);
  const topRep = [...repTotals].sort((a, b) => b.gross - a.gross)[0];

  return [
    {
      id: "units",
      label: "Total Units Sold",
      value: String(unitsSold),
      subtext: "This Year",
      delta: `+${unitsPct}%`,
      deltaDirection: "up",
      deltaSentiment: "positive",
      comparisonLabel: `vs ${year - 1} (${prevUnits})`,
      iconColor: "blue",
    },
    {
      id: "gross",
      label: "Total Gross",
      value: formatCurrency(totalGross),
      subtext: "This Year",
      delta: `+${grossPct}%`,
      deltaDirection: "up",
      deltaSentiment: "positive",
      comparisonLabel: `vs ${year - 1} (${formatCompactCurrency(prevGross)})`,
      iconColor: "green",
    },
    {
      id: "commissions",
      label: "Total Commissions",
      value: formatCurrency(totalCommissions),
      subtext: "This Year",
      delta: `+${commPct}%`,
      deltaDirection: "up",
      deltaSentiment: "positive",
      comparisonLabel: `vs ${year - 1} (${formatCompactCurrency(prevComm)})`,
      iconColor: "purple",
    },
    {
      id: "best_month",
      label: "Best Month",
      value: bestMonth ? formatMonthYear(bestMonth.monthId) : "-",
      subtext: bestMonth
        ? `${bestMonth.unitsSold} Units Sold, ${formatCompactCurrency(bestMonth.totalGross)} Gross`
        : "",
      delta: "",
      deltaDirection: "flat",
      deltaSentiment: "neutral",
      comparisonLabel: "",
      iconColor: "amber",
    },
    {
      id: "top_rep",
      label: "Top Sales Rep",
      value: topRep?.repName ?? "Mike Johnson",
      subtext: topRep
        ? `${topRep.unitsSold} Units Sold, ${formatCompactCurrency(topRep.gross)} Gross`
        : "",
      delta: "",
      deltaDirection: "flat",
      deltaSentiment: "neutral",
      comparisonLabel: "",
      iconColor: "teal",
    },
  ];
}

function aggregateRepTotals(daily: IDailySalesActivity[]) {
  const map = new Map<string, { repName: string; unitsSold: number; gross: number }>();
  for (const day of daily) {
    for (const rep of day.salesReps) {
      const existing = map.get(rep.repId) ?? {
        repName: rep.repName,
        unitsSold: 0,
        gross: 0,
      };
      existing.unitsSold += rep.unitsSold;
      existing.gross += rep.grossProfit;
      map.set(rep.repId, existing);
    }
  }
  return [...map.values()];
}

export function getMonthHeatmap(
  monthId: string,
  dailyMap: Map<string, IDailySalesActivity>,
): UnitsColorTier[] {
  const [y, m] = monthId.split("-").map(Number);
  const daysInMonth = getDaysInMonth(y!, m!);
  const dots: UnitsColorTier[] = [];
  for (let day = 1; day <= 35; day++) {
    if (day <= daysInMonth) {
      const date = `${monthId}-${String(day).padStart(2, "0")}`;
      const activity = dailyMap.get(date);
      dots.push(getUnitsColorTier(activity?.unitsSold ?? 0));
    } else {
      dots.push("none");
    }
  }
  return dots;
}

export function getMonthCardMetrics(
  monthId: string,
  report: FilteredCalendarReport,
) {
  const summary = report.monthlySummaries.find((m) => m.monthId === monthId);
  if (summary) {
    return {
      units: summary.unitsSold,
      gross: summary.totalGross,
      commissions: summary.totalCommissions,
    };
  }
  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);
  return {
    units: daily.reduce((s, d) => s + d.unitsSold, 0),
    gross: daily.reduce((s, d) => s + d.totalGross, 0),
    commissions: daily.reduce((s, d) => s + d.totalCommissions, 0),
  };
}

export function getQuarterlyBars(
  year: number,
  report: FilteredCalendarReport,
): QuarterlyMetric[] {
  const months = getMonthSummariesForYear(report, year);
  const quarters = [
    { quarter: "Q1", months: [1, 2, 3] },
    { quarter: "Q2", months: [4, 5, 6] },
    { quarter: "Q3", months: [7, 8, 9] },
    { quarter: "Q4", months: [10, 11, 12] },
  ];
  return quarters.map(({ quarter, months: qMonths }) => {
    const qData = months.filter((m) =>
      qMonths.includes(Number(m.monthId.slice(5, 7))),
    );
    return {
      quarter,
      units: qData.reduce((s, m) => s + m.unitsSold, 0),
      gross: qData.reduce((s, m) => s + m.totalGross, 0),
    };
  });
}

export function getMonthlyTrend(
  year: number,
  report: FilteredCalendarReport,
): MonthlyTrendPoint[] {
  return getMonthSummariesForYear(report, year).map((m) => ({
    label: m.monthName.slice(0, 3),
    monthId: m.monthId,
    units: m.unitsSold,
    gross: m.totalGross,
    commission: m.totalCommissions,
  }));
}

export function getMonthlyCommissionsTrend(
  year: number,
  report: FilteredCalendarReport,
): MonthlyTrendPoint[] {
  return getMonthlyTrend(year, report);
}

export function getWeeklyBreakdown(
  year: number,
  month: number,
  report: FilteredCalendarReport,
): WeekBreakdownRow[] {
  const monthId = getMonthId(year, month);
  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);
  const weeks: WeekBreakdownRow[] = [];
  const daysInMonth = getDaysInMonth(year, month);

  for (let w = 0; w < 5; w++) {
    const startDay = w * 7 + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);
    if (startDay > daysInMonth) break;

    const weekDays = daily.filter((d) => {
      const day = Number(d.date.slice(8, 10));
      return day >= startDay && day <= endDay;
    });

    weeks.push({
      week: `Week ${w + 1}`,
      unitsSold: weekDays.reduce((s, d) => s + d.unitsSold, 0),
      gross: weekDays.reduce((s, d) => s + d.totalGross, 0),
      commission: weekDays.reduce((s, d) => s + d.totalCommissions, 0),
    });
  }
  return weeks;
}

export function getTopSalesRepsForMonth(
  year: number,
  month: number,
  report: FilteredCalendarReport,
  limit = 5,
): SalesRepLeaderboardEntry[] {
  const monthId = getMonthId(year, month);
  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);
  const totals = aggregateRepTotals(daily);
  return totals
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit)
    .map((r, i) => {
      const rep = SALES_REPS.find((s) => s.name === r.repName);
      return {
        rank: i + 1,
        repId: rep?.id ?? `rep-${i}`,
        repName: r.repName,
        avatarUrl: rep?.avatarUrl,
        unitsSold: r.unitsSold,
        gross: r.gross,
      };
    });
}

export function getTopSalesRepsForYear(
  year: number,
  report: FilteredCalendarReport,
  limit = 5,
): SalesRepLeaderboardEntry[] {
  const dailyMap = buildDailyMap(report.dailyActivity);
  const yearDaily = [...dailyMap.values()].filter((d) => d.date.startsWith(String(year)));
  const totals = aggregateRepTotals(yearDaily);
  return totals
    .sort((a, b) => b.gross - a.gross)
    .slice(0, limit)
    .map((r, i) => {
      const rep = SALES_REPS.find((s) => s.name === r.repName);
      return {
        rank: i + 1,
        repId: rep?.id ?? `rep-${i}`,
        repName: r.repName,
        avatarUrl: rep?.avatarUrl,
        unitsSold: r.unitsSold,
        gross: r.gross,
      };
    });
}

export function getBestSalesMonths(
  year: number,
  report: FilteredCalendarReport,
  limit = 5,
): BestMonthEntry[] {
  return getMonthSummariesForYear(report, year)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit)
    .map((m, i) => ({
      rank: i + 1,
      monthId: m.monthId,
      monthLabel: formatMonthYear(m.monthId),
      unitsSold: m.unitsSold,
      gross: m.totalGross,
    }));
}

export function aggregateYearSummary(year: number, report: FilteredCalendarReport) {
  const months = getMonthSummariesForYear(report, year);
  const unitsSold = months.reduce((s, m) => s + m.unitsSold, 0);
  const totalGross = months.reduce((s, m) => s + m.totalGross, 0);
  const totalCommissions = months.reduce((s, m) => s + m.totalCommissions, 0);
  return {
    unitsSold,
    totalGross,
    totalCommissions,
    avgGrossPerUnit: unitsSold > 0 ? Math.round(totalGross / unitsSold) : 0,
    avgCommissionPerUnit: unitsSold > 0 ? Math.round(totalCommissions / unitsSold) : 0,
  };
}

export function getDaySoldVehicles(
  date: string,
  report: FilteredCalendarReport,
): SoldVehicleRow[] {
  const activity = buildDailyMap(report.dailyActivity).get(date);
  if (!activity || activity.unitsSold === 0) return [];

  const vehicles = [
    "2023 Toyota Camry",
    "2022 Honda Accord",
    "2024 Ford F-150",
    "2021 BMW 3 Series",
    "2023 Chevy Silverado",
    "2020 Nissan Altima",
    "2022 Jeep Wrangler",
    "2024 Tesla Model 3",
  ];
  const customers = [
    "John Smith",
    "Jane Doe",
    "Robert Lee",
    "Maria Garcia",
    "David Kim",
    "Emily Brown",
    "Chris Taylor",
    "Ashley White",
  ];

  const rows: SoldVehicleRow[] = [];
  let unitIdx = 0;
  for (const rep of activity.salesReps) {
    for (let u = 0; u < rep.unitsSold; u++) {
      rows.push({
        id: `sv-${date}-${unitIdx}`,
        date,
        stockNumber: `#${1200 + unitIdx}`,
        vehicle: vehicles[unitIdx % vehicles.length]!,
        customer: customers[unitIdx % customers.length]!,
        salesRep: rep.repName,
        profit: Math.round(rep.grossProfit / rep.unitsSold),
        commission: Math.round(rep.commissionsEarned / rep.unitsSold),
      });
      unitIdx++;
    }
  }
  return rows;
}

export function getMonthSoldVehicles(
  monthId: string,
  report: FilteredCalendarReport,
  limit = 8,
): SoldVehicleRow[] {
  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);
  const rows: SoldVehicleRow[] = [];
  for (const day of daily.sort((a, b) => b.date.localeCompare(a.date))) {
    if (day.unitsSold > 0) {
      rows.push(...getDaySoldVehicles(day.date, report));
    }
    if (rows.length >= limit) break;
  }
  return rows.slice(0, limit);
}

export function getMonthlyTrendForMonth(
  year: number,
  month: number,
  report: FilteredCalendarReport,
): MonthlyTrendPoint[] {
  const monthId = getMonthId(year, month);
  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);
  return daily
    .filter((_, i) => i % 2 === 0 || daily.length <= 15)
    .map((d) => ({
      label: String(Number(d.date.slice(8, 10))),
      monthId: d.date,
      units: d.unitsSold,
      gross: d.totalGross,
      commission: d.totalCommissions,
    }));
}

export function getMonthlyPerformanceSummary(
  monthId: string,
  report: FilteredCalendarReport,
): MonthlyPerformanceSummary | null {
  const summary = report.monthlySummaries.find((m) => m.monthId === monthId);
  if (!summary) return null;

  const daily = getDailyForMonth(buildDailyMap(report.dailyActivity), monthId);
  const repTotals = aggregateRepTotals(daily);

  const overviewLines = [
    { label: "Total Vehicles Sold", value: String(summary.unitsSold) },
    { label: "Total Vehicles Bought", value: String(summary.unitsBought) },
    { label: "Gross Revenue", value: formatCurrency(summary.totalGross) },
    { label: "COGS", value: formatCurrency(summary.cogs) },
    { label: "Gross Profit", value: formatCurrency(summary.grossProfit) },
    { label: "Total Operating Expenses", value: formatCurrency(summary.totalExpenses) },
    { label: "Commissions Paid", value: formatCurrency(summary.totalCommissions) },
    { label: "Net Profit", value: formatCurrency(summary.netProfit) },
    { label: "Average Gross per Unit", value: formatCurrency(summary.averageGrossPerUnit) },
    { label: "Average Profit per Unit", value: formatCurrency(summary.averageProfitPerUnit) },
  ];

  const salesByRep = repTotals.map((r) => ({
    repName: r.repName,
    unitsSold: r.unitsSold,
    grossProfit: r.gross,
    commissions: Math.round(r.gross * 0.127),
  }));

  const vehicleActivity = [
    { category: "Vehicles Sold", count: summary.unitsSold, amount: summary.totalGross },
    { category: "Vehicles Bought", count: summary.unitsBought, amount: summary.cogs },
    { category: "Inventory Added", count: Math.round(summary.unitsBought * 0.3), amount: Math.round(summary.cogs * 0.3) },
    { category: "Inventory Sold", count: summary.unitsSold, amount: summary.totalGross },
    { category: "Inventory Remaining", count: Math.max(0, summary.unitsBought - summary.unitsSold), amount: Math.round(summary.cogs * 0.15) },
  ];

  const importantTotals = [
    { label: "Payroll Paid", value: formatCurrency(Math.round(summary.totalExpenses * 0.45)) },
    { label: "Sales Tax Collected", value: formatCurrency(Math.round(summary.totalGross * 0.0725)) },
    { label: "CDTFA Obligations", value: formatCurrency(Math.round(summary.totalGross * 0.065)) },
    { label: "Closed Deal Jackets", value: String(summary.unitsSold) },
    { label: "Missing Documents", value: String(Math.max(1, Math.round(summary.unitsSold * 0.05))) },
    { label: "Overdue Follow Ups", value: String(Math.max(0, Math.round(summary.unitsSold * 0.08))) },
  ];

  const recentSold: SoldVehicleRow[] = [];
  for (const day of daily.sort((a, b) => b.date.localeCompare(a.date))) {
    if (day.unitsSold > 0) {
      recentSold.push(...getDaySoldVehicles(day.date, report));
    }
    if (recentSold.length >= 6) break;
  }

  const vehicles = [
    "2023 Toyota Camry",
    "2022 Honda Accord",
    "2024 Ford F-150",
    "2021 BMW 3 Series",
    "2023 Chevy Silverado",
    "2020 Nissan Altima",
  ];
  const recentPurchased: PurchasedVehicleRow[] = Array.from({ length: 5 }, (_, i) => ({
    id: `pv-${monthId}-${i}`,
    date: `${monthId}-${String(5 + i * 4).padStart(2, "0")}`,
    stockNumber: `#${1100 + i}`,
    vehicle: vehicles[i % vehicles.length]!,
    cost: 15000 + i * 3500,
    status: i % 3 === 0 ? "In Recon" : "In Stock",
  }));

  const notes = [
    `${summary.monthName} closed with ${summary.unitsSold} units sold - ${summary.unitsSold >= 70 ? "above" : "near"} target.`,
    `Gross profit margin at ${summary.totalGross > 0 ? Math.round((summary.grossProfit / summary.totalGross) * 100) : 0}% for the month.`,
    `Top performer: ${salesByRep.sort((a, b) => b.unitsSold - a.unitsSold)[0]?.repName ?? "N/A"}.`,
    summary.netProfit > 0
      ? `Net profit of ${formatCurrency(summary.netProfit)} achieved.`
      : "Review expense allocation for improved margins.",
  ];

  return {
    ...summary,
    overviewLines,
    salesByRep,
    vehicleActivity,
    importantTotals,
    recentSold: recentSold.slice(0, 6),
    recentPurchased,
    notes,
  };
}

export function getCalendarViewData(
  filters: CalendarFilters,
  report: FilteredCalendarReport,
  year: number,
  month: number,
) {
  const dailyMap = buildDailyMap(report.dailyActivity);
  const monthId = getMonthId(year, month);
  return {
    dailyMap,
    monthId,
    monthGrid: buildMonthGrid(year, month, dailyMap),
    monthlyKpis: getMonthlyKpis(year, month, report),
    yearlyKpis: getYearlyKpis(year, report),
    weeklyBreakdown: getWeeklyBreakdown(year, month, report),
    topRepsMonth: getTopSalesRepsForMonth(year, month, report),
    topRepsYear: getTopSalesRepsForYear(year, report),
    bestMonths: getBestSalesMonths(year, report),
    yearSummary: aggregateYearSummary(year, report),
    quarterlyBars: getQuarterlyBars(year, report),
    monthlyTrend: getMonthlyTrend(year, report),
    monthlyTrendForMonth: getMonthlyTrendForMonth(year, month, report),
    monthlyCommissionsTrend: getMonthlyCommissionsTrend(year, report),
    monthSoldVehicles: getMonthSoldVehicles(monthId, report),
  };
}
