import type {
  BuyerType,
  SaleType,
  TransactionPaymentMethod,
  TransactionPaymentStatus,
} from "./types";

export const SALE_TYPE_OPTIONS: {
  value: SaleType;
  label: string;
  description: string;
  color: string;
  borderActive: string;
  bgActive: string;
}[] = [
  {
    value: "wholesale",
    label: "Wholesale",
    description: "Sell to licensed dealer",
    color: "text-emerald-400",
    borderActive: "border-emerald-500",
    bgActive: "bg-emerald-500/10",
  },
  {
    value: "retail",
    label: "Retail",
    description: "Sell to retail buyer",
    color: "text-blue-400",
    borderActive: "border-blue-500",
    bgActive: "bg-blue-500/10",
  },
  {
    value: "dealer_trade",
    label: "Dealer Trade",
    description: "Dealer-to-dealer trade",
    color: "text-amber-400",
    borderActive: "border-amber-500",
    bgActive: "bg-amber-500/10",
  },
  {
    value: "auction",
    label: "Auction",
    description: "Sell at auction",
    color: "text-purple-400",
    borderActive: "border-purple-500",
    bgActive: "bg-purple-500/10",
  },
];

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  wholesale: "Wholesale",
  retail: "Retail",
  dealer_trade: "Dealer Trade",
  auction: "Auction",
};

export const BUYER_TYPE_OPTIONS: {
  value: BuyerType;
  label: string;
}[] = [
  { value: "dealer", label: "Dealer" },
  { value: "auction", label: "Auction" },
  { value: "private", label: "Private" },
  { value: "other", label: "Other" },
];

export const PAYMENT_STATUS_OPTIONS: {
  value: TransactionPaymentStatus;
  label: string;
  className: string;
}[] = [
  { value: "paid", label: "Paid", className: "bg-emerald-500/15 text-emerald-400" },
  { value: "partial", label: "Partial", className: "bg-amber-500/15 text-amber-400" },
  { value: "pending", label: "Pending", className: "bg-orange-500/15 text-orange-400" },
];

export const PAYMENT_METHOD_OPTIONS: {
  value: TransactionPaymentMethod;
  label: string;
}[] = [
  { value: "wire_transfer", label: "Wire Transfer" },
  { value: "ach", label: "ACH" },
  { value: "check", label: "Check" },
  { value: "floor_plan", label: "Floor Plan" },
  { value: "cash", label: "Cash" },
];

export const PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  wire_transfer: "Wire Transfer",
  ach: "ACH",
  check: "Check",
  floor_plan: "Floor Plan",
  cash: "Cash",
};

export const COMMON_SOLD_VEHICLE_DOCUMENTS = [
  { value: "bill_of_sale", label: "Bill of Sale" },
  { value: "buyers_order", label: "Buyer's Order" },
  { value: "title", label: "Title" },
  { value: "odometer_statement", label: "Odometer Statement" },
  { value: "buyer_license", label: "Buyer License Copy" },
  { value: "wire_confirmation", label: "Wire Confirmation" },
] as const;

export const SOLD_VEHICLE_PERIOD_PRESETS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "ytd", label: "Year to Date" },
] as const;

export const DEFAULT_SOLD_VEHICLE_PERIOD = {
  preset: "this_month" as const,
  start: "2024-05-01",
  end: "2024-05-31",
  label: "05/01/2024 - 05/31/2024",
};

export const SALESPERSON_OPTIONS = [
  { value: "mike_torres", label: "Mike Torres" },
  { value: "sarah_chen", label: "Sarah Chen" },
  { value: "james_miller", label: "James Miller" },
  { value: "unassigned", label: "Unassigned" },
] as const;
