"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Car,
  CheckCircle,
  Gavel,
  Handshake,
  Loader2,
  ShoppingCart,
  Tag,
  Upload,
  X,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/shared/modal-primitives";
import { cn } from "@/lib/utils";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { useAddSoldVehicleForm } from "@/hooks/dealer/use-add-sold-vehicle-form";
import { formatCurrencyExact, totalVehicleCost } from "@/lib/dealer/dashboard/calculations";
import {
  BUYER_TYPE_OPTIONS,
  COMMON_SOLD_VEHICLE_DOCUMENTS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SALESPERSON_OPTIONS,
  SALE_TYPE_OPTIONS,
} from "@/lib/dealer/dashboard/sold-vehicle-constants";
import type { SaleType, SoldVehicleRecord, WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import { DateField } from "@/components/expenses/add/add-expense-modal-parts";

const SALE_TYPE_ICONS = {
  wholesale: Handshake,
  retail: Tag,
  dealer_trade: ShoppingCart,
  auction: Gavel,
} as const;

function SectionHeading({
  number,
  title,
  required,
}: {
  number: number;
  title: string;
  required?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600/20 text-[10px] font-bold text-blue-400">
        {number}
      </span>
      <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-300 uppercase">
        {title}
        {required && <span className="ml-1 text-red-500">*</span>}
      </h3>
    </div>
  );
}

function VehiclePreviewCard({ vehicle }: { vehicle: WholesaleVehicle }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-slate-700">
        {vehicle.imageUrl ? (
          <Image src={vehicle.imageUrl} alt="" fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800">
            <Car className="h-6 w-6 text-slate-500" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        <p className="text-[10px] text-slate-500">
          Stock #{vehicle.stockNumber} — VIN {vehicle.vin}
        </p>
      </div>
      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
    </div>
  );
}

function FinancialSummary({
  vehicle,
  salePrice,
}: {
  vehicle: WholesaleVehicle | null;
  salePrice: number;
}) {
  const vehicleCost = vehicle?.costs.acquisition ?? 0;
  const reconditioning = vehicle?.costs.recon ?? 0;
  const totalExpenses = vehicle
    ? totalVehicleCost(vehicle.costs) - vehicleCost - reconditioning
    : 0;
  const totalCost = vehicle ? totalVehicleCost(vehicle.costs) : 0;
  const grossProfit = salePrice > 0 ? salePrice - totalCost : 0;
  const grossProfitPercent =
    salePrice > 0 ? Math.round((grossProfit / salePrice) * 1000) / 10 : 0;

  const rows = [
    { label: "Vehicle Cost", value: formatCurrencyExact(vehicleCost) },
    { label: "Reconditioning", value: formatCurrencyExact(reconditioning) },
    { label: "Total Expenses", value: formatCurrencyExact(totalExpenses) },
    { label: "Total Cost", value: formatCurrencyExact(totalCost) },
    { label: "Sale Price", value: formatCurrencyExact(salePrice) },
  ];

  return (
    <div className="space-y-2 rounded-md border border-[#1e293b] bg-[#070c14]/40 p-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">{row.label}</span>
          <span className="tabular-nums text-slate-200">{row.value}</span>
        </div>
      ))}
      <div className="border-t border-[#1e293b] pt-2">
        <div className="flex items-center justify-between text-[12px] font-semibold text-emerald-400">
          <span>Gross Profit</span>
          <span className="tabular-nums">{formatCurrencyExact(grossProfit)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-400/90">
          <span>Gross Profit %</span>
          <span className="tabular-nums">{grossProfitPercent}%</span>
        </div>
      </div>
    </div>
  );
}

