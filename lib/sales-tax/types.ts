export type SalesTaxTab =
  | "overview"
  | "reports"
  | "transactions"
  | "configuration"
  | "reminders";

export type SalesTaxKpiColor = "green" | "blue" | "purple" | "orange";

export type SalesTaxKpi = {
  id: string;
  label: string;
  valueFormatted: string;
  iconColor: SalesTaxKpiColor;
  trend?: {
    value: string;
    sentiment: "positive" | "negative" | "neutral";
    direction: "up" | "down" | "flat";
    comparisonLabel: string;
  };
  subtext?: string;
};

export type SalesTaxConfig = {
  state: string;
  stateSalesTaxPercent: string;
  additionalLocalTaxPercent: string;
  filingFrequency: string;
  filingDueDates: string;
  additionalLocalTaxApplies: string;
};

export type SalesTaxYtdRow = {
  id: string;
  label: string;
  amountFormatted: string;
  highlight?: "danger" | "default";
};

export type SalesTaxBreakdownSegment = {
  id: string;
  label: string;
  color: string;
  percent: number;
  amountFormatted: string;
};

export type SalesTaxTransaction = {
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

export type SalesTaxReport = {
  tabs: { id: SalesTaxTab; label: string }[];
  config: SalesTaxConfig;
  configOptions: {
    states: string[];
    localTaxOptions: { value: string; label: string }[];
    filingFrequencies: string[];
    filingDueDateOptions: string[];
    yesNoOptions: string[];
  };
  kpis: SalesTaxKpi[];
  ytdSummary: {
    rows: SalesTaxYtdRow[];
    chart: {
      centerPercent: number;
      centerLabel: string;
      breakdown: SalesTaxBreakdownSegment[];
    };
  };
  transactions: SalesTaxTransaction[];
};
