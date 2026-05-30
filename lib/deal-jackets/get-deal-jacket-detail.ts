import {
  DEAL_JACKET_DETAIL_REFERENCE,
  buildReferenceDocuments,
  buildReferenceExpenses,
  buildReferenceReceipts,
  buildReferenceActivities,
} from "@/mock-data/dealJacketDetail.mock";
import { DEAL_JACKETS_MOCK } from "./mock-data";
import type { DealJacketDetail } from "./detail-types";
import { formatDealJacketNumber } from "./detail-types";
import type { DealJacketListItem } from "./types";
import { formatPaymentMethod } from "./types";

const REFERENCE_DETAIL_ID = "deal-0001";

function buildGenericDetail(list: DealJacketListItem): DealJacketDetail {
  const purchasePrice = Math.round(list.salePrice * 0.72);
  const vehicleExpenses = Math.round(list.salePrice * 0.14);
  const totalInvested = purchasePrice + vehicleExpenses;
  const totalSalePrice = Math.round(list.salePrice * 1.12);
  const grossProfit = list.totalProfit + vehicleExpenses * 0.3;
  const netProfit = list.totalProfit;

  return {
    id: list.id,
    jacketNumber: formatDealJacketNumber(list.id),
    vehicleId: list.vehicleId,
    soldStatus: "sold",
    vehicle: {
      imageUrl: list.imageUrl,
      year: list.year,
      make: list.make,
      model: list.model,
      trim: "",
      displayName: `${list.year} ${list.make} ${list.model}`,
      stockNumber: list.stockNumber,
      vin: list.vin,
      mileage: 32000 + Number(list.stockNumber) * 12,
      color: "Silver",
      purchasePrice,
      totalInvested,
      soldPrice: list.salePrice,
      grossProfit,
      netProfit,
    },
    customer: {
      id: `cust-${list.stockNumber}`,
      name: list.customerName,
      phone: list.customerPhone,
      email: `${list.customerName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      address: "—",
      driversLicense: "—",
      notes: null,
    },
    sale: {
      dateSold: list.saleDate,
      soldPrice: list.salePrice,
      salesTax: Math.round(list.salePrice * 0.08),
      licenseFee: 125,
      registrationFee: 89,
      dmvFees: 175,
      documentationFee: 295,
      totalSalePrice,
      downPayment: Math.round(list.salePrice * 0.25),
      amountFinanced: Math.round(list.salePrice * 0.85),
      balanceDue: 0,
      paymentMethod: list.paymentMethod,
      paymentMethodLabel: formatPaymentMethod(list.paymentMethod),
      rosNumber: `ROS-2025-${list.stockNumber}`,
    },
    salesRep: {
      id: list.salesRepId,
      name: list.salesRepName,
      commissionType: "Percentage",
      commissionPercent: 15,
      commissionAmount: list.commissionAmount,
      commissionStatus: list.commissionStatus,
      commissionPaidDate:
        list.commissionStatus === "paid" ? list.saleDate : null,
      commissionPaymentMethod:
        list.commissionStatus === "paid" ? "ACH" : "—",
      transactionId:
        list.commissionStatus === "paid"
          ? `TXN-${list.id.replace("deal-", "")}`
          : null,
    },
    financial: {
      purchasePrice,
      vehicleExpenses,
      totalInvested,
      totalSalePrice,
      grossProfit,
      commissionDeduction: list.commissionAmount,
      additionalCosts: 250,
      netProfit,
    },
    expenseBreakdown: [
      {
        label: "Repairs & Maintenance",
        amount: vehicleExpenses * 0.5,
        percent: 50,
        color: "#3b82f6",
      },
      {
        label: "Advertising",
        amount: vehicleExpenses * 0.15,
        percent: 15,
        color: "#f97316",
      },
      {
        label: "Detail & Reconditioning",
        amount: vehicleExpenses * 0.2,
        percent: 20,
        color: "#22c55e",
      },
      {
        label: "Fees & Inspections",
        amount: vehicleExpenses * 0.1,
        percent: 10,
        color: "#eab308",
      },
      {
        label: "Other Expenses",
        amount: vehicleExpenses * 0.05,
        percent: 5,
        color: "#ef4444",
      },
    ],
    expenses: buildReferenceExpenses(12),
    documents: buildReferenceDocuments(8),
    receipts: buildReferenceReceipts(10),
    documentChecklist: [
      { label: "Driver License", uploaded: true },
      { label: "Insurance Card", uploaded: true },
      { label: "Signed Contract", uploaded: false },
      { label: "Buyer Documents", uploaded: true },
    ],
    activities: buildReferenceActivities().slice(0, 5),
    dealNotes: "No additional notes on file.",
    internalNotes: "",
    lastNoteBy: list.salesRepName,
    lastNoteAt: list.saleDate,
    tabCounts: {
      documents: 8,
      expenses: 12,
      receipts: 10,
      history: 5,
      notes: 1,
    },
  };
}

export function getDealJacketDetail(id: string): DealJacketDetail | null {
  const list = DEAL_JACKETS_MOCK.find((d) => d.id === id);
  if (!list) return null;

  if (id === REFERENCE_DETAIL_ID) {
    return {
      ...DEAL_JACKET_DETAIL_REFERENCE,
      id: list.id,
      vehicleId: list.vehicleId,
    };
  }

  return buildGenericDetail(list);
}
