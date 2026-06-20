import type {
  ISalesRepSoldVehicle,
  ISalesRepSoldVehiclesData,
  SoldVehicleTab,
} from "./types";

const IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

const SUV_IMG =
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=80&h=60&fit=crop";

const TRUCK_IMG =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=80&h=60&fit=crop";

const SEDAN_IMG =
  "https://images.unsplash.com/photo-1621007947382-bcb3e7988faf?w=80&h=60&fit=crop";

const CUSTOMERS = [
  { name: "John Smith", phone: "(312) 555-0142" },
  { name: "Jane Doe", phone: "(773) 555-0198" },
  { name: "Robert Lee", phone: "(847) 555-0167" },
  { name: "Maria Garcia", phone: "(630) 555-0134" },
  { name: "David Kim", phone: "(224) 555-0189" },
  { name: "Lisa Wong", phone: "(312) 555-0176" },
  { name: "James Wilson", phone: "(773) 555-0155" },
  { name: "Amanda Clark", phone: "(847) 555-0123" },
  { name: "Chris Allen", phone: "(630) 555-0190" },
  { name: "Emily Chen", phone: "(224) 555-0144" },
  { name: "Michael Torres", phone: "(312) 555-0161" },
  { name: "Sarah Williams", phone: "(773) 555-0178" },
  { name: "Kevin Brown", phone: "(847) 555-0139" },
  { name: "Rachel Green", phone: "(630) 555-0152" },
  { name: "Tom Harris", phone: "(224) 555-0183" },
  { name: "Nina Patel", phone: "(312) 555-0168" },
  { name: "Brian Scott", phone: "(773) 555-0147" },
  { name: "Olivia Martin", phone: "(847) 555-0195" },
];

