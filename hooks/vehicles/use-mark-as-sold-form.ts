"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { buildMarkAsSoldDefaults } from "@/lib/vehicles/actions/defaults";
import {
  markAsSoldSchema,
  type MarkAsSoldFormValues,
} from "@/lib/vehicles/actions/schemas";
import { formatPhoneNumber } from "@/lib/vehicles/actions/utils";
import { getSuccessMessage } from "@/lib/vehicles/actions/submit";
import { markAsSold } from "@/lib/vehicles/server/mark-as-sold";
import {
  buildVehicleCostBreakdown,
  calculateMarkAsSoldFinancials,
} from "@/lib/vehicles/cost-breakdown";
import {
  getMarkAsSoldOptions,
  type MarkAsSoldSalesRepOption,
} from "@/lib/vehicles/server/get-mark-as-sold-options";

export function useMarkAsSoldForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [salesReps, setSalesReps] = useState<MarkAsSoldSalesRepOption[]>([]);

  const costBreakdown = useMemo(
    () => buildVehicleCostBreakdown(vehicle),
    [vehicle],
  );

  const form = useForm<MarkAsSoldFormValues>({
    resolver: zodResolver(markAsSoldSchema) as Resolver<MarkAsSoldFormValues>,
    defaultValues: buildMarkAsSoldDefaults(vehicle),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildMarkAsSoldDefaults(vehicle));
      getMarkAsSoldOptions().then(({ salesReps: reps }) => {
        setSalesReps(reps);
      });
    }
  }, [open, vehicle, form]);

  const soldPriceBeforeTax = form.watch("soldPriceBeforeTax");
  const salesTaxAmount = form.watch("salesTaxAmount");
  const licenseRegistrationFees = form.watch("licenseRegistrationFees");
  const commissionType = form.watch("commissionType");
  const commissionRate = form.watch("commissionRate");
  const manualCommissionAmount = form.watch("manualCommissionAmount");
  const dealerPayoutsEnabled = form.watch("dealerPayoutsEnabled");
  const payoutItems = form.watch("payoutItems");
  const salesRepId = form.watch("salesRepId");

  const derived = useMemo(
    () =>
      calculateMarkAsSoldFinancials({
        totalInvestment: costBreakdown.totalInvestment,
        soldPriceBeforeTax,
        salesTaxAmount,
        licenseRegistrationFees,
        commissionType,
        commissionRate,
        manualCommissionAmount,
        dealerPayoutsEnabled,
        payoutItems,
      }),
    [
      costBreakdown.totalInvestment,
      soldPriceBeforeTax,
      salesTaxAmount,
      licenseRegistrationFees,
      commissionType,
      commissionRate,
      manualCommissionAmount,
      dealerPayoutsEnabled,
      payoutItems,
    ],
  );

  useEffect(() => {
    if (commissionType === "percentage") {
      const amount =
        Math.round(soldPriceBeforeTax * (commissionRate / 100) * 100) / 100;
      form.setValue("manualCommissionAmount", amount, { shouldDirty: false });
    }
  }, [commissionType, soldPriceBeforeTax, commissionRate, form]);

  const handlePhoneChange = (value: string) => {
    form.setValue("phoneNumber", formatPhoneNumber(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSalesRepChange = (repId: string) => {
    form.setValue("salesRepId", repId, { shouldDirty: true });
    const rep = salesReps.find((r) => r.id === repId);
    if (rep) {
      form.setValue("commissionRate", rep.commissionRate, { shouldDirty: true });
      if (commissionType === "percentage") {
        const amount =
          Math.round(soldPriceBeforeTax * (rep.commissionRate / 100) * 100) /
          100;
        form.setValue("manualCommissionAmount", amount, { shouldDirty: true });
      }
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        customerName: values.customerName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        saleDate: values.saleDate,
        soldPriceBeforeTax: values.soldPriceBeforeTax,
        salesTaxAmount: values.salesTaxAmount,
        licenseRegistrationFees: values.licenseRegistrationFees,
        totalPriceWithTaxAndFees: derived.totalPriceWithTaxAndFees,
        rosNumber: values.rosNumber,
        zipCodeOfSale: values.zipCodeOfSale,
        salesRepId: values.salesRepId || null,
        commissionType: values.commissionType,
        commissionRate: values.commissionRate,
        manualCommissionAmount: values.manualCommissionAmount,
        commissionAmount: derived.commissionAmount,
        dealerPayoutsEnabled: values.dealerPayoutsEnabled,
        payoutItems: values.dealerPayoutsEnabled ? values.payoutItems : [],
        otherPayoutsTotal: derived.otherPayoutsTotal,
        netProfit: derived.netProfit,
        roiPercent: derived.roiPercent,
        totalInvestment: costBreakdown.totalInvestment,
        notes: values.notes,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      values.documents.forEach((file, i) => {
        formData.append(`document_${i}`, file);
      });

      const result = await markAsSold(formData);

      if (result.success) {
        toast.success(getSuccessMessage("mark-as-sold"));
        onSuccess();
      } else {
        toast.error(result.error ?? "Failed to mark vehicle as sold");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, (errors) => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
    const firstError = Object.keys(errors)[0];
    if (firstError) form.setFocus(firstError as Parameters<typeof form.setFocus>[0]);
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    derived,
    costBreakdown,
    shake,
    handlePhoneChange,
    handleSalesRepChange,
    salesReps,
    salesRepId,
  };
}
