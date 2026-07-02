"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AV } from "@/lib/ui/autovault-design-tokens";
import {
  formatAvMoney,
  formatAvPercent,
  formatAvSignedMoney,
} from "@/lib/financials/vehicles-report/format";
import type { VehiclesReportVehicleRow } from "@/lib/financials/vehicles-report/types";
import RepPill, { ViewVehicleButton } from "./vehicles-report-ui";

type FinancialVehiclesTableProps = {
  mode: "profit" | "loss";
  vehicles: VehiclesReportVehicleRow[];
  onViewVehicle: (vehicle: VehiclesReportVehicleRow) => void;
  emptyMessage: string;
};

const COLUMNS_PROFIT = [
  "Sold Date",
  "Vehicle",
  "Purchase Price",
  "Sold Price",
  "Gross Profit",
  "Net Profit",
  "ROI %",
  "Sales Rep",
  "Days to Sell",
  "Actions",
] as const;

const COLUMNS_LOSS = [
  "Date",
  "Vehicle",
  "Purchase Price",
  "Sold / Ask",
  "Gross",
  "Net Loss",
  "ROI %",
  "Sales Rep",
  "Days on Lot",
  "Actions",
] as const;

export default function FinancialVehiclesTable({
  mode,
  vehicles,
  onViewVehicle,
  emptyMessage,
}: FinancialVehiclesTableProps) {
  const columns = mode === "profit" ? COLUMNS_PROFIT : COLUMNS_LOSS;

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-800/90 bg-[#101826]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-[11.5px]">
          <thead className="bg-slate-950/40 text-[10px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-slate-800">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-3 py-3 text-left font-medium whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-12 text-center text-[12px] text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="transition hover:bg-slate-800/20"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-slate-300">
                    {vehicle.soldDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="text-[13px] font-bold text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {vehicle.category}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-slate-300">
                    {formatAvMoney(vehicle.purchasePrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-slate-300">
                    {formatAvMoney(vehicle.soldPrice)}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] tabular-nums",
                      mode === "profit" ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {formatAvSignedMoney(vehicle.grossProfit)}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] font-bold tabular-nums",
                      mode === "profit" ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {formatAvSignedMoney(vehicle.netProfit)}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] tabular-nums",
                      mode === "profit" ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {formatAvPercent(vehicle.roi)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px]">
                    <RepPill rep={vehicle.salesRep} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-slate-300">
                    {vehicle.daysOnLot}d
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px]">
                    <ViewVehicleButton onClick={() => onViewVehicle(vehicle)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VehicleDetailModal({
  vehicle,
  open,
  onClose,
}: {
  vehicle: VehiclesReportVehicleRow | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !vehicle) return null;

  const positive = vehicle.netProfit >= 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ backgroundColor: "rgba(4,7,12,0.7)", backdropFilter: "blur(3px)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-[780px] overflow-y-auto rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{ backgroundColor: AV.panel, borderColor: AV.border }}
      >
        <div
          className="flex items-center justify-between border-b px-[22px] py-[18px]"
          style={{ borderColor: AV.border }}
        >
          <h3 className="m-0 text-[15px] font-extrabold text-[#e7ecf3]">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent text-lg"
            style={{ color: AV.muted }}
            aria-label="Close"
          >
            ?
          </button>
        </div>

        <div className="px-[22px] py-5">
          <div className="flex flex-wrap items-start justify-between gap-3.5">
            <div>
              <div className="text-lg font-extrabold text-[#e7ecf3]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </div>
              <div className="mt-[3px] font-mono text-[11.5px]" style={{ color: AV.muted }}>
                VIN {vehicle.vin} · {vehicle.category}
              </div>
              <div
                className="mt-1 text-xs font-extrabold"
                style={{ color: positive ? AV.green : AV.red }}
              >
                Sold
              </div>
            </div>
            <div
              className="rounded-[10px] border px-3.5 py-2 text-center font-mono text-[15px] font-extrabold"
              style={{
                color: positive ? AV.green : AV.red,
                backgroundColor: positive
                  ? "rgba(35,209,139,0.12)"
                  : "rgba(255,84,112,0.12)",
                borderColor: positive
                  ? "rgba(35,209,139,0.3)"
                  : "rgba(255,84,112,0.3)",
              }}
            >
              <span
                className="mb-0.5 block text-[9.5px] font-bold tracking-[1px]"
                style={{ color: AV.muted }}
              >
                NET PROFIT
              </span>
              {formatAvSignedMoney(vehicle.netProfit)} · {formatAvPercent(vehicle.roi)} ROI
            </div>
          </div>

          <div className="mt-[18px] grid grid-cols-1 gap-[18px] md:grid-cols-2">
            <div
              className="rounded-xl border px-4 py-3.5"
              style={{ backgroundColor: AV.panel2, borderColor: AV.border }}
            >
              <h4
                className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[1px]"
                style={{ color: AV.muted }}
              >
                Acquisition &amp; Cost Breakdown
              </h4>
              {[
                ["Purchase Price", formatAvMoney(vehicle.purchasePrice)],
                ["Repairs", formatAvMoney(vehicle.repairs)],
                ["Commission", formatAvMoney(vehicle.commission)],
                ["Sales Tax", formatAvMoney(vehicle.salesTax)],
                ["Total Vehicle Cost", formatAvMoney(vehicle.totalVehicleCost)],
                ["Sold Price", formatAvMoney(vehicle.soldPrice)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-t border-dashed py-[5px] text-[12.5px] first:border-t-0"
                  style={{ borderColor: AV.border }}
                >
                  <span style={{ color: AV.muted }}>{label}</span>
                  <span className="font-mono font-bold text-[#e7ecf3]">{value}</span>
                </div>
              ))}
              <div
                className="mt-1 flex justify-between border-t px-0 py-2.5 text-[12.5px] font-extrabold"
                style={{ borderColor: AV.border }}
              >
                <span>Net Profit</span>
                <span style={{ color: positive ? AV.green : AV.red }}>
                  {formatAvSignedMoney(vehicle.netProfit)}
                </span>
              </div>
            </div>

            <div
              className="rounded-xl border px-4 py-3.5"
              style={{ backgroundColor: AV.panel2, borderColor: AV.border }}
            >
              <h4
                className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[1px]"
                style={{ color: AV.muted }}
              >
                Customer Information
              </h4>
              {[
                ["Buyer", vehicle.customerName ?? "—"],
                ["Sold Price", formatAvMoney(vehicle.soldPrice)],
                ["Sales Rep", vehicle.salesRep],
                ["Sold Date", vehicle.soldDate],
                ["Days to Sell", `${vehicle.daysOnLot}d`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-t border-dashed py-[5px] text-[12.5px] first:border-t-0"
                  style={{ borderColor: AV.border }}
                >
                  <span style={{ color: AV.muted }}>{label}</span>
                  <span className="font-mono font-bold text-[#e7ecf3]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex justify-end border-t px-[22px] py-4"
          style={{ borderColor: AV.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[9px] border px-4 py-2.5 text-[13px] font-semibold"
            style={{
              backgroundColor: "transparent",
              borderColor: AV.border,
              color: AV.text,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
