"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { lookupVehicle } from "@/lib/expenses/server/lookup-vehicle";
import {
  getVehicleDisplayName,
  type LinkedVehicleResult,
} from "@/lib/expenses/server/types";
import { formatMileage } from "@/lib/vehicles/types";
import { DEALER_ROUTES } from "@/lib/dealer/dashboard/navigation";

type Props = {
  linkedVehicle: LinkedVehicleResult | null;
  onVehicleChange: (vehicle: LinkedVehicleResult | null) => void;
  readOnly?: boolean;
  className?: string;
};

export default function VinVehicleLookup({
  linkedVehicle,
  onVehicleChange,
  readOnly = false,
  className,
}: Props) {
  const [vinInput, setVinInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (linkedVehicle) {
      setVinInput(linkedVehicle.vin);
    } else {
      setVinInput("");
    }
  }, [linkedVehicle]);

  const handleLookup = async () => {
    const query = vinInput.trim();
    if (!query) {
      toast.error("Enter a VIN to lookup.");
      return;
    }

    setLoading(true);
    try {
      const result = await lookupVehicle({ mode: "vin", query });
      if (!result.success) {
        toast.error(result.error ?? "No vehicle found for that VIN.");
        onVehicleChange(null);
        return;
      }
      onVehicleChange(result.vehicle);
      setVinInput(result.vehicle.vin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-medium text-slate-300">
        Select Vehicle <span className="text-red-500">*</span>
      </p>

      {!readOnly && !linkedVehicle && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            theme="dark"
            value={vinInput}
            onChange={(e) => setVinInput(e.target.value.toUpperCase())}
            placeholder="Enter VIN number"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleLookup())}
          />
          <Button
            type="button"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Lookup Vehicle
              </>
            )}
          </Button>
        </div>
      )}

      {readOnly && !linkedVehicle && (
        <p className="text-[12px] text-slate-500">No vehicle linked</p>
      )}

      {linkedVehicle && (
        <div className="relative flex gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5">
          {!readOnly && (
            <button
              type="button"
              onClick={() => onVehicleChange(null)}
              className="absolute right-2 top-2 rounded p-0.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
              aria-label="Remove linked vehicle"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="relative h-[48px] w-[68px] shrink-0 overflow-hidden rounded-md bg-slate-800">
            <Image
              src={linkedVehicle.image}
              alt={getVehicleDisplayName(linkedVehicle)}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="text-[13px] font-semibold text-white">
              {getVehicleDisplayName(linkedVehicle)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Stock #{linkedVehicle.stockNumber}
            </p>
            <p className="text-[11px] text-slate-400">
              VIN:{" "}
              <span className="font-medium text-emerald-400">{linkedVehicle.vin}</span>
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Mileage: {formatMileage(linkedVehicle.mileage)} mi
            </p>
          </div>
        </div>
      )}

      {!readOnly && (
        <Link
          href={`${DEALER_ROUTES.inventory}?add=true`}
          className="inline-block text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          + Add New Vehicle
        </Link>
      )}
    </div>
  );
}
