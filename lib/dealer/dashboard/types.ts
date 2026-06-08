import type { KPICardData } from "@/components/ui/kpi-card";

export type VehicleStatus = "in_inventory" | "sold" | "pending";
export type PaymentStatus = "pending" | "funded" | "settled";

export type VehicleCosts = {
  acquisition: number;
  auction: number;
  transport: number;
  recon: number;
  storage: number;
  dealerFees: number;
};

export type WholesaleVehicle = {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
  costs: VehicleCosts;
  marketValue: number;
  status: VehicleStatus;
  daysInLot: number;
  purchaseDate: string;
  imageUrl?: string;
};

export type DealerTransaction = {
  id: string;
  inventoryId: string;
  dateSold: string;
  buyerDealer: string;
  contactPerson: string;
  vehicleLabel: string;
  stockNumber: string;
  salePrice: number;
  paymentStatus: PaymentStatus;
  documents: { id: string; name: string; uploadedAt: string }[];
  notes: string;
  auditEvents: { at: string; action: string; actor?: string }[];
};

export type ExpenseCategory =
  | "auction_fees"
  | "transportation"
  | "recon_repairs"
  | "storage_fees"
  | "dealer_fees"
  | "miscellaneous";

export type WholesaleExpense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
};

export type VaultDocument = {
  id: string;
  name: string;
  type: "bill_of_sale" | "title" | "auction_invoice" | "other";
  linkedRecord: string;
  uploadedAt: string;
};

export type ActivityItem = {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  icon: "sold" | "expense" | "document" | "inventory";
};

export type TopPerformer = {
  topVehicle: { label: string; profit: number };
  bestMargin: { label: string; margin: number };
  ytdNetProfit: { value: number; delta: number };
};

export type ProfitLossPoint = {
  week: string;
  revenue: number;
  expenses: number;
};

export type DealerKpi = KPICardData & { subValue?: string };

export type DealerProfile = {
  dealershipName: string;
  contactName: string;
  initials: string;
  imageUrl?: string;
};

export type DashboardLoadingState = {
  kpis: boolean;
  inventory: boolean;
  transactions: boolean;
  expenses: boolean;
  documents: boolean;
  activity: boolean;
  profitLoss: boolean;
};

export type DashboardSectionKey = keyof DashboardLoadingState;

export type ExpandedSection =
  | null
  | "inventory"
  | "transaction"
  | "expense";

export type DealerDashboardData = {
  profile: DealerProfile;
  kpis: DealerKpi[];
  vehicles: WholesaleVehicle[];
  transactions: DealerTransaction[];
  expenses: WholesaleExpense[];
  documents: VaultDocument[];
  activity: ActivityItem[];
  profitLoss: ProfitLossPoint[];
  profitLossSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
  topPerformers: TopPerformer;
  notificationCount: number;
};
