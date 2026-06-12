"use client";

import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";
import { PageHeaderTitle } from "@/components/layout/page-header-title";

export default function InventoryCenterHeader({
  onAddVehicle,
}: {
  onAddVehicle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <PageHeaderTitle
        as="h2"
        title="Inventory Overview"
        subtitle="Manage wholesale inventory, titles, and pipeline status"
        subtitleClassName="text-[11px]"
      />
      <Button type="button" size="sm" onClick={onAddVehicle}>
        <ButtonIcon tone="default">
          <Plus />
        </ButtonIcon>
        Add Vehicle
      </Button>
    </div>
  );
}
