import {
  MONTHLY_UNIT_TARGETS_2025,
  SALES_REPS,
  TOP_VEHICLES,
  YEARLY_TARGETS,
} from "./constants";
import type {
  CalendarReport,
  CalendarEventType,
  IDailySalesActivity,
  IMonthlySummaryMetrics,
  UpcomingComplianceEvent,
} from "./types";
import { getDaysInMonth, getMonthId } from "./format-utils";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateUnitsForDay(year: number, month: number, day: number): number {
  const monthIdx = month - 1;
  const monthTarget =
    year === 2025
      ? MONTHLY_UNIT_TARGETS_2025[monthIdx] ?? 60
      : Math.round((MONTHLY_UNIT_TARGETS_2025[monthIdx] ?? 60) * 0.8);
  const daysInMonth = getDaysInMonth(year, month);
  const base = monthTarget / daysInMonth;
  const seed = year * 10000 + month * 100 + day;
  const rand = seededRandom(seed);

  if (rand < 0.25) return 0;
  if (rand < 0.55) return Math.max(1, Math.round(base * 0.5 + rand * 2));
  if (rand < 0.8) return Math.max(3, Math.round(base + rand * 2));
  return Math.max(5, Math.round(base * 1.5 + rand * 3));
}

const EVENT_TITLES: Array<{ title: string; type: CalendarEventType }> = [
  { title: "Vehicle Smog Due", type: "compliance" },
  { title: "Customer Appointment", type: "appointment" },
  { title: "Payroll Run", type: "payroll" },
  { title: "Follow Up Call", type: "follow_up" },
  { title: "Title Processing", type: "task" },
  { title: "Insurance Renewal", type: "compliance" },
  { title: "Test Drive Scheduled", type: "appointment" },
];

function generateDailyActivity(
  year: number,
  month: number,
  day: number,
): IDailySalesActivity {
  const date = `${getMonthId(year, month)}-${String(day).padStart(2, "0")}`;
  const unitsSold = generateUnitsForDay(year, month, day);
  const avgGross = 7800 + seededRandom(year * 1000 + month * 10 + day) * 2000;
  const totalGross = Math.round(unitsSold * avgGross);
  const totalCommissions = Math.round(totalGross * 0.127);

  const salesReps: IDailySalesActivity["salesReps"] = [];
  if (unitsSold > 0) {
    let remaining = unitsSold;
    const repCount = Math.min(
      SALES_REPS.length,
      unitsSold <= 2 ? 1 : unitsSold <= 4 ? 2 : 3,
    );
    for (let i = 0; i < repCount && remaining > 0; i++) {
      const rep = SALES_REPS[i]!;
      const units =
        i === repCount - 1
          ? remaining
          : Math.max(1, Math.floor(remaining / (repCount - i)));
      remaining -= units;
      const grossProfit = Math.round(units * avgGross);
      salesReps.push({
        repId: rep.id,
        repName: rep.name,
        avatarUrl: rep.avatarUrl,
        unitsSold: units,
        grossProfit,
        commissionsEarned: Math.round(grossProfit * 0.127),
      });
    }
  }

  const seed = year * 10000 + month * 100 + day;
  const events: IDailySalesActivity["events"] = [];
  if (seededRandom(seed + 1) > 0.6) {
    const ev = EVENT_TITLES[Math.floor(seededRandom(seed + 2) * EVENT_TITLES.length)]!;
    events.push({
      id: `ev-${date}-1`,
      time: `${9 + Math.floor(seededRandom(seed + 3) * 8)}:00 AM`,
      title: ev.title,
      type: ev.type,
    });
  }
  if (seededRandom(seed + 4) > 0.75) {
    const ev = EVENT_TITLES[Math.floor(seededRandom(seed + 5) * EVENT_TITLES.length)]!;
    events.push({
      id: `ev-${date}-2`,
      time: `${1 + Math.floor(seededRandom(seed + 6) * 4)}:00 PM`,
      title: ev.title,
      type: ev.type,
    });
  }

  return {
    id: `day-${date}`,
    date,
    unitsSold,
    totalGross,
    totalCommissions,
    salesReps,
    events,
  };
}

function generateAllDailyActivity(): IDailySalesActivity[] {
  const days: IDailySalesActivity[] = [];
  for (const year of [2024, 2025]) {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = getDaysInMonth(year, month);
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(generateDailyActivity(year, month, day));
      }
    }
  }
  return days;
}

