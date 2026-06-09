import type { KPICardData } from "@/components/ui/kpi-card";
import type { CalendarReport } from "@/lib/calendar/types";
import type {
  ActivityItem,
  ProfitLossPoint,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";
import type { SalesRepListItem, SalesRepStats } from "@/lib/sales-reps/types";
import type { TopVehicle } from "@/services/vehicle.service";
import type { JacketRowExtended } from "@/services/deal-jacket.service";
import type { StickyNote } from "@/lib/reports-reminders/types";

export type AdminTodayEvent = {
  id: string;
  time: string;
  title: string;
  type: string;
};

export type AdminSalesRepTableRow = {
  rank: number;
  id: string;
  name: string;
  imageUrl: string | null;
  carsSold: number;
  grossProfit: number;
  commissionEarned: number;
  pendingCommission: number;
  payrollStatus: "Paid" | "Pending";
};

export type AdminGrossProfitRow = {
  id: string;
  vehicleLabel: string;
  imageUrl?: string;
  stockNumber: string;
  saleDate: string;
  purchaseCost: number;
  reconCost: number;
  totalCost: number;
  salePrice: number;
  grossProfit: number;
  commissionRate: number;
  commissionEarned: number;
  salesRepId: string | null;
  dealType: string;
};

export type AdminDashboardContentProps = {
  periodLabel: string;
  kpiCards: KPICardData[];
  calendarReport: CalendarReport;
  inventoryVehicles: WholesaleVehicle[];
  profitLossPoints: ProfitLossPoint[];
  profitLossSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
  activities: ActivityItem[];
  topVehicle: TopVehicle | null;
  topVehicleUnitsSold: number;
  topSalesRep: SalesRepListItem | null;
  todayEvents: AdminTodayEvent[];
  salesRepKpis: KPICardData[];
  salesRepTableRows: AdminSalesRepTableRow[];
  salesRepStats: SalesRepStats;
  grossProfitRows: AdminGrossProfitRow[];
  grossProfitPeriodLabel: string;
  stickyNotes: StickyNote[];
};

export type { JacketRowExtended };
