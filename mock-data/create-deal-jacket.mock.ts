import type { CreateDealJacketPageData } from "@/lib/sales-rep/deal-jacket/types";
import { SALES_REP_PROD_DATA } from "./sales-rep-dashboard.mock";

export const CREATE_DEAL_JACKET_MOCK: CreateDealJacketPageData = {
  profile: SALES_REP_PROD_DATA.profile,
  commissionRate: 0.1,
  vehicles: [
    {
      id: "veh-stk12345",
      stockNo: "STK12345",
      vin: "WBA5R7C50KAJ12345",
      yearModel: "2020 BMW 330i",
      mileage: "48,250",
      purchaseCost: 18000,
      askingPrice: 22500,
      imageUrl:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=120&fit=crop",
    },
    {
      id: "veh-av360-1002",
      stockNo: "AV360-1002",
      vin: "W1KWF8BB3MR812345",
      yearModel: "2021 Mercedes-Benz C300",
      mileage: "31,200",
      purchaseCost: 24500,
      askingPrice: 28900,
      imageUrl:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200&h=120&fit=crop",
    },
    {
      id: "veh-av360-1003",
      stockNo: "AV360-1003",
      vin: "WA1EAAFY0P2123456",
      yearModel: "2023 Audi Q5 Premium Plus",
      mileage: "18,000",
      purchaseCost: 31000,
      askingPrice: 36500,
      imageUrl:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&h=120&fit=crop",
    },
  ],
  buyerAttachments: {
    driverLicense: { fileName: "DL_John_Smith.pdf", uploaded: true },
    insurance: { fileName: "Insurance_John_Smith.pdf", uploaded: true },
  },
  documents: [
    {
      key: "buyersOrder",
      label: "Buyer's Order",
      fileName: "Buyers_Order_DJ1056.pdf",
      size: "245 KB",
      uploaded: true,
    },
    {
      key: "driverLicense",
      label: "Driver License",
      fileName: "DL_John_Smith.pdf",
      size: "128 KB",
      uploaded: true,
    },
    {
      key: "insuranceCard",
      label: "Insurance Card",
      fileName: "Insurance_John_Smith.pdf",
      size: "96 KB",
      uploaded: true,
    },
    {
      key: "signedContract",
      label: "Signed Contract",
      fileName: "Contract_DJ1056_Signed.pdf",
      size: "512 KB",
      uploaded: true,
    },
    {
      key: "fundingAgreement",
      label: "Funding Agreement",
      fileName: "Funding_Agreement_Westlake.pdf",
      size: "384 KB",
      uploaded: true,
    },
    {
      key: "tradeInDocuments",
      label: "Trade-In Documents",
      fileName: "TradeIn_2018_Honda_Civic.pdf",
      size: "198 KB",
      uploaded: true,
    },
    {
      key: "warrantyDocument",
      label: "Warranty Document",
      fileName: "Extended_Warranty_DJ1056.pdf",
      size: "156 KB",
      uploaded: true,
    },
  ],
  ledgerItems: [
    {
      id: "DJ-1056",
      vehicleDesc: "2020 BMW 330i",
      buyerName: "John Smith",
      saleDate: "May 20, 2026",
      grossProfit: 4500,
      status: "Pending",
    },
    {
      id: "DJ-1055",
      vehicleDesc: "2021 Mercedes-Benz C300",
      buyerName: "Jane Doe",
      saleDate: "May 18, 2026",
      grossProfit: 3800,
      status: "Approved",
    },
    {
      id: "DJ-1054",
      vehicleDesc: "2019 Toyota Camry",
      buyerName: "Robert Lee",
      saleDate: "May 15, 2026",
      grossProfit: 2100,
      status: "Approved",
    },
    {
      id: "DJ-1053",
      vehicleDesc: "2022 Honda Accord",
      buyerName: "Sarah Kim",
      saleDate: "May 12, 2026",
      grossProfit: 3200,
      status: "Approved",
    },
    {
      id: "DJ-1052",
      vehicleDesc: "2020 Ford F-150",
      buyerName: "Michael Torres",
      saleDate: "May 10, 2026",
      grossProfit: 5100,
      status: "Rejected",
    },
  ],
  ledgerCounts: { all: 8, pending: 2, approved: 5, rejected: 1 },
  adminReviewDeal: {
    id: "DJ-1056",
    vehicleDesc: "2020 BMW 330i",
    buyerName: "John Smith",
    salePrice: 22500,
    grossProfit: 4500,
    commissionEarned: 450,
    submittedBy: "Mike Johnson",
    submittedOn: "May 20, 2026 at 2:45 PM",
  },
  recentlyApproved: {
    id: "DJ-1055",
    vehicleDesc: "2021 Mercedes-Benz C300",
    buyerName: "Jane Doe",
    salePrice: 28900,
    grossProfit: 3800,
    approvedOn: "May 18, 2026 at 4:30 PM",
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchCreateDealJacketMock(
  delayMs = 800,
): Promise<CreateDealJacketPageData> {
  await delay(delayMs);
  return structuredClone(CREATE_DEAL_JACKET_MOCK);
}
