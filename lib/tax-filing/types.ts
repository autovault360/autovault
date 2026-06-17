export type FilingStatus = "open" | "due" | "paid" | "filed" | "closed";

export type FilingFrequency = "monthly" | "quarterly" | "annual" | "custom";

export type TaxFilingPeriod = {
  id: string;
  dealershipId: string;
  name: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: FilingStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaxFilingPeriodRaw = {
  id: string;
  dealership_id: string;
  name: string;
  start_date: string;
  end_date: string;
  due_date: string;
  status: FilingStatus;
  created_at: string;
  updated_at: string;
};

export type DealershipTaxSettings = {
  id: string;
  dealershipId: string;
  state: string | null;
  filingFrequency: FilingFrequency;
  reminderDays: number;
};

export type DealershipTaxSettingsRaw = {
  id: string;
  dealership_id: string;
  state: string | null;
  filing_frequency: FilingFrequency;
  reminder_days: number;
};

export type FilingPeriodDealRaw = {
  id: string;
  filing_period_id: string;
  deal_jacket_id: string;
};

export type TaxFilingDocumentRaw = {
  id: string;
  filing_period_id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
};

export type FilingPeriodDealVehicle = {
  dealJacketId: string;
  jacketNumber: string;
  vehicleTitle: string;
  vin: string;
  customerName: string;
  soldDate: string;
  buyerZip: string;
  salePrice: number;
  salesTaxEntered: number;
};

export type FilingPeriodSummary = TaxFilingPeriod & {
  vehicleCount: number;
  totalTaxEntered: number;
};

export type TaxReminder = {
  periodId: string;
  periodName: string;
  dueDate: string;
  daysUntilDue: number;
  vehicleCount: number;
  status: FilingStatus;
};

export type FilingPeriodDetail = TaxFilingPeriod & {
  vehicles: FilingPeriodDealVehicle[];
  totalTaxEntered: number;
  documents: {
    id: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
    signedUrl: string | null;
  }[];
};

export type GeneratePeriodsInput = {
  frequency: FilingFrequency;
  startDate: string;
  numberOfPeriods?: number;
};

export type SaveTaxSettingsInput = {
  state: string;
  filingFrequency: FilingFrequency;
  reminderDays: number;
};

export type FilingDashboardData = {
  settings: {
    state: string | null;
    frequency: string;
    reminderDays: number;
  } | null;
  periods: FilingPeriodSummary[];
  upcomingPeriod: {
    id: string;
    name: string;
    dueDate: string;
    status: FilingStatus;
  } | null;
  reminders: TaxReminder[];
};
