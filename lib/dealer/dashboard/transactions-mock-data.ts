import type { DealerTransaction } from "./types";

const IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

/** First 5 rows match the design mockup; remaining 43 fill totals to 48. */
const featuredTransactions: DealerTransaction[] = [
  {
    id: "t1",
    inventoryId: "v1",
    type: "dealer_sale",
    transactionDate: "2024-05-24",
    vin: "WBA8E9G50JNU12345",
    vehicleLabel: "2020 BMW 5 Series 540i",
    stockNumber: "WC360-1042",
    vehicleImageUrl: IMG,
    mileage: 42180,
    buyerSeller: "Metro Wholesale LLC",
    auction: null,
    salePurchasePrice: 24500,
    grossProfit: 3200,
    paymentStatus: "paid",
    paymentMethod: "wire_transfer",
    contactPerson: "Sarah Chen",
    dealerLicense: "DL-88421",
    phone: "(312) 555-0142",
    email: "sarah@metrowholesale.com",
    documents: [
      { id: "d1", name: "Bill of Sale.pdf", uploadedAt: "2024-05-24T14:30:00Z" },
      { id: "d2", name: "Title Copy.pdf", uploadedAt: "2024-05-24T14:35:00Z" },
    ],
    notes: "Wire received same day.",
    auditEvents: [
      { at: "2024-05-24T10:00:00Z", action: "Transaction created", actor: "System" },
      { at: "2024-05-24T14:30:00Z", action: "Payment status: Paid", actor: "Sarah Chen" },
    ],
  },
  {
    id: "t2",
    inventoryId: "v2",
    type: "dealer_sale",
    transactionDate: "2024-05-22",
    vin: "WAUENAF45KN012345",
    vehicleLabel: "2019 Audi A4 Premium",
    stockNumber: "WC360-1039",
    vehicleImageUrl: IMG,
    mileage: 38500,
    buyerSeller: "Chicago Motor Exchange",
    auction: null,
    salePurchasePrice: 22450,
    grossProfit: 2850,
    paymentStatus: "paid",
    paymentMethod: "ach",
    contactPerson: "James Miller",
    documents: [{ id: "d3", name: "Bill of Sale.pdf", uploadedAt: "2024-05-22T11:00:00Z" }],
    notes: "",
    auditEvents: [
      { at: "2024-05-22T09:00:00Z", action: "Transaction created", actor: "System" },
    ],
  },
  {
    id: "t3",
    inventoryId: "v4",
    type: "auction_sale",
    transactionDate: "2024-05-20",
    vin: "1HGCV1F34MA012345",
    vehicleLabel: "2021 Honda Accord Sport",
    stockNumber: "WC360-1035",
    vehicleImageUrl: IMG,
    mileage: 29800,
    buyerSeller: "�€”",
    auction: "Manheim Dallas",
    salePurchasePrice: 21800,
    grossProfit: 2400,
    paymentStatus: "partial",
    paymentMethod: "floor_plan",
    contactPerson: "Auction Desk",
    documents: [{ id: "d4", name: "Auction Invoice.pdf", uploadedAt: "2024-05-20T16:00:00Z" }],
    notes: "Partial payment received.",
    auditEvents: [
      { at: "2024-05-20T14:00:00Z", action: "Transaction created", actor: "System" },
    ],
  },
  {
    id: "t4",
    inventoryId: "v5",
    type: "dealer_purchase",
    transactionDate: "2024-05-18",
    vin: "4T1B11HK5KU123456",
    vehicleLabel: "2020 Toyota Camry SE",
    stockNumber: "WC360-1031",
    vehicleImageUrl: IMG,
    mileage: 51200,
    buyerSeller: "Summit Auto Group",
    auction: null,
    salePurchasePrice: 18500,
    grossProfit: null,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    contactPerson: "Mark Thompson",
    documents: [],
    notes: "Awaiting title.",
    auditEvents: [
      { at: "2024-05-18T08:00:00Z", action: "Transaction created", actor: "System" },
    ],
  },
  {
    id: "t5",
    inventoryId: "v6",
    type: "auction_purchase",
    transactionDate: "2024-05-15",
    vin: "1N4BL4BV9KC123456",
    vehicleLabel: "2019 Nissan Altima SV",
    stockNumber: "WC360-1028",
    vehicleImageUrl: IMG,
    mileage: 44100,
    buyerSeller: "�€”",
    auction: "ADESA Chicago",
    salePurchasePrice: 14200,
    grossProfit: null,
    paymentStatus: "paid",
    paymentMethod: "check",
    contactPerson: "Lane Clerk",
    documents: [
      { id: "d5", name: "Auction Invoice.pdf", uploadedAt: "2024-05-15T12:00:00Z" },
    ],
    notes: "",
    auditEvents: [
      { at: "2024-05-15T10:00:00Z", action: "Transaction created", actor: "System" },
    ],
  },
];

