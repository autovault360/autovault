import type { SoldVehicleRecord } from "./types";

const IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

const TRUCK_IMG =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=80&h=60&fit=crop";

const BMW_IMG =
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=80&h=60&fit=crop";

type SeedRow = {
  id: string;
  dateSold: string;
  vehicleLabel: string;
  exteriorColor: string;
  stockNumber: string;
  buyer: string;
  salePrice: number;
  grossProfit: number;
  paymentStatus: SoldVehicleRecord["paymentStatus"];
  paymentMethod: SoldVehicleRecord["paymentMethod"];
  saleType: SoldVehicleRecord["saleType"];
  buyerType: SoldVehicleRecord["buyerType"];
  vehicleImageUrl?: string;
  vin?: string;
};

function makeRecord(seed: SeedRow, index: number): SoldVehicleRecord {
  const totalCost = seed.salePrice - seed.grossProfit;
  const vehicleCost = Math.round(totalCost * 0.82);
  const reconditioning = Math.round(totalCost * 0.1);
  const totalExpenses = totalCost - vehicleCost - reconditioning;
  const grossProfitPercent =
    seed.salePrice > 0
      ? Math.round((seed.grossProfit / seed.salePrice) * 1000) / 10
      : 0;

  return {
    id: seed.id,
    inventoryId: `v-sv-${seed.id}`,
    dateSold: seed.dateSold,
    vin: seed.vin ?? `1HGCV1F34MA${String(index).padStart(6, "0")}`,
    vehicleLabel: seed.vehicleLabel,
    stockNumber: seed.stockNumber,
    exteriorColor: seed.exteriorColor,
    vehicleImageUrl: seed.vehicleImageUrl ?? IMG,
    mileage: 28000 + index * 420,
    buyer: seed.buyer,
    buyerType: seed.buyerType,
    contactPerson: "Contact Person",
    saleType: seed.saleType,
    salePrice: seed.salePrice,
    vehicleCost,
    reconditioning,
    totalExpenses,
    totalCost,
    grossProfit: seed.grossProfit,
    grossProfitPercent,
    paymentStatus: seed.paymentStatus,
    paymentMethod: seed.paymentMethod,
    dealNumber: `WC360-${2400 + index}`,
    documents:
      seed.paymentStatus === "paid"
        ? [
            {
              id: `doc-${seed.id}`,
              name: "Bill of Sale.pdf",
              uploadedAt: `${seed.dateSold}T12:00:00Z`,
            },
          ]
        : [],
    notes: "",
  };
}

/**
 * May 2024 sold vehicles — 24 records matching the wholesale sold vehicles mockup:
 * $340,159 total sales · $71,407 gross profit · 8 pending · $93,079 pending amount.
 */
