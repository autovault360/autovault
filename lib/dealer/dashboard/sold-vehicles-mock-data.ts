import type { SoldVehicleRecord } from "./types";

const IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

const TRUCK_IMG =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=80&h=60&fit=crop";

/** First 5 rows match the design mockup. */
const featuredSoldVehicles: SoldVehicleRecord[] = [
  {
    id: "sv1",
    inventoryId: "v-sv1",
    dateSold: "2024-05-24",
    vin: "1FTEW1EP5KFA12345",
    vehicleLabel: "2019 Ford F-150 XLT",
    stockNumber: "WC360-1042",
    vehicleImageUrl: TRUCK_IMG,
    mileage: 85210,
    buyer: "Metro Wholesale LLC",
    buyerType: "dealer",
    contactPerson: "Sarah Chen",
    dealerLicense: "DL-88421",
    phone: "(312) 555-0142",
    email: "sarah@metrowholesale.com",
    saleType: "wholesale",
    salePrice: 24500,
    vehicleCost: 18650,
    reconditioning: 1200,
    totalExpenses: 800,
    totalCost: 20650,
    grossProfit: 3850,
    grossProfitPercent: 15.6,
    paymentStatus: "paid",
    paymentMethod: "wire_transfer",
    dealNumber: "WC360-2484",
    salesperson: "mike_torres",
    documents: [
      { id: "sd1", name: "Bill of Sale.pdf", uploadedAt: "2024-05-24T14:30:00Z" },
      { id: "sd2", name: "Buyer's Order.pdf", uploadedAt: "2024-05-24T14:32:00Z" },
      { id: "sd3", name: "Title Copy.pdf", uploadedAt: "2024-05-24T14:35:00Z" },
    ],
    notes: "Wire received same day.",
  },
  {
    id: "sv2",
    inventoryId: "v-sv2",
    dateSold: "2024-05-22",
    vin: "WAUENAF45KN012345",
    vehicleLabel: "2019 Audi A4 Premium",
    stockNumber: "WC360-1039",
    vehicleImageUrl: IMG,
    mileage: 38500,
    buyer: "Chicago Motor Exchange",
    buyerType: "dealer",
    contactPerson: "James Miller",
    saleType: "wholesale",
    salePrice: 22450,
    vehicleCost: 18200,
    reconditioning: 850,
    totalExpenses: 550,
    totalCost: 19600,
    grossProfit: 2850,
    grossProfitPercent: 12.7,
    paymentStatus: "paid",
    paymentMethod: "ach",
    dealNumber: "WC360-2481",
    documents: [
      { id: "sd4", name: "Bill of Sale.pdf", uploadedAt: "2024-05-22T11:00:00Z" },
      { id: "sd5", name: "Title.pdf", uploadedAt: "2024-05-22T11:05:00Z" },
    ],
    notes: "",
  },
  {
    id: "sv3",
    inventoryId: "v-sv3",
    dateSold: "2024-05-20",
    vin: "1HGCV1F34MA012345",
    vehicleLabel: "2021 Honda Accord Sport",
    stockNumber: "WC360-1035",
    vehicleImageUrl: IMG,
    mileage: 29800,
    buyer: "Manheim Dallas",
    buyerType: "auction",
    contactPerson: "Auction Desk",
    saleType: "auction",
    salePrice: 21800,
    vehicleCost: 17800,
    reconditioning: 980,
    totalExpenses: 620,
    totalCost: 19400,
    grossProfit: 2400,
    grossProfitPercent: 11.0,
    paymentStatus: "partial",
    paymentMethod: "floor_plan",
    dealNumber: "WC360-2478",
    documents: [
      { id: "sd6", name: "Auction Invoice.pdf", uploadedAt: "2024-05-20T16:00:00Z" },
    ],
    notes: "Partial payment received.",
  },
  {
    id: "sv4",
    inventoryId: "v-sv4",
    dateSold: "2024-05-18",
    vin: "4T1B11HK5KU123456",
    vehicleLabel: "2020 Toyota Camry SE",
    stockNumber: "WC360-1031",
    vehicleImageUrl: IMG,
    mileage: 51200,
    buyer: "Summit Auto Group",
    buyerType: "dealer",
    contactPerson: "Mark Thompson",
    saleType: "wholesale",
    salePrice: 18500,
    vehicleCost: 15200,
    reconditioning: 720,
    totalExpenses: 480,
    totalCost: 16400,
    grossProfit: 2100,
    grossProfitPercent: 11.4,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    dealNumber: "WC360-2475",
    documents: [],
    notes: "Awaiting wire confirmation.",
  },
  {
    id: "sv5",
    inventoryId: "v-sv5",
    dateSold: "2024-05-15",
    vin: "1N4BL4BV9KC123456",
    vehicleLabel: "2019 Nissan Altima SV",
    stockNumber: "WC360-1028",
    vehicleImageUrl: IMG,
    mileage: 44100,
    buyer: "ADESA Chicago",
    buyerType: "auction",
    contactPerson: "Lane Clerk",
    saleType: "auction",
    salePrice: 14200,
    vehicleCost: 11800,
    reconditioning: 540,
    totalExpenses: 410,
    totalCost: 12750,
    grossProfit: 1450,
    grossProfitPercent: 10.2,
    paymentStatus: "paid",
    paymentMethod: "check",
    dealNumber: "WC360-2472",
    documents: [
      { id: "sd7", name: "Bill of Sale.pdf", uploadedAt: "2024-05-15T12:00:00Z" },
    ],
    notes: "",
  },
];

