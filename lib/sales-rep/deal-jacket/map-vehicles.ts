import type { IVehicleCard } from "@/lib/sales-rep/dashboard/types";
import type { ILinkedVehicle } from "./types";

export function vehicleCardToLinked(vehicle: IVehicleCard): ILinkedVehicle {
  return {
    id: vehicle.stockNo,
    stockNo: vehicle.stockNo,
    vin: vehicle.vin,
    yearModel: vehicle.yearModel,
    mileage: vehicle.mileage.replace(/\s*mi$/i, ""),
    purchaseCost: Math.round(vehicle.price * 0.75),
    askingPrice: vehicle.price,
    imageUrl: vehicle.imageUrl,
  };
}

export function inventoryToLinkedVehicles(
  inventory: IVehicleCard[],
): ILinkedVehicle[] {
  return inventory.map(vehicleCardToLinked);
}
