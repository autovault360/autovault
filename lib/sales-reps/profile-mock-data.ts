import { formatCurrency } from "@/lib/sales-reps/types";
import type { SalesRepProfileDetail } from "./profile-types";

/** Reference profile matching the design mockup (Mike Johnson). */
const MIKE_JOHNSON_PROFILE: SalesRepProfileDetail = {
  summary: {
    id: "mock-mike-johnson",
    fullName: "Mike Johnson",
    title: "Sales Representative",
    email: "mike.johnson@autovault360.test",
    phone: "(555) 123-4567",
    imageUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=176&h=176&fit=crop&crop=face",
    isActive: true,
    hireDate: "2023-01-15",
    commissionPlan: "Standard 20%",
    managerName: "John Dealer",
    lifetimeVehiclesSold: 128,
  },
  dateRange: {
    start: "2026-05-01",
    end: "2026-05-31",
    label: "May 1 �€“ May 31, 2026",
  },
  kpis: [
    {
      id: "vehicles-sold",
      label: "Vehicles Sold",
      icon: "car",
      color: "green",
      thisMonth: "8",
      thisYear: "42",
      lifetime: "128",
    },
    {
      id: "gross-profit",
      label: "Gross Profit Generated",
      icon: "dollar-sign",
      color: "green",
      thisMonth: formatCurrency(16250),
      thisYear: formatCurrency(86700),
      lifetime: formatCurrency(241850),
    },
    {
      id: "commissions",
      label: "Commissions Earned",
      icon: "trending-up",
      color: "violet",
      thisMonth: formatCurrency(3250),
      thisYear: formatCurrency(17340),
      lifetime: formatCurrency(48920),
    },
    {
      id: "avg-gross",
      label: "Average Gross / Vehicle",
      icon: "bar-chart-3",
      color: "orange",
      thisMonth: formatCurrency(2031),
      thisYear: formatCurrency(2069),
    },
    {
      id: "closing-ratio",
      label: "Closing Ratio",
      icon: "pie-chart",
      color: "blue",
      thisMonth: "28.6%",
      thisYear: "27.4%",
    },
    {
      id: "inventory-sold",
      label: "Inventory Sold",
      icon: "shopping-cart",
      color: "blue",
      thisMonth: "8",
      thisYear: "42",
    },
  ],
  vehicleSales: [
    {
      id: "vs-1",
      date: "2026-05-28",
      stockNumber: "A1023",
      vehicle: "2021 Honda Accord",
      customer: "John Smith",
      salePrice: 18500,
      grossProfit: 2100,
      commission: 420,
    },
    {
      id: "vs-2",
      date: "2026-05-25",
      stockNumber: "B2045",
      vehicle: "2019 Toyota Camry",
      customer: "Sarah Lee",
      salePrice: 17200,
      grossProfit: 1950,
      commission: 390,
    },
    {
      id: "vs-3",
      date: "2026-05-22",
      stockNumber: "C3067",
      vehicle: "2020 Ford F-150",
      customer: "Mike Davis",
      salePrice: 28900,
      grossProfit: 3200,
      commission: 640,
    },
    {
      id: "vs-4",
      date: "2026-05-18",
      stockNumber: "D4089",
      vehicle: "2018 Chevy Malibu",
      customer: "Emily Brown",
      salePrice: 14800,
      grossProfit: 1700,
      commission: 340,
    },
    {
      id: "vs-5",
      date: "2026-05-15",
      stockNumber: "E5012",
      vehicle: "2022 Nissan Altima",
      customer: "Chris Wilson",
      salePrice: 19800,
      grossProfit: 2250,
      commission: 450,
    },
    {
      id: "vs-6",
      date: "2026-05-12",
      stockNumber: "F6034",
      vehicle: "2017 Jeep Wrangler",
      customer: "Lisa Taylor",
      salePrice: 24500,
      grossProfit: 2800,
      commission: 560,
    },
    {
      id: "vs-7",
      date: "2026-05-08",
      stockNumber: "G7056",
      vehicle: "2020 Hyundai Sonata",
      customer: "David Martinez",
      salePrice: 16500,
      grossProfit: 1900,
      commission: 380,
    },
    {
      id: "vs-8",
      date: "2026-05-03",
      stockNumber: "H8078",
      vehicle: "2019 Mazda CX-5",
      customer: "Anna Garcia",
      salePrice: 21200,
      grossProfit: 2350,
      commission: 470,
    },
  ],
  vehicleSalesSummary: {
    count: 8,
    totalSalePrice: 161400,
    totalGrossProfit: 18250,
    totalCommission: 3650,
  },
  commissionHistory: [
    {
      id: "ch-1",
      date: "2026-05-28",
      vehicle: "2021 Honda Accord",
      grossProfit: 2100,
      commission: 420,
      status: "paid",
    },
    {
      id: "ch-2",
      date: "2026-05-25",
      vehicle: "2019 Toyota Camry",
      grossProfit: 1950,
      commission: 390,
      status: "paid",
    },
    {
      id: "ch-3",
      date: "2026-05-22",
      vehicle: "2020 Ford F-150",
      grossProfit: 3200,
      commission: 640,
      status: "pending_review",
    },
    {
      id: "ch-4",
      date: "2026-05-18",
      vehicle: "2018 Chevy Malibu",
      grossProfit: 1700,
      commission: 340,
      status: "paid",
    },
    {
      id: "ch-5",
      date: "2026-05-15",
      vehicle: "2022 Nissan Altima",
      grossProfit: 2250,
      commission: 450,
      status: "pending_review",
    },
    {
      id: "ch-6",
      date: "2026-05-12",
      vehicle: "2017 Jeep Wrangler",
      grossProfit: 2800,
      commission: 560,
      status: "paid",
    },
    {
      id: "ch-7",
      date: "2026-05-08",
      vehicle: "2020 Hyundai Sonata",
      grossProfit: 1900,
      commission: 380,
      status: "paid",
    },
    {
      id: "ch-8",
      date: "2026-05-03",
      vehicle: "2019 Mazda CX-5",
      grossProfit: 2350,
      commission: 470,
      status: "pending_review",
    },
  ],
  commissionSummary: {
    paidTotal: 2090,
    pendingTotal: 1560,
    earnedTotal: 3650,
  },
  salesTrend: [
    { month: "Jun", vehiclesSold: 3, grossProfit: 6200, commissions: 1240 },
    { month: "Jul", vehiclesSold: 4, grossProfit: 8100, commissions: 1620 },
    { month: "Aug", vehiclesSold: 3, grossProfit: 5900, commissions: 1180 },
    { month: "Sep", vehiclesSold: 5, grossProfit: 10200, commissions: 2040 },
    { month: "Oct", vehiclesSold: 4, grossProfit: 8400, commissions: 1680 },
    { month: "Nov", vehiclesSold: 6, grossProfit: 12100, commissions: 2420 },
    { month: "Dec", vehiclesSold: 5, grossProfit: 10500, commissions: 2100 },
    { month: "Jan", vehiclesSold: 4, grossProfit: 8200, commissions: 1640 },
    { month: "Feb", vehiclesSold: 3, grossProfit: 6100, commissions: 1220 },
    { month: "Mar", vehiclesSold: 5, grossProfit: 10300, commissions: 2060 },
    { month: "Apr", vehiclesSold: 4, grossProfit: 8600, commissions: 1720 },
    { month: "May", vehiclesSold: 8, grossProfit: 16250, commissions: 3250 },
  ],
  salesTrendSummary: {
    totalVehicles: 42,
    totalGrossProfit: 86700,
    totalCommissions: 17340,
  },
  followUps: [
    {
      id: "fu-1",
      customer: "James Anderson",
      vehicleInterested: "2021 BMW 530i",
      lastContact: "2026-05-18",
      nextFollowUp: "2026-05-25",
    },
    {
      id: "fu-2",
      customer: "Sarah Mitchell",
      vehicleInterested: "2020 Audi Q5",
      lastContact: "2026-05-20",
      nextFollowUp: "2026-05-27",
    },
    {
      id: "fu-3",
      customer: "David Chen",
      vehicleInterested: "2019 Mercedes GLC",
      lastContact: "2026-05-22",
      nextFollowUp: "2026-05-29",
    },
    {
      id: "fu-4",
      customer: "Emily Rodriguez",
      vehicleInterested: "2022 Lexus RX 350",
      lastContact: "2026-05-24",
      nextFollowUp: "2026-05-31",
    },
    {
      id: "fu-5",
      customer: "Michael Torres",
      vehicleInterested: "2020 Honda Pilot",
      lastContact: "2026-05-26",
      nextFollowUp: "2026-06-02",
    },
  ],
  appointments: [
    {
      id: "ap-1",
      date: "2026-05-30",
      time: "10:00 AM",
      event: "Test Drive - Toyota RAV4",
      dotColor: "blue",
    },
    {
      id: "ap-2",
      date: "2026-05-31",
      time: "2:00 PM",
      event: "Delivery - John Smith",
      dotColor: "green",
    },
    {
      id: "ap-3",
      date: "2026-06-01",
      time: "11:30 AM",
      event: "Follow-Up Call - Sarah Mitchell",
      dotColor: "orange",
    },
    {
      id: "ap-4",
      date: "2026-06-02",
      time: "9:00 AM",
      event: "Test Drive - 2020 Audi Q5",
      dotColor: "blue",
    },
    {
      id: "ap-5",
      date: "2026-06-06",
      time: "3:00 PM",
      event: "Team Meeting",
      dotColor: "purple",
    },
  ],
  notes: [
    {
      id: "n-1",
      date: "2026-05-28",
      content: "Great job closing 3 deals this week!",
      author: "John Dealer",
      tone: "green",
    },
    {
      id: "n-2",
      date: "2026-05-25",
      content: "Followed up with Sarah Lee on financing options.",
      author: "Mike Johnson",
      tone: "blue",
    },
    {
      id: "n-3",
      date: "2026-05-20",
      content: "Needs coaching on trade-in negotiations.",
      author: "John Dealer",
      tone: "orange",
    },
  ],
  documents: [
    { id: "d-1", name: "Driver License", uploadedAt: "2023-04-15", fileType: "image" },
    { id: "d-2", name: "W9 Form", uploadedAt: "2023-04-15", fileType: "pdf" },
    { id: "d-3", name: "Employment Agreement", uploadedAt: "2023-01-15", fileType: "pdf" },
    { id: "d-4", name: "Commission Plan", uploadedAt: "2023-01-15", fileType: "pdf" },
    { id: "d-5", name: "Background Check", uploadedAt: "2023-01-10", fileType: "pdf" },
  ],
  dealJackets: [
    {
      id: "dj-1",
      jacketNumber: "Deal Jacket #1056",
      date: "2026-05-30",
      stockNumber: "STK12352",
      status: "completed",
    },
    {
      id: "dj-2",
      jacketNumber: "Deal Jacket #1055",
      date: "2026-05-28",
      stockNumber: "STK12348",
      status: "completed",
    },
    {
      id: "dj-3",
      jacketNumber: "Deal Jacket #1054",
      date: "2026-05-25",
      stockNumber: "STK12341",
      status: "completed",
    },
    {
      id: "dj-4",
      jacketNumber: "Deal Jacket #1053",
      date: "2026-05-22",
      stockNumber: "STK12335",
      status: "completed",
    },
    {
      id: "dj-5",
      jacketNumber: "Deal Jacket #1052",
      date: "2026-05-18",
      stockNumber: "STK12329",
      status: "completed",
    },
  ],
  reportActions: [
    {
      id: "ra-1",
      label: "Sales Rep Report",
      subtitle: "Detailed performance",
      icon: "file-text",
      color: "blue",
    },
    {
      id: "ra-2",
      label: "Commission Report",
      subtitle: "Earnings breakdown",
      icon: "dollar-sign",
      color: "green",
    },
    {
      id: "ra-3",
      label: "Deals Report",
      subtitle: "All deals closed",
      icon: "handshake",
      color: "violet",
    },
    {
      id: "ra-4",
      label: "Export to Excel",
      subtitle: "Download .xlsx",
      icon: "file-spreadsheet",
      color: "emerald",
    },
    {
      id: "ra-5",
      label: "Print Report",
      subtitle: "Print friendly",
      icon: "printer",
      color: "blue",
    },
  ],
};

