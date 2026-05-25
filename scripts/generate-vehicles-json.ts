import { writeFileSync } from "fs";
import { join } from "path";

type VehicleStatus = "In Stock" | "Needs Attention" | "Marked Sold";

type Vehicle = {
  id: string;
  image: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  stockNumber: string;
  vin: string;
  mileage: number;
  price: number;
  cost: number;
  daysInInventory: number;
  status: VehicleStatus;
  location: string;
  arrivalDate: string;
};

const images = [
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=120&q=70",
  "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=120&q=70",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=120&q=70",
  "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=120&q=70",
  "https://images.unsplash.com/photo-1494976388531-d1058498cdd5?w=120&q=70",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=70",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=120&q=70",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=120&q=70",
];

const locations = ["Main Lot", "Overflow Lot", "Service Bay", "Off-Site Storage"];

const designRows: Omit<Vehicle, "id" | "arrivalDate">[] = [
  {
    image: images[0],
    make: "BMW",
    model: "X5",
    trim: "xDrive40i M Sport",
    year: 2024,
    stockNumber: "AV-1021",
    vin: "5UXCR6C07M9F12345",
    mileage: 24560,
    price: 48750,
    cost: 38200,
    daysInInventory: 22,
    status: "In Stock",
    location: "Main Lot",
  },
  {
    image: images[1],
    make: "Mercedes-Benz",
    model: "E 350",
    trim: "Premium",
    year: 2020,
    stockNumber: "AV-1020",
    vin: "WDDZF4KBXKA567890",
    mileage: 18750,
    price: 31900,
    cost: 24500,
    daysInInventory: 52,
    status: "In Stock",
    location: "Main Lot",
  },
  {
    image: images[2],
    make: "Audi",
    model: "Q7",
    trim: "Premium Plus",
    year: 2021,
    stockNumber: "AV-1019",
    vin: "WA1LAAF72LD012345",
    mileage: 22100,
    price: 42500,
    cost: 33800,
    daysInInventory: 75,
    status: "Needs Attention",
    location: "Main Lot",
  },
  {
    image: images[3],
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    year: 2018,
    stockNumber: "AV-1018",
    vin: "3TMCZ5AN8JM123456",
    mileage: 68450,
    price: 18750,
    cost: 14200,
    daysInInventory: 95,
    status: "Needs Attention",
    location: "Main Lot",
  },
  {
    image: images[4],
    make: "Lexus",
    model: "RX 350",
    trim: "F Sport",
    year: 2025,
    stockNumber: "AV-1017",
    vin: "2T2HZMDA1MC123456",
    mileage: 5200,
    price: 52900,
    cost: 41500,
    daysInInventory: 12,
    status: "In Stock",
    location: "Main Lot",
  },
  {
    image: images[5],
    make: "Ford",
    model: "F-150",
    trim: "XLT SuperCrew",
    year: 2022,
    stockNumber: "AV-1016",
    vin: "1FTEW1EP5NFA12345",
    mileage: 31200,
    price: 38900,
    cost: 30100,
    daysInInventory: 38,
    status: "In Stock",
    location: "Main Lot",
  },
  {
    image: images[6],
    make: "Chevrolet",
    model: "Silverado",
    trim: "LT Trail Boss",
    year: 2021,
    stockNumber: "AV-1015",
    vin: "1GCUYDED5MZ123456",
    mileage: 42800,
    price: 36500,
    cost: 28900,
    daysInInventory: 61,
    status: "Needs Attention",
    location: "Overflow Lot",
  },
  {
    image: images[7],
    make: "Honda",
    model: "Accord",
    trim: "Sport",
    year: 2023,
    stockNumber: "AV-1014",
    vin: "1HGCV1F34PA123456",
    mileage: 15600,
    price: 27900,
    cost: 21800,
    daysInInventory: 18,
    status: "In Stock",
    location: "Main Lot",
  },
  {
    image: images[0],
    make: "Tesla",
    model: "Model Y",
    trim: "Long Range",
    year: 2024,
    stockNumber: "AV-1013",
    vin: "5YJ3E1EA8RF123456",
    mileage: 8900,
    price: 44900,
    cost: 37200,
    daysInInventory: 8,
    status: "In Stock",
    location: "Main Lot",
  },
  {
    image: images[1],
    make: "Porsche",
    model: "Macan",
    trim: "S",
    year: 2022,
    stockNumber: "AV-1012",
    vin: "WP1AB2A59NLA12345",
    mileage: 19800,
    price: 58900,
    cost: 48200,
    daysInInventory: 44,
    status: "Marked Sold",
    location: "Main Lot",
  },
];

const extraMakes = [
  { make: "Nissan", model: "Altima", trim: "SV" },
  { make: "Hyundai", model: "Sonata", trim: "SEL" },
  { make: "Kia", model: "Telluride", trim: "EX" },
  { make: "Subaru", model: "Outback", trim: "Limited" },
  { make: "Mazda", model: "CX-5", trim: "Touring" },
  { make: "Volkswagen", model: "Tiguan", trim: "SE R-Line" },
  { make: "Jeep", model: "Grand Cherokee", trim: "Limited" },
  { make: "Ram", model: "1500", trim: "Big Horn" },
  { make: "GMC", model: "Sierra", trim: "Elevation" },
  { make: "Cadillac", model: "XT5", trim: "Premium Luxury" },
];

