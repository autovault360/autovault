export type VehicleActionType =
  | "update-pricing"
  | "add-repair-cost"
  | "mark-as-sold"
  | "mark-as-loss";

export type UpdatePricingPayload = {
  vehicleId: string;
  newAskingPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  minAcceptablePrice: number;
  targetProfit: number;
  pricingStrategy: string;
  reason: string;
  effectiveDate: string;
  notes?: string;
  photoFile?: File | null;
};

export type AddRepairCostPayload = {
  vehicleId: string;
  repairDate: string;
  repairCategory: string;
  repairType: string;
  priority: string;
  description: string;
  laborCost: number;
  partsCost: number;
  shopVendor: string;
  otherFees: number;
  totalRepairCost: number;
  isInternalRepair: boolean;
  paymentMethod: string;
  invoiceNumber: string;
  paymentStatus: string;
  datePaid: string;
  attachments: File[];
  notes?: string;
};

export type MarkAsSoldPayload = {
  vehicleId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  saleDate: string;
  soldPriceBeforeTax: number;
  salesTaxAmount: number;
  licenseRegistrationFees: number;
  totalPriceWithTaxAndFees: number;
  rosNumber: string;
  zipCodeOfSale: string;
  salesRepId?: string | null;
  commissionType: "percentage" | "manual";
  commissionRate: number;
  manualCommissionAmount: number;
  commissionAmount: number;
  dealerPayoutsEnabled: boolean;
  payoutItems: { description: string; amount: number; frequency: string }[];
  otherPayoutsTotal: number;
  netProfit: number;
  roiPercent: number;
  totalInvestment: number;
  documents: File[];
  notes?: string;
};

export type MarkAsLossPayload = {
  vehicleId: string;
  lossDate: string;
  lossReason: string;
  lossType: string;
  explanation: string;
  totalInvestment: number;
  totalExpenses: number;
  totalCostBasis: number;
  estimatedLossAmount: number;
  insuranceProceeds: number;
  netLoss: number;
  documents: File[];
};
