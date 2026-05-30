"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { lookupVehicle } from "@/lib/expenses/server/lookup-vehicle";
import {
  getVehicleDisplayName,
  type LinkedVehicleResult,
} from "@/lib/expenses/server/types";
import { formatMileage, getStatusStyle } from "@/lib/vehicles/types";

import type { VehicleStatus } from "@/lib/vehicles/types";

const SOLD_STATUSES = ["Sold", "Loss"];

function isSoldStatus(status: string): boolean {
  return SOLD_STATUSES.includes(status);
}

function toVehicleStatus(status: string): VehicleStatus {
  if (status === "Sold" || status === "Loss") return "Marked Sold";
  return status as VehicleStatus;
}

type SearchTab = "vin" | "stock" | "make";

const TABS: { id: SearchTab; label: string }[] = [
  { id: "vin", label: "Search by VIN" },
  { id: "stock", label: "Search by Stock #" },
  { id: "make", label: "Search by Make & Model" },
];

export default function LinkedVehicleSection({

  vehicle,

  onVehicleChange,

  readOnly,

}: {

  vehicle: LinkedVehicleResult | null;

  onVehicleChange: (vehicle: LinkedVehicleResult | null) => void;

  readOnly?: boolean;

}) {
  const [activeTab, setActiveTab] = useState<SearchTab>("vin");
  const [vinInput, setVinInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) setVinInput(vehicle.vin);
  }, [vehicle]);

  const handleTabClick = (tab: SearchTab) => {
    if (tab !== "vin") {
      toast.info("Coming soon");
      return;
    }
    setActiveTab(tab);
  };

  const handleLookup = async () => {
    if (activeTab !== "vin") return;
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
    <div className="rounded-[6px] border border-slate-700/70 bg-[#0b121c]/80 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        Linked Vehicle <span className="text-red-500">*</span>
      </p>

      {!readOnly && (
        <>
          <div className="mt-2.5 flex flex-wrap gap-4 border-b border-slate-800/80">

            {TABS.map((tab) => (

              <button

                key={tab.id}

                type="button"

                onClick={() => handleTabClick(tab.id)}

                className={cn(

                  "relative pb-2 text-[11.5px] font-medium transition-colors",

                  activeTab === tab.id

                    ? "text-blue-400 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-500"

                    : "text-slate-500 hover:text-slate-300",

                )}

              >

                {tab.label}

              </button>

            ))}

          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              theme="dark"
              value={vinInput}
              onChange={(e) => setVinInput(e.target.value.toUpperCase())}
              placeholder="Enter VIN number"
              className="h-9 flex-1 bg-slate-800/50 uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <Button
              type="button"
              className="h-9 shrink-0 bg-blue-600 px-4 text-[12px] hover:bg-blue-500"
              onClick={handleLookup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Looking up…
                </>
              ) : (
                "Lookup Vehicle"
              )}
            </Button>
          </div>
        </>
      )}

      {readOnly && !vehicle && (
        <p className="mt-2 text-[12px] text-slate-500">No vehicle linked</p>
      )}

      {vehicle && (
        <>
          <div className="relative mt-3 flex gap-3 rounded-md border border-slate-700/80 bg-[#101722] p-2.5">
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
            <div className="relative h-[52px] w-[72px] shrink-0 overflow-hidden rounded-md bg-slate-800">
              <Image
                src={vehicle.image}
                alt={getVehicleDisplayName(vehicle)}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-white">
                  {getVehicleDisplayName(vehicle)}
                </p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                    getStatusStyle(toVehicleStatus(vehicle.status)),
                  )}
                >
                  {vehicle.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Stock #{vehicle.stockNumber} • VIN: {vehicle.vin}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Mileage: {formatMileage(vehicle.mileage)} mi
                {vehicle.color !== "—" ? ` • Color: ${vehicle.color}` : ""}
              </p>
            </div>
          </div>
          {isSoldStatus(vehicle.status) && (
            <div className="mt-2 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-[12px] leading-relaxed text-red-300">
                This vehicle is marked as <strong>{vehicle.status.toLowerCase()}</strong>.
                Expenses cannot be added to sold or loss vehicles.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