function padVin(n: number) {
  return `GEN${String(n).padStart(14, "0")}`;
}

function formatLocalDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function thisMonthDate(day: number) {
  const now = new Date();
  return formatLocalDate(now.getFullYear(), now.getMonth(), day);
}

function priorMonthDate(day: number) {
  const now = new Date();
  return formatLocalDate(now.getFullYear(), now.getMonth() - 1, day);
}

const vehicles: Vehicle[] = designRows.map((row, i) => ({
  ...row,
  id: String(i + 1),
  arrivalDate: row.daysInInventory <= 25 ? thisMonthDate((i % 28) + 1) : priorMonthDate((i % 28) + 1),
}));

// Generate remaining 75 vehicles to reach 85 total
for (let i = 10; i < 85; i++) {
  const spec = extraMakes[i % extraMakes.length];
  const year = 2018 + (i % 8);
  const daysInInventory = [8, 15, 22, 28, 35, 42, 55, 68, 82, 14, 19, 26][i % 12];
  let status: VehicleStatus = "In Stock";
  if (i % 17 === 0) status = "Marked Sold";
  else if (daysInInventory >= 50) status = "Needs Attention";

  const cost = 12000 + (i % 20) * 1500;
  const price = cost + 4000 + (i % 10) * 800;

  vehicles.push({
    id: String(i + 1),
    image: images[i % images.length],
    make: spec.make,
    model: spec.model,
    trim: spec.trim,
    year,
    stockNumber: `AV-${1021 - i}`,
    vin: padVin(i + 1),
    mileage: 8000 + (i % 30) * 2500,
    price,
    cost,
    daysInInventory,
    status,
    location: locations[i % locations.length],
    arrivalDate:
      daysInInventory <= 25 || i < 22
        ? thisMonthDate((i % 28) + 1)
        : priorMonthDate((i % 28) + 1),
  });
}

// Normalize generated rows (index >= 10) toward design stat targets
const designCount = designRows.length;
const generated = vehicles.slice(designCount);

const monthPrefix = thisMonthDate(1).slice(0, 7);
const designNewArrivals = vehicles
  .slice(0, designCount)
  .filter((v) => v.arrivalDate?.startsWith(monthPrefix)).length;
const designAged = vehicles
  .slice(0, designCount)
  .filter((v) => v.daysInInventory > 25).length;
const designSold = vehicles
  .slice(0, designCount)
  .filter((v) => v.status === "Marked Sold").length;

const needNewArrivals = Math.max(0, 12 - designNewArrivals);
const needAged = Math.max(0, 28 - designAged);
const needSold = Math.max(0, 7 - designSold);

for (const v of generated) {
  v.arrivalDate = priorMonthDate(15);
  v.status = "In Stock";
  if (v.daysInInventory > 25) v.daysInInventory = 18;
}

let soldAssigned = 0;
for (const v of generated) {
  if (soldAssigned >= needSold) break;
  v.status = "Marked Sold";
  v.arrivalDate = thisMonthDate(soldAssigned + 1);
  soldAssigned++;
}

let arrivalsAssigned = 0;
for (const v of generated) {
  if (arrivalsAssigned >= needNewArrivals) break;
  if (v.status === "Marked Sold") continue;
  v.arrivalDate = thisMonthDate(arrivalsAssigned + 1);
  v.daysInInventory = 10 + (arrivalsAssigned % 15);
  arrivalsAssigned++;
}

let agedAssigned = 0;
for (const v of generated) {
  if (agedAssigned >= needAged) break;
  if (v.status === "Marked Sold") continue;
  v.daysInInventory = 30 + (agedAssigned % 50);
  if (v.daysInInventory >= 50) v.status = "Needs Attention";
  agedAssigned++;
}

// Scale generated in-stock rows toward design total value target
const inStockGenerated = generated.filter((v) => v.status !== "Marked Sold");
const designInStockValue = vehicles
  .slice(0, designCount)
  .filter((v) => v.status !== "Marked Sold")
  .reduce((sum, v) => sum + v.price, 0);
const targetValue = 1985430;
const generatedValue = inStockGenerated.reduce((sum, v) => sum + v.price, 0);
const remainingTarget = targetValue - designInStockValue;
const scale = generatedValue > 0 ? remainingTarget / generatedValue : 1;
for (const v of inStockGenerated) {
  v.price = Math.round(v.price * scale);
}

const outPath = join(process.cwd(), "public", "vehicles.json");
writeFileSync(outPath, JSON.stringify(vehicles, null, 2));
console.log(`Wrote ${vehicles.length} vehicles to ${outPath}`);
console.log({
  newArrivals: vehicles.filter((v) => v.arrivalDate?.startsWith(monthPrefix)).length,
  markedSold: vehicles.filter((v) => v.status === "Marked Sold").length,
  aged: vehicles.filter((v) => v.daysInInventory > 25).length,
  totalValue: vehicles
    .filter((v) => v.status !== "Marked Sold")
    .reduce((s, v) => s + v.price, 0),
});
