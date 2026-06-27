import type { AddVehicleFormValues } from "./schemas";
import { todayISO } from "../utils";

export function buildAddVehicleDefaults(): AddVehicleFormValues {
  return {
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    bodyStyle: "",
    mileage: 0,
    exteriorColor: "",
    interiorColor: "",
    driveType: "",
    photos: [],
    stockNumber: "",
    lotLocation: "",
    acquisitionDate: todayISO(),
    titleReceived: true,
    licensePlate: "",
    state: "",
    expirationDate: "",
    sellerAuction: "",
    purchaseType: "",
    acquisitionCost: 0,
    registrationFees: 0,
    auctionFees: 0,
    askingPrice: 0,
    marketValue: 0,
    wholesalePrice: 0,
    reconditioningCost: 0,
    odometerStatus: "",
    fuelType: "",
    notes: "",
    addAnother: false,
  };
}

export function computeTotalInvested(
  acquisitionCost: number,
  registrationFees: number,
  auctionFees: number,
  reconditioningCost: number,
) {
  return acquisitionCost + registrationFees + auctionFees + reconditioningCost;
}


