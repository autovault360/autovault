import type { CommissionStatus, PaymentMethod } from "./types";

export type DealJacketDetailTab =
  | "overview"
  | "documents"
  | "expenses"
  | "receipts"
  | "history"
  | "notes";

export type ExpenseCategoryBreakdown = {
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type DealJacketExpenseItem = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  notes: string | null;
};

export type DealJacketFileItem = {
  id: string;
  name: string;
  type: "document" | "receipt";
  uploadedAt: string;
  icon: "contract" | "license" | "insurance" | "receipt" | "generic";
  fileUrl: string;
  fileType: string;
};

import type { DealJacketStatus, DealJacketActivityRow } from "./types";

export type DealJacketActivityItem = {
  id: string;
  label: string;
  detail: string;
  occurredAt: string;
  actor: string;
};

export type DealJacketDetail = {
  id: string;
  jacketNumber: string;
  vehicleId: string;

  vehicle: {
    imageUrl: string | null;
    year: number;
    make: string;
    model: string;
    trim: string;
    displayName: string;
    stockNumber: string;
    vin: string;
    mileage: number;
    color: string;
    purchasePrice: number;
    totalInvested: number;
    soldPrice: number;
    grossProfit: number;
    netProfit: number;
  };

  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    driversLicense: string;
    notes: string | null;
  };

  sale: {
    dateSold: string;
    soldPrice: number;
    salesTax: number;
    licenseFee: number;
    registrationFee: number;
    dmvFees: number;
    documentationFee: number;
    totalSalePrice: number;
    downPayment: number;
    amountFinanced: number;
    balanceDue: number;
    paymentMethod: PaymentMethod;
    paymentMethodLabel: string;
    rosNumber: string;
  };

  salesRep: {
    id: string;
    name: string;
    commissionType: string;
    commissionPercent: number;
    commissionAmount: number;
    commissionStatus: CommissionStatus;
    commissionPaidDate: string | null;
    commissionPaymentMethod: string;
    transactionId: string | null;
  };

  financial: {
    purchasePrice: number;
    vehicleExpenses: number;
    totalInvested: number;
    totalSalePrice: number;
    grossProfit: number;
    commissionDeduction: number;
    additionalCosts: number;
    netProfit: number;
  };

  expenseBreakdown: ExpenseCategoryBreakdown[];
  expenses: DealJacketExpenseItem[];
  documents: DealJacketFileItem[];
  receipts: DealJacketFileItem[];
  documentChecklist: { label: string; uploaded: boolean }[];
  activities: DealJacketActivityItem[];
  workflowStatus: DealJacketStatus;
  workflowActivities: DealJacketActivityRow[];
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  changeCategories: string[] | null;
  rejectionReason: string | null;

  dealNotes: string;
  internalNotes: string;
  lastNoteBy: string;
  lastNoteAt: string;

  tabCounts: {
    documents: number;
    expenses: number;
    receipts: number;
    history: number;
    notes: number;
  };
};

export function formatDealJacketNumber(dealId: string): string {
  const num = dealId.replace(/^deal-/, "");
  const parsed = Number.parseInt(num, 10);
  if (!Number.isNaN(parsed)) {
    return `DJ-${String(parsed).padStart(6, "0")}`;
  }
  return dealId.toUpperCase();
}
