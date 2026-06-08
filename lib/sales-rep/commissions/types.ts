import type { CommissionStatus } from "@/lib/deal-jackets/types";

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
