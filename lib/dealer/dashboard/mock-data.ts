import type { DealerDashboardData, WholesaleVehicle } from "./types";
import { formatCurrency, potentialProfit, totalVehicleCost } from "./calculations";
import { buildSoldVehicleKpiStrip } from "./sold-vehicle-calculations";
import { soldVehiclesMockData } from "./sold-vehicles-mock-data";
import { buildTransactionKpiStrip } from "./transaction-calculations";
import { transactionsMockData } from "./transactions-mock-data";

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

function makeVehicle(
  partial: Omit<WholesaleVehicle, "id"> & { id?: string },
): WholesaleVehicle {
  return { id: partial.id ?? crypto.randomUUID(), ...partial };
}

const vehicles: WholesaleVehicle[] = [
  makeVehicle({
    id: "v1",
    vin: "WBA8E9G50JNU12345",
    year: 2021,
    make: "BMW",
    model: "330i Sedan 4D",
    stockNumber: "WC360-1001",
    costs: {
      acquisition: 28500,
      auction: 450,
      transport: 380,
      recon: 1200,
      storage: 150,
      dealerFees: 200,
    },
    marketValue: 32400,
    status: "in_inventory",
    daysInLot: 18,
    purchaseDate: "2024-04-12",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v2",
    vin: "WAUENAF45KN012345",
    year: 2019,
    make: "Audi",
    model: "A4 Premium",
    stockNumber: "WC360-1002",
    costs: {
      acquisition: 18200,
      auction: 350,
      transport: 290,
      recon: 850,
      storage: 120,
      dealerFees: 175,
    },
    marketValue: 22450,
    status: "sold",
    daysInLot: 32,
    purchaseDate: "2024-03-05",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v3",
    vin: "WDDWF4KB0FR123456",
    year: 2020,
    make: "Mercedes-Benz",
    model: "C300",
    stockNumber: "WC360-1003",
    costs: {
      acquisition: 26800,
      auction: 420,
      transport: 350,
      recon: 980,
      storage: 140,
      dealerFees: 190,
    },
    marketValue: 30960,
    status: "in_inventory",
    daysInLot: 24,
    purchaseDate: "2024-03-28",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v4",
    vin: "1HGCV1F34MA012345",
    year: 2021,
    make: "Honda",
    model: "Accord Sport",
    stockNumber: "WC360-1004",
    costs: {
      acquisition: 19800,
      auction: 300,
      transport: 275,
      recon: 620,
      storage: 95,
      dealerFees: 150,
    },
    marketValue: 23100,
    status: "in_inventory",
    daysInLot: 11,
    purchaseDate: "2024-05-10",
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747fd588?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v5",
    vin: "5YJ3E1EA8MF012345",
    year: 2021,
    make: "Tesla",
    model: "Model 3",
    stockNumber: "WC360-1005",
    costs: {
      acquisition: 31200,
      auction: 500,
      transport: 400,
      recon: 450,
      storage: 180,
      dealerFees: 220,
    },
    marketValue: 35800,
    status: "pending",
    daysInLot: 7,
    purchaseDate: "2024-05-15",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v6",
    vin: "1FTFW1E84MFA12345",
    year: 2021,
    make: "Ford",
    model: "F-150 XLT",
    stockNumber: "WC360-1006",
    costs: {
      acquisition: 34500,
      auction: 550,
      transport: 420,
      recon: 1100,
      storage: 160,
      dealerFees: 240,
    },
    marketValue: 39200,
    status: "in_inventory",
    daysInLot: 15,
    purchaseDate: "2024-04-20",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v7",
    vin: "5NPE34AF4KH012345",
    year: 2019,
    make: "Hyundai",
    model: "Sonata SEL",
    stockNumber: "WC360-1007",
    costs: {
      acquisition: 14200,
      auction: 280,
      transport: 250,
      recon: 540,
      storage: 85,
      dealerFees: 130,
    },
    marketValue: 16800,
    status: "sold",
    daysInLot: 28,
    purchaseDate: "2024-02-18",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=80&h=60&fit=crop",
  }),
  makeVehicle({
    id: "v8",
    vin: "3VWDB7AJ5HM012345",
    year: 2017,
    make: "Volkswagen",
    model: "Jetta S",
    stockNumber: "WC360-1008",
    costs: {
      acquisition: 9800,
      auction: 220,
      transport: 210,
      recon: 480,
      storage: 70,
      dealerFees: 110,
    },
    marketValue: 11900,
    status: "in_inventory",
    daysInLot: 42,
    purchaseDate: "2024-01-22",
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=80&h=60&fit=crop",
  }),
];

