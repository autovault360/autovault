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

export type CpaDashboardData = {
  dataAsOf: string;
  kpis: CpaKpi[];
  salesActivity: CpaSalesActivity[];
  vehiclesSold: CpaVehicleSold[];
  vehiclesSoldTotal: number;
  salesTax: CpaSalesTaxSummary;
  payroll: CpaPayrollSummary;
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
  role: string;
  dealershipId: string;
  dealershipName: string;
  canManageNotes: boolean;
  isReadOnly: boolean;
};
