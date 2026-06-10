"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCommissionCurrency, formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import {
  formatSoldDate,
  getVehicleLabel,
} from "@/lib/sales-rep/sold-vehicles/calculations";
import type { ISalesRepSoldVehicle } from "@/lib/sales-rep/sold-vehicles/types";
import SoldVehiclesStatusBadge from "./sold-vehicles-status-badge";

type Props = {
  vehicle: ISalesRepSoldVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SoldVehiclesDetailDialog({
  vehicle,
  open,
  onOpenChange,
}: Props) {
  if (!vehicle) return null;

  const rows = [
    { label: "Customer", value: vehicle.customerName },
    { label: "Phone", value: vehicle.customerPhone },
    { label: "Sold Date", value: formatSoldDate(vehicle.soldDate) },
    { label: "Stock #", value: vehicle.stockNumber },
    { label: "Deal Jacket", value: vehicle.dealJacketId },
    { label: "Sold Price", value: formatCommissionPrice(vehicle.soldPrice) },
    { label: "Cost", value: formatCommissionPrice(vehicle.cost) },
    { label: "Gross Profit", value: formatCommissionPrice(vehicle.grossProfit) },
    {
      label: "Commission",
      value: `${formatCommissionCurrency(vehicle.commission)} (${vehicle.commissionRate}%)`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {getVehicleLabel(vehicle)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {vehicle.vehicleImageUrl ? (
              <img
                src={vehicle.vehicleImageUrl}
                alt={getVehicleLabel(vehicle)}
                className="h-16 w-24 rounded-md object-cover"
              />
            ) : null}
            <SoldVehiclesStatusBadge status={vehicle.status} />
          </div>

          <dl className="grid gap-2.5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-slate-800/60 pb-2 text-[12px] last:border-0"
              >
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="font-medium text-slate-200">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
