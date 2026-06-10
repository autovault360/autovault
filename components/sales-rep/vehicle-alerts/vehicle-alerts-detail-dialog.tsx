"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import {
  formatAlertDate,
  getRelativeTime,
  getVehicleLabel,
} from "@/lib/sales-rep/vehicle-alerts/calculations";
import type { ISalesRepVehicleAlert } from "@/lib/sales-rep/vehicle-alerts/types";
import VehicleAlertsStatusBadge from "./vehicle-alerts-status-badge";

type Props = {
  alert: ISalesRepVehicleAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function VehicleAlertsDetailDialog({
  alert,
  open,
  onOpenChange,
}: Props) {
  if (!alert) return null;

  const rows = [
    { label: "Alert Title", value: alert.alertTitle },
    { label: "Customer", value: alert.customerName },
    { label: "Phone", value: alert.customerPhone },
    { label: "VIN", value: alert.vin },
    { label: "Stock #", value: alert.stockNumber },
    { label: "Sold Date", value: formatAlertDate(alert.soldDate) },
    { label: "Sold Price", value: formatCommissionPrice(alert.soldPrice) },
    { label: "Deal Jacket", value: alert.dealJacketId },
    { label: "Alert Type", value: alert.alertType.replace(/_/g, " ") },
    { label: "Priority", value: alert.priority },
    { label: "Assigned To", value: alert.assignedTo },
    { label: "Due Date", value: formatAlertDate(alert.dueDate) },
    {
      label: "Pending Since",
      value: `${formatAlertDate(alert.pendingSince)} (${getRelativeTime(alert.pendingSince)})`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {getVehicleLabel(alert)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={alert.vehicleImageUrl}
              alt={getVehicleLabel(alert)}
              className="h-16 w-24 rounded-md object-cover"
            />
            <VehicleAlertsStatusBadge status={alert.status} />
          </div>

          <dl className="grid gap-2.5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-slate-800/60 pb-2 text-[12px] last:border-0"
              >
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="max-w-[55%] text-right font-medium capitalize text-slate-200">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