const may2024Seeds: SeedRow[] = [
  {
    id: "sv-m01a",
    dateSold: "2024-05-01",
    vehicleLabel: "2018 Ford Escape SE",
    exteriorColor: "Blue",
    stockNumber: "WC360-1010",
    buyer: "Lakefront Motors",
    salePrice: 12450,
    grossProfit: 2615,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m01b",
    dateSold: "2024-05-01",
    vehicleLabel: "2017 Chevrolet Malibu LT",
    exteriorColor: "White",
    stockNumber: "WC360-1011",
    buyer: "Capital City Auto",
    salePrice: 12450,
    grossProfit: 2615,
    paymentStatus: "paid",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m02",
    dateSold: "2024-05-02",
    vehicleLabel: "2019 Ford Fusion SE",
    exteriorColor: "Gray",
    stockNumber: "WC360-1012",
    buyer: "Pacific Auto Traders",
    salePrice: 10040,
    grossProfit: 2108,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m03",
    dateSold: "2024-05-03",
    vehicleLabel: "2020 Nissan Rogue SV",
    exteriorColor: "White",
    stockNumber: "WC360-1013",
    buyer: "Elite Motor Exchange",
    salePrice: 10040,
    grossProfit: 2108,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m04",
    dateSold: "2024-05-04",
    vehicleLabel: "2019 Hyundai Sonata SEL",
    exteriorColor: "Gray",
    stockNumber: "WC360-1015",
    buyer: "Precision Auto Group",
    salePrice: 12450,
    grossProfit: 2615,
    paymentStatus: "paid",
    paymentMethod: "check",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m05",
    dateSold: "2024-05-05",
    vehicleLabel: "2018 Toyota RAV4 LE",
    exteriorColor: "Silver",
    stockNumber: "WC360-1016",
    buyer: "Summit Wholesale",
    salePrice: 10040,
    grossProfit: 2108,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m06",
    dateSold: "2024-05-06",
    vehicleLabel: "2020 Jeep Cherokee Latitude",
    exteriorColor: "Black",
    stockNumber: "WC360-1018",
    buyer: "Elite Motor Exchange",
    salePrice: 18500,
    grossProfit: 3885,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m07",
    dateSold: "2024-05-07",
    vehicleLabel: "2019 GMC Terrain SLE",
    exteriorColor: "Black",
    stockNumber: "WC360-1017",
    buyer: "Valley Auto Network",
    salePrice: 10040,
    grossProfit: 2108,
    paymentStatus: "pending",
    paymentMethod: "floor_plan",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m08a",
    dateSold: "2024-05-08",
    vehicleLabel: "2021 Ford Explorer XLT",
    exteriorColor: "Silver",
    stockNumber: "WC360-1020",
    buyer: "Pacific Auto Traders",
    salePrice: 21875,
    grossProfit: 4594,
    paymentStatus: "paid",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
    vehicleImageUrl: TRUCK_IMG,
  },
  {
    id: "sv-m08b",
    dateSold: "2024-05-08",
    vehicleLabel: "2019 Ram 1500 Big Horn",
    exteriorColor: "Red",
    stockNumber: "WC360-1021",
    buyer: "Valley Auto Network",
    salePrice: 21875,
    grossProfit: 4594,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
    vehicleImageUrl: TRUCK_IMG,
  },
  {
    id: "sv-m09",
    dateSold: "2024-05-09",
    vehicleLabel: "2020 Hyundai Tucson SEL",
    exteriorColor: "Red",
    stockNumber: "WC360-1022",
    buyer: "Capital City Auto",
    salePrice: 10040,
    grossProfit: 2108,
    paymentStatus: "paid",
    paymentMethod: "check",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m10",
    dateSold: "2024-05-10",
    vehicleLabel: "2017 Jeep Wrangler Sport",
    exteriorColor: "Green",
    stockNumber: "WC360-1023",
    buyer: "Precision Auto Group",
    salePrice: 10039,
    grossProfit: 2108,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m13a",
    dateSold: "2024-05-13",
    vehicleLabel: "2020 Subaru Outback Premium",
    exteriorColor: "Green",
    stockNumber: "WC360-1024",
    buyer: "Summit Wholesale",
    salePrice: 12400,
    grossProfit: 2604,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m13b",
    dateSold: "2024-05-13",
    vehicleLabel: "2018 Mazda CX-5 Touring",
    exteriorColor: "Blue",
    stockNumber: "WC360-1025",
    buyer: "Metro Wholesale LLC",
    salePrice: 12400,
    grossProfit: 2604,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m13c",
    dateSold: "2024-05-13",
    vehicleLabel: "2019 Kia Sportage LX",
    exteriorColor: "White",
    stockNumber: "WC360-1026",
    buyer: "Chicago Motor Exchange",
    salePrice: 12400,
    grossProfit: 2604,
    paymentStatus: "pending",
    paymentMethod: "floor_plan",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m15",
    dateSold: "2024-05-15",
    vehicleLabel: "2019 Nissan Altima SV",
    exteriorColor: "Black",
    stockNumber: "WC360-1028",
    buyer: "ADESA Chicago",
    salePrice: 14200,
    grossProfit: 1450,
    paymentStatus: "paid",
    paymentMethod: "check",
    saleType: "auction",
    buyerType: "auction",
  },
  {
    id: "sv-m16",
    dateSold: "2024-05-16",
    vehicleLabel: "2020 Volkswagen Jetta S",
    exteriorColor: "Silver",
    stockNumber: "WC360-1029",
    buyer: "Manheim Dallas",
    salePrice: 14300,
    grossProfit: 3003,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "auction",
    buyerType: "auction",
  },
  {
    id: "sv-m18",
    dateSold: "2024-05-18",
    vehicleLabel: "2020 Toyota Camry SE",
    exteriorColor: "Gray",
    stockNumber: "WC360-1031",
    buyer: "Summit Auto Group",
    salePrice: 18500,
    grossProfit: 2100,
    paymentStatus: "pending",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m20a",
    dateSold: "2024-05-20",
    vehicleLabel: "2021 Honda Accord Sport",
    exteriorColor: "Red",
    stockNumber: "WC360-1035",
    buyer: "Manheim Dallas",
    salePrice: 21800,
    grossProfit: 2400,
    paymentStatus: "partial",
    paymentMethod: "floor_plan",
    saleType: "auction",
    buyerType: "auction",
  },
  {
    id: "sv-m20b",
    dateSold: "2024-05-20",
    vehicleLabel: "2019 Chevrolet Equinox LT",
    exteriorColor: "White",
    stockNumber: "WC360-1036",
    buyer: "ADESA Chicago",
    salePrice: 6850,
    grossProfit: 1439,
    paymentStatus: "paid",
    paymentMethod: "check",
    saleType: "auction",
    buyerType: "auction",
  },
  {
    id: "sv-m22",
    dateSold: "2024-05-22",
    vehicleLabel: "2019 Audi A4 Premium",
    exteriorColor: "Silver",
    stockNumber: "WC360-1039",
    buyer: "Chicago Motor Exchange",
    salePrice: 22450,
    grossProfit: 2850,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m24",
    dateSold: "2024-05-24",
    vehicleLabel: "2020 BMW 5 Series 530i",
    exteriorColor: "White",
    stockNumber: "WC360-1042",
    buyer: "Metro Wholesale LLC",
    salePrice: 25023,
    grossProfit: 3395,
    paymentStatus: "paid",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
    vehicleImageUrl: BMW_IMG,
    vin: "WAUENAF45KN012345",
  },
  {
    id: "sv-m11",
    dateSold: "2024-05-11",
    vehicleLabel: "2019 Subaru Forester Premium",
    exteriorColor: "Blue",
    stockNumber: "WC360-1027",
    buyer: "Metro Wholesale LLC",
    salePrice: 10040,
    grossProfit: 2108,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-m29",
    dateSold: "2024-05-29",
    vehicleLabel: "2018 Honda Civic LX",
    exteriorColor: "Blue",
    stockNumber: "WC360-1045",
    buyer: "Lakefront Motors",
    salePrice: 11950,
    grossProfit: 2510,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
];

const april2024Seeds: SeedRow[] = [
  {
    id: "sv-a01",
    dateSold: "2024-04-12",
    vehicleLabel: "2018 Ford F-150 XLT",
    exteriorColor: "White",
    stockNumber: "WC360-0998",
    buyer: "Summit Auto Group",
    salePrice: 19800,
    grossProfit: 4158,
    paymentStatus: "paid",
    paymentMethod: "wire_transfer",
    saleType: "wholesale",
    buyerType: "dealer",
    vehicleImageUrl: TRUCK_IMG,
  },
  {
    id: "sv-a02",
    dateSold: "2024-04-18",
    vehicleLabel: "2019 Honda CR-V EX",
    exteriorColor: "Gray",
    stockNumber: "WC360-0999",
    buyer: "Chicago Motor Exchange",
    salePrice: 17200,
    grossProfit: 3612,
    paymentStatus: "paid",
    paymentMethod: "ach",
    saleType: "wholesale",
    buyerType: "dealer",
  },
  {
    id: "sv-a03",
    dateSold: "2024-04-25",
    vehicleLabel: "2020 Chevrolet Silverado LT",
    exteriorColor: "Black",
    stockNumber: "WC360-1000",
    buyer: "Manheim Dallas",
    salePrice: 24500,
    grossProfit: 5145,
    paymentStatus: "paid",
    paymentMethod: "check",
    saleType: "auction",
    buyerType: "auction",
    vehicleImageUrl: TRUCK_IMG,
  },
];

const FEATURED_IDS = new Set([
  "sv-m15",
  "sv-m18",
  "sv-m20a",
  "sv-m22",
  "sv-m24",
]);

const LOCKED_PENDING_IDS = new Set(["sv-m06", "sv-m18"]);

const TARGET_SALES = 340_159;
const TARGET_PROFIT = 71_407;
const TARGET_PENDING_AMOUNT = 93_079;

function tuneMaySeeds(seeds: SeedRow[]): SeedRow[] {
  const tuned = seeds.map((seed) => ({ ...seed }));

  const lockedPendingSales = tuned
    .filter((s) => LOCKED_PENDING_IDS.has(s.id))
    .reduce((sum, s) => sum + s.salePrice, 0);
  const flexiblePending = tuned.filter(
    (s) => s.paymentStatus === "pending" && !LOCKED_PENDING_IDS.has(s.id),
  );

  if (flexiblePending.length > 0) {
    const perPending = Math.floor(
      (TARGET_PENDING_AMOUNT - lockedPendingSales) / flexiblePending.length,
    );
    const remainder =
      TARGET_PENDING_AMOUNT -
      lockedPendingSales -
      perPending * flexiblePending.length;

    flexiblePending.forEach((seed, index) => {
      seed.salePrice = perPending + (index === 0 ? remainder : 0);
      seed.grossProfit = Math.round(seed.salePrice * 0.21);
    });
  }

  const fixedSales = tuned
    .filter(
      (s) => FEATURED_IDS.has(s.id) || s.paymentStatus === "pending",
    )
    .reduce((sum, s) => sum + s.salePrice, 0);

  const adjustable = tuned.filter(
    (s) => !FEATURED_IDS.has(s.id) && s.paymentStatus === "paid",
  );

  const currentAdjustableSales = adjustable.reduce(
    (sum, s) => sum + s.salePrice,
    0,
  );

  const salesTargetForAdjustable = TARGET_SALES - fixedSales;
  const salesFactor =
    currentAdjustableSales > 0
      ? salesTargetForAdjustable / currentAdjustableSales
      : 1;

  adjustable.forEach((seed) => {
    seed.salePrice = Math.round(seed.salePrice * salesFactor);
    seed.grossProfit = Math.round(seed.grossProfit * salesFactor);
  });

  const currentProfit = tuned.reduce((sum, s) => sum + s.grossProfit, 0);
  const profitFactor =
    currentProfit > 0 ? TARGET_PROFIT / currentProfit : 1;

  tuned.forEach((seed) => {
    seed.grossProfit = Math.round(seed.grossProfit * profitFactor);
  });

  return tuned;
}

function buildCurrentMonthSeeds(): SeedRow[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = (d: number) => `${y}-${m}-${String(d).padStart(2, "0")}`;

  return [
    {
      id: "sv-cur-1", dateSold: day(2), vehicleLabel: "2022 Toyota Camry XSE", exteriorColor: "White",
      stockNumber: "WC360-2001", buyer: "Summit Auto Group", salePrice: 28500, grossProfit: 5130,
      paymentStatus: "paid", paymentMethod: "wire_transfer", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-2", dateSold: day(5), vehicleLabel: "2021 Honda Civic Touring", exteriorColor: "Blue",
      stockNumber: "WC360-2002", buyer: "Lakefront Motors", salePrice: 24200, grossProfit: 4356,
      paymentStatus: "paid", paymentMethod: "ach", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-3", dateSold: day(5), vehicleLabel: "2023 Ford Bronco Sport", exteriorColor: "Green",
      stockNumber: "WC360-2003", buyer: "Pacific Auto Traders", salePrice: 32100, grossProfit: 5778,
      paymentStatus: "pending", paymentMethod: "wire_transfer", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-4", dateSold: day(8), vehicleLabel: "2020 BMW X3 xDrive30i", exteriorColor: "Black",
      stockNumber: "WC360-2004", buyer: "Elite Motor Exchange", salePrice: 35800, grossProfit: 6444,
      paymentStatus: "paid", paymentMethod: "ach", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-5", dateSold: day(10), vehicleLabel: "2022 Hyundai Tucson Limited", exteriorColor: "Silver",
      stockNumber: "WC360-2005", buyer: "Capital City Auto", salePrice: 26800, grossProfit: 4824,
      paymentStatus: "paid", paymentMethod: "check", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-6", dateSold: day(12), vehicleLabel: "2021 Mazda CX-9 Carbon", exteriorColor: "Red",
      stockNumber: "WC360-2006", buyer: "Metro Wholesale LLC", salePrice: 29500, grossProfit: 5310,
      paymentStatus: "pending", paymentMethod: "wire_transfer", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-7", dateSold: day(15), vehicleLabel: "2023 Kia Telluride SX", exteriorColor: "White",
      stockNumber: "WC360-2007", buyer: "Valley Auto Network", salePrice: 38900, grossProfit: 7002,
      paymentStatus: "paid", paymentMethod: "wire_transfer", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-8", dateSold: day(18), vehicleLabel: "2020 Chevrolet Tahoe LT", exteriorColor: "Black",
      stockNumber: "WC360-2008", buyer: "Chicago Motor Exchange", salePrice: 41200, grossProfit: 7416,
      paymentStatus: "partial", paymentMethod: "floor_plan", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-9", dateSold: day(20), vehicleLabel: "2022 Nissan Pathfinder SL", exteriorColor: "Gray",
      stockNumber: "WC360-2009", buyer: "Manheim Dallas", salePrice: 31400, grossProfit: 5652,
      paymentStatus: "paid", paymentMethod: "ach", saleType: "auction", buyerType: "auction",
    },
    {
      id: "sv-cur-10", dateSold: day(22), vehicleLabel: "2021 Jeep Grand Cherokee L", exteriorColor: "Silver",
      stockNumber: "WC360-2010", buyer: "ADESA Chicago", salePrice: 33700, grossProfit: 6066,
      paymentStatus: "paid", paymentMethod: "check", saleType: "auction", buyerType: "auction",
    },
    {
      id: "sv-cur-11", dateSold: day(25), vehicleLabel: "2023 Tesla Model Y Long Range", exteriorColor: "White",
      stockNumber: "WC360-2011", buyer: "Precision Auto Group", salePrice: 47800, grossProfit: 8604,
      paymentStatus: "pending", paymentMethod: "wire_transfer", saleType: "wholesale", buyerType: "dealer",
    },
    {
      id: "sv-cur-12", dateSold: day(28), vehicleLabel: "2022 Subaru Outback Wilderness", exteriorColor: "Green",
      stockNumber: "WC360-2012", buyer: "Summit Wholesale", salePrice: 35200, grossProfit: 6336,
      paymentStatus: "paid", paymentMethod: "ach", saleType: "wholesale", buyerType: "dealer",
    },
  ];
}

export function buildSoldVehiclesMockData(): SoldVehicleRecord[] {
  const may = tuneMaySeeds(may2024Seeds).map((seed, i) => makeRecord(seed, i + 1));
  const april = april2024Seeds.map((seed, i) =>
    makeRecord(seed, i + may.length + 1),
  );
  const current = buildCurrentMonthSeeds().map((seed, i) =>
    makeRecord(seed, i + may.length + april.length + 1),
  );
  return [...may, ...april, ...current];
}

export const soldVehiclesMockData = buildSoldVehiclesMockData();
