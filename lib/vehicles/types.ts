import {
  BODY_STYLES,
  DRIVE_TYPES,
  EXTERIOR_COLORS,
  FUEL_TYPES,
  INTERIOR_COLORS,
  LOT_LOCATIONS,
  TITLE_STATUSES,
  VEHICLE_MAKES,
  VEHICLE_MODELS,
} from "@/lib/vehicles/actions/add-vehicle/options";

export type VehicleStatus = "In Stock" | "Needs Attention" | "Marked Sold";

export type Vehicle = {
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
  arrivalDate?: string;
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMileage(value: number): string {
  if (value === 0) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

const OPTION_MAP: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  bodyStyle: BODY_STYLES,
  drivetrain: DRIVE_TYPES,
  exteriorColor: EXTERIOR_COLORS,
  interiorColor: INTERIOR_COLORS,
  fuelType: FUEL_TYPES,
  location: LOT_LOCATIONS,
  titleStatus: TITLE_STATUSES,
};

export function formatField(field: string, value: string, make?: string): string {
  const options = OPTION_MAP[field];
  if (options) {
    return options.find((o) => o.value === value)?.label ?? value;
  }
  if (field === "make") {
    return VEHICLE_MAKES.find((o) => o.value === value)?.label ?? value;
  }
  if (field === "model" && make) {
    return (
      VEHICLE_MODELS[make]?.find((o) => o.value === value)?.label ?? value
    );
  }
  return value;
}

export function getDaysColor(days: number): string {
  if (days < 30) return "text-emerald-400";
  if (days < 50) return "text-amber-400";
  return "text-red-400";
}

export function getStatusStyle(status: VehicleStatus): string {
  switch (status) {
    case "In Stock":
      return "bg-emerald-500/15 text-emerald-400";
    case "Needs Attention":
      return "bg-amber-500/15 text-amber-400";
    case "Marked Sold":
      return "bg-red-500/15 text-red-400";
  }
}

export function getVehicleName(vehicle: Vehicle): string {
  return `${vehicle.year} ${formatField("make", vehicle.make)} ${formatField("model", vehicle.model, vehicle.make)}`;
}

export function isNewArrivalThisMonth(vehicle: Vehicle): boolean {
  if (!vehicle.arrivalDate) return false;
  const [year, month] = vehicle.arrivalDate.split("-").map(Number);
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

export function isSoldThisMonth(vehicle: Vehicle): boolean {
  return vehicle.status === "Marked Sold" && isNewArrivalThisMonth(vehicle);
}

export type VehicleStats = {
  totalInventory: number;
  newArrivals: number;
  agedUnits: number;
  totalValue: number;
  markedSold: number;
};

export function computeVehicleStats(vehicles: Vehicle[]): VehicleStats {
  const inStock = vehicles.filter((v) => v.status !== "Marked Sold");

  return {
    totalInventory: vehicles.length,
    newArrivals: vehicles.filter(
      (v) => v.status !== "Marked Sold" && isNewArrivalThisMonth(v),
    ).length,
    agedUnits: vehicles.filter((v) => v.daysInInventory > 25).length,
    totalValue: inStock.reduce((sum, v) => sum + v.price, 0),
    markedSold: vehicles.filter((v) => v.status === "Marked Sold").length,
  };
}
