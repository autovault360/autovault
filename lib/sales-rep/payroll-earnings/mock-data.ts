import type {
  IEarningsByVehicle,
  IPaymentHistoryEntry,
  IPayrollEarningsData,
  PayrollPeriodMonth,
} from "./types";

const SUV_IMG =
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=80&h=60&fit=crop";
const SEDAN_IMG =
  "https://images.unsplash.com/photo-1621007947382-bcb3e7988faf?w=80&h=60&fit=crop";
const TRUCK_IMG =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=80&h=60&fit=crop";

type VehicleRowSeed = {
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
  vehicleImageUrl: string;
  customerName: string;
  customerPhone: string;
  soldDate: string;
  soldPrice: number;
  grossProfit: number;
  commissionRate: number;
  commissionEarned: number;
  dealJacketId: string;
};

const VEHICLE_ROWS: VehicleRowSeed[] = [
  {
    year: 2021,
    make: "BMW",
    model: "X5",
    trim: "xDrive40i",
    stockNumber: "AV1023",
    vehicleImageUrl: SUV_IMG,
    customerName: "John Smith",
    customerPhone: "(312) 555-0142",
    soldDate: "2026-05-28",
    soldPrice: 42900,
    grossProfit: 10800,
    commissionRate: 10,
    commissionEarned: 1080,
    dealJacketId: "DJ-1058",
  },
  {
    year: 2023,
    make: "Audi",
    model: "A4",
    trim: "Premium",
    stockNumber: "AV1019",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Maria Garcia",
    customerPhone: "(630) 555-0134",
    soldDate: "2026-05-27",
    soldPrice: 35500,
    grossProfit: 5500,
    commissionRate: 10,
    commissionEarned: 1100,
    dealJacketId: "DJ-1057",
  },
  {
    year: 2024,
    make: "Ford",
    model: "F-150",
    trim: "XLT",
    stockNumber: "AV1016",
    vehicleImageUrl: TRUCK_IMG,
    customerName: "James Wilson",
    customerPhone: "(773) 555-0155",
    soldDate: "2026-05-26",
    soldPrice: 42800,
    grossProfit: 4250,
    commissionRate: 10,
    commissionEarned: 850,
    dealJacketId: "DJ-1056",
  },
  {
    year: 2020,
    make: "Jeep",
    model: "Grand Cherokee",
    trim: "Limited",
    stockNumber: "AV1013",
    vehicleImageUrl: SUV_IMG,
    customerName: "Emily Chen",
    customerPhone: "(224) 555-0144",
    soldDate: "2026-05-25",
    soldPrice: 38600,
    grossProfit: 4600,
    commissionRate: 10,
    commissionEarned: 920,
    dealJacketId: "DJ-1055",
  },
  {
    year: 2022,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    stockNumber: "AV1017",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Lisa Wong",
    customerPhone: "(312) 555-0176",
    soldDate: "2026-05-24",
    soldPrice: 24200,
    grossProfit: 3200,
    commissionRate: 10,
    commissionEarned: 640,
    dealJacketId: "DJ-1054",
  },
  {
    year: 2023,
    make: "Honda",
    model: "Accord",
    trim: "Sport",
    stockNumber: "AV1018",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "David Kim",
    customerPhone: "(224) 555-0189",
    soldDate: "2026-05-23",
    soldPrice: 26800,
    grossProfit: 3800,
    commissionRate: 10,
    commissionEarned: 760,
    dealJacketId: "DJ-1053",
  },
  {
    year: 2022,
    make: "Mercedes-Benz",
    model: "C300",
    stockNumber: "AV1022",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Jane Doe",
    customerPhone: "(773) 555-0198",
    soldDate: "2026-05-22",
    soldPrice: 28900,
    grossProfit: 4450,
    commissionRate: 10,
    commissionEarned: 890,
    dealJacketId: "DJ-1052",
  },
  {
    year: 2020,
    make: "Honda",
    model: "Accord",
    trim: "EX-L",
    stockNumber: "AV1020",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Robert Lee",
    customerPhone: "(847) 555-0167",
    soldDate: "2026-05-21",
    soldPrice: 22400,
    grossProfit: 3500,
    commissionRate: 10,
    commissionEarned: 700,
    dealJacketId: "DJ-1051",
  },
  {
    year: 2023,
    make: "Audi",
    model: "Q5",
    trim: "Premium Plus",
    stockNumber: "AV1015",
    vehicleImageUrl: SUV_IMG,
    customerName: "Chris Allen",
    customerPhone: "(630) 555-0190",
    soldDate: "2026-05-20",
    soldPrice: 36500,
    grossProfit: 5300,
    commissionRate: 10,
    commissionEarned: 1060,
    dealJacketId: "DJ-1050",
  },
  {
    year: 2022,
    make: "Chevrolet",
    model: "Silverado",
    trim: "LT",
    stockNumber: "AV1014",
    vehicleImageUrl: TRUCK_IMG,
    customerName: "Amanda Clark",
    customerPhone: "(847) 555-0123",
    soldDate: "2026-05-19",
    soldPrice: 39200,
    grossProfit: 5100,
    commissionRate: 10,
    commissionEarned: 1020,
    dealJacketId: "DJ-1049",
  },
  {
    year: 2023,
    make: "Nissan",
    model: "Altima",
    trim: "SV",
    stockNumber: "AV1012",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Michael Torres",
    customerPhone: "(312) 555-0161",
    soldDate: "2026-05-18",
    soldPrice: 23900,
    grossProfit: 2900,
    commissionRate: 10,
    commissionEarned: 580,
    dealJacketId: "DJ-1048",
  },
  {
    year: 2024,
    make: "Tesla",
    model: "Model 3",
    stockNumber: "AV1011",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Sarah Williams",
    customerPhone: "(773) 555-0178",
    soldDate: "2026-05-17",
    soldPrice: 37800,
    grossProfit: 4800,
    commissionRate: 10,
    commissionEarned: 960,
    dealJacketId: "DJ-1047",
  },
  {
    year: 2022,
    make: "Ford",
    model: "Mustang",
    trim: "GT",
    stockNumber: "AV1010",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Kevin Brown",
    customerPhone: "(847) 555-0139",
    soldDate: "2026-05-16",
    soldPrice: 33400,
    grossProfit: 3400,
    commissionRate: 10,
    commissionEarned: 680,
    dealJacketId: "DJ-1046",
  },
  {
    year: 2021,
    make: "Lexus",
    model: "RX 350",
    stockNumber: "AV1009",
    vehicleImageUrl: SUV_IMG,
    customerName: "Rachel Green",
    customerPhone: "(630) 555-0152",
    soldDate: "2026-05-15",
    soldPrice: 39800,
    grossProfit: 4600,
    commissionRate: 10,
    commissionEarned: 920,
    dealJacketId: "DJ-1045",
  },
  {
    year: 2022,
    make: "Honda",
    model: "CR-V",
    trim: "EX",
    stockNumber: "AV1008",
    vehicleImageUrl: SUV_IMG,
    customerName: "Tom Harris",
    customerPhone: "(224) 555-0183",
    soldDate: "2026-05-14",
    soldPrice: 27100,
    grossProfit: 3100,
    commissionRate: 10,
    commissionEarned: 620,
    dealJacketId: "DJ-1044",
  },
  {
    year: 2020,
    make: "Toyota",
    model: "RAV4",
    trim: "XLE",
    stockNumber: "AV1007",
    vehicleImageUrl: SUV_IMG,
    customerName: "Nina Patel",
    customerPhone: "(312) 555-0168",
    soldDate: "2026-05-13",
    soldPrice: 25600,
    grossProfit: 3500,
    commissionRate: 10,
    commissionEarned: 700,
    dealJacketId: "DJ-1043",
  },
  {
    year: 2023,
    make: "Mazda",
    model: "CX-5",
    trim: "Touring",
    stockNumber: "AV1006",
    vehicleImageUrl: SUV_IMG,
    customerName: "Brian Scott",
    customerPhone: "(773) 555-0147",
    soldDate: "2026-05-12",
    soldPrice: 28900,
    grossProfit: 3800,
    commissionRate: 10,
    commissionEarned: 760,
    dealJacketId: "DJ-1042",
  },
  {
    year: 2023,
    make: "BMW",
    model: "3 Series",
    trim: "330i",
    stockNumber: "AV1005",
    vehicleImageUrl: SEDAN_IMG,
    customerName: "Olivia Martin",
    customerPhone: "(847) 555-0195",
    soldDate: "2026-05-11",
    soldPrice: 41200,
    grossProfit: 6200,
    commissionRate: 10,
    commissionEarned: 1240,
    dealJacketId: "DJ-1041",
  },
];

