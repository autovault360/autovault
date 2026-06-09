import type {
  TransactionPaymentMethod,
  TransactionPaymentStatus,
  TransactionType,
} from "./types";

export const TRANSACTION_TYPE_OPTIONS: {
  value: TransactionType;
  label: string;
  description: string;
  color: string;
  borderActive: string;
  bgActive: string;
}[] = [
  {
    value: "dealer_sale",
    label: "Dealer Sale",
    description: "Sell to licensed dealer",
    color: "text-emerald-400",
    borderActive: "border-emerald-500",
    bgActive: "bg-emerald-500/10",
  },
  {
    value: "auction_sale",
    label: "Auction Sale",
    description: "Sell at auction",
    color: "text-purple-400",
    borderActive: "border-purple-500",
    bgActive: "bg-purple-500/10",
  },
  {
    value: "dealer_purchase",
    label: "Dealer Purchase",
    description: "Buy from dealer",
    color: "text-blue-400",
    borderActive: "border-blue-500",
    bgActive: "bg-blue-500/10",
  },
  {
    value: "auction_purchase",
    label: "Auction Purchase",
    description: "Buy at auction",
    color: "text-violet-400",
    borderActive: "border-violet-500",
    bgActive: "bg-violet-500/10",
  },
];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  dealer_sale: "Dealer Sale",
  auction_sale: "Auction Sale",
  dealer_purchase: "Dealer Purchase",
  auction_purchase: "Auction Purchase",
};

export const TRANSACTION_TYPE_BADGE_CLASS: Record<TransactionType, string> = {
  dealer_sale: "text-emerald-400",
  auction_sale: "text-purple-400",
  dealer_purchase: "text-blue-400",
  auction_purchase: "text-violet-400",
};

export const PAYMENT_STATUS_OPTIONS: {
  value: TransactionPaymentStatus;
  label: string;
  className: string;
}[] = [
  { value: "paid", label: "Paid", className: "bg-emerald-500/15 text-emerald-400" },
  { value: "partial", label: "Partial", className: "bg-orange-500/15 text-orange-400" },
  { value: "pending", label: "Pending", className: "bg-blue-500/15 text-blue-400" },
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

export const COMMON_TRANSACTION_DOCUMENTS = [
  { value: "bill_of_sale", label: "Bill of Sale" },
  { value: "dealer_invoice", label: "Dealer / Auction Invoice" },
  { value: "title_copy", label: "Title Copy" },
  { value: "odometer_statement", label: "Odometer Statement" },
  { value: "buyer_license", label: "Buyer License Copy" },
  { value: "wire_confirmation", label: "Wire Confirmation" },
] as const;

export const TRANSACTION_PERIOD_PRESETS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "ytd", label: "Year to Date" },
] as const;

export const DEFAULT_TRANSACTION_PERIOD = {
  preset: "this_month" as const,
  start: "2024-05-01",
  end: "2024-05-31",
  label: "05/01/2024 - 05/31/2024",
};
