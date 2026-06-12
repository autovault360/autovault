import type { Vehicle } from "@/lib/vehicles/types";

export type VehicleFeature = {
  label: string;
  value: string;
  icon: string;
};

export type VehicleExpense = {
  label: string;
  amount: number;
};

export type VehicleComparable = {
  name: string;
  year: number;
  mileage: number;
  price: number;
  daysInInventory: number;
};

export type ActivityLogEntry = {
  title: string;
  timestamp: string;
  description: string;
  color: string;
  icon: string;
  details?: Record<string, unknown> | null;
};

export type VehicleDetailExtras = {
  displayYear?: number;
  displayTrim?: string;
  displayMileage?: number;
  displayDaysInInventory?: number;
  images: string[];
  imageStoragePaths: string[];
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  doors: number;
  drivetrain: string;
  engine: string;
  transmission: string;
  fuelType: string;
  mpg: string;
  marketValue: number;
  features: VehicleFeature[];
  expenses: VehicleExpense[];
  dateAcquired: string;
  acquisitionCost: number;
  titleReceived: boolean;
  titleStatus: string;
  licensePlate: string;
  state: string;
  expirationDate: string;
  sellerAuction: string;
  purchaseType: string;
  odometerStatus: string;
  wholesalePrice: number;
  lastUpdated: string;
  notes: string;
  comparables: VehicleComparable[];
  activityLog: ActivityLogEntry[];
};

export type VehicleDetail = Vehicle &
  VehicleDetailExtras & {
    totalReconditioning: number;
    grossProfit: number;
    grossProfitPct: number;
    displayTitle: string;
  };

export type VehicleDetailsMap = Record<string, VehicleDetailExtras>;