const TARGET_TOTAL = 13945;

function buildEarningsRows(): IEarningsByVehicle[] {
  const rawTotal = VEHICLE_ROWS.reduce((sum, r) => sum + r.commissionEarned, 0);
  const scale = TARGET_TOTAL / rawTotal;

  const statusByIndex: Record<number, IEarningsByVehicle["paymentStatus"]> = {
    3: "pending",
  };

  return VEHICLE_ROWS.map((row, i) => {
    const status =
      statusByIndex[i] ??
      (i < 14 ? "paid" : i < 17 ? "pending" : "on_hold");
    return {
      ...row,
      id: `earn-${i + 1}`,
      commissionEarned:
        i === VEHICLE_ROWS.length - 1
          ? TARGET_TOTAL -
            VEHICLE_ROWS.slice(0, -1).reduce(
              (sum, r) => sum + Math.round(r.commissionEarned * scale),
              0,
            )
          : Math.round(row.commissionEarned * scale),
      paymentStatus: status,
      employeeId: "SR-1042",
      invoiceRef: `INV-2026-${String(500 + i).padStart(4, "0")}`,
      transactionId: `TXN-${String(8800 + i)}`,
    };
  });
}

const PAYMENT_HISTORY: IPaymentHistoryEntry[] = [
  {
    id: "ph-1",
    payDate: "May 6, 2026",
    period: "Apr 1 �€“ Apr 30, 2026",
    totalEarnings: 11750,
    status: "paid",
  },
  {
    id: "ph-2",
    payDate: "Apr 4, 2026",
    period: "Mar 1 �€“ Mar 31, 2026",
    totalEarnings: 10920,
    status: "paid",
  },
  {
    id: "ph-3",
    payDate: "Mar 6, 2026",
    period: "Feb 1 �€“ Feb 28, 2026",
    totalEarnings: 9840,
    status: "paid",
  },
  {
    id: "ph-4",
    payDate: "Feb 6, 2026",
    period: "Jan 1 �€“ Jan 31, 2026",
    totalEarnings: 9050,
    status: "paid",
  },
];

