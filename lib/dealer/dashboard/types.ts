import type { KPICardData } from "@/components/ui/kpi-card";

export type VehicleStatus = "in_inventory" | "sold" | "pending";

/** @deprecated Use TransactionPaymentStatus for the transactions center */
export type PaymentStatus = "pending" | "funded" | "settled";

export type TransactionType =
  | "dealer_sale"
  | "auction_sale"
  | "dealer_purchase"
  | "auction_purchase";

export type TransactionPaymentStatus = "paid" | "partial" | "pending";

export type TransactionPaymentMethod =
  | "wire_transfer"
  | "ach"
  | "check"
  | "floor_plan"
  | "cash";

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
  type: TransactionType;
  transactionDate: string;
  vin: string;
  vehicleLabel: string;
  stockNumber: string;
  vehicleImageUrl?: string;
  mileage?: number;
  buyerSeller: string;
  auction: string | null;
  salePurchasePrice: number;
  grossProfit: number | null;
  paymentStatus: TransactionPaymentStatus;
  paymentMethod: TransactionPaymentMethod;
  contactPerson: string;
  dealerLicense?: string;
  phone?: string;
  email?: string;
  documents: { id: string; name: string; uploadedAt: string }[];
  notes: string;
  auditEvents: { at: string; action: string; actor?: string }[];
  /** @deprecated Use transactionDate */
  dateSold?: string;
  /** @deprecated Use buyerSeller */
  buyerDealer?: string;
  /** @deprecated Use salePurchasePrice */
  salePrice?: number;
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
  soldVehicles: boolean;
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

export type TransactionKpiStrip = {
  totalTransactions: DealerKpi;
  dealerSales: DealerKpi;
  auctionSales: DealerKpi;
  totalRevenue: DealerKpi;
  pendingPayments: DealerKpi;
  completedPayments: DealerKpi;
  grossProfit: DealerKpi;
};

export type SaleType = "wholesale" | "retail" | "dealer_trade" | "auction";

export type BuyerType = "dealer" | "auction" | "private" | "other";

export type SoldVehicleRecord = {
  id: string;
  inventoryId: string;
  dateSold: string;
  vin: string;
  vehicleLabel: string;
  stockNumber: string;
  vehicleImageUrl?: string;
  mileage?: number;
  buyer: string;
  buyerType: BuyerType;
  contactPerson: string;
  dealerLicense?: string;
  phone?: string;
  email?: string;
  saleType: SaleType;
  salePrice: number;
  vehicleCost: number;
  reconditioning: number;
  totalExpenses: number;
  totalCost: number;
  grossProfit: number;
  grossProfitPercent: number;
  paymentStatus: TransactionPaymentStatus;
  paymentMethod: TransactionPaymentMethod;
  dealNumber: string;
  salesperson?: string;
  documents: { id: string; name: string; uploadedAt: string }[];
  notes: string;
};

export type SoldVehicleKpiStrip = {
  totalSold: DealerKpi;
  totalSales: DealerKpi;
  totalGrossProfit: DealerKpi;
  averageGrossProfit: DealerKpi;
  soldThisMonth: DealerKpi;
  pendingPayments: DealerKpi;
};

export type DealerDashboardData = {
  profile: DealerProfile;
  kpis: DealerKpi[];
  transactionKpis: TransactionKpiStrip;
  soldVehicleKpis: SoldVehicleKpiStrip;
  vehicles: WholesaleVehicle[];
  transactions: DealerTransaction[];
  soldVehicles: SoldVehicleRecord[];
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
