"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileText,
  Info,
  Link2,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSection,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/shared/modal-primitives";
import { ModalThemeProvider } from "@/components/shared/modal-theme-context";
import { formatCurrency } from "@/lib/sales-reps/types";
import { useUnifiedDealJacketForm } from "@/hooks/sales-rep/use-unified-deal-jacket-form";
import {
  DEAL_TYPES,
  SALES_TAX_RATE,
  US_STATES,
} from "@/lib/sales-rep/deal-jacket/constants";
import { lookupVehicle } from "@/lib/expenses/server/lookup-vehicle";
import { checkVehicleHasDealJacket } from "@/lib/deal-jackets/server/check-deal-jacket";
import {
  getVehicleDisplayName,
  type LinkedVehicleResult,
} from "@/lib/expenses/server/types";
import { formatMileage, getStatusStyle } from "@/lib/vehicles/types";
import { formatPhoneNumber } from "@/lib/vehicles/actions/utils";
import type {
  IDealJacketDocument,
  ILinkedVehicle,
} from "@/lib/sales-rep/deal-jacket/types";

const UNAVAILABLE_STATUSES = ["Sold", "Loss", "Pending Deal"];

function isUnavailableForDeal(status: string | undefined | null): boolean {
  return UNAVAILABLE_STATUSES.includes(status ?? "");
}

function toVehicleStatus(status: string): "In Stock" | "Needs Attention" | "Pending Deal" | "Marked Sold" {
  if (status === "Sold" || status === "Loss") return "Marked Sold";
  if (status === "Pending Deal") return "Pending Deal";
  return status as "In Stock" | "Needs Attention" | "Pending Deal" | "Marked Sold";
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-700/60", className)}
    />
  );
}

function fieldClassName(hasError: boolean) {
  return cn(
    "h-8 border-slate-700/80 bg-slate-800/50 text-[12px] text-slate-100",
    hasError && "border-red-500",
  );
}

type Props = {
  vinLookup?: boolean;
  viewMode?: "create" | "linked";
  vehicles?: ILinkedVehicle[];
  documents?: IDealJacketDocument[];
  commissionRate?: number;
  loading?: boolean;
  defaultVehicleId?: string;
  onSuccess?: () => void;
};

function KeyValueRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[11px]">
      <span className="shrink-0 text-[#64748b]">{label}</span>
      <span
        className={cn(
          "truncate text-right text-white",
          mono && "font-mono tabular-nums tracking-tight",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function AttachmentUploadBadge({
  label,
  file,
  onFileSelect,
  onRemove,
}: {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex cursor-pointer items-center gap-2 rounded border border-dashed border-slate-700/80 bg-slate-800/30 px-2.5 py-2 transition hover:border-blue-500/40 hover:bg-slate-800/50"
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-[#64748b]">{label}</div>
        <div className="truncate text-[11px] text-slate-300">
          {file ? file.name : "Tap to upload"}
        </div>
      </div>
      {file ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-white"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <span className="text-[9px] text-slate-600">Optional</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[#64748b]">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          highlight ? "font-semibold text-emerald-400" : "text-slate-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function VinLookupSection({
  linkedVehicle,
  vehicleHasJacket,
  onVehicleChange,
  readOnly,
}: {
  linkedVehicle: LinkedVehicleResult | null;
  vehicleHasJacket: boolean;
  onVehicleChange: (
    vehicle: LinkedVehicleResult | null,
    options?: { hasExistingJacket?: boolean; workflowStatus?: string },
  ) => void;
  readOnly?: boolean;
}) {
  const [vinInput, setVinInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (linkedVehicle) {
      setVinInput(linkedVehicle.vin);
    } else {
      setVinInput("");
    }
  }, [linkedVehicle]);

  const handleLookup = async () => {
    const query = vinInput.trim();
    if (!query) {
      toast.error("Enter a VIN to lookup.");
      return;
    }

    setLoading(true);
    try {
      const result = await lookupVehicle({ mode: "vin", query });
      if (!result.success) {
        toast.error(result.error ?? "No vehicle found for that VIN.");
        onVehicleChange(null);
        return;
      }

      const check = await checkVehicleHasDealJacket(result.vehicle.id);
      if (check.error) {
        toast.error(check.error);
        onVehicleChange(null);
        return;
      }

      onVehicleChange(result.vehicle, {
        hasExistingJacket: check.hasJacket,
        workflowStatus: check.workflowStatus,
      });
      setVinInput(result.vehicle.vin);
    } finally {
      setLoading(false);
    }
  };

  const vehicleUnavailable = isUnavailableForDeal(linkedVehicle?.status);

  return (
    <div className="rounded-[6px] border border-slate-700/70 bg-card/80 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        Linked Vehicle <span className="text-red-500">*</span>
      </p>

      {!readOnly && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            theme="dark"
            value={vinInput}
            onChange={(e) => setVinInput(e.target.value.toUpperCase())}
            placeholder="Enter VIN number"
            className="h-9 flex-1 bg-slate-800/50 uppercase text-[12px]"
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <Button
            type="button"
            className="h-9 shrink-0 bg-blue-600 px-4 text-[12px] hover:bg-blue-500"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Looking up...
              </>
            ) : (
              "Lookup Vehicle"
            )}
          </Button>
        </div>
      )}

      {readOnly && !linkedVehicle && (
        <p className="mt-2 text-[12px] text-slate-500">No vehicle linked</p>
      )}

      {linkedVehicle && (
        <>
          <div className="relative mt-3 flex gap-3 rounded-md border border-slate-700/80 bg-card p-2.5">
            {!readOnly && (
              <button
                type="button"
                onClick={() => onVehicleChange(null)}
                className="absolute right-2 top-2 rounded p-0.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                aria-label="Remove linked vehicle"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="relative h-[52px] w-[72px] shrink-0 overflow-hidden rounded-md bg-slate-800">
              <Image
                src={linkedVehicle.image}
                alt={getVehicleDisplayName(linkedVehicle)}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-white">
                  {getVehicleDisplayName(linkedVehicle)}
                </p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                    getStatusStyle(toVehicleStatus(linkedVehicle.status)),
                  )}
                >
                  {linkedVehicle.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Stock #{linkedVehicle.stockNumber} ... VIN: {linkedVehicle.vin}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Mileage: {formatMileage(linkedVehicle.mileage)} mi
                {linkedVehicle.color !== "..." ? ` ... Color: ${linkedVehicle.color}` : ""}
              </p>
            </div>
          </div>

          {vehicleHasJacket && (
            <div className="mt-2 flex items-start gap-2.5 rounded-md border border-red-500/40 bg-red-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div>
                <p className="text-[13px] font-medium text-red-300">
                  Deal jacket already exists
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-red-400/80">
                  This vehicle already has a deal jacket. Remove the vehicle link
                  or select a different vehicle.
                </p>
              </div>
            </div>
          )}

          {vehicleUnavailable && (
            <div className="mt-2 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-[12px] leading-relaxed text-red-300">
                This vehicle is marked as{" "}
                <strong>{linkedVehicle.status.toLowerCase()}</strong>. Deal
                jackets cannot be created for sold, loss, or pending-deal vehicles.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DealJacketFormEngine({
  vinLookup = false,
  viewMode = "create",
  vehicles = [],
  documents = [],
  commissionRate = 0,
  loading = false,
  defaultVehicleId,
  onSuccess,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);

  const {
    form,
    derived,
    selectedVehicle,
    linkedVehicle,
    handleLinkedVehicleChange,
    vehicleHasJacket,
    isSubmitting,
    shake,
    saveDraft,
    saveDealJacket,
    setFiles,
  } = useUnifiedDealJacketForm(vehicles, commissionRate, defaultVehicleId, vinLookup, onSuccess);

  const vehicleRejected =
    isUnavailableForDeal(linkedVehicle?.status) || vehicleHasJacket;

  const collectAllFiles = (
    extra: File[],
    dl: File | null,
    ins: File | null,
  ) => {
    const all = [...extra];
    if (dl) all.push(dl);
    if (ins) all.push(ins);
    return all;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const next = [...extraFiles, ...Array.from(files)];
      setExtraFiles(next);
      setFiles(collectAllFiles(next, driverLicenseFile, insuranceFile));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="space-y-3 xl:col-span-4">
            <SkeletonBar className="h-48 w-full" />
            <SkeletonBar className="h-72 w-full" />
          </div>
          <SkeletonBar className="h-[520px] w-full xl:col-span-4" />
          <div className="space-y-3 xl:col-span-4">
            <SkeletonBar className="h-56 w-full" />
            <SkeletonBar className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const emptyDash = "-";

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-700/80 bg-card p-3",
        shake && "animate-[shake_0.4s_ease-in-out]",
      )}
    >
      <Form {...form}>
        <ModalThemeProvider theme="dark">
        <form className="grid grid-cols-1 gap-3 xl:grid-cols-12 items-start">

          {vinLookup && vehicleHasJacket && (
            <div className="flex items-start gap-2.5 rounded-md border border-red-500/40 bg-red-500/10 p-3 xl:col-span-12">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div>
                <p className="text-[13px] font-medium text-red-300">
                  Deal jacket already exists
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-red-400/80">
                  This vehicle already has a deal jacket. Remove the vehicle link
                  or select a different vehicle.
                </p>
              </div>
            </div>
          )}

          {vinLookup && isUnavailableForDeal(linkedVehicle?.status) && (
            <div className="flex items-start gap-2.5 rounded-md border border-red-500/40 bg-red-500/10 p-3 xl:col-span-12">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div>
                <p className="text-[13px] font-medium text-red-300">
                  Vehicle is not available for a deal jacket
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-red-400/80">
                  This vehicle is sold, marked as a loss, or already has a deal in
                  progress. Remove the vehicle link or select a different vehicle.
                </p>
              </div>
            </div>
          )}

          {/* COLUMN 1: Vehicle & Buyer Information */}
          <div className="space-y-3 xl:col-span-4">
            <FormSection
              title="Vehicle Information"
              theme="dark"
              className="border-slate-700/80"
              headerRight={
                !vinLookup && viewMode === "create" ? (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Link2 className="h-3 w-3" />
                    Linked Vehicle
                  </span>
                ) : undefined
              }
            >
              {vinLookup ? (
                <>
                  <VinLookupSection
                    linkedVehicle={linkedVehicle}
                    vehicleHasJacket={vehicleHasJacket}
                    onVehicleChange={handleLinkedVehicleChange}
                  />
                  <FormField
                    control={form.control}
                    name="linkedVehicleId"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stockNo"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  {viewMode === "create" && (
                    <FormField
                      control={form.control}
                      name="linkedVehicleId"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Select Vehicle" required />
                            <FormMessage className="text-[10px] text-red-500" />
                          </div>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={fieldClassName(!!fieldState.error)}
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Choose a vehicle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-slate-700/80 bg-card text-slate-300">
                              {vehicles.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.stockNo} - {v.yearModel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex gap-3">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-slate-700/80 bg-slate-800/50">
                      {selectedVehicle?.imageUrl ? (
                        <Image
                          src={selectedVehicle.imageUrl}
                          alt={selectedVehicle.yearModel}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <KeyValueRow
                        label="Stock #"
                        value={selectedVehicle?.stockNo ?? emptyDash}
                        mono
                      />
                      <KeyValueRow
                        label="VIN"
                        value={selectedVehicle?.vin ?? emptyDash}
                        mono
                      />
                      <div className="text-[12px] font-semibold text-white">
                        {selectedVehicle?.yearModel ?? "No vehicle selected"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-700/80 pt-2">
                    <KeyValueRow
                      label="Mileage"
                      value={
                        selectedVehicle?.mileage
                          ? `${selectedVehicle.mileage} mi`
                          : emptyDash
                      }
                      mono
                    />
                    <KeyValueRow
                      label="Purchase Cost"
                      value={
                        selectedVehicle
                          ? formatCurrency(selectedVehicle.purchaseCost)
                          : emptyDash
                      }
                      mono
                    />
                    <KeyValueRow
                      label="Asking Price"
                      value={
                        selectedVehicle
                          ? formatCurrency(selectedVehicle.askingPrice)
                          : emptyDash
                      }
                      mono
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="stockNo"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </FormSection>

            <FormSection
              title="Buyer Information"
              theme="dark"
              className="border-slate-700/80"
            >
              {(
                [
                  ["buyerName", "Buyer Name", true, "text"],
                  ["buyerEmail", "Email", true, "email"],
                  ["buyerAddress", "Address", false, "text"],
                  ["driverLicenseNo", "Driver License #", true, "text"],
                ] as const
              ).map(([name, label, required, type]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label={label} required={required} />
                        <FormMessage className="text-[10px] text-red-500" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type={type}
                          theme="dark"
                          className={fieldClassName(!!fieldState.error)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="buyerPhone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="Phone" required />
                      <FormMessage className="text-[10px] text-red-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        theme="dark"
                        placeholder="(123) 456-7890"
                        className={fieldClassName(!!fieldState.error)}
                        aria-invalid={!!fieldState.error}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerState"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="State" required />
                      <FormMessage className="text-[10px] text-red-500" />
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={fieldClassName(!!fieldState.error)}
                          aria-invalid={!!fieldState.error}
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-slate-700/80 bg-card text-slate-300">
                        {US_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="space-y-2 border-t border-slate-700/80 pt-2">
                <AttachmentUploadBadge
                  label="Driver License"
                  file={driverLicenseFile}
                  onFileSelect={(f) => {
                    setDriverLicenseFile(f);
                    setFiles(collectAllFiles(extraFiles, f, insuranceFile));
                  }}
                  onRemove={() => {
                    setDriverLicenseFile(null);
                    setFiles(collectAllFiles(extraFiles, null, insuranceFile));
                  }}
                />
                <AttachmentUploadBadge
                  label="Insurance Card"
                  file={insuranceFile}
                  onFileSelect={(f) => {
                    setInsuranceFile(f);
                    setFiles(collectAllFiles(extraFiles, driverLicenseFile, f));
                  }}
                  onRemove={() => {
                    setInsuranceFile(null);
                    setFiles(collectAllFiles(extraFiles, driverLicenseFile, null));
                  }}
                />
              </div>
            </FormSection>
          </div>

          {/* COLUMN 2: Deal Information */}
          <div className="xl:col-span-4 h-full">
            <FormSection
              title="Deal Information"
              theme="dark"
              className="h-full border-slate-700/80 bg-card/40"
            >
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Sale Price" required />
                        <FormMessage className="text-[10px] text-red-500" />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          theme="dark"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Date Sold" required />
                        <FormMessage className="text-[10px] text-red-500" />
                      </div>
                      <FormControl>
                        <Input
                          mode="date"
                          theme="dark"
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {(
                  [
                    ["downPayment", "Down Payment"],
                    ["tradeInAllowance", "Trade-In Allowance"],
                    ["dmvFees", "DMV Fees"],
                    ["registrationFees", "Registration Fees"],
                    ["documentationFees", "Documentation Fees"],
                    ["warrantyAmount", "Warranty Amount"],
                    ["gapAmount", "GAP Amount"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label={label} />
                          <FormMessage className="text-[10px] text-red-500" />
                        </div>
                        <FormControl>
                          <Input
                            mode="currency"
                            theme="dark"
                            value={field.value}
                            onValueChange={field.onChange}
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
                <FormItem>
                  <FormLabel className="text-[10px] text-[#64748b]">
                    Sales Tax ({(SALES_TAX_RATE * 100).toFixed(2)}%)
                  </FormLabel>
                  <Input
                    mode="readonly"
                    theme="dark"
                    value={formatCurrency(derived.salesTax)}
                    readOnly
                  />
                </FormItem>
                <FormItem>
                  <FormLabel className="text-[10px] text-[#64748b]">
                    Finance Amount
                  </FormLabel>
                  <Input
                    mode="readonly"
                    theme="dark"
                    value={formatCurrency(derived.financeAmount)}
                    readOnly
                    className="tabular-nums"
                  />
                </FormItem>
                <FormField
                  control={form.control}
                  name="lender"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Lender / Financing Company" />
                        <FormMessage className="text-[10px] text-red-500" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          theme="dark"
                          className={fieldClassName(false)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rosNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="ROS #" />
                        <FormMessage className="text-[10px] text-red-500" />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          theme="dark"
                          className={fieldClassName(false)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dealType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Deal Type" required />
                        <FormMessage className="text-[10px] text-red-500" />
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={fieldClassName(!!fieldState.error)}
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-slate-700/80 bg-card text-slate-300">
                          {DEAL_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="Notes" />
                      <FormMessage className="text-[10px] text-red-500" />
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add deal notes..."
                        className="min-h-[72px] border-slate-700/80 bg-slate-800/50 text-[12px] text-slate-100 placeholder:text-slate-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>
          </div>

          {/* COLUMN 3: Commission Preview & Documents Upload */}
          <div className="space-y-3 xl:col-span-4">
            <FormSection
              title="Commission Preview"
              theme="dark"
              className="border-slate-700/80"
            >
              <div className="mb-2 flex items-center justify-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Profit Calculated Automatically
              </div>
              <div className="space-y-1.5">
                <SummaryRow
                  label="Sale Price"
                  value={formatCurrency(derived.salePrice)}
                />
                <SummaryRow
                  label="Vehicle Cost"
                  value={formatCurrency(derived.vehicleCost)}
                />
                <SummaryRow
                  label="Gross Profit"
                  value={formatCurrency(derived.grossProfit)}
                  highlight
                />
                <SummaryRow
                  label="Total Fees and Extras"
                  value={formatCurrency(derived.totalFeesExtras)}
                />
                <SummaryRow
                  label="Net Profit"
                  value={formatCurrency(derived.netProfit)}
                  highlight
                />
              </div>
              <div className="my-2 border-t border-slate-700/80" />
              <div className="space-y-1.5">
                <SummaryRow
                  label="Commission Structure"
                  value={`${derived.commissionRatePercent.toFixed(2)}% of Gross Profit`}
                />
                <SummaryRow
                  label="Commission Rate"
                  value={`${derived.commissionRatePercent.toFixed(0)}%`}
                />
                <div className="flex items-center justify-between rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2">
                  <span className="text-[11px] font-semibold text-white">
                    Commission Earned
                  </span>
                  <span className="text-[14px] font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(derived.commissionEarned)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-start gap-2 rounded border border-blue-500/20 bg-blue-500/5 px-2.5 py-2">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                <p className="text-[10px] leading-relaxed text-blue-300/90">
                  Commission will be paid upon deal funding and admin approval.
                </p>
              </div>
            </FormSection>

            <FormSection
              title="Documents Upload"
              theme="dark"
              className="border-slate-700/80"
            >
              <div className="max-h-[220px] space-y-1.5 overflow-y-auto pr-0.5">
                {documents.map((doc) => (
                  <div
                    key={doc.key}
                    className="flex items-center gap-2 rounded border border-slate-700/80 bg-slate-800/30 px-2 py-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#64748b]">
                        {doc.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[11px] text-slate-300">
                          {doc.fileName}
                        </span>
                        <span className="shrink-0 text-[9px] text-[#475569]">
                          {doc.size}
                        </span>
                      </div>
                    </div>
                    {doc.uploaded && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                  </div>
                ))}
                {extraFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${idx}`}
                    className="flex items-center gap-2 rounded border border-slate-700/80 bg-slate-800/30 px-2 py-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span className="truncate text-[11px] text-slate-300">
                      {file.name}
                    </span>
                    <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
                  </div>
                ))}
              </div>

              <div
                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/80 bg-slate-800/20 px-3 py-5 transition hover:border-blue-500/40 hover:bg-slate-800/40"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = Array.from(e.dataTransfer.files);
                  const next = [...extraFiles, ...dropped];
                  setExtraFiles(next);
                  setFiles(collectAllFiles(next, driverLicenseFile, insuranceFile));
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <CloudUpload className="mb-1.5 h-5 w-5 text-[#475569]" />
                <p className="text-center text-[11px] text-[#64748b]">
                  + Upload Additional Document
                </p>
                <p className="text-center text-[10px] text-[#475569]">
                  Drag and drop or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mt-3 flex flex-col items-end gap-2 border-t border-slate-700/80 pt-3">
                <p className="w-full text-center text-[10px] text-[#475569]">
                  Deal will be saved and sent for admin review.
                </p>
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || vehicleRejected}
                    onClick={saveDraft}
                    className="h-8 border-slate-700/80 bg-transparent text-[12px] text-slate-300 hover:bg-slate-800/50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting || vehicleRejected}
                    onClick={saveDealJacket}
                    className="h-8 bg-[#3b82f6] text-[12px] text-white hover:bg-blue-500"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Save Deal Jacket
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </FormSection>
          </div>

        </form>
        </ModalThemeProvider>
      </Form>
    </div>
  );
}