const PERIOD_LABELS: Record<PayrollPeriodMonth, string> = {
  "2026-05": "May 1 �€“ May 31, 2026",
  "2026-04": "Apr 1 �€“ Apr 30, 2026",
  "2026-03": "Mar 1 �€“ Mar 31, 2026",
  "2026-02": "Feb 1 �€“ Feb 28, 2026",
  "2026-01": "Jan 1 �€“ Jan 31, 2026",
};

export function getPayrollEarningsMockData(
  month: PayrollPeriodMonth = "2026-05",
): IPayrollEarningsData {
  const earningsByVehicle = buildEarningsRows();
  const totalCommissions = earningsByVehicle.reduce(
    (sum, e) => sum + e.commissionEarned,
    0,
  );
  const vehiclesSold = earningsByVehicle.length;
  const avgCommission = vehiclesSold > 0 ? totalCommissions / vehiclesSold : 0;

  const daysUntil = 5;

  const scale =
    month === "2026-05"
      ? 1
      : month === "2026-04"
        ? 0.84
        : month === "2026-03"
          ? 0.78
          : month === "2026-02"
            ? 0.7
            : 0.65;

  const scaledTotal =
    month === "2026-05" ? TARGET_TOTAL : Math.round(totalCommissions * scale);

  return {
    periodLabel: PERIOD_LABELS[month],
    periodMonth: month,
    kpiSummary: {
      totalEarnings: scaledTotal,
      totalCommissions: scaledTotal,
      vehiclesSold: month === "2026-05" ? vehiclesSold : Math.round(vehiclesSold * scale),
      avgCommissionPerVehicle:
        month === "2026-05" ? 774.72 : avgCommission,
      nextPayDate: "Jun 6, 2026",
      daysUntilPay: daysUntil,
      totalEarningsTrend: "�†‘ 18.7% vs last month",
      totalCommissionsTrend: "�†‘ 18.7% vs last month",
      vehiclesSoldTrend: "�†‘ 20% vs last month",
      avgCommissionTrend: "�†‘ 6.4% vs last month",
    },
    breakdown: {
      totalCommissions: scaledTotal,
      otherBonuses: 0,
      adjustments: 0,
      chargebacks: 0,
      netPay: scaledTotal,
    },
    earningsByVehicle:
      month === "2026-05"
        ? earningsByVehicle
        : earningsByVehicle.slice(0, Math.max(6, Math.round(vehiclesSold * scale))),
    paymentHistory: PAYMENT_HISTORY,
    chartData: [
      { label: "Jan", earnings: 9050 },
      { label: "Feb", earnings: 9840 },
      { label: "Mar", earnings: 10920 },
      { label: "Apr", earnings: 11750 },
      { label: "May", earnings: scaledTotal },
    ],
  };
}

export const SALES_REP_PAYROLL_EARNINGS_MOCK =
  getPayrollEarningsMockData("2026-05");
