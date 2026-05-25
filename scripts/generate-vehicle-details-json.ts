import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

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
  status: string;
  location: string;
  arrivalDate?: string;
};

const galleryImages = [
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  "https://images.unsplash.com/photo-1617814076367-b759c2992e52?w=800&q=80",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  "https://images.unsplash.com/photo-1583121270602-7674030a0a2?w=800&q=80",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
];

const defaultFeatures = [
  { label: "Backup Camera", value: "Yes", icon: "camera" },
  { label: "Bluetooth", value: "Yes", icon: "bluetooth" },
  { label: "Navigation", value: "Yes", icon: "navigation" },
  { label: "Heated Seats", value: "Yes", icon: "flame" },
  { label: "Sunroof", value: "Panoramic", icon: "sun" },
  { label: "Leather Seats", value: "Yes", icon: "armchair" },
  { label: "Apple CarPlay", value: "Yes", icon: "smartphone" },
  { label: "Android Auto", value: "Yes", icon: "smartphone" },
  { label: "Keyless Entry", value: "Yes", icon: "key" },
  { label: "Remote Start", value: "Yes", icon: "radio" },
  { label: "Blind Spot Monitor", value: "Yes", icon: "eye" },
  { label: "Lane Departure Warning", value: "Yes", icon: "alert-triangle" },
  { label: "Adaptive Cruise Control", value: "Yes", icon: "gauge" },
  { label: "Parking Sensors", value: "Yes", icon: "radar" },
  { label: "Premium Audio", value: "Yes", icon: "volume-2" },
  { label: "Third Row Seating", value: "No", icon: "users" },
  { label: "Tow Package", value: "Yes", icon: "truck" },
  { label: "Roof Rails", value: "Yes", icon: "grip-horizontal" },
];

