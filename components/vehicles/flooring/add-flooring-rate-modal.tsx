"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { applyFlooringPlan } from "@/lib/vehicles/server/apply-flooring-plan";
import { getFlooringVehicleOptions } from "@/lib/vehicles/server/get-flooring-summary";
import type { FlooringVehicleOption } from "@/lib/vehicles/flooring/types";
import { formatCurrencyDecimal } from "@/lib/vehicles/types";

type FlooringRateType = "monthly" | "daily" | "apr";
type IncreaseAmountType = "fixed" | "percentage";
type ApplyTo = "all" | "select";

type FormState = {
  rateType: FlooringRateType;
  baseMonthlyRate: number;
  effectiveDate: string;
  rateIncreaseEnabled: boolean;
  increaseAfterDays: number;
  increaseAmountType: IncreaseAmountType;
  increaseAmount: number;
  maxCap: number;
  buyFee: number;
  lateFeeAfterDays: number;
  lateFeeAmount: number;
  gracePeriodDays: number;
  applyTo: ApplyTo;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const DEFAULT_FORM: FormState = {
  rateType: "monthly",
  baseMonthlyRate: 250,
  effectiveDate: new Date().toISOString().split("T")[0] ?? "",
  rateIncreaseEnabled: true,
  increaseAfterDays: 30,
  increaseAmountType: "fixed",
  increaseAmount: 25,
  maxCap: 500,
  buyFee: 150,
  lateFeeAfterDays: 60,
  lateFeeAmount: 10,
  gracePeriodDays: 5,
  applyTo: "all",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      {children}
    </h3>
  );
}

function FieldLabel({
  children,
  required,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500",
        className,
      )}
    >
      {children}
      {required ? <span className="text-red-400"> *</span> : null}
    </label>
  );
}

function DarkInfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-blue-500/25 bg-[#0c1a2e] px-3 py-2.5">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
      <p className="text-[11px] leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}

function DaysSuffixInput({
  value,
  onChange,
  min = 0,
  "aria-invalid": ariaInvalid,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  "aria-invalid"?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-8 overflow-hidden rounded-[4px] border border-slate-600 bg-transparent",
        ariaInvalid && "border-red-400",
      )}
    >
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13px] text-white outline-none"
        aria-invalid={ariaInvalid}
      />
      <span className="flex shrink-0 items-center border-l border-slate-600 px-2.5 text-[11px] text-slate-500">
        Days
      </span>
    </div>
  );
}

function PerDayCurrencyInput({
  value,
  onChange,
  "aria-invalid": ariaInvalid,
}: {
  value: number;
  onChange: (value: number) => void;
  "aria-invalid"?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-8 overflow-hidden rounded-[4px] border border-slate-600 bg-transparent",
        ariaInvalid && "border-red-400",
      )}
    >
      <span className="flex shrink-0 items-center border-r border-slate-600 px-2.5 text-[13px] text-slate-400">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value.toFixed(2)}
        onChange={(event) => {
          const parsed = Number.parseFloat(event.target.value.replace(/[^0-9.]/g, ""));
          onChange(Number.isNaN(parsed) ? 0 : parsed);
        }}
        className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13px] text-white outline-none"
        aria-invalid={ariaInvalid}
      />
      <span className="flex shrink-0 items-center border-l border-slate-600 px-2 text-[11px] text-slate-500">
        Per Day
      </span>
    </div>
  );
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (form.baseMonthlyRate <= 0) {
    errors.baseMonthlyRate = "Base rate must be greater than zero.";
  }
  if (!form.effectiveDate) {
    errors.effectiveDate = "Effective date is required.";
  }

  if (form.rateIncreaseEnabled) {
    if (form.increaseAfterDays <= 0) {
      errors.increaseAfterDays = "Enter days greater than zero.";
    }
    if (form.increaseAmount <= 0) {
      errors.increaseAmount = "Increase amount must be greater than zero.";
    }
  }

  if (form.lateFeeAfterDays > 0 && form.lateFeeAmount <= 0) {
    errors.lateFeeAmount = "Late fee amount is required when days are set.";
  }

  return errors;
}

