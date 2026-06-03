import type { CpaDashboardData, CpaViewMode } from "@/lib/cpa/types";

export type CpaDashboardParams = {
  view: CpaViewMode;
  month: number;
  year: number;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function buildChartData(baseValue: number, month: number, months = MONTH_NAMES): { name: string; value: number }[] {
  return months.map((m, i) => ({
    name: m,
    value: Math.round(baseValue * (0.7 + (i / (months.length - 1)) * 0.6) * (1 + (Math.random() - 0.5) * 0.08)),
  }));
}

function buildVehiclesSold(month: number, year: number) {
  const base = [
    { stock: "STK12401", vehicle: "2023 Honda Accord Sport", vin: "1HGCV1F34PA123456", price: 24995, profit: 3200 },
    { stock: "STK12398", vehicle: "2022 Toyota Camry SE", vin: "4T1G11AK2NU987654", price: 22850, profit: 2850 },
    { stock: "STK12395", vehicle: "2024 Ford F-150 XLT", vin: "1FTFW1E84PFA11223", price: 48500, profit: 5200 },
    { stock: "STK12392", vehicle: "2021 Chevrolet Silverado LT", vin: "3GCUYDED5MG445566", price: 38900, profit: 4100 },
    { stock: "STK12388", vehicle: "2023 Nissan Altima SV", vin: "1N4BL4BV3PC778899", price: 21500, profit: 2400 },
    { stock: "STK12385", vehicle: "2022 Jeep Grand Cherokee Laredo", vin: "1C4RJFBG2NC334455", price: 31200, profit: 3600 },
    { stock: "STK12382", vehicle: "2024 Hyundai Tucson SEL", vin: "5NMJB3AE4RH667788", price: 27800, profit: 2950 },
    { stock: "STK12379", vehicle: "2020 BMW 330i xDrive", vin: "WBA5R1C05LAC11223", price: 33500, profit: 3800 },
  ];

  return base.map((v, i) => ({
    id: `${v.stock}-${month}`,
    dateSold: `${year}-${String(month).padStart(2, "0")}-${String(28 - i).padStart(2, "0")}`,
    stockNumber: v.stock,
    vehicle: v.vehicle,
    vin: v.vin,
    salePrice: v.price,
    grossProfit: v.profit,
  }));
}

export async function getCpaDashboardData(
  _dealershipId: string,
  params: CpaDashboardParams,
): Promise<CpaDashboardData> {
  const { month, year, view } = params;
  const monthLabel = MONTH_NAMES[month - 1] ?? "May";
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevLabel = MONTH_NAMES[prevMonth - 1];

  const multiplier = view === "yearly" ? 12 : 1;
  const revenue = 512450 * multiplier;
  const grossProfit = 98450 * multiplier;
  const netProfit = 62150 * multiplier;
  const expenses = 16190 * multiplier;
  const payroll = 9850 * multiplier;
  const commissions = 6320 * multiplier;

  const vehicles = buildVehiclesSold(month, year);

  return {
    dataAsOf: `${monthLabel} 20, ${year} 11:59 PM`,
    kpis: [
      {
        label: "Total Revenue",
        value: formatCurrency(revenue),
        delta: `? 18.6% vs ${prevLabel} ${prevYear}`,
        deltaPositive: true,
        icon: "dollar-sign",
        color: "green",
        chartData: buildChartData(revenue / (view === "yearly" ? 12 : 1), month),
      },
      {
        label: "Gross Profit",
        value: formatCurrency(grossProfit),
        delta: `? 17.3% vs ${prevLabel} ${prevYear}`,
        deltaPositive: true,
        icon: "bar-chart-3",
        color: "purple",
        chartData: buildChartData(grossProfit / (view === "yearly" ? 12 : 1), month),
      },
      {
        label: "Net Profit",
        value: formatCurrency(netProfit),
        delta: `? 14.6% vs ${prevLabel} ${prevYear}`,
        deltaPositive: true,
        icon: "pie-chart",
        color: "blue",
        chartData: buildChartData(netProfit / (view === "yearly" ? 12 : 1), month),
      },
      {
        label: "Total Expenses",
        value: formatCurrency(expenses),
        delta: `? 2.1% vs ${prevLabel} ${prevYear}`,
        deltaPositive: false,
        icon: "trending-down",
        color: "red",
        chartData: buildChartData(expenses / (view === "yearly" ? 12 : 1), month),
      },
      {
        label: "Payroll Paid",
        value: formatCurrency(payroll),
        delta: `? 5.6% vs ${prevLabel} ${prevYear}`,
        deltaPositive: true,
        icon: "landmark",
        color: "teal",
        chartData: buildChartData(payroll / (view === "yearly" ? 12 : 1), month),
      },
      {
        label: "Commissions Paid",
        value: formatCurrency(commissions),
        delta: `? 8.7% vs ${prevLabel} ${prevYear}`,
        deltaPositive: true,
        icon: "car",
        color: "orange",
        chartData: buildChartData(commissions / (view === "yearly" ? 12 : 1), month),
      },
    ],
    salesActivity: [
      { label: "Vehicles Purchased", value: 42, delta: "? 12%", deltaPositive: true, icon: "car" },
      { label: "Vehicles Sold", value: 38, delta: "? 8%", deltaPositive: true, icon: "tag" },
      { label: "Inventory Added", value: 48, delta: "? 5%", deltaPositive: true, icon: "leaf" },
      { label: "Inventory Remaining", value: 78, icon: "bar-chart-3" },
    ],
    vehiclesSold: vehicles,
    vehiclesSoldTotal: 38,
    salesTax: {
      taxableSales: 485200,
      taxCollected: 38816,
      taxPaymentsMade: 35200,
      balanceDue: 3616,
      filingFrequency: "Monthly",
      dueDate: "June 30, 2025",
      status: "DUE SOON",
    },
    payroll: {
      totalPayroll: 9850,
      employeesPaid: 14,
      commissionsPaid: 6320,
      bonusesPaid: 1200,
      payrollTaxes: 1842,
      nextPayrollDate: "June 15, 2025",
    },
    profitLoss: [
      { label: "Revenue", current: 512450, previous: 432100, changePct: 18.6 },
      { label: "Cost Of Goods Sold", current: 414000, previous: 351200, changePct: 17.9 },
      { label: "Gross Profit", current: 98450, previous: 80900, changePct: 21.7 },
      { label: "Expenses", current: 16190, previous: 16540, changePct: -2.1 },
      { label: "Net Profit", current: 62150, previous: 54200, changePct: 14.6 },
      { label: "Net Margin", current: 12.1, previous: 12.5, changePct: -0.4, isMargin: true },
    ],
    trend: MONTH_NAMES.map((m, i) => ({
      month: m,
      revenue: 380000 + i * 12000 + (i === month - 1 ? 20000 : 0),
      netProfit: 42000 + i * 1800,
    })),
    dealJackets: [
      { name: "Completed", value: 22, color: "#22c55e" },
      { name: "Missing Docs", value: 6, color: "#ef4444" },
      { name: "Pending Signatures", value: 5, color: "#f97316" },
      { name: "Funding Pending", value: 3, color: "#3b82f6" },
      { name: "Other", value: 2, color: "#64748b" },
    ],
    dealJacketsTotal: 38,
    storageFolders: [
      { id: "bank", name: "Bank Statements", fileCount: 24, iconColor: "blue" },
      { id: "payroll", name: "Payroll Reports", fileCount: 18, iconColor: "orange" },
      { id: "tax", name: "Tax Documents", fileCount: 31, iconColor: "red" },
      { id: "deals", name: "Deal Jackets", fileCount: 38, iconColor: "green" },
      { id: "receipts", name: "Expense Receipts", fileCount: 56, iconColor: "purple" },
      { id: "audit", name: "Audit Files", fileCount: 12, iconColor: "teal" },
    ],
    notePreviews: [],
    notesSummary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
  };
}