const VEHICLE_SPECS = [
  { year: 2021, make: "BMW", model: "X5", trim: "xDrive40i", stock: "AV1023", img: SUV_IMG, price: 42900, cost: 32100 },
  { year: 2022, make: "Mercedes-Benz", model: "C300", trim: "", stock: "AV1022", img: SEDAN_IMG, price: 28900, cost: 24450 },
  { year: 2022, make: "BMW", model: "X5", trim: "xDrive40i", stock: "AV1021", img: SUV_IMG, price: 45900, cost: 39800 },
  { year: 2020, make: "Honda", model: "Accord", trim: "EX-L", stock: "AV1020", img: SEDAN_IMG, price: 22400, cost: 18900 },
  { year: 2023, make: "Audi", model: "Q5", trim: "Premium Plus", stock: "AV1019", img: SUV_IMG, price: 36500, cost: 31200 },
  { year: 2023, make: "Honda", model: "Accord", trim: "Sport", stock: "AV1018", img: SEDAN_IMG, price: 26800, cost: 23000 },
  { year: 2022, make: "Toyota", model: "Camry", trim: "SE", stock: "AV1017", img: SEDAN_IMG, price: 24200, cost: 21000 },
  { year: 2024, make: "Ford", model: "F-150", trim: "XLT", stock: "AV1016", img: TRUCK_IMG, price: 42800, cost: 38550 },
  { year: 2022, make: "Chevrolet", model: "Silverado", trim: "LT", stock: "AV1015", img: TRUCK_IMG, price: 39200, cost: 34100 },
  { year: 2023, make: "Nissan", model: "Altima", trim: "SV", stock: "AV1014", img: SEDAN_IMG, price: 23900, cost: 21000 },
  { year: 2024, make: "Jeep", model: "Wrangler", trim: "Sport", stock: "AV1013", img: SUV_IMG, price: 38600, cost: 34000 },
  { year: 2023, make: "BMW", model: "3 Series", trim: "330i", stock: "AV1012", img: SEDAN_IMG, price: 41200, cost: 35000 },
  { year: 2022, make: "Ford", model: "Mustang", trim: "GT", stock: "AV1011", img: IMG, price: 33400, cost: 30000 },
  { year: 2024, make: "Tesla", model: "Model 3", trim: "", stock: "AV1010", img: SEDAN_IMG, price: 37800, cost: 33000 },
  { year: 2023, make: "Audi", model: "A4", trim: "Premium", stock: "AV1009", img: SEDAN_IMG, price: 35500, cost: 30000 },
  { year: 2022, make: "Honda", model: "CR-V", trim: "EX", stock: "AV1008", img: SUV_IMG, price: 27100, cost: 24000 },
  { year: 2021, make: "Lexus", model: "RX 350", trim: "", stock: "AV1007", img: SUV_IMG, price: 39800, cost: 35200 },
  { year: 2020, make: "Toyota", model: "RAV4", trim: "XLE", stock: "AV1006", img: SUV_IMG, price: 25600, cost: 22100 },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function buildVehicle(
  index: number,
  spec: (typeof VEHICLE_SPECS)[number],
  customer: (typeof CUSTOMERS)[number],
  soldDate: string,
  status: ISalesRepSoldVehicle["status"] = "completed",
): ISalesRepSoldVehicle {
  const grossProfit = spec.price - spec.cost;
  const commissionRate = 10;
  const commission = Math.round(grossProfit * (commissionRate / 100));

  return {
    id: `sv-${index}`,
    year: spec.year,
    make: spec.make,
    model: spec.model,
    trim: spec.trim,
    stockNumber: spec.stock,
    vehicleImageUrl: spec.img,
    customerName: customer.name,
    customerPhone: customer.phone,
    soldDate,
    soldPrice: spec.price,
    cost: spec.cost,
    grossProfit,
    commission,
    commissionRate,
    status,
    dealJacketId: `DJ-${1056 - index}`,
  };
}

function buildMockVehicles(): ISalesRepSoldVehicle[] {
  const vehicles: ISalesRepSoldVehicle[] = [];
  let index = 0;

  // This month �€” 18 vehicles (June 2026)
  for (let i = 0; i < 18; i++) {
    const spec = VEHICLE_SPECS[i % VEHICLE_SPECS.length]!;
    const customer = CUSTOMERS[i % CUSTOMERS.length]!;
    const day = Math.max(1, 28 - i);
    const status: ISalesRepSoldVehicle["status"] =
      i < 14 ? "completed" : i < 16 ? "pending" : "processing";
    vehicles.push(
      buildVehicle(index++, spec, customer, isoDate(2026, 6, day), status),
    );
  }

  // Last month �€” 15 vehicles (May 2026)
  for (let i = 0; i < 15; i++) {
    const spec = VEHICLE_SPECS[(i + 3) % VEHICLE_SPECS.length]!;
    const customer = CUSTOMERS[(i + 2) % CUSTOMERS.length]!;
    const day = Math.max(1, 28 - i);
    vehicles.push(
      buildVehicle(index++, spec, customer, isoDate(2026, 5, day)),
    );
  }

  // Rest of year �€” 63 vehicles (Jan�€“Apr 2026)
  for (let i = 0; i < 63; i++) {
    const spec = VEHICLE_SPECS[i % VEHICLE_SPECS.length]!;
    const customer = CUSTOMERS[i % CUSTOMERS.length]!;
    const month = (i % 4) + 1;
    const day = (i % 27) + 1;
    vehicles.push(
      buildVehicle(index++, spec, customer, isoDate(2026, month, day)),
    );
  }

  return vehicles;
}

export const SALES_REP_SOLD_VEHICLES_MOCK: ISalesRepSoldVehicle[] =
  buildMockVehicles();

export function getSoldVehicleTabCounts(
  vehicles: ISalesRepSoldVehicle[],
): Record<SoldVehicleTab, number> {
  const thisMonth = vehicles.filter((v) => v.soldDate.startsWith("2026-06")).length;
  const lastMonth = vehicles.filter((v) => v.soldDate.startsWith("2026-05")).length;
  const thisYear = vehicles.filter((v) => v.soldDate.startsWith("2026")).length;

  return {
    all: thisMonth,
    this_month: thisMonth,
    last_month: lastMonth,
    this_year: thisYear,
    custom: 0,
  };
}

export function getSoldVehiclesMockData(): ISalesRepSoldVehiclesData {
  return {
    vehicles: SALES_REP_SOLD_VEHICLES_MOCK,
    tabCounts: getSoldVehicleTabCounts(SALES_REP_SOLD_VEHICLES_MOCK),
  };
}
