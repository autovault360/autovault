"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronUp, CloudUpload, Loader2 } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { Badge } from "@/components/ui/badge";
import { FormGrid, FormSection } from "@/components/ui/form";
import DealJacketStepper from "./deal-jacket-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/sales-reps/types";
import { useCreateDealJacketForm } from "@/hooks/sales-rep/use-create-deal-jacket-form";
import {
  DEAL_TYPES,
  PAYMENT_TYPES,
} from "@/lib/sales-rep/deal-jacket/schemas";
import type {
  IPricingConstants,
  ISalesRepProfile,
  ITradeInOption,
  IVehicleCard,
} from "@/lib/sales-rep/dashboard/types";

type Props = {
  expanded: boolean;
  onCollapse: () => void;
  selectedVehicle: IVehicleCard | null;
  profile: ISalesRepProfile;
  pricing: IPricingConstants;
  tradeInOptions: ITradeInOption[];
  panelRef: React.RefObject<HTMLDivElement | null>;
};

function fieldClassName(hasError: boolean) {
  return cn(
    "border-slate-700 bg-[#0e1626] text-[12px] text-slate-300",
    hasError && "border-red-500",
  );
}

export default function CreateDealJacketPanel({
  expanded,
  onCollapse,
  selectedVehicle,
  profile,
  pricing,
  tradeInOptions,
  panelRef,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const {
    form,
    derived,
    hasTradeIn,
    isSubmitting,
    shake,
    saveDraft,
    continueToBuyer,
    yearModel,
    vehicleImageUrl,
  } = useCreateDealJacketForm(selectedVehicle, profile, pricing);

  if (!expanded) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles((prev) => [
        ...prev,
        ...Array.from(files).map((f) => f.name),
      ]);
    }
  };

  return (
    <div ref={panelRef} id="create-deal-jacket" className="mt-3.5 scroll-mt-4">
      <CardShell
        className={cn(
          shake && "animate-[shake_0.4s_ease-in-out]",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
              CREATE DEAL JACKET
            </span>
            <Badge className="border-0 bg-blue-600/20 text-[10px] text-blue-400 hover:bg-blue-600/20">
              Draft
            </Badge>
          </div>
          <button
            type="button"
            onClick={onCollapse}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
          >
            Collapse <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </div>

        <DealJacketStepper activeStep={1} />

        <Form {...form}>
          <form className="space-y-4">
            <FormGrid cols={4}>
              <FormSection title="Vehicle Information" theme="dark">
                <div className="flex gap-3">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-slate-800">
                    {vehicleImageUrl ? (
                      <Image
                        src={vehicleImageUrl}
                        alt={yearModel}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                  <div className="text-[12px] font-medium text-white">
                    {yearModel || "Select a vehicle"}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="stockNo"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        Stock #
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={fieldClassName(!!fieldState.error)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        VIN
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={fieldClassName(!!fieldState.error)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title="Deal Information" theme="dark">
                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        Sale Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={fieldClassName(!!fieldState.error)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dealType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        Deal Type
                      </FormLabel>
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
                        <SelectContent className="border-slate-800 bg-[#0e1626] text-slate-300">
                          {DEAL_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        Payment Type
                      </FormLabel>
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
                        <SelectContent className="border-slate-800 bg-[#0e1626] text-slate-300">
                          {PAYMENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        Sale Price
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                          }
                          className={fieldClassName(!!fieldState.error)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasTradeIn"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-[10px] text-slate-500">
                        Trade-In?
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {hasTradeIn && (
                  <FormField
                    control={form.control}
                    name="tradeInVehicle"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-slate-500">
                          Trade-In Vehicle
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={fieldClassName(!!fieldState.error)}
                              aria-invalid={!!fieldState.error}
                            >
                              <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-slate-800 bg-[#0e1626] text-slate-300">
                            {tradeInOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] text-red-500" />
                      </FormItem>
                    )}
                  />
                )}
              </FormSection>

              <FormSection title="Pricing Breakdown" theme="dark">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Cost / Purchase Price</span>
                  <span className="text-slate-300 tabular-nums">
                    {formatCurrency(pricing.costPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Reconditioning</span>
                  <span className="text-slate-300 tabular-nums">
                    {formatCurrency(pricing.reconditioning)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Gross Profit</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">
                    {formatCurrency(derived.grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Commission %</span>
                  <span className="text-slate-300 tabular-nums">
                    {derived.commissionRatePercent}%
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-[12px]">
                  <span className="font-medium text-slate-400">
                    Estimated Commission
                  </span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(derived.estimatedCommission)}
                  </span>
                </div>
              </FormSection>

              <FormSection title="Notes & Salesperson Info" theme="dark">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-slate-500">
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add any notes about this deal..."
                          className="min-h-[80px] border-slate-700 bg-[#0e1626] text-[12px] text-slate-300 placeholder:text-slate-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="space-y-1 rounded border border-slate-800 bg-[#0e1626] p-2">
                  <div className="text-[10px] text-slate-500">
                    Salesperson Information
                  </div>
                  <div className="text-[12px] font-medium text-white">
                    {profile.name}
                  </div>
                  <div className="text-[11px] text-slate-500">{profile.id}</div>
                </div>
              </FormSection>
            </FormGrid>

            {/* Document Upload */}
            <div
              className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#0e1626]/50 px-4 py-8"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const names = Array.from(e.dataTransfer.files).map(
                  (f) => f.name,
                );
                setUploadedFiles((prev) => [...prev, ...names]);
              }}
            >
              <CloudUpload className="mb-2 h-8 w-8 text-slate-600" />
              <p className="text-[12px] text-slate-400">
                Drag &amp; Drop files here or
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 border-slate-700 bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="mt-2 text-[10px] text-slate-600">
                PDF, JPG, PNG (Max 20MB per file)
              </p>
              {uploadedFiles.length > 0 && (
                <ul className="mt-2 text-[10px] text-slate-400">
                  {uploadedFiles.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <span className="text-[11px] text-slate-500">
                Deal Jacket Status:{" "}
                <span className="text-slate-300">Draft</span>
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={saveDraft}
                  className="border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={continueToBuyer}
                  className="bg-emerald-600 text-[12px] text-white hover:bg-emerald-500"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Continue to Buyer Information
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardShell>
    </div>
  );
}
