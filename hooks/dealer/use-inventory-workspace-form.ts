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
  stockNumber: "",
  acquisitionCost: 0,
  auctionFees: 0,
  transportationCosts: 0,
  reconRepairDetails: 0,
  storageFees: 0,
  dealerFees: 0,
  marketValue: 0,
};

function vehicleToFormValues(
  vehicle: WholesaleVehicle | null,
): InventoryWorkspaceValues {
  if (!vehicle) return emptyDefaults;
  return {
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    stockNumber: vehicle.stockNumber,
    acquisitionCost: vehicle.costs.acquisition,
    auctionFees: vehicle.costs.auction,
    transportationCosts: vehicle.costs.transport,
    reconRepairDetails: vehicle.costs.recon,
    storageFees: vehicle.costs.storage,
    dealerFees: vehicle.costs.dealerFees,
    marketValue: vehicle.marketValue,
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
