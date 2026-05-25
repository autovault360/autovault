"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { buildUpdatePricingDefaults } from "@/lib/vehicles/actions/defaults";
import {
  updatePricingSchema,
  type UpdatePricingFormValues,
} from "@/lib/vehicles/actions/schemas";
import {
  computeMarketStats,
  computePriceChange,
} from "@/lib/vehicles/actions/utils";
import { getSuccessMessage } from "@/lib/vehicles/actions/submit";
import { updatePricing } from "@/lib/vehicles/server/update-pricing";
import { formatCurrencyDecimal } from "@/lib/vehicles/types";

export function useUpdatePricingForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<UpdatePricingFormValues>({
    resolver: zodResolver(updatePricingSchema) as Resolver<UpdatePricingFormValues>,
    defaultValues: buildUpdatePricingDefaults(vehicle),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildUpdatePricingDefaults(vehicle));
      setPhotoPreview(null);
    }
  }, [open, vehicle, form]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const newAskingPrice = form.watch("newAskingPrice");
  const currentAskingPrice = form.watch("currentAskingPrice");

  const derived = useMemo(() => {
    const priceChange = computePriceChange(currentAskingPrice, newAskingPrice);
    const market = computeMarketStats(vehicle, newAskingPrice);
    const changeVariant = priceChange.isNegative
      ? "negative"
      : priceChange.isPositive
        ? "positive"
        : "neutral";

    return {
      priceChange,
      changeVariant,
      market,
      priceChangeDisplay: priceChange.delta,
      changePctDisplay: priceChange.pct,
    };
  }, [currentAskingPrice, newAskingPrice, vehicle]);

  const handlePhotoChange = (file: File) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    form.setValue("photoFile", file, { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        newAskingPrice: values.newAskingPrice,
        wholesalePrice: values.wholesalePrice,
        retailPrice: values.retailPrice,
        minAcceptablePrice: values.minAcceptablePrice,
        targetProfit: values.targetProfit,
        pricingStrategy: values.pricingStrategy,
        reason: values.reason,
        effectiveDate: values.effectiveDate,
        notes: values.notes,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));

      const photoFile = form.getValues("photoFile");
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const result = await updatePricing(formData);

      if (result.success) {
        toast.success(getSuccessMessage("update-pricing"));
        onSuccess();
      } else {
        toast.error(result.error ?? "Failed to update pricing");
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
    shake,
    photoPreview,
    handlePhotoChange,
    formatMarketValue: (v: number) =>
      formatCurrencyDecimal(v).replace("$", "$ "),
  };
}
