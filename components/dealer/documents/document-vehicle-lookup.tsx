"use client";

import VinVehicleLookup from "@/components/shared/vin-vehicle-lookup";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";

export default function DocumentVehicleLookup({
  vehicle,
  onVehicleChange,
  readOnly,
}: {
  vehicle: LinkedVehicleResult | null;
  onVehicleChange: (vehicle: LinkedVehicleResult | null) => void;
  readOnly?: boolean;
}) {
  return (
    <VinVehicleLookup
      linkedVehicle={vehicle}
      onVehicleChange={onVehicleChange}
      readOnly={readOnly}
    />
  );
}
