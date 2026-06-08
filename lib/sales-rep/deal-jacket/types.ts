import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";

export interface ILinkedVehicle {
  id: string;
  stockNo: string;
  vin: string;
  yearModel: string;
  mileage: string;
  purchaseCost: number;
  askingPrice: number;
  imageUrl?: string;
}

export type DealJacketLedgerStatus = "Pending" | "Approved" | "Rejected";

export interface IDealJacketLedgerItem {
  id: string;
  vehicleDesc: string;
  buyerName: string;
  saleDate: string;
  grossProfit: number;
  status: DealJacketLedgerStatus;
}

export interface IDealJacketDocument {
  key: string;
  label: string;
  fileName: string;
  size: string;
  uploaded: boolean;
}

export interface IAdminReviewDeal {
  id: string;
  vehicleDesc: string;
  buyerName: string;
  salePrice: number;
  grossProfit: number;
  commissionEarned: number;
  submittedBy: string;
  submittedOn: string;
}

export interface IRecentlyApprovedDeal {
  id: string;
  vehicleDesc: string;
  buyerName: string;
  salePrice: number;
  grossProfit: number;
  approvedOn: string;
}

export interface CreateDealJacketPageData {
  profile: ISalesRepProfile;
  vehicles: ILinkedVehicle[];
  documents: IDealJacketDocument[];
  ledgerItems: IDealJacketLedgerItem[];
  ledgerCounts: { all: number; pending: number; approved: number; rejected: number };
  adminReviewDeal: IAdminReviewDeal;
  recentlyApproved: IRecentlyApprovedDeal;
  commissionRate: number;
  buyerAttachments: {
    driverLicense: { fileName: string; uploaded: boolean };
    insurance: { fileName: string; uploaded: boolean };
  };
}
