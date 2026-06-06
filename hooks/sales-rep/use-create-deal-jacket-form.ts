"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createDealJacketSchema,
  type CreateDealJacketFormValues,
} from "@/lib/sales-rep/deal-jacket/schemas";
import type {
  IPricingConstants,
  ISalesRepProfile,
  IVehicleCard,
} from "@/lib/sales-rep/dashboard/types";

function buildDefaults(vehicle: IVehicleCard | null): CreateDealJacketFormValues {
  return {
    stockNo: vehicle?.stockNo ?? "",
    vin: vehicle?.vin ?? "",
    saleDate: "2026-05-24",
    dealType: "Retail",
    paymentType: "Cash",
    salePrice: vehicle?.price ?? 0,
    hasTradeIn: true,
    tradeInVehicle: "2020-honda-accord",
    notes: "",
  };
}

export function useCreateDealJacketForm(
  selectedVehicle: IVehicleCard | null,
  profile: ISalesRepProfile,
  pricing: IPricingConstants,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<CreateDealJacketFormValues>({
    resolver: zodResolver(
      createDealJacketSchema,
    ) as Resolver<CreateDealJacketFormValues>,
    defaultValues: buildDefaults(selectedVehicle),
    mode: "onBlur",
  });

  useEffect(() => {
    if (selectedVehicle) {
      form.reset({
        ...form.getValues(),
        stockNo: selectedVehicle.stockNo,
        vin: selectedVehicle.vin,
        salePrice: selectedVehicle.price,
      });
    }
  }, [selectedVehicle, form]);

  const salePrice = form.watch("salePrice");
  const hasTradeIn = form.watch("hasTradeIn");

  const derived = useMemo(() => {
    const price = Number(salePrice) || 0;
    const grossProfit = price - pricing.costPrice - pricing.reconditioning;
    const estimatedCommission = grossProfit * pricing.commissionRate;
    return {
      grossProfit: Math.max(grossProfit, 0),
      estimatedCommission: Math.max(estimatedCommission, 0),
      commissionRatePercent: pricing.commissionRate * 100,
    };
  }, [salePrice, pricing]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const saveDraft = form.handleSubmit(
    async () => {
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      setIsSubmitting(false);
      toast.success("Deal jacket saved successfully as draft.");
    },
    () => {
      triggerShake();
      const firstError = Object.keys(form.formState.errors)[0];
      if (firstError) {
        form.setFocus(firstError as keyof CreateDealJacketFormValues);
      }
    },
  );

  const continueToBuyer = form.handleSubmit(
    async () => {
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      setIsSubmitting(false);
      toast.success("Proceeding to buyer information...");
    },
    () => {
      triggerShake();
      const firstError = Object.keys(form.formState.errors)[0];
      if (firstError) {
        form.setFocus(firstError as keyof CreateDealJacketFormValues);
      }
    },
  );

  return {
    form,
    derived,
    hasTradeIn,
    isSubmitting,
    shake,
    saveDraft,
    continueToBuyer,
    yearModel: selectedVehicle?.yearModel ?? "",
    vehicleImageUrl: selectedVehicle?.imageUrl,
    profile,
  };
}