function buildMonthlySummaries(
  dailyActivity: IDailySalesActivity[],
): IMonthlySummaryMetrics[] {
  const byMonth = new Map<string, IDailySalesActivity[]>();
  for (const day of dailyActivity) {
    const monthId = day.date.slice(0, 7);
    const list = byMonth.get(monthId) ?? [];
    list.push(day);
    byMonth.set(monthId, list);
  }

  const summaries: IMonthlySummaryMetrics[] = [];
  for (const [monthId, days] of byMonth) {
    const unitsSold = days.reduce((s, d) => s + d.unitsSold, 0);
    const totalGross = days.reduce((s, d) => s + d.totalGross, 0);
    const totalCommissions = days.reduce((s, d) => s + d.totalCommissions, 0);
    const [y, m] = monthId.split("-").map(Number);
    const monthName = new Date(y!, m! - 1, 1).toLocaleDateString("en-US", {
      month: "long",
    });
    const unitsBought = Math.round(unitsSold * 0.9);
    const cogs = Math.round(totalGross * 0.756);
    const grossProfit = totalGross - cogs;
    const totalExpenses = Math.round(grossProfit * 0.245);
    const netProfit = grossProfit - totalExpenses - totalCommissions;

    summaries.push({
      monthId,
      monthName,
      unitsSold,
      unitsBought,
      totalGross,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      averageGrossPerUnit: unitsSold > 0 ? Math.round(totalGross / unitsSold) : 0,
      averageProfitPerUnit: unitsSold > 0 ? Math.round(netProfit / unitsSold) : 0,
      totalCommissions,
      topVehicles: TOP_VEHICLES.slice(0, 5).map((v, i) => ({
        vehicleId: `veh-${monthId}-${i}`,
        makeModel: v.makeModel,
        imageUrl: v.imageUrl,
        unitsSold: Math.max(1, Math.round(unitsSold * (0.15 - i * 0.02))),
        grossProfit: Math.round(totalGross * (0.12 - i * 0.015)),
      })),
    });
  }

  return summaries.sort((a, b) => a.monthId.localeCompare(b.monthId));
}

function scaleMonthlySummaries(
  summaries: IMonthlySummaryMetrics[],
): IMonthlySummaryMetrics[] {
  return summaries.map((s) => {
    const year = Number(s.monthId.slice(0, 4));
    const target = YEARLY_TARGETS[year];
    if (!target) return s;

    const yearSummaries = summaries.filter((x) => x.monthId.startsWith(String(year)));
    const yearUnits = yearSummaries.reduce((sum, x) => sum + x.unitsSold, 0);
    const scale = target.units / Math.max(yearUnits, 1);

    if (Math.abs(scale - 1) < 0.05) return s;

    const monthIdx = Number(s.monthId.slice(5, 7)) - 1;
    const targetMonthUnits =
      year === 2025
        ? MONTHLY_UNIT_TARGETS_2025[monthIdx] ?? s.unitsSold
        : Math.round((MONTHLY_UNIT_TARGETS_2025[monthIdx] ?? s.unitsSold) * 0.8);

    const unitScale = targetMonthUnits / Math.max(s.unitsSold, 1);
    const unitsSold = targetMonthUnits;
    const totalGross = Math.round(s.totalGross * unitScale);
    const totalCommissions = Math.round(s.totalCommissions * unitScale);
    const cogs = Math.round(s.cogs * unitScale);
    const grossProfit = totalGross - cogs;
    const totalExpenses = Math.round(s.totalExpenses * unitScale);
    const netProfit = grossProfit - totalExpenses - totalCommissions;

    return {
      ...s,
      unitsSold,
      unitsBought: Math.round(s.unitsBought * unitScale),
      totalGross,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      totalCommissions,
      averageGrossPerUnit: unitsSold > 0 ? Math.round(totalGross / unitsSold) : 0,
      averageProfitPerUnit: unitsSold > 0 ? Math.round(netProfit / unitsSold) : 0,
    };
  });
}

const UPCOMING_EVENTS: UpcomingComplianceEvent[] = [
  { id: "ue-1", title: "Sales Tax Due", date: "2025-05-25", status: "urgent" },
  { id: "ue-2", title: "Payroll Run", date: "2025-05-28", status: "upcoming" },
  { id: "ue-3", title: "Insurance Renewal", date: "2025-06-01", status: "scheduled" },
  { id: "ue-4", title: "CDTFA Quarterly Filing", date: "2025-06-15", status: "scheduled" },
];

const YEARLY_EVENTS: UpcomingComplianceEvent[] = [
  { id: "ye-1", title: "CDTFA Annual Filing", date: "2026-01-31", status: "urgent" },
  { id: "ye-2", title: "Tax Filing Deadline", date: "2026-04-15", status: "upcoming" },
  { id: "ye-3", title: "Insurance Renewal", date: "2026-06-01", status: "scheduled" },
  { id: "ye-4", title: "CPA Year-End Review", date: "2026-02-28", status: "scheduled" },
];

const rawDaily = generateAllDailyActivity();
const rawMonthly = buildMonthlySummaries(rawDaily);
const scaledMonthly = scaleMonthlySummaries(rawMonthly);

export const CALENDAR_MOCK_REPORT: CalendarReport = {
  dailyActivity: rawDaily,
  monthlySummaries: scaledMonthly,
  upcomingEvents: UPCOMING_EVENTS,
  yearlyEvents: YEARLY_EVENTS,
  dayNotes: {
    "2025-05-01": "Strong sales day! Team exceeded daily target.",
    "2025-05-15": "Best sales day of the month - 8 units closed.",
  },
  soldVehicleRows: [],
  purchasedVehicleRows: [],
  monthFinancials: {},
};
