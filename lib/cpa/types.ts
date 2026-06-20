export type CpaNoteCategory =
  | "Documents"
  | "Receipts"
  | "Payroll"
  | "Sales Tax"
  | "Deal Jackets"
  | "Audit"
  | "Vehicle Records"
  | "General";

export type CpaNotePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type CpaNoteStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";

export type CpaViewMode = "monthly" | "yearly";

export type CpaNoteListItem = {
  id: string;
  title: string;
  description: string;
  category: CpaNoteCategory;
  priority: CpaNotePriority;
  status: CpaNoteStatus;
  stockNumber: string | null;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  createdById: string;
  isArchived: boolean;
};

export type CpaNoteComment = {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
};

export type CpaNoteAttachment = {
  id: string;
  noteId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string | null;
  uploadedByName: string;
  createdAt: string;
};

export type CpaNoteActivity = {
  id: string;
  activityType: string;
  activityDescription: string;
  userName: string;
  createdAt: string;
};

export type CpaNoteDetail = CpaNoteListItem & {
  assignedTo: string | null;
  assignedToName: string | null;
  resolvedAt: string | null;
  comments: CpaNoteComment[];
  attachments: CpaNoteAttachment[];
  activity: CpaNoteActivity[];
};

export type CpaNotesSummary = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
};

export type CpaKpi = {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: string;
  color: "green" | "purple" | "blue" | "red" | "teal" | "orange";
  chartData: { name: string; value: number }[];
};

export type CpaSalesActivity = {
  label: string;
  value: number;
  delta?: string;
  deltaPositive?: boolean;
  icon: string;
};

export type CpaVehicleSold = {
  id: string;
  dateSold: string;
  stockNumber: string;
  vehicle: string;
  vin: string;
  salePrice: number;
  grossProfit: number;
};

export type CpaSalesTaxSummary = {
  taxableSales: number;
  taxCollected: number;
  taxPaymentsMade: number;
  balanceDue: number;
  filingFrequency: string;
  dueDate: string;
  status: "DUE SOON" | "PAID" | "OVERDUE";
};

export type CpaPayrollSummary = {
  totalPayroll: number;
  employeesPaid: number;
  commissionsPaid: number;
  bonusesPaid: number;
  payrollTaxes: number;
  nextPayrollDate: string;
};

export type CpaProfitLossRow = {
  label: string;
  current: number;
  previous: number;
  changePct: number;
  isMargin?: boolean;
};

export type CpaTrendPoint = {
  month: string;
  revenue: number;
  netProfit: number;
};

export type CpaDealJacketSegment = {
  name: string;
  value: number;
  color: string;
  count?: number;
};

export type CpaStorageFolder = {
  id: string;
  name: string;
  fileCount: number;
  iconColor: string;
};

export type CpaNotePreview = {
  id: string;
  title: string;
  date: string;
  creator: string;
  status: CpaNoteStatus;
  priority: CpaNotePriority;
};

export type CpaVehicleHighlight = {
  amount: number;
  vehicle: string;
};

export type CpaVehicleProfitStats = {
  totalVehiclesSold: number;
  profitableCount: number;
  profitPct: number;
  totalProfit: number;
  avgProfitPerVehicle: number;
  highestProfit: CpaVehicleHighlight;
  lowestProfit: CpaVehicleHighlight;
  grossProfitMargin: number;
};

export type CpaVehicleLossStats = {
  lossCount: number;
  lossPct: number;
  totalLoss: number;
  avgLossPerVehicle: number;
  highestLoss: CpaVehicleHighlight;
  lowestLoss: CpaVehicleHighlight;
  returnedToAuction: number;
  lossImpactPct: number;
};

export type CpaExpensePanel = {
  totalExpenses: number;
  expenseRatio: number;
  dailyAverage: number;
  monthlyBudget: number;
  vsBudgetPct: number;
  categories: CpaExpenseCategory[];
};

export type CpaPayrollBreakdownItem = {
  label: string;
  amount: number;
};

export type CpaTopEarner = {
  rank: number;
  name: string;
  amount: number;
};

export type CpaPayrollPanel = {
  totalPayroll: number;
  totalCommissions: number;
  bonuses: number;
  payrollTaxes: number;
  deductions: number;
  totalPayments: number;
  payrollBreakdown: CpaPayrollBreakdownItem[];
  topEarners: CpaTopEarner[];
};

