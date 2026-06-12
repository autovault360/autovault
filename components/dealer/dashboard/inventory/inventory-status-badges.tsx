"use client";

import { cn } from "@/lib/utils";
import {
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  TITLE_STATUS_LABELS,
  TITLE_STATUS_STYLES,
} from "@/lib/dealer/inventory/inventory-constants";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";

function Badge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function InventoryStatusBadge({
  status,
}: {
  status: WholesaleVehicle["inventoryStatus"];
}) {
  return (
    <Badge
      label={INVENTORY_STATUS_LABELS[status]}
      className={INVENTORY_STATUS_STYLES[status]}
    />
  );
}

export function TitleStatusBadge({
  status,
}: {
  status: WholesaleVehicle["titleStatus"];
}) {
  if (status !== "missing") return null;
  return (
    <Badge
      label={TITLE_STATUS_LABELS[status]}
      className={TITLE_STATUS_STYLES[status]}
    />
  );
}

export function PaymentStatusBadge({
  status,
}: {
  status: NonNullable<WholesaleVehicle["paymentStatus"]>;
}) {
  return (
    <Badge
      label={PAYMENT_STATUS_LABELS[status]}
      className={PAYMENT_STATUS_STYLES[status]}
    />
  );
}

export function InventoryStatusBadges({
  vehicle,
}: {
  vehicle: WholesaleVehicle;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <InventoryStatusBadge status={vehicle.inventoryStatus} />
      <TitleStatusBadge status={vehicle.titleStatus} />
    </div>
  );
}
