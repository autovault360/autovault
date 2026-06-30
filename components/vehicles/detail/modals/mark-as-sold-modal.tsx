"use client";

import { useRef, type ReactNode } from "react";
import {
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { useMarkAsSoldForm } from "@/hooks/vehicles/use-mark-as-sold-form";
import {
  COMMISSION_TYPES,
  PAYOUT_FREQUENCY_OPTIONS,
  US_STATES,
} from "@/lib/vehicles/actions/options";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectOptions,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  FieldLabel,
  FilePreviewCard,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";
import { formatCurrencyDecimal } from "@/lib/vehicles/types";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/vehicles/actions/utils";

type Props = {
  vehicle: VehicleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
      {children}
    </h3>
  );
}

function CostRow({
  label,
  value,
  info,
}: {
  label: string;
  value: number;
  info?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12px]">
      <span className="flex items-center gap-1 text-slate-400">
        {label}
        {info && <Info className="h-3 w-3 text-slate-500" />}
      </span>
      <span className="tabular-nums text-slate-200">
        {formatCurrencyDecimal(value)}
      </span>
    </div>
  );
}

function FinancialSummaryItem({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "negative" | "positive";
}) {
  return (
    <div className="min-w-0 flex-1 px-3 py-2 text-center">
      <p className="truncate text-[9px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-[13px] font-bold tabular-nums",
          variant === "negative" && "text-red-400",
          variant === "positive" && "text-emerald-400",
          variant === "default" && "text-slate-100",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function MarkAsSoldModal({
  vehicle,
  open,
  onOpenChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    form,
    onSubmit,
    isSubmitting,
    derived,
    costBreakdown,
    shake,
    handlePhoneChange,
    handleSalesRepChange,
    salesReps,
  } = useMarkAsSoldForm(vehicle, open, () => onOpenChange(false));

  const commissionType = form.watch("commissionType");
  const dealerPayoutsEnabled = form.watch("dealerPayoutsEnabled");
  const commissionRate = form.watch("commissionRate");
  const soldPriceBeforeTax = form.watch("soldPriceBeforeTax");
  const salesTaxAmount = form.watch("salesTaxAmount");
  const licenseRegistrationFees = form.watch("licenseRegistrationFees");
  const documents = form.watch("documents");

  const addPayoutItem = () => {
    const items = form.getValues("payoutItems");
    form.setValue(
      "payoutItems",
      [...items, { description: "", amount: 0, frequency: "one_time" as const }],
      { shouldDirty: true },
    );
  };

  const removePayoutItem = (index: number) => {
    const items = form.getValues("payoutItems");
    form.setValue(
      "payoutItems",
      items.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  const handleDocumentsAdded = (files: File[]) => {
    const current = form.getValues("documents");
    form.setValue("documents", [...current, ...files], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const commissionLabel =
    commissionType === "percentage"
      ? `COMMISSION (${commissionRate.toFixed(2)}%)`
      : "COMMISSION";

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="xl" theme="dark">
      <ModalHeader
        icon={<CheckCircle2 className="h-4 w-4 text-white" />}
        iconClassName="bg-red-600"
        title="Mark Vehicle as Sold"
        subtitle="All costs and fees have been auto-populated."
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake} className="space-y-0 px-0 py-0">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,280px)_1fr]">
              {/* Left: Cost Breakdown */}
              <aside className="border-b border-slate-800 bg-[#0a1018] px-5 py-5 lg:border-r lg:border-b-0">
                <SectionTitle>Cost Breakdown (Auto-Populated)</SectionTitle>
                <div className="space-y-0.5">
                  <CostRow label="Purchase Price" value={costBreakdown.purchasePrice} />
                  <CostRow label="Auction / Fees" value={costBreakdown.auctionFees} />
                  <CostRow label="Repairs" value={costBreakdown.repairs} />
                  <CostRow label="Flooring Fees" value={costBreakdown.flooringFees} info />
                  <CostRow label="Other Expenses" value={costBreakdown.otherExpenses} />
                  <div className="my-2 border-t border-slate-700/80" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[12px] font-semibold text-slate-200">
                      Total Investment
                    </span>
                    <span className="text-[14px] font-bold tabular-nums text-white">
                      {formatCurrencyDecimal(costBreakdown.totalInvestment)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                  <p className="text-[11px] leading-relaxed text-blue-200/90">
                    These amounts are locked and cannot be edited.
                  </p>
                </div>
              </aside>

              {/* Right: Form sections */}
              <div className="space-y-5 px-5 py-5">
                {/* Sales Details */}
                <div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="soldPriceBeforeTax"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FieldLabel label="Sold Price (Before Tax)" required />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              theme="dark"
                              mode="currency"
                              placeholder="0.00"
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
                      name="salesTaxAmount"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FieldLabel label="Sales Tax (Collected)" />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              theme="dark"
                              mode="currency"
                              placeholder="0.00"
                              value={field.value}
                              onValueChange={field.onChange}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div>
                      <FieldLabel label="Total Price (With Tax & Fees)" />
                      <FormControl>
                        <Input
                          theme="dark"
                          mode="currency"
                          value={derived.totalPriceWithTaxAndFees}
                          onValueChange={() => {}}
                          disabled
                          className="opacity-70"
                        />
                      </FormControl>
                    </div>
                    <FormField
                      control={form.control}
                      name="saleDate"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FieldLabel label="Sold Date" required />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              theme="dark"
                              mode="date"
                              placeholder="MM/DD/YYYY"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="licenseRegistrationFees"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FieldLabel label="License / Registration Fees" />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              theme="dark"
                              mode="currency"
                              placeholder="0.00"
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
                      name="rosNumber"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FieldLabel label="ROS Number" />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              theme="dark"
                              placeholder="Enter ROS number"
                              {...field}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCodeOfSale"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FieldLabel label="ZIP Code" required />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              theme="dark"
                              placeholder="90210"
                              {...field}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {/* Buyer / Customer */}
                  <div>
                    <SectionTitle>Buyer / Customer Information</SectionTitle>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FieldLabel label="Customer Name" required />
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Input
                                theme="dark"
                                placeholder="Full name"
                                {...field}
                                aria-invalid={!!fieldState.error}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FieldLabel label="Phone Number" required />
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Input
                                theme="dark"
                                value={field.value}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                onBlur={field.onBlur}
                                placeholder="(310) 555-1234"
                                aria-invalid={!!fieldState.error}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FieldLabel label="Email Address" />
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Input
                                theme="dark"
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                                aria-invalid={!!fieldState.error}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FieldLabel label="Address" required />
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Input
                                theme="dark"
                                placeholder="Street address"
                                {...field}
                                aria-invalid={!!fieldState.error}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field, fieldState }) => (
                            <FormItem className="col-span-1">
                              <div className="flex items-center justify-between">
                                <FieldLabel label="City" required />
                                <FormMessage />
                              </div>
                              <FormControl>
                                <Input
                                  theme="dark"
                                  placeholder="City"
                                  {...field}
                                  aria-invalid={!!fieldState.error}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FieldLabel label="State" required />
                                <FormMessage />
                              </div>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                                  <SelectValue placeholder="CA" />
                                </SelectTrigger>
                                <SelectContent theme="dark">
                                  <SelectOptions theme="dark" options={US_STATES} label="State" />
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FieldLabel label="ZIP Code" required />
                                <FormMessage />
                              </div>
                              <FormControl>
                                <Input
                                  theme="dark"
                                  placeholder="90210"
                                  {...field}
                                  aria-invalid={!!fieldState.error}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="documents"
                        render={({ fieldState }) => (
                          <FormItem>
                            <FieldLabel label="Upload Documents (JPG only)" />
                            <div
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === "Enter" && fileInputRef.current?.click()
                              }
                              onClick={() => fileInputRef.current?.click()}
                              className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-600 bg-slate-800/40 px-4 py-6 transition hover:border-slate-500"
                            >
                              <Upload className="mb-2 h-6 w-6 text-slate-400" />
                              <p className="text-[12px] font-medium text-slate-300">
                                Drag &amp; drop files here or click to upload
                              </p>
                              <p className="mt-1 text-center text-[10px] text-slate-500">
                                Driver&apos;s License, Bill of Sale, Proof of Insurance, etc.
                              </p>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                const valid: File[] = [];
                                for (const file of files) {
                                  const err = validateFile(file, {
                                    maxSizeMB: 5,
                                    allowedTypes: ["image/jpeg"],
                                  });
                                  if (!err) valid.push(file);
                                }
                                if (valid.length) handleDocumentsAdded(valid);
                                e.target.value = "";
                              }}
                            />
                            {documents.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {documents.map((file, i) => (
                                  <FilePreviewCard
                                    key={`${file.name}-${i}`}
                                    file={file}
                                    onRemove={() => {
                                      form.setValue(
                                        "documents",
                                        documents.filter((_, idx) => idx !== i),
                                        { shouldValidate: true },
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            {fieldState.error && (
                              <p className="mt-1 text-[11px] text-red-500">
                                {fieldState.error.message}
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Sales Rep & Commission */}
                  <div className="space-y-5">
                    <div>
                      <SectionTitle>Sales Rep &amp; Commission (Optional)</SectionTitle>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="salesRepId"
                          render={({ field }) => (
                            <FormItem>
                              <FieldLabel label="Sales Rep" />
                              <Select
                                value={field.value || undefined}
                                onValueChange={handleSalesRepChange}
                              >
                                <SelectTrigger theme="dark">
                                  <SelectValue placeholder="Select sales rep..." />
                                </SelectTrigger>
                                <SelectContent theme="dark">
                                  {salesReps.map((rep) => (
                                    <SelectItem key={rep.id} value={rep.id}>
                                      {rep.fullName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="commissionType"
                            render={({ field }) => (
                              <FormItem>
                                <FieldLabel label="Commission Type" />
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger theme="dark">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent theme="dark">
                                    <SelectOptions
                                      theme="dark"
                                      options={COMMISSION_TYPES}
                                      label="Commission Type"
                                    />
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          {commissionType === "percentage" ? (
                            <FormField
                              control={form.control}
                              name="commissionRate"
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FieldLabel label="Commission Rate (%)" />
                                  <FormControl>
                                    <Input
                                      theme="dark"
                                      mode="percent"
                                      placeholder="10.00"
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      aria-invalid={!!fieldState.error}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ) : (
                            <div />
                          )}
                        </div>
                        <div className="flex items-center gap-3 py-1">
                          <div className="h-px flex-1 bg-slate-700" />
                          <span className="text-[10px] font-medium text-slate-500">??? OR ???</span>
                          <div className="h-px flex-1 bg-slate-700" />
                        </div>
                        <FormField
                          control={form.control}
                          name="manualCommissionAmount"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <div className="flex items-center gap-1">
                                <FieldLabel label="Input Commission Manually" />
                                <Info className="h-3 w-3 text-slate-500" />
                              </div>
                              <FormControl>
                                <Input
                                  theme="dark"
                                  mode="currency"
                                  placeholder="0.00"
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={commissionType === "percentage"}
                                  aria-invalid={!!fieldState.error}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <p className="text-[11px] text-violet-400">
                          Commission will be deducted from gross profit.
                        </p>
                      </div>
                    </div>

                    {/* Dealer Payouts */}
                    <div className="rounded-md border border-slate-700/80 bg-slate-900/30 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <SectionTitle>
                          Dealer Pays Sales Rep For Other Items (Optional)
                        </SectionTitle>
                        <FormField
                          control={form.control}
                          name="dealerPayoutsEnabled"
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-checked:bg-orange-500"
                            />
                          )}
                        />
                      </div>

                      {dealerPayoutsEnabled && (
                        <>
                          <div className="mb-2 grid grid-cols-[1fr_100px_110px_32px] gap-2 text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                            <span>Description</span>
                            <span>Amount</span>
                            <span>Frequency</span>
                            <span />
                          </div>
                          <FormField
                            control={form.control}
                            name="payoutItems"
                            render={({ field }) => (
                              <div className="space-y-2">
                                {field.value.map((item, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-[1fr_100px_110px_32px] items-center gap-2"
                                  >
                                    <Input
                                      theme="dark"
                                      placeholder="Lot Bonus"
                                      value={item.description}
                                      onChange={(e) => {
                                        const next = [...field.value];
                                        next[index] = {
                                          ...next[index],
                                          description: e.target.value,
                                        };
                                        field.onChange(next);
                                      }}
                                    />
                                    <Input
                                      theme="dark"
                                      mode="currency"
                                      placeholder="0.00"
                                      value={item.amount}
                                      onValueChange={(v) => {
                                        const next = [...field.value];
                                        next[index] = { ...next[index], amount: v };
                                        field.onChange(next);
                                      }}
                                    />
                                    <Select
                                      value={item.frequency}
                                      onValueChange={(v) => {
                                        const next = [...field.value];
                                        next[index] = {
                                          ...next[index],
                                          frequency: v as typeof item.frequency,
                                        };
                                        field.onChange(next);
                                      }}
                                    >
                                      <SelectTrigger theme="dark" className="h-8 text-[11px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent theme="dark">
                                        {PAYOUT_FREQUENCY_OPTIONS.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <button
                                      type="button"
                                      onClick={() => removePayoutItem(index)}
                                      className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-red-400"
                                      aria-label="Remove payout item"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addPayoutItem}
                                  className="flex items-center gap-1 text-[12px] font-medium text-orange-400 hover:text-orange-300"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add Another Item
                                </button>
                              </div>
                            )}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary Bar */}
            <div className="border-t border-slate-800 bg-[#070c14]">
              <div className="flex flex-wrap items-stretch divide-x divide-slate-800 overflow-x-auto">
                <FinancialSummaryItem
                  label="Total Investment"
                  value={formatCurrencyDecimal(costBreakdown.totalInvestment)}
                />
                <FinancialSummaryItem
                  label="Sold Price (Before Tax)"
                  value={formatCurrencyDecimal(soldPriceBeforeTax)}
                />
                <FinancialSummaryItem
                  label="Sales Tax (Collected)"
                  value={formatCurrencyDecimal(salesTaxAmount)}
                />
                <FinancialSummaryItem
                  label="License / Reg. Fees"
                  value={formatCurrencyDecimal(licenseRegistrationFees)}
                />
                <FinancialSummaryItem
                  label={commissionLabel}
                  value={`-${formatCurrencyDecimal(derived.commissionAmount)}`}
                  variant="negative"
                />
                <FinancialSummaryItem
                  label="Other Payouts"
                  value={`-${formatCurrencyDecimal(derived.otherPayoutsTotal)}`}
                  variant="negative"
                />
                <FinancialSummaryItem
                  label="Net Profit (After Payouts)"
                  value={formatCurrencyDecimal(derived.netProfit)}
                  variant="positive"
                />
                <FinancialSummaryItem
                  label="ROI (After Payouts)"
                  value={`${derived.roiPercent}%`}
                  variant="positive"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            submitLabel="Confirm & Mark as Sold"
            submitClassName="bg-red-600 hover:bg-red-500"
            submitIcon={<CheckCircle2 className="mr-1.5 h-4 w-4" />}
            isSubmitting={isSubmitting}
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
