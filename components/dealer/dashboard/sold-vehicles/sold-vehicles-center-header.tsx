"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOLD_VEHICLE_PERIOD_PRESETS } from "@/lib/dealer/dashboard/sold-vehicle-constants";

export default function SoldVehiclesCenterHeader({
  periodPreset,
  onPeriodChange,
  onAddSoldVehicle,
}: {
  periodPreset: string;
  onPeriodChange: (value: string) => void;
  onAddSoldVehicle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-[17px] font-bold tracking-tight text-white">
        Sold Vehicles Center
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={periodPreset} onValueChange={onPeriodChange}>
          <SelectTrigger
            theme="dark"
            className="h-8 w-[130px] border-[#1e293b] bg-card text-[11px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent theme="dark" className="border-[#1e293b] bg-card">
            {SOLD_VEHICLE_PERIOD_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value} theme="dark">
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={onAddSoldVehicle}
          className="h-8 gap-1.5 bg-emerald-600 px-3 text-[11px] hover:bg-emerald-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Sold Vehicle
        </Button>
      </div>
    </div>
  );
}
