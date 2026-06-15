"use client";

import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryWorkspaceSchema,
  type InventoryWorkspaceValues,
} from "@/lib/dealer/dashboard/schemas";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";

const emptyDefaults: InventoryWorkspaceValues = {
  vin: "",
  year: new Date().getFullYear(),
  make: "",
  model: "",
  trim: "",
  stockNumber: "",
  mileage: undefined,
  lotLocation: "",
  condition: undefined,
  acquisitionDate: new Date().toISOString().slice(0, 10),
  acquisitionCost: 0,
  auctionFees: 0,
  transportationCosts: 0,
  reconRepairDetails: 0,
  storageFees: 0,
  dealerFees: 0,
  marketValue: 0,
  wholesaleValue: 0,
  titleReceived: true,
  inventoryStatus: "in_stock",
  odometerStatus: "",
  notes: "",
  timesInAuction: 0,
  nextAuctionDate: "",
  lastAuctionDate: "",
  soldAt: "",
  soldPrice: undefined,
  arbitrationReason: "",
  arbitrationBuyerDealer: "",
};

function vehicleToFormValues(
  vehicle: WholesaleVehicle | null,
): InventoryWorkspaceValues {
  if (!vehicle) return emptyDefaults;
  return {
    vehicleId: vehicle.id,
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? "",
    stockNumber: vehicle.stockNumber,
    mileage: vehicle.mileage,
    lotLocation: vehicle.location,
    condition: vehicle.condition,
    acquisitionDate: vehicle.purchaseDate || emptyDefaults.acquisitionDate,
    acquisitionCost: vehicle.costs.acquisition,
    auctionFees: vehicle.costs.auction,
    transportationCosts: vehicle.costs.transport,
    reconRepairDetails: vehicle.costs.recon,
    storageFees: vehicle.costs.storage,
    dealerFees: vehicle.costs.dealerFees,
    marketValue: vehicle.marketValue,
    wholesaleValue: vehicle.wholesaleValue,
    titleReceived: vehicle.titleStatus === "received",
    inventoryStatus: vehicle.inventoryStatus,
    odometerStatus: vehicle.odometerStatus ?? "",
    notes: vehicle.notes ?? "",
    timesInAuction: vehicle.timesInAuction ?? 0,
    nextAuctionDate: vehicle.nextAuctionDate ?? "",
    lastAuctionDate: vehicle.lastAuctionDate ?? "",
    soldAt: vehicle.soldAt ?? "",
    soldPrice: vehicle.soldPrice,
    arbitrationReason: vehicle.arbitrationReason ?? "",
    arbitrationBuyerDealer: vehicle.arbitrationBuyerDealer ?? "",
  };
}

export function useInventoryWorkspaceForm(vehicle: WholesaleVehicle | null) {
  const form = useForm<InventoryWorkspaceValues>({
    resolver: zodResolver(
      inventoryWorkspaceSchema,
    ) as Resolver<InventoryWorkspaceValues>,
    defaultValues: vehicleToFormValues(vehicle),
    mode: "onBlur",
  });

  return form;
}

export function resetInventoryForm(
  form: UseFormReturn<InventoryWorkspaceValues>,
  vehicle: WholesaleVehicle | null,
) {
  form.reset(vehicleToFormValues(vehicle));
}

export function buildWholesaleVehicleFromForm(
  values: InventoryWorkspaceValues,
): WholesaleVehicle {
  const costs = {
    acquisition: values.acquisitionCost,
    auction: values.auctionFees,
    transport: values.transportationCosts,
    recon: values.reconRepairDetails,
    storage: values.storageFees,
    dealerFees: values.dealerFees,
  };
  const wholesaleValue = values.wholesaleValue ?? values.marketValue;
  const totalCost =
    costs.acquisition +
    costs.auction +
    costs.transport +
    costs.recon +
    costs.storage +
    costs.dealerFees;

  return {
    id: values.vehicleId ?? "preview",
    vin: values.vin,
    year: values.year,
    make: values.make,
    model: values.model,
    trim: values.trim,
    stockNumber: values.stockNumber,
    mileage: values.mileage,
    costs,
    marketValue: values.marketValue,
    wholesaleValue,
    status:
      values.inventoryStatus === "sold"
        ? "sold"
        : values.inventoryStatus === "pending_sale"
          ? "pending"
          : "in_inventory",
    inventoryStatus: values.inventoryStatus,
    titleStatus: values.titleReceived ? "received" : "missing",
    condition: values.condition,
    location: values.lotLocation ?? "",
    daysInLot: 0,
    purchaseDate: values.acquisitionDate ?? "",
    profit: wholesaleValue - totalCost,
    timesInAuction: values.timesInAuction,
    nextAuctionDate: values.nextAuctionDate,
    lastAuctionDate: values.lastAuctionDate,
    soldAt: values.soldAt,
    soldPrice: values.soldPrice,
    odometerStatus: values.odometerStatus,
    notes: values.notes,
  };
}
