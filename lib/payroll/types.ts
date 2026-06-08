export type PayrollStatus = "pending" | "paid" | "overdue";
export type PaymentType = "direct_deposit" | "check" | "paper_check";

export type PayrollKpis = {
  totalPayrollPaid: number;
  commissionsPaid: number;
  bonusesPaid: number;
  employeesPaid: number;
  pendingPayroll: number;
  nextPayrollDate: string;
  periodLabel: string;
};

export type PayrollSummaryRow = {
  id: string;
  employeeName: string;
  employeeId: string;
  avatarUrl: string;
  role: string;
  paymentType: PaymentType;
  payPeriod: string;
  payDate: string;
  basePay: number;
  commission: number;
  bonus: number;
  deductions: number;
  totalPaid: number;
  status: PayrollStatus;
};

export type CommissionSegment = {
  name: string;
  amount: number;
  percent: number;
  color: string;
};

export type UpcomingPayment = {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  iconColor: string;
};

export type PayrollRunStatus = "pending" | "paid";

export type PayrollRun = {
  id: string;
  period: string;
  amount: number;
  status: PayrollRunStatus;
};

export type PayrollReport = {
  id: string;
  title: string;
  actionLabel: "View & Export" | "Download";
  icon: string;
  color: string;
};

export type CpaSyncState = {
  note: string;
  author: string;
  syncedAt: string;
  isSynced: boolean;
};

export type PayrollDashboardData = {
  kpis: PayrollKpis;
  summaryRows: PayrollSummaryRow[];
  commissionSegments: CommissionSegment[];
  upcomingPayments: UpcomingPayment[];
  payrollRuns: PayrollRun[];
  reports: PayrollReport[];
  cpaSync: CpaSyncState;
};

export function formatPayrollCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPaymentType(type: PaymentType): string {
  switch (type) {
    case "direct_deposit":
      return "Direct Deposit";
    case "check":
      return "Check";
    case "paper_check":
      return "Paper Check";
  }
}

export type PayrollCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";

export type EmployeePayrollTab = "overview" | "calendar";

export type DeductionLine = {
  type: string;
  description: string;
  amount: number;
};

export type EarningsLine = {
  type: string;
  reference: string;
  description: string;
  rateOrAmount: string;
  amount: number;
};

export type CommissionDealRow = {
  dealJacketId: string;
  vehicle: string;
  grossProfit: number;
  commissionRate: number;
  commission: number;
};

export type PayHistoryEntry = {
  id: string;
  payPeriod: string;
  payDate: string;
  totalPay: number;
  status: PayrollStatus;
  paymentType: PaymentType;
};

export type PaymentSummary = {
  status: PayrollStatus;
  paymentType: PaymentType;
  bank: string;
  accountMasked: string;
  estimatedDeposit: string;
  netPay: number;
  infoNote: string;
};

export type YtdSummary = {
  year: number;
  grossEarnings: number;
  taxes: number;
  otherDeductions: number;
  netPayYtd: number;
  totalCommissions: number;
  totalBonuses: number;
};

export type EmployeeUpcomingPayDate = {
  id: string;
  date: string;
  label: string;
  daysUntil: number;
  estimatedAmount: number;
};

export type PayrollDocument = {
  id: string;
  name: string;
  uploadedAt: string;
  type: "w4" | "direct_deposit" | "pay_stub" | "other";
};

export type PayPeriodSummary = {
  status: PayrollStatus;
  payPeriod: string;
  payDate: string;
  paymentType: PaymentType;
  basePay: number;
  commission: number;
  bonus: number;
  deductions: number;
  totalPay: number;
};

export type PayrollCalendarEventType = "period_start" | "period_end" | "pay_date";

export type PayrollCalendarEvent = {
  date: string;
  type: PayrollCalendarEventType;
  label: string;
  amount?: number;
  period?: string;
};

export type PaycheckDetail = {
  period: string;
  payDate: string;
  basePay: number;
  commission: number;
  bonus: number;
  deductions: number;
  netPay: number;
  paymentType: PaymentType;
  verificationStatus: "verified" | "pending" | "review";
  adminNote: string;
  documents: PayrollDocument[];
};

export type EmployeePayrollProfile = {
  id: string;
  empCode: string;
  name: string;
  avatarUrl: string;
  role: string;
  phone: string;
  email: string;
  hireDate: string;
  payFrequency: string;
  isActive: boolean;
  periodLabel: string;
  payPeriodSummary: PayPeriodSummary;
  deductions: DeductionLine[];
  earnings: EarningsLine[];
  commissionDeals: CommissionDealRow[];
  payHistory: PayHistoryEntry[];
  paymentSummary: PaymentSummary;
  ytdSummary: YtdSummary;
  upcomingPayDates: EmployeeUpcomingPayDate[];
  documents: PayrollDocument[];
  adminNote: string;
  adminNoteUpdatedAt: string;
  calendarEvents: PayrollCalendarEvent[];
  paycheckDetails: Record<string, PaycheckDetail>;
};