type RepOverride = {
  fullName?: string;
  email?: string;
  phone?: string;
  imageUrl?: string | null;
  commissionPlan?: string;
  hireDate?: string;
};

/**
 * Optional per-rep overrides when navigating from the live list.
 * Extend this map or replace with a Supabase lookup when backend is ready.
 */
const REP_OVERRIDES: Record<string, RepOverride> = {};

function cloneProfile(
  base: SalesRepProfileDetail,
  id: string,
  override?: RepOverride,
): SalesRepProfileDetail {
  const fullName = override?.fullName ?? base.summary.fullName;
  return {
    ...base,
    summary: {
      ...base.summary,
      id,
      fullName,
      email: override?.email ?? base.summary.email,
      phone: override?.phone ?? base.summary.phone,
      imageUrl: override?.imageUrl ?? base.summary.imageUrl,
      commissionPlan: override?.commissionPlan ?? base.summary.commissionPlan,
      hireDate: override?.hireDate ?? base.summary.hireDate,
    },
  };
}

/**
 * Mock data layer �€” swap this function body for a service call when integrating backend.
 */
export function getMockSalesRepProfile(
  id: string,
  override?: RepOverride,
): SalesRepProfileDetail | null {
  if (!id?.trim()) return null;
  const merged = { ...REP_OVERRIDES[id], ...override };
  return cloneProfile(MIKE_JOHNSON_PROFILE, id, merged);
}

export function registerSalesRepProfileOverride(
  id: string,
  override: RepOverride,
): void {
  REP_OVERRIDES[id] = { ...REP_OVERRIDES[id], ...override };
}
