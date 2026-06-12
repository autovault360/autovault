import type { KPIIconName } from "@/components/ui/kpi-card";

export type ReportsDateRange =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "quarter"
  | "year"
  | "custom";

export type ReportsFilters = {
  dateRange: ReportsDateRange;
  salesRep: string;
  vehicle: string;
  customer: string;
  category: string;
  dealJacket: string;
  state: string;
};

export type ReportsKpi = {
  icon: KPIIconName;
  color: string;
  label: string;
  value: string;
  delta: string;
  sparkColor: string;
  sparkPoints: string;
};

export type ReportSummaryRow = {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
};

export type SalesRepRow = {
  rank: number;
  name: string;
  carsSold: number;
  grossProfit: string;
  commission: string;
  closingRatio: string;
};

export type ExpenseBarRow = {
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type InventoryBreakdownSegment = {
  id: string;
  label: string;
  color: string;
  count: number;
  percent: number;
};

export type InventoryOverview = {
  totalVehicles: number;
  avgDaysInStock: number;
  inventoryValue: string;
  estProfitInInventory: string;
  breakdown: InventoryBreakdownSegment[];
};

export type TopReminderItem = {
  id: string;
  title: string;
  statusLabel: string;
  statusTone: "red" | "orange" | "blue" | "purple" | "green";
  iconTone: "amber" | "red" | "emerald" | "lime" | "blue";
};

export type StickyNote = {
  id: string;
  color: string;
  text: string;
  date: string;
  author: string;
  is_pinned?: boolean;
  dashboard_path?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
};

export type ReportsAiSuggestionIcon =
  | "chart"
  | "dollar"
  | "alert"
  | "car"
  | "file"
  | "clock";

export type ReportsAiSuggestion = {
  id: string;
  label: string;
  icon: ReportsAiSuggestionIcon;
};

export type DealJacketStatusSegment = {
  label: string;
  count: number;
  percent: string;
  tone: "green" | "blue" | "orange" | "emerald";
};

export type AuditReadinessItem = {
  label: string;
  done: boolean;
  badge?: string;
};

export type AuditReadiness = {
  percent: number;
  subtitle: string;
  items: AuditReadinessItem[];
};

export type CustomReportField = {
  id: string;
  label: string;
  value: string;
};

export type ReportsRemindersMock = {
  kpis: ReportsKpi[];
  reportSummary: ReportSummaryRow[];
  salesPerformance: SalesRepRow[];
  expenseBars: ExpenseBarRow[];
  inventory: InventoryOverview;
  profitLossSummary: ReportSummaryRow[];
  payroll: { label: string; value: string }[];
  commissions: { label: string; value: string }[];
  dealJacketStatus: DealJacketStatusSegment[];
  auditReadiness: AuditReadiness;
  customReportFields: CustomReportField[];
  topReminders: TopReminderItem[];
  stickyNotes: StickyNote[];
  aiSuggestions: ReportsAiSuggestion[];
};

export const DEFAULT_REPORTS_FILTERS: ReportsFilters = {
  dateRange: "this_month",
  salesRep: "all",
  vehicle: "all",
  customer: "all",
  category: "all",
  dealJacket: "all",
  state: "all",
};
