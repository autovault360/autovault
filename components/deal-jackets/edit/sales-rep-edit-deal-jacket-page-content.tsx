"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  CheckCircle2,
  CloudUpload,
  FileText,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
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
import {
  DEAL_TYPES,
  US_STATES,
} from "@/lib/sales-rep/deal-jacket/constants";
import {
  unifiedDealJacketSchema,
  type UnifiedDealJacketFormValues,
} from "@/lib/sales-rep/deal-jacket/unified-schemas";
import { formatPhoneNumber } from "@/lib/vehicles/actions/utils";
import { updateDealJacket } from "@/lib/deal-jackets/server/update-deal-jacket";
import {
  getDealJacketEditData,
  type DealJacketEditData,
} from "@/lib/deal-jackets/server/get-deal-jacket-edit-data";
import { getCurrentSalesRepCommissionRate } from "@/lib/sales-rep/server/get-commission-rate";

function fieldClassName(hasError: boolean) {
  return cn(
    "h-8 border-slate-700/80 bg-slate-800/50 text-[12px] text-slate-100",
    hasError && "border-red-500",
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-700/60", className)}
    />
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

type Props = {
  dealJacketId: string;
};

export default function SalesRepEditDealJacketPageContent({
  dealJacketId,
}: Props) {
  const router = useRouter();
  const [editData, setEditData] = useState<DealJacketEditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(0.1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDealJacketEditData(dealJacketId),
      getCurrentSalesRepCommissionRate(),
    ]).then(([dataResult, rate]) => {
      if (cancelled) return;
      if (!dataResult.success) {
        toast.error(dataResult.error);
        router.push("/sales-rep/deal-jackets");
        return;
      }
      setEditData(dataResult.data);
      setCommissionRate(rate);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dealJacketId, router]);

  const form = useForm<UnifiedDealJacketFormValues>({
    resolver: zodResolver(
      unifiedDealJacketSchema,
    ) as Resolver<UnifiedDealJacketFormValues>,
    defaultValues: {
      linkedVehicleId: "",
      stockNo: "",
      vin: "",
      buyerName: "",
      buyerPhone: "",
      buyerEmail: "",
      buyerAddress: "",
      driverLicenseNo: "",
      buyerState: "" as UnifiedDealJacketFormValues["buyerState"],
      salePrice: 0,
      saleDate: "",
      downPayment: 0,
      tradeInAllowance: 0,
      dmvFees: 0,
      registrationFees: 0,
      documentationFees: 0,
      warrantyAmount: 0,
      gapAmount: 0,
      salesTaxAmount: 0,
      lender: "",
      rosNumber: "",
      dealType: "Retail",
      notes: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        linkedVehicleId: editData.linkedVehicleId,
        stockNo: editData.stockNo,
        vin: editData.vin,
        buyerName: editData.buyerName,
        buyerPhone: editData.buyerPhone,
        buyerEmail: editData.buyerEmail,
        buyerAddress: editData.buyerAddress,
        driverLicenseNo: editData.driverLicenseNo,
        buyerState:
          editData.buyerState as UnifiedDealJacketFormValues["buyerState"],
        salePrice: editData.salePrice,
        saleDate: editData.saleDate,
        downPayment: editData.downPayment,
        tradeInAllowance: editData.tradeInAllowance,
        dmvFees: editData.dmvFees,
        registrationFees: editData.registrationFees,
        documentationFees: editData.documentationFees,
        warrantyAmount: editData.warrantyAmount,
        gapAmount: editData.gapAmount,
        salesTaxAmount: editData.totalTax,
        lender: editData.lender,
        rosNumber: editData.rosNumber,
        dealType: editData.dealType as UnifiedDealJacketFormValues["dealType"],
        notes: editData.notes,
      });
    }
  }, [editData, form]);

  const salePrice = form.watch("salePrice");
  const downPayment = form.watch("downPayment");
  const tradeInAllowance = form.watch("tradeInAllowance");
  const dmvFees = form.watch("dmvFees");
  const registrationFees = form.watch("registrationFees");
  const documentationFees = form.watch("documentationFees");
  const warrantyAmount = form.watch("warrantyAmount");
  const gapAmount = form.watch("gapAmount");
  const salesTaxAmount = form.watch("salesTaxAmount");

  const derived = useMemo(() => {
    const price = Number(salePrice) || 0;
    const vehicleCost = editData?.vehicleAcquisitionCost ?? 0;
    const salesTax = Number(salesTaxAmount) || 0;
    const grossProfit = Math.max(price - vehicleCost, 0);
    const totalFeesExtras =
      (Number(dmvFees) || 0) +
      (Number(registrationFees) || 0) +
      (Number(documentationFees) || 0) +
      (Number(warrantyAmount) || 0) +
      (Number(gapAmount) || 0);
    const commissionEarned = grossProfit * commissionRate;
    const netProfit = Math.max(
      grossProfit - commissionEarned - totalFeesExtras * 0.15,
      0,
    );
    const financeAmount = Math.max(
      0,
      price +
        salesTax +
        (Number(dmvFees) || 0) +
        (Number(registrationFees) || 0) +
        (Number(documentationFees) || 0) +
        (Number(warrantyAmount) || 0) +
        (Number(gapAmount) || 0) -
        (Number(downPayment) || 0) -
        (Number(tradeInAllowance) || 0),
    );

    return {
      salePrice: price,
      vehicleCost,
      salesTax,
      grossProfit,
      totalFeesExtras,
      netProfit,
      commissionRate,
      commissionRatePercent: commissionRate * 100,
      commissionEarned,
      financeAmount,
    };
  }, [
    salePrice,
    editData,
    dmvFees,
    registrationFees,
    documentationFees,
    warrantyAmount,
    gapAmount,
    salesTaxAmount,
    downPayment,
    tradeInAllowance,
    commissionRate,
  ]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!editData) return;

    setIsSubmitting(true);
    try {
      const result = await updateDealJacket(
        dealJacketId,
        {
          linkedVehicleId: values.linkedVehicleId,
          buyerName: values.buyerName,
          buyerPhone: values.buyerPhone,
          buyerEmail: values.buyerEmail,
          buyerAddress: values.buyerAddress,
          driverLicenseNo: values.driverLicenseNo,
          buyerState: values.buyerState,
          salePrice: values.salePrice,
          saleDate: values.saleDate,
          downPayment: values.downPayment,
          tradeInAllowance: values.tradeInAllowance,
          dmvFees: values.dmvFees,
          registrationFees: values.registrationFees,
          documentationFees: values.documentationFees,
          warrantyAmount: values.warrantyAmount,
          gapAmount: values.gapAmount,
          salesTaxAmount: values.salesTaxAmount,
          lender: values.lender,
          rosNumber: values.rosNumber,
          dealType: values.dealType,
          notes: values.notes,
        },
        extraFiles,
      );

      if (result.success) {
        toast.success(
          `Deal jacket ${result.jacketNumber} updated and resubmitted.`,
        );
        router.push("/sales-rep/deal-jackets");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update deal jacket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setExtraFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full">
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
      </div>
    );
  }

  if (!editData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Deal jacket not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-card">
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <PageHeaderTitle
              title={`Edit Deal Jacket #${editData.jacketNumber}`}
              subtitle="Update the deal jacket and resubmit for review."
              subtitleClassName="text-[12.5px]"
            />
          </div>
        </div>
        <Button
          variant="outline"
          asChild
          className="h-8 border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-card"
        >
          <Link href={`/dashboard/deal-jackets/${dealJacketId}`}>
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to Detail
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-slate-700/80 bg-card p-3">
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
                  <div className="flex gap-3">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-slate-700/80 bg-slate-800/50">
                      {editData.vehicleImageUrl ? (
                        <Image
                          src={editData.vehicleImageUrl}
                          alt={editData.vehicleDisplayName}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="text-[12px] font-semibold text-white">
                        {editData.vehicleDisplayName}
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-[11px]">
                        <span className="shrink-0 text-[#64748b]">
                          Stock #
                        </span>
                        <span className="truncate text-right font-mono tabular-nums tracking-tight text-white">
                          {editData.stockNo}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-[11px]">
                        <span className="shrink-0 text-[#64748b]">VIN</span>
                        <span className="truncate text-right font-mono tabular-nums tracking-tight text-white">
                          {editData.vin}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-[11px]">
                        <span className="shrink-0 text-[#64748b]">
                          Mileage
                        </span>
                        <span className="truncate text-right font-mono tabular-nums tracking-tight text-white">
                          {editData.vehicleMileage.toLocaleString()} mi
                        </span>
                      </div>
                    </div>
                  </div>

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
                              const formatted = formatPhoneNumber(
                                e.target.value,
                              );
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
                              defaultToToday={false}
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
                    <FormField
                      control={form.control}
                      name="salesTaxAmount"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Sales Tax Amount" required />
                            <FormMessage className="text-[10px] text-red-500" />
                          </div>
                          <FormControl>
                            <Input
                              mode="currency"
                              theme="dark"
                              value={field.value}
                              onValueChange={field.onChange}
                              aria-invalid={!!fieldState.error}
                              placeholder="$0.00"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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

              {/* COLUMN 3: Commission Preview & Documents */}
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
                      Commission will be paid upon deal funding and admin
                      approval.
                    </p>
                  </div>
                </FormSection>

                <FormSection
                  title="Documents"
                  theme="dark"
                  className="border-slate-700/80"
                >
                  {editData.existingDocuments.length > 0 && (
                    <div className="mb-2 max-h-[180px] space-y-1 overflow-y-auto">
                      <p className="text-[10px] font-medium text-[#64748b] mb-1">
                        Existing Documents
                      </p>
                      {editData.existingDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 rounded border border-slate-700/80 bg-slate-800/30 px-2 py-1.5"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          <span className="truncate text-[11px] text-slate-300">
                            {doc.name}
                          </span>
                          <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {extraFiles.length > 0 && (
                    <div className="mb-2 max-h-[120px] space-y-1 overflow-y-auto">
                      <p className="text-[10px] font-medium text-[#64748b] mb-1">
                        New Documents
                      </p>
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
                  )}

                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/80 bg-slate-800/20 px-3 py-5 transition hover:border-blue-500/40 hover:bg-slate-800/40"
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

                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-700/80 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                      className="h-8 border-slate-700/80 bg-transparent text-[12px] text-slate-300 hover:bg-slate-800/50"
                    >
                      <Link href={`/dashboard/deal-jackets/${dealJacketId}`}>
                        Cancel
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="h-8 bg-blue-600 text-[12px] text-white hover:bg-blue-500"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Save Changes &amp; Resubmit
                    </Button>
                  </div>
                </FormSection>
              </div>
            </form>
          </ModalThemeProvider>
        </Form>
      </div>
    </div>
  );
}