export type CpaSalesTaxPanel = {
  taxCollected: number;
  taxPaid: number;
  taxDue: number;
  effectiveTaxRate: number;
  upcomingFiling: string;
  filingDueDate: string;
  vehiclesIncluded: number;
};

export type CpaDashboardData = {
  dataAsOf: string;
  prevPeriodLabel: string;
  kpis: CpaKpi[];
  salesActivity: CpaSalesActivity[];
  vehiclesSold: CpaVehicleSold[];
  vehiclesSoldTotal: number;
  vehicleProfitStats: CpaVehicleProfitStats;
  vehicleLossStats: CpaVehicleLossStats;
  salesTax: CpaSalesTaxSummary;
  salesTaxPanel: CpaSalesTaxPanel;
  payroll: CpaPayrollSummary;
  payrollPanel: CpaPayrollPanel;
  expensePanel: CpaExpensePanel;
  profitLoss: CpaProfitLossRow[];
  trend: CpaTrendPoint[];
  dealJackets: CpaDealJacketSegment[];
  dealJacketsTotal: number;
  storageFolders: CpaStorageFolder[];
  notePreviews: CpaNotePreview[];
  notesSummary: CpaNotesSummary;
};

export type CpaSession = {
  userId: string;
  email: string;
  fullName: string;
  initials: string;
  imageUrl?: string;
  role: string;
  dealershipId: string;
  dealershipName: string;
  canManageNotes: boolean;
  isReadOnly: boolean;
};

export type CpaMetricTrend = {
  value: number;
  changePct: number;
  trend: "up" | "down";
};

export type CpaMonthlyVehicleSold = {
  id: string;
  date: string;
  stockId: string;
  vehicle: string;
  customer: string;
  salePrice: number;
  cogs: number;
  grossProfit: number;
  salesRep: string;
};

export type CpaMonthlyVehiclePurchased = {
  id: string;
  date: string;
  stockId: string;
  vehicle: string;
  purchasePrice: number;
  cost: number;
};

export type CpaExpenseCategory = {
  label: string;
  amount: number;
  pct: number;
  color: string;
};

export type CpaSalesRepRank = {
  id: string;
  name: string;
  initials: string;
  unitsSold: number;
  grossProfit: number;
  commissions: number;
};

export type CpaMonthlyNoteItem = {
  id: string;
  content: string;
  date: string;
  author: string;
  ribbon: "blue" | "green" | "amber";
};

export type CpaDealJacketStatusSegment = {
  name: string;
  count: number;
  pct: number;
  color: string;
};

export type CpaReportExportItem = {
  id: string;
  label: string;
  format: "pdf" | "excel";
};

export type CpaMonthlyFinancialsData = {
  selectedMonth: string;
  periodSubtitle: string;
  prevMonthLabel: string;
  metrics: {
    totalRevenue: CpaMetricTrend;
    cogs: CpaMetricTrend;
    grossProfit: CpaMetricTrend;
    totalExpenses: CpaMetricTrend;
    netProfit: CpaMetricTrend;
    salesTaxCollected: CpaMetricTrend;
    payrollPaid: CpaMetricTrend;
    commissionsPaid: CpaMetricTrend;
  };
  vehiclesSold: {
    totalCount: number;
    data: CpaMonthlyVehicleSold[];
    totals: { salePrice: number; cogs: number; grossProfit: number };
  };
  vehiclesPurchased: {
    totalCount: number;
    data: CpaMonthlyVehiclePurchased[];
    totals: { purchasePrice: number; cost: number };
  };
  salesTax: CpaSalesTaxSummary & {
    salesTaxOwed: number;
  };
  expenseBreakdown: {
    total: number;
    categories: CpaExpenseCategory[];
  };
  profitLossSummary: {
    totalRevenue: number;
    cogs: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
    otherIncome: number;
    profitMargin: number;
  };
  topSalesReps: CpaSalesRepRank[];
  payrollCommissions: {
    payroll: {
      totalPayroll: number;
      employeesPaid: number;
      payrollTaxes: number;
      benefits: number;
      bonuses: number;
    };
    commissions: {
      totalCommissions: number;
      salesCommissions: number;
      financeCommissions: number;
      otherCommissions: number;
    };
  };
  dealJackets: {
    total: number;
    segments: CpaDealJacketStatusSegment[];
  };
  notes: CpaMonthlyNoteItem[];
  storageFolders: CpaStorageFolder[];
  reportExports: CpaReportExportItem[];
};