type SeedConfig = {
  id: string;
  date: string;
  stock: string;
  vin: string;
  vehicle: string;
  buyer: string;
  buyerType: SoldVehicleRecord["buyerType"];
  saleType: SoldVehicleRecord["saleType"];
  price: number;
  profit: number;
  status: SoldVehicleRecord["paymentStatus"];
  method: SoldVehicleRecord["paymentMethod"];
};

function makeSoldVehicle(config: SeedConfig, index: number): SoldVehicleRecord {
  const totalCost = config.price - config.profit;
  const vehicleCost = Math.round(totalCost * 0.82);
  const reconditioning = Math.round(totalCost * 0.1);
  const totalExpenses = totalCost - vehicleCost - reconditioning;
  const profitPct =
    config.price > 0
      ? Math.round((config.profit / config.price) * 1000) / 10
      : 0;

  return {
    id: config.id,
    inventoryId: `v-sv-gen-${index}`,
    dateSold: config.date,
    vin: config.vin,
    vehicleLabel: config.vehicle,
    stockNumber: config.stock,
    vehicleImageUrl: IMG,
    mileage: 28000 + index * 380,
    buyer: config.buyer,
    buyerType: config.buyerType,
    contactPerson: "Contact Person",
    saleType: config.saleType,
    salePrice: config.price,
    vehicleCost,
    reconditioning,
    totalExpenses,
    totalCost,
    grossProfit: config.profit,
    grossProfitPercent: profitPct,
    paymentStatus: config.status,
    paymentMethod: config.method,
    dealNumber: `WC360-${2400 + index}`,
    documents:
      config.status === "paid"
        ? [
            {
              id: `doc-${config.id}`,
              name: "Bill of Sale.pdf",
              uploadedAt: `${config.date}T12:00:00Z`,
            },
          ]
        : [],
    notes: "",
  };
}

function generateAdditionalSoldVehicles(): SoldVehicleRecord[] {
  const buyers = [
    "Precision Auto Group",
    "Elite Motor Exchange",
    "Pacific Auto Traders",
    "Valley Auto Network",
    "Summit Wholesale",
    "Lakefront Motors",
    "Capital City Auto",
    "Metro Wholesale LLC",
  ];
  const saleTypes: SoldVehicleRecord["saleType"][] = [
    "wholesale",
    "retail",
    "dealer_trade",
    "auction",
  ];

  const configs: SeedConfig[] = [];
  let idx = 6;

  for (let i = 0; i < 151; i++) {
    const month = i < 19 ? "05" : i < 55 ? "04" : "03";
    const day = String(1 + (i % 28)).padStart(2, "0");
    const price = 12800 + (i % 40) * 420;
    const profit = 1100 + (i % 9) * 180;
    const status: SoldVehicleRecord["paymentStatus"] =
      i < 7 ? "pending" : i === 7 ? "partial" : "paid";
    const saleType = saleTypes[i % saleTypes.length]!;
    const buyerType: SoldVehicleRecord["buyerType"] =
      saleType === "auction" ? "auction" : i % 5 === 0 ? "private" : "dealer";

    configs.push({
      id: `sv${idx++}`,
      date: `2024-${month}-${day}`,
      stock: `WC360-${1020 - i}`,
      vin: `SVVIN${String(idx).padStart(11, "0")}`,
      vehicle: `20${19 + (i % 4)} ${["Ford", "Honda", "Toyota", "Chevy"][i % 4]} ${["XLT", "Sport", "SE", "LT"][i % 4]}`,
      buyer:
        saleType === "auction"
          ? ["Manheim Dallas", "ADESA Chicago", "Manheim Phoenix"][i % 3]!
          : buyers[i % buyers.length]!,
      buyerType,
      saleType,
      price,
      profit,
      status,
      method:
        i % 3 === 0 ? "wire_transfer" : i % 3 === 1 ? "ach" : "check",
    });
  }

  return configs.map((c, i) => makeSoldVehicle(c, i));
}

function scaleRow(
  row: SoldVehicleRecord,
  salesFactor: number,
  grossFactor: number,
): SoldVehicleRecord {
  const salePrice = Math.round(row.salePrice * salesFactor);
  const grossProfit = Math.round(row.grossProfit * grossFactor);
  const totalCost = salePrice - grossProfit;
  const vehicleCost = Math.round(totalCost * 0.82);
  const reconditioning = Math.round(totalCost * 0.1);
  const totalExpenses = totalCost - vehicleCost - reconditioning;
  const grossProfitPercent =
    salePrice > 0 ? Math.round((grossProfit / salePrice) * 1000) / 10 : 0;

  return {
    ...row,
    salePrice,
    grossProfit,
    totalCost,
    vehicleCost,
    reconditioning,
    totalExpenses,
    grossProfitPercent,
  };
}

export function buildSoldVehiclesMockData(): SoldVehicleRecord[] {
  const additional = generateAdditionalSoldVehicles();

  const featuredSales = featuredSoldVehicles.reduce((s, r) => s + r.salePrice, 0);
  const featuredGross = featuredSoldVehicles.reduce((s, r) => s + r.grossProfit, 0);
  const addSales = additional.reduce((s, r) => s + r.salePrice, 0);
  const addGross = additional.reduce((s, r) => s + r.grossProfit, 0);

  const targetSales = 2_458_750;
  const targetGross = 487_350;
  const salesFactor = (targetSales - featuredSales) / addSales;
  const grossFactor = (targetGross - featuredGross) / addGross;

  const scaledAdditional = additional.map((row) =>
    scaleRow(row, salesFactor, grossFactor),
  );

  return [...featuredSoldVehicles, ...scaledAdditional];
}

export const soldVehiclesMockData = buildSoldVehiclesMockData();
