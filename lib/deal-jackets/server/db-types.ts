export type DealJacketFees = {
  license?: number;
  registration?: number;
  dmv?: number;
  documentation?: number;
  other?: number;
};

export type DealJacketRow = {
  id: string;
  dealership_id: string;
  deal_id: string | null;
  vehicle_id: string;
  customer_id: string;
  sales_rep_id: string | null;
  jacket_number: string;
  sold_price: number;
  total_tax: number;
  fees: DealJacketFees;
  total_sale_price: number;
  down_payment: number;
  amount_financed: number;
  balance_due: number;
  total_invested: number;
  additional_expenses: number;
  commission_amount: number;
  profit_gross: number;
  profit_net: number;
  date_sold: string;
  workflow_status: string;
  sales_rep_commission_id: string | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  change_categories: string[] | null;
  rejection_reason: string | null;
  trade_in_allowance: number;
  warranty_amount: number;
  gap_amount: number;
  lender: string | null;
  ros_number: string | null;
  deal_type: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DealJacketDocumentRow = {
  id: string;
  deal_jacket_id: string;
  file_url: string;
  file_type: string;
  document_name: string;
  uploaded_at: string;
};

export type DealJacketExpenseRelationRow = {
  id: string;
  deal_jacket_id: string;
  expense_id: string;
  amount: number;
};

export type CreateDealJacketSaleData = {
  dealId?: string | null;
  vehicleId: string;
  customerId: string;
  salesRepId?: string | null;
  saleDate: string;
  soldPrice: number;
  totalTax: number;
  fees: DealJacketFees;
  totalSalePrice: number;
  downPayment?: number;
  amountFinanced?: number;
  balanceDue?: number;
  additionalExpenses?: number;
  notes?: string | null;
};

export type DealJacketDocumentInput = {
  storagePath: string;
  fileType: string;
  documentName: string;
};
