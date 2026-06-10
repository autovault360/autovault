export type PayrollPaymentStatus =
  | "paid"
  | "pending"
  | "processing"
  | "failed"
  | "on_hold";

export type PayrollPeriodMonth =
  | "2026-05"
  | "2026-04"
  | "2026-03"
  | "2026-02"
  | "2026-01";

export type EarningsChartRange = "monthly" | "weekly" | "yearly";

export type IEarningsByVehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
  vehicleImageUrl: string;
  customerName: string;
  customerPhone: string;
  soldDate: string;
  soldPrice: number;
  grossProfit: number;
  commissionRate: number;
  commissionEarned: number;
  paymentStatus: PayrollPaymentStatus;
  dealJacketId: string;
  employeeId: string;
  invoiceRef: string;
  transactionId: string;
} & Record<string, unknown>;

export interface IPayrollEarningsKpiSummary {
  totalEarnings: number;
  totalCommissions: number;
  vehiclesSold: number;
  avgCommissionPerVehicle: number;
  nextPayDate: string;
  daysUntilPay: number;
  totalEarningsTrend: string;
  totalCommissionsTrend: string;
  vehiclesSoldTrend: string;
  avgCommissionTrend: string;
}

export interface IPayrollEarningsBreakdown {
  totalCommissions: number;
  otherBonuses: number;
  adjustments: number;
  chargebacks: number;
  netPay: number;
}

export interface IPaymentHistoryEntry {
  id: string;
  payDate: string;
  period: string;
  totalEarnings: number;
  status: "paid" | "pending";
}

export interface IPayrollEarningsData {
  periodLabel: string;
  periodMonth: PayrollPeriodMonth;
  kpiSummary: IPayrollEarningsKpiSummary;
  breakdown: IPayrollEarningsBreakdown;
  earningsByVehicle: IEarningsByVehicle[];
  paymentHistory: IPaymentHistoryEntry[];
  chartData: { label: string; earnings: number }[];
}

export interface PayrollEarningsFilterState {
  search: string;
  paymentStatus: string;
  payrollCycle: string;
}
