"use client";

import { useState } from "react";
import { DollarSign, Check, AlertCircle, Wrench } from "lucide-react";
import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { formatCurrency } from "@/lib/vehicles/types";
import { cn } from "@/lib/utils";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import UpdatePricingModal from "@/components/vehicles/detail/modals/update-pricing-modal";
import AddRepairCostModal from "@/components/vehicles/detail/modals/add-repair-cost-modal";
import MarkAsSoldModal from "@/components/vehicles/detail/modals/mark-as-sold-modal";
import MarkAsLossModal from "@/components/vehicles/detail/modals/mark-as-loss-modal";

type OpenModal = "pricing" | "sold" | "loss" | "repair" | null;

export default function PricingActionsCard({
  vehicle,
}: {
  vehicle: VehicleDetail;
}) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const isSold = vehicle.status === "Marked Sold";

  const actions: {
    key: string;
    label: string;
    icon: typeof DollarSign;
    className: string;
    modal: OpenModal;
    disabled: boolean;
    badge?: string;
  }[] = [
    {
      key: "pricing",
      label: "Update Pricing",
      icon: DollarSign,
      className: "bg-blue-600 hover:bg-blue-500 text-white",
      modal: "pricing",
      disabled: isSold,
      badge: isSold ? "Sold" : undefined,
    },
    {
      key: "sold",
      label: isSold ? "Marked as Sold" : "Mark as Sold",
      icon: Check,
      className: isSold
        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
        : "bg-emerald-600 hover:bg-emerald-500 text-white",
      modal: "sold",
      disabled: isSold,
    },
    {
      key: "loss",
      label: "Add Loss",
      icon: AlertCircle,
      className: "bg-red-600 hover:bg-red-500 text-white",
      modal: "loss",
      disabled: isSold,
      badge: isSold ? "Sold" : undefined,
    },
    {
      key: "repair",
      label: "Repair Cost",
      icon: Wrench,
      className: "bg-orange-500 hover:bg-orange-400 text-white",
      modal: "repair",
      disabled: isSold,
      badge: isSold ? "Sold" : undefined,
    },
  ];

  return (
    <>
      <DetailCard>
        <DetailCardHead title="PRICING & ACTIONS" />
        <div className="flex-1 space-y-0.5">
          <DetailRow
            label="Market Value"
            value={formatCurrency(vehicle.marketValue)}
          />
          <DetailRow label="Our Price" value={formatCurrency(vehicle.price)} />
          <DetailRow label="Cost" value={formatCurrency(vehicle.cost)} />
          <DetailRow
            label="Total Reconditioning"
            value={formatCurrency(vehicle.totalReconditioning)}
          />
          <DetailRow
            label="Gross Profit"
            value={
              <span className="font-semibold text-emerald-400">
                {formatCurrency(vehicle.grossProfit)}
              </span>
            }
          />
          <DetailRow
            label="Gross Profit %"
            value={
              <span className="font-semibold text-emerald-400">
                {vehicle.grossProfitPct.toFixed(1)}%
              </span>
            }
          />
        </div>
        <div className="mt-auto space-y-2 pt-4">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.key} className="relative">
                {a.badge && (
                  <span className="absolute -top-1.5 -right-1.5 z-10 rounded-full bg-slate-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300 shadow">
                    {a.badge}
                  </span>
                )}
                <button
                  type="button"
                  disabled={a.disabled}
                  onClick={() => setOpenModal(a.modal)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-semibold transition",
                    a.className,
                    a.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {a.label}
                </button>
              </div>
            );
          })}
        </div>
      </DetailCard>

      <UpdatePricingModal
        vehicle={vehicle}
        open={openModal === "pricing"}
        onOpenChange={(open) => !open && setOpenModal(null)}
      />
      <MarkAsSoldModal
        vehicle={vehicle}
        open={openModal === "sold"}
        onOpenChange={(open) => !open && setOpenModal(null)}
      />
      <MarkAsLossModal
        vehicle={vehicle}
        open={openModal === "loss"}
        onOpenChange={(open) => !open && setOpenModal(null)}
      />
      <AddRepairCostModal
        vehicle={vehicle}
        open={openModal === "repair"}
        onOpenChange={(open) => !open && setOpenModal(null)}
      />
    </>
  );
}