export default function AddSoldVehicleWorkspace({
  record,
  readOnly = false,
  onClose,
}: {
  record: SoldVehicleRecord | null;
  readOnly?: boolean;
  onClose: () => void;
}) {
  const { dashboardData, workspaceSaving, simulateSave } = useDealerDashboard();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const {
    form,
    handleSubmit,
    shake,
    vehicleSearch,
    setVehicleSearch,
    isEdit,
  } = useAddSoldVehicleForm(true, record, simulateSave, onClose);

  const vehicles = dashboardData?.vehicles ?? [];
  const selectedVehicleId = form.watch("vehicleId");
  const salePrice = form.watch("salePrice");

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.vin.toLowerCase().includes(q) ||
        v.stockNumber.toLowerCase().includes(q) ||
        `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q),
    );
  }, [vehicles, vehicleSearch]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? null;
  const selectedPaymentStatus = form.watch("paymentStatus");
  const paymentStatusConfig = PAYMENT_STATUS_OPTIONS.find(
    (o) => o.value === selectedPaymentStatus,
  );
  const paymentStatusTextClass =
    selectedPaymentStatus === "paid"
      ? "text-emerald-400"
      : selectedPaymentStatus === "partial"
        ? "text-orange-400"
        : "text-blue-400";

  const title = readOnly
    ? "View Sold Vehicle"
    : isEdit
      ? "Edit Sold Vehicle"
      : "Add Sold Vehicle";

  return (
    <div
      className={cn(
        "mt-4 min-w-0 max-w-full rounded-md border border-[#1e293b] bg-[#080e19] p-4",
        shake && "animate-shake motion-reduce:animate-none",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-bold text-white">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-4">
            {/* Column 1: Sale Type + Vehicle (mirrors transaction type + vehicle) */}
            <div className="">
              <div className="lg:col-span-12">
                <SectionHeading number={1} title="Select Sale Type" required />
                <FormField
                  control={form.control}
                  name="saleType"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-2">
                        {SALE_TYPE_OPTIONS.map((opt) => {
                          const Icon = SALE_TYPE_ICONS[opt.value as SaleType];
                          const active = field.value === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={readOnly}
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                "flex flex-col items-center gap-2 rounded-md border p-3 text-center transition",
                                active
                                  ? cn(opt.borderActive, opt.bgActive)
                                  : "border-[#1e293b] bg-[#070c14]/40 hover:border-slate-600",
                              )}
                            >
                              <Icon className={cn("h-5 w-5", active ? opt.color : "text-slate-500")} />
                              <span className={cn("text-[11px] font-semibold", active ? "text-white" : "text-slate-400")}>
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-3.5 lg:col-span-12">
                <SectionHeading number={2} title="Vehicle Information" required />
                <div className="space-y-3">
                  <Input
                    theme="dark"
                    placeholder="Search by VIN, Stock #, or Year/Make/Model"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    disabled={readOnly}
                    className="h-8 border-[#1e293b] bg-[#070c14]/60 text-[11px]"
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                    <FormField
                      control={form.control}
                      name="stockNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FieldLabel label="Stock #" />
                          <FormControl>
                            <Input
                              theme="dark"
                              disabled={readOnly}
                              className="h-8 border-[#1e293b] bg-[#070c14]/60"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="hidden pb-2 text-center text-[10px] text-slate-500 sm:block">OR</span>
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between gap-1">
                            <FieldLabel label="Select Vehicle" required />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}
                              disabled={readOnly}
                            >
                              <SelectTrigger
                                theme="dark"
                                className="border-[#1e293b] bg-[#070c14]/60"
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Select Vehicle" />
                              </SelectTrigger>
                              <SelectContent theme="dark" className="border-[#1e293b]">
                                {filteredVehicles.map((v) => (
                                  <SelectItem key={v.id} value={v.id} theme="dark">
                                    {v.year} {v.make} {v.model} — {v.stockNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {selectedVehicle && <VehiclePreviewCard vehicle={selectedVehicle} />}
                </div>
              </div>
            </div>

            {/* Column 2: Buyer Information */}
            <div className="">
              <SectionHeading number={3} title="Buyer Information" required />
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="buyerName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Buyer / Business Name" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          disabled={readOnly}
                          className="h-8 border-[#1e293b] bg-[#070c14]/60"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Contact Person" />
                      <FormControl>
                        <Input theme="dark" disabled={readOnly} className="h-8 border-[#1e293b] bg-[#070c14]/60" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dealerLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Dealer License #" />
                      <FormControl>
                        <Input theme="dark" disabled={readOnly} className="h-8 border-[#1e293b] bg-[#070c14]/60" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Phone" />
                        <FormControl>
                          <Input theme="dark" disabled={readOnly} className="h-8 border-[#1e293b] bg-[#070c14]/60" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-1">
                          <FieldLabel label="Email" />
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input theme="dark" disabled={readOnly} className="h-8 border-[#1e293b] bg-[#070c14]/60" aria-invalid={!!fieldState.error} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="buyerType"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Buyer Type" />
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                          <SelectTrigger theme="dark" className="border-[#1e293b] bg-[#070c14]/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent theme="dark" className="border-[#1e293b]">
                            {BUYER_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} theme="dark">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Column 3: Sale Information + inline notes (mirrors transaction details) */}
            <div className="">
              <SectionHeading number={4} title="Sale Information" required />
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Sale Date" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <DateField
                          value={field.value}
                          onChange={field.onChange}
                          dateInputRef={dateInputRef}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Sale Price" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          mode="currency"
                          disabled={readOnly}
                          value={field.value}
                          onValueChange={field.onChange}
                          className="h-8 border-[#1e293b] bg-[#070c14]/60"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Payment Method" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                          <SelectTrigger theme="dark" className="border-[#1e293b] bg-[#070c14]/60" aria-invalid={!!fieldState.error}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent theme="dark" className="border-[#1e293b]">
                            {PAYMENT_METHOD_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} theme="dark">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Payment Status" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                          <SelectTrigger theme="dark" className="border-[#1e293b] bg-[#070c14]/60" aria-invalid={!!fieldState.error}>
                            <SelectValue>
                              <span className={paymentStatusTextClass}>
                                {paymentStatusConfig?.label}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent theme="dark" className="border-[#1e293b]">
                            {PAYMENT_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} theme="dark">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dealNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Deal / Invoice #" />
                      <FormControl>
                        <Input theme="dark" disabled={readOnly} className="h-8 border-[#1e293b] bg-[#070c14]/60" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesperson"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Salesperson (Optional)" />
                      <FormControl>
                        <Select value={field.value || undefined} onValueChange={field.onChange} disabled={readOnly}>
                          <SelectTrigger theme="dark" className="border-[#1e293b] bg-[#070c14]/60">
                            <SelectValue placeholder="Select salesperson" />
                          </SelectTrigger>
                          <SelectContent theme="dark" className="border-[#1e293b]">
                            {SALESPERSON_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} theme="dark">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={readOnly}
                          placeholder="Add notes about this sale..."
                          rows={3}
                          className="min-h-[72px] resize-none rounded-[6px] border-slate-600 bg-[#070c14]/60 px-3 py-2.5 text-[13px] text-slate-100"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Column 4: Financial Summary + Documents (stacked like col 1) */}
            <div className="">
              <SectionHeading number={5} title="Financial Summary" />
              <FinancialSummary vehicle={selectedVehicle} salePrice={salePrice} />

              <div className="mt-3.5">
                <SectionHeading number={6} title="Documents" />
                {!readOnly && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-3 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-600/90 bg-[#0d1420] px-4 py-4 text-center"
                  >
                    <Upload className="mb-2 h-6 w-6 text-slate-500" />
                    <p className="text-[11px] text-slate-400">Drag & drop files here</p>
                    <Button type="button" className="mt-2 h-7 bg-slate-700 px-3 text-[10px] hover:bg-slate-600">
                      Choose Files
                    </Button>
                    {receiptFile && (
                      <p className="mt-2 truncate text-[11px] text-blue-400">{receiptFile.name}</p>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                <FormField
                  control={form.control}
                  name="commonDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        {COMMON_SOLD_VEHICLE_DOCUMENTS.map((doc) => {
                          const checked = (field.value ?? []).includes(doc.value);
                          return (
                            <label key={doc.value} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={readOnly}
                                onChange={() => {
                                  const current = field.value ?? [];
                                  field.onChange(
                                    checked
                                      ? current.filter((v) => v !== doc.value)
                                      : [...current, doc.value],
                                  );
                                }}
                                className="h-3.5 w-3.5 rounded border-slate-600 accent-emerald-500"
                              />
                              <span className="text-[11px] text-slate-300">{doc.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addAnotherDocument"
                  render={({ field }) => (
                    <label className="mt-3 flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!field.value}
                        disabled={readOnly}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-600 accent-emerald-500"
                      />
                      <span className="text-[11px] text-slate-400">Add Another Document</span>
                    </label>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#1e293b] pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={workspaceSaving}
              className="h-8 border-[#1e293b] bg-transparent text-[12px] text-slate-300"
            >
              Cancel
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                disabled={workspaceSaving}
                className="h-8 bg-emerald-600 text-[12px] hover:bg-emerald-500"
              >
                {workspaceSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Save Sale
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
