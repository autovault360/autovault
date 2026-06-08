"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SALES_TAX_RATE } from "@/lib/sales-rep/deal-jacket/constants";
import {
  unifiedDealJacketSchema,
  type UnifiedDealJacketFormValues,
} from "@/lib/sales-rep/deal-jacket/unified-schemas";
import type { ILinkedVehicle } from "@/lib/sales-rep/deal-jacket/types";

function buildDefaults(
  vehicle: ILinkedVehicle | null,
): UnifiedDealJacketFormValues {
  return {
    linkedVehicleId: vehicle?.id ?? "",
    stockNo: vehicle?.stockNo ?? "",
    vin: vehicle?.vin ?? "",
    buyerName: "John Smith",
    buyerPhone: "(555) 123-4567",
    buyerEmail: "john.smith@email.com",
    buyerAddress: "1234 Main St, Los Angeles, CA 90001",
    driverLicenseNo: "S1234567",
    buyerState: "CA",
    salePrice: vehicle?.askingPrice ?? 0,
    saleDate: "2026-05-20",
    downPayment: 2500,
    tradeInAllowance: 1500,
    dmvFees: 85,
    registrationFees: 75,
    documentationFees: 85,
    warrantyAmount: 895,
    gapAmount: 595,
    lender: "Westlake Financial",
    rosNumber: "1234567890",
    dealType: "Retail",
    notes: "",
  };
}

export function useUnifiedDealJacketForm(
  vehicles: ILinkedVehicle[],
  commissionRate: number,
  defaultVehicleId?: string,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const defaultVehicle =
    vehicles.find((v) => v.id === defaultVehicleId) ?? vehicles[0] ?? null;

  const form = useForm<UnifiedDealJacketFormValues>({
    resolver: zodResolver(
      unifiedDealJacketSchema,
    ) as Resolver<UnifiedDealJacketFormValues>,
    defaultValues: buildDefaults(defaultVehicle),
    mode: "onBlur",
  });

  const linkedVehicleId = form.watch("linkedVehicleId");
  const salePrice = form.watch("salePrice");
  const downPayment = form.watch("downPayment");
  const tradeInAllowance = form.watch("tradeInAllowance");
  const dmvFees = form.watch("dmvFees");
  const registrationFees = form.watch("registrationFees");
  const documentationFees = form.watch("documentationFees");
  const warrantyAmount = form.watch("warrantyAmount");
  const gapAmount = form.watch("gapAmount");

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === linkedVehicleId) ?? null,
    [vehicles, linkedVehicleId],
  );

  useEffect(() => {
    if (defaultVehicleId) {
      form.setValue("linkedVehicleId", defaultVehicleId);
    }
  }, [defaultVehicleId, form]);

  useEffect(() => {
    if (selectedVehicle) {
      form.setValue("stockNo", selectedVehicle.stockNo);
      form.setValue("vin", selectedVehicle.vin);
      if (!form.formState.dirtyFields.salePrice) {
        form.setValue("salePrice", selectedVehicle.askingPrice);
      }
    }
  }, [selectedVehicle, form]);

  const derived = useMemo(() => {
    const price = Number(salePrice) || 0;
    const vehicleCost = selectedVehicle?.purchaseCost ?? 0;
    const salesTax = price * SALES_TAX_RATE;
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
    selectedVehicle,
    dmvFees,
    registrationFees,
    documentationFees,
    warrantyAmount,
    gapAmount,
    downPayment,
    tradeInAllowance,
    commissionRate,
  ]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const onValidationError = () => {
    triggerShake();
    const firstError = Object.keys(form.formState.errors)[0];
    if (firstError) {
      form.setFocus(firstError as keyof UnifiedDealJacketFormValues);
    }
  };

  const saveDraft = form.handleSubmit(async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    toast.success("Deal jacket saved as draft.");
  }, onValidationError);

  const saveDealJacket = form.handleSubmit(async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    toast.success("Deal jacket saved and sent for admin review.");
  }, onValidationError);

  return {
    form,
    derived,
    selectedVehicle,
    isSubmitting,
    shake,
    saveDraft,
    saveDealJacket,
  };
}
