import type { SalesRepDashboardData } from "@/lib/sales-rep/dashboard/types";
import { SALES_REP_COMMISSIONS_MOCK } from "@/lib/sales-rep/commissions/mock-data";

export const SALES_REP_PROD_DATA = {
  profile: {
    name: "Mike Johnson",
    title: "Sales Representative",
    id: "EMP-1001",
    initials: "MJ",
    imageUrl: "https://i.pravatar.cc/64?img=33",
  },
  topPerformer: {
    name: "David Brown",
    imageUrl: "https://i.pravatar.cc/64?img=12",
    units: 24,
    unitsDelta: 12,
    profit: 186750,
    profitDelta: 8,
    commission: 18675,
    commissionDelta: 10,
  },
  myMetrics: {
    currentMonthUnits: 18,
    currentMonthGross: 138450,
    currentMonthCommission: 13845,
    awaitingApprovalCommission: 2350,
  },
  inventory: [
    {
      stockNo: "AV360-1001",
      vin: "5UXCR6C09N9L12345",
      yearModel: "2022 BMW X5 xDrive40i",
      mileage: "28,450 mi",
      type: "SUV",
      color: "White",
      price: 45900,
      status: "Available" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=120&fit=crop",
    },
    {
      stockNo: "AV360-1002",
      vin: "W1KWF8BB3MR812345",
      yearModel: "2021 Mercedes-Benz C300",
      mileage: "31,200 mi",
      type: "Sedan",
      color: "Black",
      price: 28900,
      status: "Available" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200&h=120&fit=crop",
    },
    {
      stockNo: "AV360-1003",
      vin: "WA1EAAFY0P2123456",
      yearModel: "2023 Audi Q5 Premium Plus",
      mileage: "18,000 mi",
      type: "SUV",
      color: "Gray",
      price: 36500,
      status: "Available" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&h=120&fit=crop",
    },
  ],
};

export const SALES_REP_DASHBOARD_MOCK: SalesRepDashboardData = {
  ...SALES_REP_PROD_DATA,
  leaderboard: [
    { rank: 1, name: "David Brown", units: 24 },
    { rank: 2, name: "Mike Johnson (You)", units: 18, isCurrentUser: true },
    { rank: 3, name: "Sarah Williams", units: 15 },
    { rank: 4, name: "Chris Allen", units: 12 },
    { rank: 5, name: "Emily Chen", units: 10 },
  ],
  recentDealJackets: [
    {
      id: "DJ-1056",
      vehicleDesc: "2021 Mercedes-Benz C300",
      buyerName: "John Smith",
      status: "Pending",
      dateString: "May 24, 2026",
    },
    {
      id: "DJ-1055",
      vehicleDesc: "2022 BMW X5",
      buyerName: "Jane Doe",
      status: "Approved",
      dateString: "May 23, 2026",
    },
    {
      id: "DJ-1054",
      vehicleDesc: "2020 Honda Accord",
      buyerName: "Robert Lee",
      status: "Changes Requested",
      dateString: "May 23, 2026",
    },
  ],
  teamMessages: [
    {
      id: "msg-1",
      name: "Sarah Williams",
      avatarInitials: "SW",
      message: "Hey Mike, can you review the DJ-1056 deal?",
      timestamp: "10:32 AM",
    },
    {
      id: "msg-2",
      name: "Chris Allen",
      avatarInitials: "CA",
      message: "Great job on the BMW sale yesterday!",
      timestamp: "9:15 AM",
    },
    {
      id: "msg-3",
      name: "David Brown",
      avatarInitials: "DB",
      message: "Team meeting at 2 PM today.",
      timestamp: "Yesterday",
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      message: "Deal Jacket DJ-1056 was submitted by you",
      timestamp: "May 24, 2026 - 10:45 AM",
      type: "success",
    },
    {
      id: "act-2",
      message: "Document uploaded to DJ-1055",
      timestamp: "May 24, 2026 - 9:30 AM",
      type: "upload",
    },
    {
      id: "act-3",
      message: "Deal Jacket DJ-1054 requires changes",
      timestamp: "May 23, 2026 - 4:15 PM",
      type: "warning",
    },
    {
      id: "act-4",
      message: "Commission approved for DJ-1053",
      timestamp: "May 23, 2026 - 2:00 PM",
      type: "info",
    },
  ],
  tradeInOptions: [
    { value: "2020-honda-accord", label: "2020 Honda Accord EX-L" },
    { value: "2019-toyota-camry", label: "2019 Toyota Camry SE" },
    { value: "2021-ford-f150", label: "2021 Ford F-150 XLT" },
  ],
  pricing: {
    costPrice: 30250,
    reconditioning: 750,
    commissionRate: 0.2,
  },
  commissions: SALES_REP_COMMISSIONS_MOCK,
  notificationCount: 7,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSalesRepDashboardMock(
  delayMs = 800,
): Promise<SalesRepDashboardData> {
  await delay(delayMs);
  return structuredClone(SALES_REP_DASHBOARD_MOCK);
}