export default function AddFlooringRateModal({
  open,
  onOpenChange,
  activeInventoryCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeInventoryCount: number;
}) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState<FlooringVehicleOption[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    getFlooringVehicleOptions().then((options) => {
      setVehicleOptions(options);
      setSelectedVehicleIds(options.map((o) => o.id));
    });
  }, [open]);

  const rateIncreaseSummary = useMemo(() => {
    if (!form.rateIncreaseEnabled) return null;
    const amountLabel =
      form.increaseAmountType === "fixed"
        ? `$${form.increaseAmount.toFixed(2)}`
        : `${form.increaseAmount}%`;
    return `After ${form.increaseAfterDays} days, the flooring rate will increase by ${amountLabel}.`;
  }, [form]);

  const lateFeeSummary = useMemo(() => {
    return `Buy fee is charged once when flooring starts. Late fee of $${form.lateFeeAmount.toFixed(2)} will be charged per day after ${form.lateFeeAfterDays} days (after grace period).`;
  }, [form.lateFeeAmount, form.lateFeeAfterDays]);

  const baseRateLabel =
    form.rateType === "apr"
      ? "APR Rate (%)"
      : form.rateType === "daily"
        ? "Base Daily Rate"
        : "Base Monthly Rate";

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleClose = () => {
    onOpenChange(false);
    setErrors({});
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm(form);
    if (form.applyTo === "select" && selectedVehicleIds.length === 0) {
      toast.error("Select at least one vehicle.");
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await applyFlooringPlan({
        planName: "Standard Floor Plan",
        rateType: form.rateType,
        baseRate: form.baseMonthlyRate,
        effectiveDate: form.effectiveDate,
        rateIncreaseEnabled: form.rateIncreaseEnabled,
        increaseAfterDays: form.increaseAfterDays,
        increaseAmountType: form.increaseAmountType,
        increaseAmount: form.increaseAmount,
        maxCap: form.maxCap > 0 ? form.maxCap : null,
        buyFee: form.buyFee,
        lateFeeAfterDays: form.lateFeeAfterDays,
        lateFeePerDay: form.lateFeeAmount,
        gracePeriodDays: form.gracePeriodDays,
        applyTo: form.applyTo,
        vehicleIds: form.applyTo === "select" ? selectedVehicleIds : undefined,
      });

      if (result.success) {
        toast.success(
          `Flooring rate applied to ${result.vehiclesUpdated} vehicle${result.vehiclesUpdated === 1 ? "" : "s"}.`,
        );
        router.refresh();
        handleClose();
      } else {
        toast.error(result.error ?? "Failed to apply flooring rate.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[95vh] w-[min(860px,calc(100vw-1.5rem))] max-w-none gap-0 overflow-hidden rounded-lg border border-slate-700 bg-[#0b1322] p-0 text-slate-200 shadow-2xl",
          "sm:max-w-none",
        )}
      >
        <DialogTitle className="sr-only">Add Flooring Rate To All Vehicles</DialogTitle>

        <div className="flex items-start justify-between border-b border-slate-700/80 px-6 py-5">
          <div>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.08em] text-white">
              ADD FLOORING RATE TO ALL VEHICLES
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
              Set a flooring cost (monthly rate) that will be applied to all unsold vehicles.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(95vh-140px)] space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <FieldLabel required>Flooring Rate Type</FieldLabel>
              <Select
                value={form.rateType}
                onValueChange={(value: FlooringRateType) => updateForm("rateType", value)}
              >
                <SelectTrigger theme="dark" className="h-8 w-full text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent theme="dark">
                  <SelectItem value="monthly" className="text-[12px]">
                    Monthly Rate
                  </SelectItem>
                  <SelectItem value="daily" className="text-[12px]">
                    Daily Rate
                  </SelectItem>
                  <SelectItem value="apr" className="text-[12px]">
                    APR
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <FieldLabel required>{baseRateLabel}</FieldLabel>
              {form.rateType === "apr" ? (
                <Input
                  theme="dark"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="9.00"
                  value={form.baseMonthlyRate}
                  onChange={(e) =>
                    updateForm("baseMonthlyRate", Number(e.target.value) || 0)
                  }
                  aria-invalid={!!errors.baseMonthlyRate}
                />
              ) : (
                <Input
                  mode="currency"
                  theme="dark"
                  value={form.baseMonthlyRate}
                  onValueChange={(value) => updateForm("baseMonthlyRate", value)}
                  aria-invalid={!!errors.baseMonthlyRate}
                />
              )}
              {errors.baseMonthlyRate ? (
                <p className="mt-1 text-[10px] text-red-400">{errors.baseMonthlyRate}</p>
              ) : null}
            </div>

            <div>
              <FieldLabel required>Effective Date</FieldLabel>
              <Input
                mode="date"
                theme="dark"
                value={form.effectiveDate}
                onChange={(event) => updateForm("effectiveDate", event.target.value)}
                defaultToToday={false}
                aria-invalid={!!errors.effectiveDate}
              />
              {errors.effectiveDate ? (
                <p className="mt-1 text-[10px] text-red-400">{errors.effectiveDate}</p>
              ) : null}
            </div>
          </div>

          <section className="space-y-3 border-t border-slate-700/80 pt-5">
            <SectionTitle>Rate Increase (Optional)</SectionTitle>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.rateIncreaseEnabled}
                onChange={(event) => updateForm("rateIncreaseEnabled", event.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 accent-blue-500"
              />
              <span className="text-[12px] text-slate-300">
                Increase rate after a certain number of days
              </span>
            </label>

            {form.rateIncreaseEnabled ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <FieldLabel>Increase After (Days)</FieldLabel>
                    <DaysSuffixInput
                      value={form.increaseAfterDays}
                      onChange={(value) => updateForm("increaseAfterDays", value)}
                      min={1}
                      aria-invalid={!!errors.increaseAfterDays}
                    />
                  </div>
                  <div>
                    <FieldLabel>Increase Amount Type</FieldLabel>
                    <Select
                      value={form.increaseAmountType}
                      onValueChange={(value: IncreaseAmountType) =>
                        updateForm("increaseAmountType", value)
                      }
                    >
                      <SelectTrigger theme="dark" className="h-8 w-full text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent theme="dark">
                        <SelectItem value="fixed" className="text-[12px]">
                          Fixed Amount
                        </SelectItem>
                        <SelectItem value="percentage" className="text-[12px]">
                          Percentage
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Amount</FieldLabel>
                    {form.increaseAmountType === "fixed" ? (
                      <Input
                        mode="currency"
                        theme="dark"
                        value={form.increaseAmount}
                        onValueChange={(value) => updateForm("increaseAmount", value)}
                        aria-invalid={!!errors.increaseAmount}
                      />
                    ) : (
                      <Input
                        theme="dark"
                        type="number"
                        min={0}
                        step={0.1}
                        value={form.increaseAmount}
                        onChange={(event) =>
                          updateForm("increaseAmount", Number(event.target.value) || 0)
                        }
                        aria-invalid={!!errors.increaseAmount}
                      />
                    )}
                  </div>
                  <div>
                    <FieldLabel>Max Cap (Optional)</FieldLabel>
                    <Input
                      mode="currency"
                      theme="dark"
                      value={form.maxCap}
                      onValueChange={(value) => updateForm("maxCap", value)}
                    />
                  </div>
                </div>

                {rateIncreaseSummary ? <DarkInfoBox>{rateIncreaseSummary}</DarkInfoBox> : null}
              </>
            ) : null}
          </section>

          <section className="space-y-3 border-t border-slate-700/80 pt-5">
            <SectionTitle>Additional Fees (Optional)</SectionTitle>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <FieldLabel>Buy Fee (One-Time)</FieldLabel>
                <Input
                  mode="currency"
                  theme="dark"
                  value={form.buyFee}
                  onValueChange={(value) => updateForm("buyFee", value)}
                />
                <p className="mt-1 text-[10px] text-slate-500">Charged once per vehicle</p>
              </div>
              <div>
                <FieldLabel>Late Fee (After Days)</FieldLabel>
                <DaysSuffixInput
                  value={form.lateFeeAfterDays}
                  onChange={(value) => updateForm("lateFeeAfterDays", value)}
                />
              </div>
              <div>
                <FieldLabel>Late Fee Amount</FieldLabel>
                <PerDayCurrencyInput
                  value={form.lateFeeAmount}
                  onChange={(value) => updateForm("lateFeeAmount", value)}
                  aria-invalid={!!errors.lateFeeAmount}
                />
                {errors.lateFeeAmount ? (
                  <p className="mt-1 text-[10px] text-red-400">{errors.lateFeeAmount}</p>
                ) : null}
              </div>
              <div>
                <FieldLabel>Grace Period (Days)</FieldLabel>
                <DaysSuffixInput
                  value={form.gracePeriodDays}
                  onChange={(value) => updateForm("gracePeriodDays", value)}
                />
              </div>
            </div>

            <DarkInfoBox>{lateFeeSummary}</DarkInfoBox>
          </section>

          <section className="space-y-3 border-t border-slate-700/80 pt-5">
            <SectionTitle>Apply To</SectionTitle>

            <RadioGroup
              value={form.applyTo}
              onValueChange={(value: ApplyTo) => updateForm("applyTo", value)}
              className="space-y-4"
            >
              <label className="flex cursor-pointer items-start gap-3">
                <RadioGroupItem value="all" id="apply-all" className="mt-0.5 border-slate-600" />
                <span>
                  <span className="block text-[12px] font-medium text-white">
                    All Active Inventory ({activeInventoryCount} vehicles)
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                    Apply this rate to all vehicles that are currently in inventory.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <RadioGroupItem
                  value="select"
                  id="apply-select"
                  className="mt-0.5 border-slate-600"
                />
                <span>
                  <span className="block text-[12px] font-medium text-white">
                    Select Vehicles
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                    Choose specific vehicles to apply this flooring rate.
                  </span>
                </span>
              </label>
            </RadioGroup>

            {form.applyTo === "select" ? (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-slate-700 bg-slate-900/40 p-3">
                {vehicleOptions.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No active inventory vehicles.</p>
                ) : (
                  vehicleOptions.map((vehicle) => (
                    <label
                      key={vehicle.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-800/60"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.includes(vehicle.id)}
                        onChange={() => toggleVehicle(vehicle.id)}
                        className="h-3.5 w-3.5 rounded border-slate-600 accent-blue-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] text-white">
                          {vehicle.label}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          Stock #{vehicle.stockNumber || "—"} ·{" "}
                          {formatCurrencyDecimal(vehicle.purchasePrice)}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            ) : null}
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-700/80 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            theme="dark"
            onClick={handleClose}
            disabled={submitting}
            className="min-w-[100px] border-slate-600 bg-[#0e1626] text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="min-w-[160px] bg-blue-600 text-white hover:bg-blue-500"
          >
            {submitting ? "Saving..." : "Add Flooring Rate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}