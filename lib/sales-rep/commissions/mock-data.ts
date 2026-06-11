import type {
  ISalesRepCommissionRow,
  ISalesRepCommissionsData,
} from "./types";

export const SALES_REP_COMMISSIONS_MOCK = {
  entries: [] as ISalesRepCommissionRow[],
  summary: {
    totalCarsSold: 0,
    totalCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
    heldAdjustments: 0,
    periodLabel: "",
  },
};

const COMMISSION_ENTRIES: ISalesRepCommissionRow[] = [
  {
    id: "comm-1",
    dealJacketId: "DJ-1056",
    dateSold: "May 24, 2026",
    vehicle: "2021 Mercedes-Benz C300",
    buyerName: "John Smith",
    salePrice: 28900,
    cost: 24450,
    grossProfit: 4450,
    commissionRate: 20,
    commissionEarned: 890,
    status: "pending_review",
  },
  {
    id: "comm-2",
    dealJacketId: "DJ-1055",
    dateSold: "May 23, 2026",
    vehicle: "2022 BMW X5 xDrive40i",
    buyerName: "Jane Doe",
    salePrice: 45900,
    cost: 39800,
    grossProfit: 6100,
    commissionRate: 20,
    commissionEarned: 1220,
    status: "approved",
  },
  {
    id: "comm-3",
    dealJacketId: "DJ-1054",
    dateSold: "May 22, 2026",
    vehicle: "2020 Audi Q7 Premium",
    buyerName: "Robert Williams",
    salePrice: 32500,
    cost: 28100,
    grossProfit: 4400,
    commissionRate: 20,
    commissionEarned: 880,
    status: "paid",
  },
  {
    id: "comm-4",
    dealJacketId: "DJ-1053",
    dateSold: "May 21, 2026",
    vehicle: "2023 Tesla Model Y",
    buyerName: "Emily Davis",
    salePrice: 52000,
    cost: 46200,
    grossProfit: 5800,
    commissionRate: 25,
    commissionEarned: 1450,
    status: "paid",
  },
  {
    id: "comm-5",
    dealJacketId: "DJ-1052",
    dateSold: "May 20, 2026",
    vehicle: "2019 Ford F-150 XLT",
    buyerName: "Michael Brown",
    salePrice: 26800,
    cost: 23100,
    grossProfit: 3700,
    commissionRate: 20,
    commissionEarned: 740,
    status: "rejected",
  },
  {
    id: "comm-6",
    dealJacketId: "DJ-1051",
    dateSold: "May 19, 2026",
    vehicle: "2021 Honda CR-V EX",
    buyerName: "Sarah Wilson",
    salePrice: 22400,
    cost: 18900,
    grossProfit: 3500,
    commissionRate: 20,
    commissionEarned: 700,
    status: "changes_requested",
  },
  {
    id: "comm-7",
    dealJacketId: "DJ-1050",
    dateSold: "May 18, 2026",
    vehicle: "2022 Toyota Camry LE",
    buyerName: "David Lee",
    salePrice: 19500,
    cost: 16200,
    grossProfit: 3300,
    commissionRate: 20,
    commissionEarned: 660,
    status: "resubmitted",
  },
  {
    id: "comm-8",
    dealJacketId: "DJ-1049",
    dateSold: "May 17, 2026",
    vehicle: "2020 Chevrolet Tahoe",
    buyerName: "Jennifer Taylor",
    salePrice: 41200,
    cost: 35800,
    grossProfit: 5400,
    commissionRate: 25,
    commissionEarned: 1350,
    status: "pending_review",
  },
];

export function getMockCommissions(): ISalesRepCommissionsData {
  const entries = COMMISSION_ENTRIES;
  const total = entries.reduce((s, e) => s + e.commissionEarned, 0);
  const paid = entries
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + e.commissionEarned, 0);
  const pnd = entries
    .filter((e) => e.status !== "paid")
    .reduce((s, e) => s + e.commissionEarned, 0);

  return {
    summary: {
      totalCarsSold: entries.length,
      totalCommission: total,
      paidCommission: paid,
      pendingCommission: pnd,
      heldAdjustments: 0,
      periodLabel: "Past 30 Days",
    },
    entries,
  };
}