type SeedConfig = {
  id: string;
  type: DealerTransaction["type"];
  date: string;
  stock: string;
  vin: string;
  vehicle: string;
  party: string;
  auction: string | null;
  price: number;
  profit: number | null;
  status: DealerTransaction["paymentStatus"];
  method: DealerTransaction["paymentMethod"];
};

function makeTxn(config: SeedConfig, index: number): DealerTransaction {
  return {
    id: config.id,
    inventoryId: `v-gen-${index}`,
    type: config.type,
    transactionDate: config.date,
    vin: config.vin,
    vehicleLabel: config.vehicle,
    stockNumber: config.stock,
    vehicleImageUrl: IMG,
    mileage: 30000 + index * 420,
    buyerSeller: config.party,
    auction: config.auction,
    salePurchasePrice: config.price,
    grossProfit: config.profit,
    paymentStatus: config.status,
    paymentMethod: config.method,
    contactPerson: "Contact Person",
    documents:
      config.status === "paid"
        ? [{ id: `doc-${config.id}`, name: "Bill of Sale.pdf", uploadedAt: `${config.date}T12:00:00Z` }]
        : [],
    notes: "",
    auditEvents: [
      { at: `${config.date}T08:00:00Z`, action: "Transaction created", actor: "System" },
    ],
  };
}