const totalInventoryCost = vehicles
  .filter((v) => v.status === "in_inventory")
  .reduce((sum, v) => sum + totalVehicleCost(v.costs), 0);

const totalMarketValue = vehicles
  .filter((v) => v.status === "in_inventory")
  .reduce((sum, v) => sum + v.marketValue, 0);

const totalPotentialProfit = vehicles
  .filter((v) => v.status === "in_inventory")
  .reduce((sum, v) => sum + potentialProfit(v), 0);

export const INVENTORY_FOOTER = {
  totalVehicles: 24,
  totalInventoryCost: 105380,
  totalMarketValue: 120500,
  totalPotentialProfit: 15120,
};

export const dealerDashboardMock: DealerDashboardData = {
  profile: {
    dealershipName: "West Coast Motors",
    contactName: "West Coast Motors",
    initials: "WC",
  },
  kpis: [
    {
      icon: "car",
      color: "blue",
      label: "Vehicles in Inventory",
      value: "24",
      unit: `Total Value: ${formatCurrency(366450)}`,
      link: "#",
      sparkColor: "#3b82f6",
      sparkPoints,
    },
    {
      icon: "tag",
      color: "green",
      label: "Vehicles Sold This Month",
      value: "16",
      unit: `Total Sales: ${formatCurrency(511750)}`,
      link: "#",
      sparkColor: "#10b981",
      sparkPoints,
    },
    {
      icon: "dollar-sign",
      color: "purple",
      label: "Total Wholesale Revenue",
      value: formatCurrency(512750),
      delta: "+18.6%",
      link: "#",
      sparkColor: "#a855f7",
      sparkPoints,
    },
    {
      icon: "trending-down",
      color: "orange",
      label: "Total Expenses",
      value: formatCurrency(106340),
      delta: "+8.4%",
      link: "#",
      sparkColor: "#f97316",
      sparkPoints,
    },
    {
      icon: "trending-up",
      color: "green",
      label: "Gross Profit",
      value: formatCurrency(406410),
      delta: "+22.2%",
      link: "#",
      sparkColor: "#10b981",
      sparkPoints,
    },
    {
      icon: "pie-chart",
      color: "green",
      label: "Net Profit",
      value: formatCurrency(326110),
      delta: "+20.1%",
      link: "#",
      sparkColor: "#22c55e",
      sparkPoints,
    },
    {
      icon: "handshake",
      color: "amber",
      label: "Dealer Transactions This Month",
      value: "12",
      link: "#",
      sparkColor: "#f59e0b",
      sparkPoints,
    },
  ],
  vehicles,
  transactionKpis: buildTransactionKpiStrip(transactionsMockData),
  soldVehicleKpis: buildSoldVehicleKpiStrip(soldVehiclesMockData),
  transactions: transactionsMockData,
  soldVehicles: soldVehiclesMockData,
  expenses: [
    { id: "e1", category: "auction_fees", description: "Manheim Dallas lane fees", amount: 12450, date: "2024-05-01" },
    { id: "e2", category: "auction_fees", description: "ADESA Chicago buyer fees", amount: 8920, date: "2024-05-08" },
    { id: "e3", category: "transportation", description: "Central Dispatch - 6 units", amount: 2280, date: "2024-05-03" },
    { id: "e4", category: "transportation", description: "Montway Auto Transport", amount: 1850, date: "2024-05-12" },
    { id: "e5", category: "recon_repairs", description: "Detail & minor body work - WC360-1003", amount: 980, date: "2024-05-06" },
    { id: "e6", category: "recon_repairs", description: "Brake pads & rotors - WC360-1008", amount: 480, date: "2024-05-10" },
    { id: "e7", category: "storage_fees", description: "Lot storage - May 2024", amount: 3200, date: "2024-05-01" },
    { id: "e8", category: "dealer_fees", description: "DMV title processing", amount: 1450, date: "2024-05-14" },
    { id: "e9", category: "miscellaneous", description: "Office supplies & software", amount: 680, date: "2024-05-18" },
  ],
  documents: [
    { id: "doc1", name: "Bill of Sale - WC360-1002", type: "bill_of_sale", linkedRecord: "WC360-1002", uploadedAt: "2024-05-20" },
    { id: "doc2", name: "Title - WC360-1007", type: "title", linkedRecord: "WC360-1007", uploadedAt: "2024-05-18" },
    { id: "doc3", name: "Manheim Auction Invoice", type: "auction_invoice", linkedRecord: "Batch #4521", uploadedAt: "2024-05-01" },
    { id: "doc4", name: "Bill of Sale - WC360-1001", type: "bill_of_sale", linkedRecord: "WC360-1001", uploadedAt: "2024-05-12" },
    { id: "doc5", name: "ADESA Chicago Invoice", type: "auction_invoice", linkedRecord: "Batch #4489", uploadedAt: "2024-05-08" },
    { id: "doc6", name: "Title - WC360-1004", type: "title", linkedRecord: "WC360-1004", uploadedAt: "2024-05-08" },
  ],
  activity: [
    { id: "a1", action: "Sold 2019 Audi A4", detail: "Precision Auto Group | $22,450", timestamp: "2 hours ago", icon: "sold" },
    { id: "a2", action: "Added Expense", detail: "Manheim Dallas lane fees | $12,450", timestamp: "5 hours ago", icon: "expense" },
    { id: "a3", action: "Uploaded Document", detail: "Bill of Sale - WC360-1002", timestamp: "Yesterday", icon: "document" },
    { id: "a4", action: "Added 2021 Tesla Model 3", detail: "Stock WC360-1005 | In Inventory", timestamp: "Yesterday", icon: "inventory" },
    { id: "a5", action: "Sold 2019 Hyundai Sonata", detail: "Metro Wholesale LLC | $16,800", timestamp: "2 days ago", icon: "sold" },
    { id: "a6", action: "Added Expense", detail: "Lot storage - May 2024 | $3,200", timestamp: "3 days ago", icon: "expense" },
  ],
  profitLoss: [
    { week: "Week 1", revenue: 98000, expenses: 22400 },
    { week: "Week 2", revenue: 112000, expenses: 24800 },
    { week: "Week 3", revenue: 128500, expenses: 26100 },
    { week: "Week 4", revenue: 174250, expenses: 33040 },
  ],
  profitLossSummary: {
    totalRevenue: 512750,
    totalExpenses: 106340,
    netProfit: 406410,
  },
  topPerformers: {
    topVehicle: { label: "2020 Mercedes-Benz C300", profit: 4160 },
    bestMargin: { label: "2019 Audi A4 Premium", margin: 23.4 },
    ytdNetProfit: { value: 1046320, delta: 24.7 },
  },
  notificationCount: 3,
};

export async function fetchDealerDashboardMock(
  delayMs = 800,
): Promise<DealerDashboardData> {
  await new Promise((r) => setTimeout(r, delayMs));
  return dealerDashboardMock;
}

export { totalInventoryCost, totalMarketValue, totalPotentialProfit };
