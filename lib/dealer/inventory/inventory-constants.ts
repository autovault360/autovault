import type {
  InventoryKpiFilterKey,
  VehicleCondition,
  WholesaleInventoryStatus,
  WholesalePaymentStatus,
  WholesaleTitleStatus,
} from "@/lib/dealer/dashboard/types";

export const INVENTORY_KPI_FILTERS: InventoryKpiFilterKey[] = [
  "all",
  "missing_titles",
  "pending_sale",
  "sold_this_month",
];

export const INVENTORY_KPI_LABELS: Record<
  Exclude<InventoryKpiFilterKey, "all">,
  string
> = {
  missing_titles: "Missing Titles",
  pending_sale: "Pending Sale",
  sold_this_month: "Sold This Month",
};

export const INVENTORY_STATUS_LABELS: Record<WholesaleInventoryStatus, string> =
  {
    in_stock: "In Stock",
    pending_sale: "Pending Sale",
    sold: "Sold",
  };

export const INVENTORY_STATUS_STYLES: Record<WholesaleInventoryStatus, string> =
  {
    in_stock: "bg-emerald-500/15 text-emerald-400",
    pending_sale: "bg-violet-500/15 text-violet-400",
    sold: "bg-slate-500/15 text-slate-400",
  };

export const TITLE_STATUS_LABELS: Record<WholesaleTitleStatus, string> = {
  received: "Title Received",
  missing: "Missing Title",
};

export const TITLE_STATUS_STYLES: Record<WholesaleTitleStatus, string> = {
  received: "bg-emerald-500/15 text-emerald-400",
  missing: "bg-red-500/15 text-red-400",
};

export const PAYMENT_STATUS_LABELS: Record<WholesalePaymentStatus, string> = {
  paid: "Paid",
  on_hold: "On Hold (Title Pending)",
  partial: "Partial",
};

export const PAYMENT_STATUS_STYLES: Record<WholesalePaymentStatus, string> = {
  paid: "bg-emerald-500/15 text-emerald-400",
  on_hold: "bg-amber-500/15 text-amber-400",
  partial: "bg-blue-500/15 text-blue-400",
};

export const CONDITION_LABELS: Record<VehicleCondition, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

export const CONDITION_STYLES: Record<VehicleCondition, string> = {
  excellent: "bg-emerald-500/15 text-emerald-400",
  good: "bg-blue-500/15 text-blue-400",
  fair: "bg-amber-500/15 text-amber-400",
};
