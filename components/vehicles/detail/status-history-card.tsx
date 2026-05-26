import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { formatCurrency, formatField, getStatusStyle } from "@/lib/vehicles/types";
import { cn } from "@/lib/utils";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";

export default function StatusHistoryCard({
  vehicle,
}: {
  vehicle: VehicleDetail;
}) {
  return (
    <DetailCard>
      <DetailCardHead title="STATUS & HISTORY" />
      <div className="space-y-0.5">
        <DetailRow
          label="Status"
          value={
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                getStatusStyle(vehicle.status),
              )}
            >
              {vehicle.status}
            </span>
          }
        />
        <DetailRow
          label="Days in Inventory"
          value={
            <span className="inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              {vehicle.daysInInventory}
            </span>
          }
        />
        <DetailRow label="Date Acquired" value={vehicle.dateAcquired} />
        <DetailRow
          label="Acquisition Cost"
          value={formatCurrency(vehicle.acquisitionCost)}
        />
        <DetailRow label="Title Status" value={formatField("titleStatus", vehicle.titleStatus)} />
        <DetailRow label="Last Updated" value={vehicle.lastUpdated} />
      </div>
    </DetailCard>
  );
}
