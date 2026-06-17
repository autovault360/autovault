export type StateTaxTab =
  | "overview"
  | "reports"
  | "transactions"
  | "configuration"
  | "reminders";

export type StateTaxKpiColor = "green" | "blue" | "purple" | "orange";

export type StateTaxKpi = {
  id: string;
  label: string;
  valueFormatted: string;
  iconColor: StateTaxKpiColor;
  trend?: {
    value: string;
    sentiment: "positive" | "negative" | "neutral";
    direction: "up" | "down" | "flat";
    comparisonLabel: string;
  };
  subtext?: string;
};

export type StateTaxConfig = {
  state: string;
  stateSalesTaxPercent: string;
  additionalLocalTaxPercent: string;
  filingFrequency: string;
  filingDueDates: string;
  additionalLocalTaxApplies: string;
};

export type StateTaxYtdRow = {
  id: string;
  label: string;
  amountFormatted: string;
  highlight?: "danger" | "default";
};

export type StateTaxBreakdownSegment = {
  id: string;
  label: string;
  color: string;
  percent: number;
  amountFormatted: string;
};

export type StateTaxTransaction = {
  id: string;
  date: string;
  invoiceNumber: string;
  vehicle: string;
  taxableAmount: number;
  taxableAmountFormatted: string;
  taxCollected: number;
  taxCollectedFormatted: string;
  status: "collected";
};

export type MonthlyTaxDataPoint = {
  name: string;
  tax: number;
  vehicles: number;
};

export type ReminderInfo = {
  periodId: string;
  periodName: string;
  dueDate: string;
  daysUntilDue: number;
  vehicleCount: number;
  status: string;
};

export type PeriodSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: string;
  vehicleCount: number;
  totalTaxEntered: number;
};

export type StateTaxReport = {
  tabs: { id: StateTaxTab; label: string }[];
  config: StateTaxConfig;
  configOptions: {
    states: string[];
    localTaxOptions: { value: string; label: string }[];
    filingFrequencies: string[];
    filingDueDateOptions: string[];
    yesNoOptions: string[];
  };
  kpis: StateTaxKpi[];
  ytdSummary: {
    rows: StateTaxYtdRow[];
    chart: {
      centerPercent: number;
      centerLabel: string;
      breakdown: StateTaxBreakdownSegment[];
    };
  };
  transactions: StateTaxTransaction[];
  monthlyTaxData: MonthlyTaxDataPoint[];
  reminders: ReminderInfo[];
  periods: PeriodSummary[];
};
