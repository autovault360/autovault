export type LinkedVehicleResult = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  stockNumber: string;
  vin: string;
  mileage: number;
  color: string;
  status: string;
  image: string;
};

type VehiclesJsonRow = {
  id: string;
  image: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  stockNumber: string;
  vin: string;
  mileage: number;
  status: string;
};

const DEMO_VEHICLES: LinkedVehicleResult[] = [
  {
    id: "demo-accord",
    year: 2020,
    make: "Honda",
    model: "Accord",
    trim: "LX",
    stockNumber: "1008",
    vin: "1HGCV1F14LA123456",
    mileage: 45210,
    color: "Silver",
    status: "In Stock",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=240&q=80",
  },
];

let vehiclesCache: VehiclesJsonRow[] | null = null;

async function loadVehicles(): Promise<VehiclesJsonRow[]> {
  if (vehiclesCache) return vehiclesCache;
  const res = await fetch("/vehicles.json");
  if (!res.ok) return [];
  vehiclesCache = (await res.json()) as VehiclesJsonRow[];
  return vehiclesCache;
}

function mapRow(row: VehiclesJsonRow): LinkedVehicleResult {
  return {
    id: row.id,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    stockNumber: row.stockNumber.replace(/^AV-/, ""),
    vin: row.vin,
    mileage: row.mileage,
    color: "—",
    status: row.status,
    image: row.image,
  };
}

export async function lookupVehicleByVin(
  vin: string,
): Promise<LinkedVehicleResult | null> {
  const normalized = vin.trim().toUpperCase();
  if (!normalized) return null;

  const demo = DEMO_VEHICLES.find((v) => v.vin.toUpperCase() === normalized);
  if (demo) return demo;

  const vehicles = await loadVehicles();
  const match = vehicles.find((v) => v.vin.toUpperCase() === normalized);
  return match ? mapRow(match) : null;
}

export function getVehicleDisplayName(vehicle: LinkedVehicleResult): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.trim();
}