/** Generates 43 additional rows; counts reconcile to image totals. */
function generateAdditionalTransactions(): DealerTransaction[] {
  const dealers = [
    "Precision Auto Group",
    "Elite Motor Exchange",
    "Pacific Auto Traders",
    "Valley Auto Network",
    "Summit Wholesale",
    "Lakefront Motors",
    "Capital City Auto",
  ];
  const auctions = ["Manheim Dallas", "ADESA Chicago", "Manheim Phoenix", "ADESA Atlanta"];

  const configs: SeedConfig[] = [];
  let idx = 6;

  // 26 more dealer sales (28 total)
  for (let i = 0; i < 26; i++) {
    const day = String(1 + (i % 28)).padStart(2, "0");
    const price = 19800 + i * 380;
    const profit = 1800 + (i % 7) * 120;
    const status: DealerTransaction["paymentStatus"] =
      i < 2 ? "pending" : i === 2 ? "partial" : "paid";
    configs.push({
      id: `t${idx++}`,
      type: "dealer_sale",
      date: `2024-05-${day}`,
      stock: `WC360-${1030 - i}`,
      vin: `GENVIN${String(idx).padStart(11, "0")}`,
      vehicle: `202${i % 3} Vehicle Model ${i + 1}`,
      party: dealers[i % dealers.length]!,
      auction: null,
      price,
      profit,
      status,
      method: i % 2 === 0 ? "wire_transfer" : "ach",
    });
  }

  // 11 more auction sales (12 total)
  for (let i = 0; i < 11; i++) {
    const day = String(2 + (i % 27)).padStart(2, "0");
    const price = 16500 + i * 290;
    const profit = 1500 + (i % 5) * 90;
    const status: DealerTransaction["paymentStatus"] =
      i < 1 ? "pending" : i === 1 ? "partial" : "paid";
    configs.push({
      id: `t${idx++}`,
      type: "auction_sale",
      date: `2024-05-${day}`,
      stock: `WC360-${1020 - i}`,
      vin: `AUCVIN${String(idx).padStart(11, "0")}`,
      vehicle: `2019 Auction Unit ${i + 1}`,
      party: "�€”",
      auction: auctions[i % auctions.length]!,
      price,
      profit,
      status,
      method: "floor_plan",
    });
  }

  // 7 more purchases (8 total across dealer + auction)
  for (let i = 0; i < 4; i++) {
    const day = String(3 + (i % 25)).padStart(2, "0");
    configs.push({
      id: `t${idx++}`,
      type: "dealer_purchase",
      date: `2024-05-${day}`,
      stock: `WC360-${1010 - i}`,
      vin: `PURVIN${String(idx).padStart(11, "0")}`,
      vehicle: `2020 Purchase Unit ${i + 1}`,
      party: dealers[(i + 2) % dealers.length]!,
      auction: null,
      price: 13200 + i * 410,
      profit: null,
      status: i < 2 ? "pending" : "paid",
      method: "wire_transfer",
    });
  }

  for (let i = 0; i < 3; i++) {
    const day = String(4 + (i % 24)).padStart(2, "0");
    configs.push({
      id: `t${idx++}`,
      type: "auction_purchase",
      date: `2024-05-${day}`,
      stock: `WC360-${1005 - i}`,
      vin: `AUPVIN${String(idx).padStart(11, "0")}`,
      vehicle: `2018 Auction Buy ${i + 1}`,
      party: "�€”",
      auction: auctions[(i + 1) % auctions.length]!,
      price: 11800 + i * 350,
      profit: null,
      status: i < 1 ? "pending" : "paid",
      method: "check",
    });
  }

  const generated = configs.map((c, i) => makeTxn(c, i));

  // Normalize totals to match mockup KPIs
  const sales = [...featuredTransactions, ...generated].filter(
    (t) => t.type === "dealer_sale" || t.type === "auction_sale",
  );
  const targetRevenue = 1_247_500;
  const targetGross = 187_450;
  const currentRevenue = sales.reduce((s, t) => s + t.salePurchasePrice, 0);
  const currentGross = sales.reduce((s, t) => s + (t.grossProfit ?? 0), 0);
  const revenueScale = targetRevenue / currentRevenue;
  const grossScale = targetGross / currentGross;

  return generated.map((txn) => {
    if (txn.type !== "dealer_sale" && txn.type !== "auction_sale") return txn;
    return {
      ...txn,
      salePurchasePrice: Math.round(txn.salePurchasePrice * revenueScale),
      grossProfit:
        txn.grossProfit != null ? Math.round(txn.grossProfit * grossScale) : null,
    };
  });
}

export function buildTransactionsMockData(): DealerTransaction[] {
  const additional = generateAdditionalTransactions();
  const all = [...featuredTransactions, ...additional];

  // Normalize featured row prices after scaling additional
  const sales = all.filter(
    (t) => t.type === "dealer_sale" || t.type === "auction_sale",
  );
  const targetRevenue = 1_247_500;
  const targetGross = 187_450;
  const currentRevenue = sales.reduce((s, t) => s + t.salePurchasePrice, 0);
  const currentGross = sales.reduce((s, t) => s + (t.grossProfit ?? 0), 0);
  const revenueFactor = targetRevenue / currentRevenue;
  const grossFactor = targetGross / currentGross;

  return all.map((txn) => {
    if (txn.type !== "dealer_sale" && txn.type !== "auction_sale") return txn;
    return {
      ...txn,
      salePurchasePrice: Math.round(txn.salePurchasePrice * revenueFactor),
      grossProfit:
        txn.grossProfit != null ? Math.round(txn.grossProfit * grossFactor) : null,
    };
  });
}

export const transactionsMockData = buildTransactionsMockData();
