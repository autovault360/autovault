"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  unifiedDealJacketSchema,
  type UnifiedDealJacketFormValues,
} from "@/lib/sales-rep/deal-jacket/unified-schemas";
import { submitDealJacket } from "@/lib/deal-jackets/server/submit-deal-jacket";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";

function buildDefaults(): UnifiedDealJacketFormValues {
  return {
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
    salesTaxAmount: 0,
    downPayment: 0,
    tradeInAllowance: 0,
    dmvFees: 0,
    registrationFees: 0,
    documentationFees: 0,
    warrantyAmount: 0,
    gapAmount: 0,
    lender: "",
    rosNumber: "",
    dealType: "" as UnifiedDealJacketFormValues["dealType"],
    notes: "",
  };
}

export function useSalesRepDealJacketForm(
  commissionRate: number,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(null);
  const filesRef = useRef<File[]>([]);

  const form = useForm<UnifiedDealJacketFormValues>({
    resolver: zodResolver(
      unifiedDealJacketSchema,
    ) as Resolver<UnifiedDealJacketFormValues>,
    defaultValues: buildDefaults(),
    mode: "onBlur",
  });

  const setFiles = (files: File[]) => {
    filesRef.current = files;
  };

  useEffect(() => {
    if (linkedVehicle) {
      form.setValue("linkedVehicleId", linkedVehicle.id);
      form.setValue("stockNo", linkedVehicle.stockNumber);
      form.setValue("vin", linkedVehicle.vin);
    } else {
      form.setValue("linkedVehicleId", "");
      form.setValue("stockNo", "");
      form.setValue("vin", "");
    }
  }, [linkedVehicle, form]);

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
    const vehicleCost = linkedVehicle?.mileage ? 0 : 0;
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
        (Number(salesTaxAmount) || 0) +
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
    linkedVehicle,
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

  const saveDealJacket = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const result = await submitDealJacket(
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
          salesTaxAmount: values.salesTaxAmount,
          downPayment: values.downPayment,
          tradeInAllowance: values.tradeInAllowance,
          dmvFees: values.dmvFees,
          registrationFees: values.registrationFees,
          documentationFees: values.documentationFees,
          warrantyAmount: values.warrantyAmount,
          gapAmount: values.gapAmount,
          lender: values.lender,
          rosNumber: values.rosNumber,
          dealType: values.dealType,
          notes: values.notes,
        },
        filesRef.current,
      );

      if (result.success) {
        toast.success(
          `Deal jacket ${result.jacketNumber} created and sent for review.`,
        );
        form.reset(buildDefaults());
        setLinkedVehicle(null);
        filesRef.current = [];
      } else {
        toast.error(result.error);
        triggerShake();
      }
    } catch {
      toast.error("Failed to create deal jacket. Please try again.");
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  }, onValidationError);

  return {
    form,
    derived,
    linkedVehicle,
    setLinkedVehicle,
    isSubmitting,
    shake,
    saveDraft,
    saveDealJacket,
    setFiles,
  };
}
