export type CalendarViewMode = "monthly" | "yearly";

export type UnitsColorTier = "none" | "low" | "mid" | "high";

export type CalendarEventType =
  | "compliance"
  | "appointment"
  | "payroll"
  | "follow_up"
  | "task";

export interface IDailySalesActivity {
  id: string;
  date: string;
  unitsSold: number;
  totalGross: number;
  totalCommissions: number;
  salesReps: Array<{
    repId: string;
    repName: string;
    avatarUrl?: string;
    unitsSold: number;
    grossProfit: number;
    commissionsEarned: number;
  }>;
  events: Array<{
    id: string;
    time: string;
    title: string;
    type: CalendarEventType;
    description?: string;
  }>;
}

export interface IMonthlySummaryMetrics {
  monthId: string;
  monthName: string;
  unitsSold: number;
  unitsBought: number;
  totalGross: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  averageGrossPerUnit: number;
  averageProfitPerUnit: number;
  totalCommissions: number;
  topVehicles: Array<{
    vehicleId: string;
    makeModel: string;
    imageUrl: string;
    unitsSold: number;
    grossProfit: number;
  }>;
}

export type CalendarFilters = {
  salesRep: string;
  location: string;
  searchQuery: string;
};

export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  salesRep: "all",
  location: "all",
  searchQuery: "",
};

export type CalendarKpi = {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  delta: string;
  deltaDirection: "up" | "down" | "flat";
  deltaSentiment: "positive" | "negative" | "neutral";
  comparisonLabel: string;
  iconColor: "blue" | "green" | "purple" | "amber" | "teal";
};

export type SalesRepLeaderboardEntry = {
  rank: number;
  repId: string;
  repName: string;
  avatarUrl?: string;
  unitsSold: number;
  gross: number;
};

export type BestMonthEntry = {
  rank: number;
  monthId: string;
  monthLabel: string;
  unitsSold: number;
  gross: number;
};

export type UpcomingComplianceEvent = {
  id: string;
  title: string;
  date: string;
  status: "urgent" | "upcoming" | "scheduled";
};

export type SoldVehicleRow = {
  id: string;
  date: string;
  stockNumber: string;
  vehicle: string;
  customer: string;
  salesRep: string;
  profit: number;
  commission: number;
};

export type PurchasedVehicleRow = {
  id: string;
  date: string;
  stockNumber: string;
  vehicle: string;
  cost: number;
  status: "In Stock" | "In Recon" | "Sold";
};

export type MonthlyTrendPoint = {
  label: string;
  monthId: string;
  units: number;
  gross: number;
  commission: number;
};

export type QuarterlyMetric = {
  quarter: string;
  units: number;
  gross: number;
};

export type WeekBreakdownRow = {
  week: string;
  unitsSold: number;
  gross: number;
  commission: number;
};

export type MonthGridCell = {
  date: string | null;
  dayNumber: number | null;
  activity: IDailySalesActivity | null;
};

export type MonthlyPerformanceSummary = IMonthlySummaryMetrics & {
  overviewLines: Array<{ label: string; value: string }>;
  salesByRep: Array<{
    repName: string;
    unitsSold: number;
    grossProfit: number;
    commissions: number;
  }>;
  vehicleActivity: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
  importantTotals: Array<{ label: string; value: string }>;
  recentSold: SoldVehicleRow[];
  recentPurchased: PurchasedVehicleRow[];
  notes: string[];
};

export type CalendarReport = {
  dailyActivity: IDailySalesActivity[];
  monthlySummaries: IMonthlySummaryMetrics[];
  upcomingEvents: UpcomingComplianceEvent[];
  yearlyEvents: UpcomingComplianceEvent[];
  dayNotes: Record<string, string>;
};

export type FilteredCalendarReport = CalendarReport & {
  dailyActivity: IDailySalesActivity[];
};
