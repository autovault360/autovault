"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileText,
  Info,
  Link2,
  Loader2,
  X,
  AlertTriangle,
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
import { useSalesRepDealJacketForm } from "@/hooks/sales-rep/use-sales-rep-deal-jacket-form";
import {
  DEAL_TYPES,
  SALES_TAX_RATE,
  US_STATES,
} from "@/lib/sales-rep/deal-jacket/constants";
import { lookupVehicle } from "@/lib/expenses/server/lookup-vehicle";
import {
  getVehicleDisplayName,
  type LinkedVehicleResult,
} from "@/lib/expenses/server/types";
import { formatMileage, getStatusStyle } from "@/lib/vehicles/types";


const SOLD_STATUSES = ["Sold", "Loss"];

function isSoldStatus(status: string): boolean {
  return SOLD_STATUSES.includes(status);
}

function toVehicleStatus(status: string): "In Stock" | "Needs Attention" | "Marked Sold" {
  if (status === "Sold" || status === "Loss") return "Marked Sold";
  return status as "In Stock" | "Needs Attention" | "Marked Sold";
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
  commissionRate?: number;
  loading?: boolean;
};

function AttachmentBadge({
  label,
  fileName,
  uploaded,
}: {
  label: string;
  fileName: string;
  uploaded: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-slate-700/80 bg-slate-800/50 px-2.5 py-2">
      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-slate-400">{label}</div>
        <div className="truncate text-[11px] text-slate-300">{fileName}</div>
      </div>
      {uploaded && (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      )}
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
      <span className="text-slate-400">{label}</span>
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
  onVehicleChange,
  readOnly,
}: {
  linkedVehicle: LinkedVehicleResult | null;
  onVehicleChange: (v: LinkedVehicleResult | null) => void;
  readOnly?: boolean;
}) {
  const [vinInput, setVinInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      onVehicleChange(result.vehicle);
      setVinInput(result.vehicle.vin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <Link2 className="h-3 w-3 text-blue-400" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-400">
          Linked Vehicle <span className="text-red-500">*</span>
        </span>
      </div>

      {!readOnly && (
        <div className="flex flex-col gap-2 sm:flex-row">
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

      {linkedVehicle && (
        <>
          <div className="relative flex gap-3 rounded-md border border-slate-700/80 bg-card p-2.5">
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
          {isSoldStatus(linkedVehicle.status) && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-[12px] leading-relaxed text-red-300">
                This vehicle is marked as <strong>{linkedVehicle.status.toLowerCase()}</strong>.
                Deal jackets cannot be created for sold or loss vehicles.
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default function SalesRepDealJacketFormEngine({
  commissionRate = 0.1,
  loading = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extraFiles, setExtraFiles] = useState<string[]>([]);

  const {
    form,
    derived,
    linkedVehicle,
    setLinkedVehicle,
    isSubmitting,
    shake,
    saveDraft,
    saveDealJacket,
  } = useSalesRepDealJacketForm(commissionRate);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setExtraFiles((prev) => [
        ...prev,
        ...Array.from(files).map((f) => f.name),
      ]);
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

          {/* COLUMN 1: Vehicle & Buyer Information */}
          <div className="space-y-3 xl:col-span-4">
            <FormSection
              title="Vehicle Information"
              theme="dark"
              className="border-slate-700/80"
            >
              <VinLookupSection
                linkedVehicle={linkedVehicle}
                onVehicleChange={setLinkedVehicle}
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
            </FormSection>

            <FormSection
              title="Buyer Information"
              theme="dark"
              className="border-slate-700/80"
            >
              {(
                [
                  ["buyerName", "Buyer Name", true, "text", "Enter buyer's full name"],
                  ["buyerPhone", "Phone", true, "text", "(555) 123-4567"],
                  ["buyerEmail", "Email", true, "email", "buyer@example.com"],
                  ["buyerAddress", "Address", false, "text", "Street, City, State, ZIP"],
                  ["driverLicenseNo", "Driver License #", true, "text", "e.g. D1234567"],
                ] as const
              ).map(([name, label, required, type, placeholder]) => (
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
                          placeholder={placeholder}
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
                name="buyerState"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="State" required />
                      <FormMessage className="text-[10px] text-red-500" />
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                <AttachmentBadge
                  label="Driver License Upload"
                  fileName=""
                  uploaded={false}
                />
                <AttachmentBadge
                  label="Insurance Upload"
                  fileName=""
                  uploaded={false}
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
                  <FormLabel className="text-[10px] text-slate-400">
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
                  <FormLabel className="text-[10px] text-slate-400">
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
                          placeholder="e.g. Westlake Financial"
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
                          placeholder="Enter ROS number"
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
                            <SelectValue placeholder="Select deal type" />
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
                {extraFiles.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 rounded border border-slate-700/80 bg-slate-800/30 px-2 py-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span className="truncate text-[11px] text-slate-300">
                      {name}
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
                  const names = Array.from(e.dataTransfer.files).map(
                    (f) => f.name,
                  );
                  setExtraFiles((prev) => [...prev, ...names]);
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
                <CloudUpload className="mb-1.5 h-5 w-5 text-slate-500" />
                <p className="text-center text-[11px] text-slate-400">
                  + Upload Additional Document
                </p>
                <p className="text-center text-[10px] text-slate-500">
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
                <p className="w-full text-center text-[10px] text-slate-500">
                  Deal will be saved and sent for admin review.
                </p>
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
