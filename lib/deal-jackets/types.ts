export type CommissionStatus = "paid" | "pending";

export type PaymentMethod = "cash" | "finance" | "check" | "wire" | "credit_card";

export type DealJacketTab =
  | "all"
  | "sold_this_month"
  | "sold_this_year"
  | "pending_commission"
  | "commission_paid";

export type DealJacketListItem = {
  id: string;
  vehicleId: string;
  year: number;
  make: string;
  model: string;
  stockNumber: string;
  vin: string;
  imageUrl: string | null;
  customerName: string;
  customerPhone: string;
  saleDate: string;
  salePrice: number;
  totalProfit: number;
  salesRepId: string;
  salesRepName: string;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  paymentMethod: PaymentMethod;
  soldStatus: "sold";
};

export type DealJacketTabCounts = Record<DealJacketTab, number>;

export const DEAL_JACKET_TABS: { key: DealJacketTab; label: string }[] = [
  { key: "all", label: "All Deal Jackets" },
  { key: "sold_this_month", label: "Sold This Month" },
  { key: "sold_this_year", label: "Sold This Year" },
  { key: "pending_commission", label: "Pending Commission" },
  { key: "commission_paid", label: "Commission Paid" },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "finance",
  "check",
  "wire",
  "credit_card",
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  finance: "Finance",
  check: "Check",
  wire: "Wire Transfer",
  credit_card: "Credit Card",
};

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_LABELS[method] ?? method;
}

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDisplayDate(date: string): string {
  const d = new Date(date.includes("T") ? date : `${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getVehicleDisplayName(item: DealJacketListItem): string {
  return `${item.year} ${item.make} ${item.model}`;
}

export function formatCommissionStatus(status: CommissionStatus): string {
  return status === "paid" ? "Paid" : "Pending";
}

export function getCommissionStatusStyle(status: CommissionStatus): string {
  return status === "paid"
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

export function getSoldStatusStyle(): string {
  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
}
