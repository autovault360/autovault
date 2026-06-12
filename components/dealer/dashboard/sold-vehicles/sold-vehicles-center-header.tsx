"use client";

import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOLD_VEHICLE_PERIOD_PRESETS } from "@/lib/dealer/dashboard/sold-vehicle-constants";
import { PageHeaderTitle } from "@/components/layout/page-header-title";

export default function SoldVehiclesCenterHeader({
  periodPreset,
  onPeriodChange,
  onAddSoldVehicle,
  showTitle = true,
}: {
  periodPreset: string;
  onPeriodChange: (value: string) => void;
  onAddSoldVehicle: () => void;
  showTitle?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {showTitle ? (
        <PageHeaderTitle
          as="h2"
          title="Sold Vehicles Center"
          subtitle="Manage wholesale sold vehicle records and sale documentation"
          subtitleClassName="text-[11px]"
        />
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={periodPreset} onValueChange={onPeriodChange}>
          <SelectTrigger
            theme="dark"
            className="h-8 w-[130px] border-[#1e293b] bg-card text-[11px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent theme="dark">
            {SOLD_VEHICLE_PERIOD_PRESETS.map((preset) => (
              <SelectItem
                key={preset.value}
                value={preset.value}
                className="text-[11px]"
              >
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" onClick={onAddSoldVehicle}>
          <ButtonIcon tone="default">
            <Plus />
          </ButtonIcon>
          Add Sold Vehicle
        </Button>
      </div>
    </div>
  );
}
