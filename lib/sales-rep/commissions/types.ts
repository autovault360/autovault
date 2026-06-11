import type { CommissionStatus } from "@/lib/deal-jackets/types";

export type SalesRepCommissionStatus =
  | "pending_review"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "paid";

export const COMMISSION_STATUS_LABELS: Record<SalesRepCommissionStatus, string> = {
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  resubmitted: "Resubmitted",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
};

export function getCommissionStatusStyle(status: SalesRepCommissionStatus): string {
  const styles: Record<SalesRepCommissionStatus, string> = {
    pending_review: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    changes_requested: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    resubmitted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    paid: "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return styles[status];
}

export type SalesRepCommissionRow = {
  id: string;
  dealership_id: string;
  sales_rep_id: string;
  deal_jacket_id: string;
  commission_amount: number;
  commission_rate: number;
  gross_profit: number;
  sold_price: number;
  status: SalesRepCommissionStatus;
  paid_at: string | null;
  paid_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SalesRepCommissionListItem = {
  id: string;
  dealJacketId: string;
  jacketNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  stockNumber: string;
  imageUrl: string | null;
  customerName: string;
  customerPhone: string;
  saleDate: string;
  soldPrice: number;
  grossProfit: number;
  commissionRate: number;
  commissionAmount: number;
  status: SalesRepCommissionStatus;
  paidAt: string | null;
};

export interface SalesRepCommissionSummary {
  totalCommissions: number;
  paidCommissions: number;
  pendingApproval: number;
  approvedUnpaid: number;
  rejectedCount: number;
  totalVehiclesSold: number;
  periodLabel: string;
}

export interface SalesRepCommissionsData {
  summary: SalesRepCommissionSummary;
  entries: SalesRepCommissionListItem[];
  totalCount: number;
}

export interface SalesRepCommissionFilterState {
  search: string;
  status: string;
}

export interface ISalesRepCommissionSummary {
  totalCarsSold: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  heldAdjustments: number;
  periodLabel: string;
}

export type ISalesRepCommissionRow = {
  id: string;
  dealJacketId: string;
  dateSold: string;
  vehicle: string;
  buyerName: string;
  salePrice: number;
  cost: number;
  grossProfit: number;
  commissionRate: number;
  commissionEarned: number;
  status: CommissionStatus;
  paidDate?: string;
} & Record<string, unknown>;

export interface ISalesRepCommissionsData {
  summary: ISalesRepCommissionSummary;
  entries: ISalesRepCommissionRow[];
}
