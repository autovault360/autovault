"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InventoryCenterHeader({
  onAddVehicle,
}: {
  onAddVehicle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-white">
          INVENTORY OVERVIEW
        </h2>
        <p className="text-[11px] text-slate-500">
          Manage wholesale inventory, titles, and pipeline status
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        className="h-8 bg-emerald-600 text-[11px] hover:bg-emerald-500"
        onClick={onAddVehicle}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Vehicle
      </Button>
    </div>
  );
}
