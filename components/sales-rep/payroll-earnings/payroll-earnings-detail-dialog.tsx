"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCommissionCurrency,
  formatCommissionPrice,
} from "@/lib/sales-rep/commissions/format";
import {
  formatSoldDate,
  getVehicleLabel,
  VEHICLE_IMAGE_PLACEHOLDER,
} from "@/lib/sales-rep/payroll-earnings/calculations";
import type { IEarningsByVehicle } from "@/lib/sales-rep/payroll-earnings/types";
import PayrollPaymentStatusBadge from "./payroll-payment-status-badge";

type Props = {
  row: IEarningsByVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PayrollEarningsDetailDialog({
  row,
  open,
  onOpenChange,
}: Props) {
  if (!row) return null;

  const fields = [
    { label: "Customer", value: row.customerName },
    { label: "Phone", value: row.customerPhone },
    { label: "Employee ID", value: row.employeeId },
    { label: "Sold Date", value: formatSoldDate(row.soldDate) },
    { label: "Sold Price", value: formatCommissionPrice(row.soldPrice) },
    { label: "Gross Profit", value: formatCommissionPrice(row.grossProfit) },
    { label: "Commission Rate", value: `${row.commissionRate}%` },
    {
      label: "Commission Earned",
      value: formatCommissionCurrency(row.commissionEarned),
    },
    { label: "Deal Jacket", value: row.dealJacketId },
    { label: "Invoice Ref", value: row.invoiceRef },
    { label: "Transaction ID", value: row.transactionId },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {getVehicleLabel(row)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={row.vehicleImageUrl || VEHICLE_IMAGE_PLACEHOLDER}
              alt={getVehicleLabel(row)}
              className="h-16 w-24 rounded-md object-cover"
            />
            <PayrollPaymentStatusBadge status={row.paymentStatus} />
          </div>
          <dl className="grid gap-2.5">
            {fields.map((f) => (
              <div
                key={f.label}
                className="flex justify-between border-b border-slate-800/60 pb-2 text-[12px] last:border-0"
              >
                <dt className="text-slate-500">{f.label}</dt>
                <dd className="font-medium text-slate-200">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