const designVehicle1 = {
  displayYear: 2021,
  displayTrim: "xDrive40i",
  displayMileage: 24560,
  displayDaysInInventory: 15,
  images: galleryImages,
  bodyStyle: "SUV",
  exteriorColor: "Alpine White",
  interiorColor: "Black",
  doors: 4,
  drivetrain: "AWD",
  engine: "3.0L I6 Turbo",
  transmission: "8-Speed Automatic",
  fuelType: "Gasoline",
  mpg: "20/26",
  marketValue: 52800,
  features: defaultFeatures,
  expenses: [
    { label: "Detailing", amount: 350 },
    { label: "Paint Correction", amount: 450 },
    { label: "Tire Rotation", amount: 150 },
    { label: "Floor Mats", amount: 100 },
  ],
  dateAcquired: "May 20, 2025",
  acquisitionCost: 38200,
  titleStatus: "Clean",
  lastUpdated: "May 15, 2025",
  notes:
    "Excellent condition vehicle with full service history. One owner, no accidents reported. Premium package with panoramic sunroof and upgraded wheels. Ready for immediate sale.",
  comparables: [
    {
      name: "2022 BMW X5 xDrive40i",
      year: 2022,
      mileage: 18200,
      price: 52900,
      daysInInventory: 22,
    },
    {
      name: "2023 BMW X5 M50i",
      year: 2023,
      mileage: 12400,
      price: 68500,
      daysInInventory: 18,
    },
    {
      name: "2024 Mercedes-Benz GLE 350",
      year: 2024,
      mileage: 8900,
      price: 59800,
      daysInInventory: 12,
    },
    {
      name: "2020 Audi Q7 Premium Plus",
      year: 2020,
      mileage: 32100,
      price: 44500,
      daysInInventory: 35,
    },
  ],
  activityLog: [
    {
      title: "Vehicle Added",
      timestamp: "May 1, 2025 at 9:30 AM",
      description: "Vehicle added to inventory by John Dealer",
      color: "emerald",
      icon: "car",
    },
    {
      title: "Photos Added",
      timestamp: "May 2, 2025 at 2:15 PM",
      description: "10 photos uploaded to vehicle gallery",
      color: "blue",
      icon: "camera",
    },
    {
      title: "Pricing Updated",
      timestamp: "May 5, 2025 at 11:00 AM",
      description: "Price changed from $49,500 to $48,750",
      color: "orange",
      icon: "dollar-sign",
    },
    {
      title: "Expense Added",
      timestamp: "May 8, 2025 at 4:45 PM",
      description: "Detailing expense of $350 added",
      color: "purple",
      icon: "receipt",
    },
    {
      title: "Status Updated",
      timestamp: "May 10, 2025 at 10:20 AM",
      description: "Status changed to In Stock",
      color: "emerald",
      icon: "check-circle",
    },
  ],
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "Jan 1, 2025";
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

function generateForVehicle(v: Vehicle, index: number) {
  const expenseTotal = 800 + (index % 5) * 150;
  const expenses = [
    { label: "Detailing", amount: Math.round(expenseTotal * 0.35) },
    { label: "Paint Correction", amount: Math.round(expenseTotal * 0.3) },
    { label: "Tire Rotation", amount: Math.round(expenseTotal * 0.2) },
    { label: "Floor Mats", amount: Math.round(expenseTotal * 0.15) },
  ];

  return {
    images: [
      v.image.replace("w=120", "w=800"),
      ...galleryImages.slice(1, 6),
      ...galleryImages.slice(6, 10),
    ],
    bodyStyle: index % 3 === 0 ? "SUV" : index % 3 === 1 ? "Sedan" : "Truck",
    exteriorColor: ["Alpine White", "Jet Black", "Silver Metallic", "Blue Metallic"][index % 4],
    interiorColor: ["Black", "Cognac", "Gray"][index % 3],
    doors: index % 2 === 0 ? 4 : 2,
    drivetrain: index % 2 === 0 ? "AWD" : "FWD",
    engine: index % 2 === 0 ? "3.0L V6 Turbo" : "2.0L I4 Turbo",
    transmission: "8-Speed Automatic",
    fuelType: "Gasoline",
    mpg: `${18 + (index % 4)}/${25 + (index % 5)}`,
    marketValue: Math.round(v.price * 1.08),
    features: defaultFeatures.map((f, fi) => ({
      ...f,
      value: fi % 4 === 0 ? "No" : f.value,
    })),
    expenses,
    dateAcquired: formatDate(v.arrivalDate),
    acquisitionCost: v.cost,
    titleStatus: "Clean",
    lastUpdated: formatDate(v.arrivalDate),
    notes: `Well-maintained ${v.year} ${v.make} ${v.model} in ${v.status.toLowerCase()} status. Full service records available. Contact sales for additional details.`,
    comparables: [
      {
        name: `${v.year - 1} ${v.make} ${v.model}`,
        year: v.year - 1,
        mileage: v.mileage + 5000,
        price: v.price - 2000,
        daysInInventory: v.daysInInventory + 5,
      },
      {
        name: `${v.year} ${v.make} ${v.model} Sport`,
        year: v.year,
        mileage: v.mileage - 3000,
        price: v.price + 3500,
        daysInInventory: Math.max(5, v.daysInInventory - 3),
      },
      {
        name: `${v.year + 1} ${v.make} ${v.model}`,
        year: v.year + 1,
        mileage: Math.max(1000, v.mileage - 8000),
        price: v.price + 8000,
        daysInInventory: 10,
      },
      {
        name: `${v.year - 2} ${v.make} Base`,
        year: v.year - 2,
        mileage: v.mileage + 15000,
        price: v.price - 6000,
        daysInInventory: v.daysInInventory + 12,
      },
    ],
    activityLog: [
      {
        title: "Vehicle Added",
        timestamp: `${formatDate(v.arrivalDate)} at 9:30 AM`,
        description: "Vehicle added to inventory by John Dealer",
        color: "emerald",
        icon: "car",
      },
      {
        title: "Photos Added",
        timestamp: `${formatDate(v.arrivalDate)} at 2:15 PM`,
        description: "8 photos uploaded to vehicle gallery",
        color: "blue",
        icon: "camera",
      },
      {
        title: "Pricing Updated",
        timestamp: `${formatDate(v.arrivalDate)} at 11:00 AM`,
        description: `Price set to $${v.price.toLocaleString()}`,
        color: "orange",
        icon: "dollar-sign",
      },
      {
        title: "Expense Added",
        timestamp: `${formatDate(v.arrivalDate)} at 4:45 PM`,
        description: `Detailing expense of $${expenses[0].amount} added`,
        color: "purple",
        icon: "receipt",
      },
      {
        title: "Status Updated",
        timestamp: `${formatDate(v.arrivalDate)} at 10:20 AM`,
        description: `Status set to ${v.status}`,
        color: "emerald",
        icon: "check-circle",
      },
    ],
  };
}

const vehiclesPath = join(process.cwd(), "public", "vehicles.json");
const vehicles = JSON.parse(readFileSync(vehiclesPath, "utf8")) as Vehicle[];

const details: Record<string, unknown> = {};
for (const v of vehicles) {
  details[v.id] = v.id === "1" ? designVehicle1 : generateForVehicle(v, Number(v.id));
}

const outPath = join(process.cwd(), "public", "vehicle-details.json");
writeFileSync(outPath, JSON.stringify(details, null, 2));
console.log(`Wrote detail overlays for ${Object.keys(details).length} vehicles`);
