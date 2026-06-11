export type CommissionStatus =
  | "pending_review"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "paid";

export const DEAL_JACKET_STATUSES = [
  "pending_review",
  "changes_requested",
  "resubmitted",
  "approved",
  "rejected",
] as const;

export type DealJacketStatus = (typeof DEAL_JACKET_STATUSES)[number];

export const DEAL_JACKET_STATUS_LABELS: Record<DealJacketStatus, string> = {
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  resubmitted: "Resubmitted",
  approved: "Approved",
  rejected: "Rejected",
};

export function getWorkflowStatusStyle(status: DealJacketStatus): string {
  const styles: Record<DealJacketStatus, string> = {
    pending_review:
      "bg-amber-500/15 text-amber-400 border-amber-500/30",
    changes_requested:
      "bg-orange-500/15 text-orange-400 border-orange-500/30",
    resubmitted:
      "bg-blue-500/15 text-blue-400 border-blue-500/30",
    approved:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected:
      "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return styles[status];
}

export type WorkflowAction =
  | "created"
  | "submitted"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "note_added"
  | "document_uploaded";

export type DealJacketActivityRow = {
  id: string;
  deal_jacket_id: string;
  action: WorkflowAction;
  actor_id: string;
  actor_name: string;
  old_status: string | null;
  new_status: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

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
  workflowStatus: DealJacketStatus;
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
  if (Number.isNaN(d.getTime())) return "...";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getVehicleDisplayName(item: DealJacketListItem): string {
  return `${item.year} ${item.make} ${item.model}`;
}

const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  resubmitted: "Resubmitted",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
};

export function formatCommissionStatus(status: CommissionStatus): string {
  return COMMISSION_STATUS_LABELS[status] ?? status;
}

export function getCommissionStatusStyle(status: CommissionStatus): string {
  const styles: Record<CommissionStatus, string> = {
    pending_review:
      "bg-amber-500/15 text-amber-400 border-amber-500/30",
    changes_requested:
      "bg-orange-500/15 text-orange-400 border-orange-500/30",
    resubmitted:
      "bg-blue-500/15 text-blue-400 border-blue-500/30",
    approved:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected:
      "bg-red-500/15 text-red-400 border-red-500/30",
    paid:
      "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return styles[status] ?? styles.pending_review;
}

export function getSoldStatusStyle(): string {
  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
}
