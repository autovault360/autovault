import type { KPIIconName } from "@/components/ui/kpi-card";

export type SalesRepCommissionStatus = "paid" | "pending";

export type SalesRepProfileDateRange = {
  start: string;
  end: string;
  label: string;
};

export type SalesRepProfileSummary = {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  imageUrl: string | null;
  isActive: boolean;
  hireDate: string;
  commissionPlan: string;
  managerName: string;
  lifetimeVehiclesSold: number;
};

export type SalesRepProfileKpiMetric = {
  id: string;
  label: string;
  icon: KPIIconName;
  color: "blue" | "green" | "violet" | "orange" | "amber";
  thisMonth: string;
  thisYear?: string;
  lifetime?: string;
};

export type SalesRepVehicleSale = {
  id: string;
  date: string;
  stockNumber: string;
  vehicleId?: string;
  vehicle: string;
  customer: string;
  salePrice: number;
  grossProfit: number;
  commission: number;
};

export type SalesRepVehicleSalesSummary = {
  count: number;
  totalSalePrice: number;
  totalGrossProfit: number;
  totalCommission: number;
};

export type SalesRepCommissionEntry = {
  id: string;
  date: string;
  vehicle: string;
  grossProfit: number;
  commission: number;
  status: SalesRepCommissionStatus;
};

export type SalesRepCommissionSummary = {
  paidTotal: number;
  pendingTotal: number;
  earnedTotal: number;
};

export type SalesRepTrendPoint = {
  month: string;
  vehiclesSold: number;
  grossProfit: number;
  commissions: number;
};

export type SalesRepTrendSummary = {
  totalVehicles: number;
  totalGrossProfit: number;
  totalCommissions: number;
};

export type SalesRepFollowUp = {
  id: string;
  customer: string;
  vehicleInterested: string;
  lastContact: string;
  nextFollowUp: string;
};

export type SalesRepAppointment = {
  id: string;
  date: string;
  time: string;
  event: string;
  dotColor: "blue" | "green" | "orange" | "purple";
};

export type SalesRepNoteTone = "green" | "blue" | "orange";

export type SalesRepInternalNote = {
  id: string;
  date: string;
  content: string;
  author: string;
  tone: SalesRepNoteTone;
};

export type SalesRepDocument = {
  id: string;
  name: string;
  uploadedAt: string;
  fileType: "pdf" | "image" | "doc";
};

export type SalesRepDealJacketItem = {
  id: string;
  jacketNumber: string;
  date: string;
  stockNumber: string;
  status: "completed" | "in_progress" | "pending";
};

export type SalesRepReportAction = {
  id: string;
  label: string;
  subtitle: string;
  icon: "file-text" | "dollar-sign" | "handshake" | "file-spreadsheet" | "printer";
  color: "blue" | "green" | "violet" | "emerald";
};

export type SalesRepProfileDetail = {
  summary: SalesRepProfileSummary;
  dateRange: SalesRepProfileDateRange;
  kpis: SalesRepProfileKpiMetric[];
  vehicleSales: SalesRepVehicleSale[];
  vehicleSalesSummary: SalesRepVehicleSalesSummary;
  commissionHistory: SalesRepCommissionEntry[];
  commissionSummary: SalesRepCommissionSummary;
  salesTrend: SalesRepTrendPoint[];
  salesTrendSummary: SalesRepTrendSummary;
  followUps: SalesRepFollowUp[];
  appointments: SalesRepAppointment[];
  notes: SalesRepInternalNote[];
  documents: SalesRepDocument[];
  dealJackets: SalesRepDealJacketItem[];
  reportActions: SalesRepReportAction[];
};

export type SalesRepProfileFilters = {
  dateRange: SalesRepProfileDateRange;
};

export function formatProfileDate(date: string): string {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
