"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SALES_TAX_RATE } from "@/lib/sales-rep/deal-jacket/constants";
import {
  unifiedDealJacketSchema,
  type UnifiedDealJacketFormValues,
} from "@/lib/sales-rep/deal-jacket/unified-schemas";
import { submitDealJacket } from "@/lib/deal-jackets/server/submit-deal-jacket";
import { checkVehicleHasDealJacket } from "@/lib/deal-jackets/server/check-deal-jacket";
import type { ILinkedVehicle } from "@/lib/sales-rep/deal-jacket/types";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import { todayISO } from "@/lib/vehicles/actions/utils";

function buildDefaults(
  vehicle: ILinkedVehicle | null,
): UnifiedDealJacketFormValues {
  return {
    linkedVehicleId: vehicle?.id ?? "",
    stockNo: vehicle?.stockNo ?? "",
    vin: vehicle?.vin ?? "",
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    buyerAddress: "",
    driverLicenseNo: "",
    buyerState: "" as UnifiedDealJacketFormValues["buyerState"],
    salePrice: vehicle?.askingPrice ?? 0,
    saleDate: todayISO(),
    downPayment: 0,
    tradeInAllowance: 0,
    dmvFees: 0,
    registrationFees: 0,
    documentationFees: 0,
    warrantyAmount: 0,
    gapAmount: 0,
    lender: "",
    rosNumber: "",
    dealType: "Retail",
    notes: "",
  };
}

export function useUnifiedDealJacketForm(
  vehicles: ILinkedVehicle[],
  commissionRate: number,
  defaultVehicleId?: string,
  vinLookup?: boolean,
  onSuccess?: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(null);
  const [vehicleHasJacket, setVehicleHasJacket] = useState(false);
  const filesRef = useRef<File[]>([]);

  const defaultVehicle = vinLookup
    ? null
    : (vehicles.find((v) => v.id === defaultVehicleId) ?? vehicles[0] ?? null);

  const form = useForm<UnifiedDealJacketFormValues>({
    resolver: zodResolver(
      unifiedDealJacketSchema,
    ) as Resolver<UnifiedDealJacketFormValues>,
    defaultValues: buildDefaults(defaultVehicle),
    mode: "onBlur",
  });

  const setFiles = (files: File[]) => {
    filesRef.current = files;
  };

  const handleLinkedVehicleChange = (
    vehicle: LinkedVehicleResult | null,
    options?: { hasExistingJacket?: boolean; workflowStatus?: string },
  ) => {
    setLinkedVehicle(vehicle);

    if (!vehicle) {
      setVehicleHasJacket(false);
      return;
    }

    if (options?.hasExistingJacket !== undefined) {
      setVehicleHasJacket(options.hasExistingJacket);
      return;
    }

    setVehicleHasJacket(false);
    checkVehicleHasDealJacket(vehicle.id).then((res) => {
      if (res.hasJacket) setVehicleHasJacket(true);
    });
  };

  useEffect(() => {
    if (linkedVehicle && !vehicleHasJacket) {
      form.setValue("linkedVehicleId", linkedVehicle.id);
      form.setValue("stockNo", linkedVehicle.stockNumber);
      form.setValue("vin", linkedVehicle.vin);
    } else if (vinLookup && (!linkedVehicle || vehicleHasJacket)) {
      form.setValue("linkedVehicleId", "");
      form.setValue("stockNo", "");
      form.setValue("vin", "");
    } else if (!vinLookup && !linkedVehicle) {
      form.setValue("linkedVehicleId", "");
      form.setValue("stockNo", "");
      form.setValue("vin", "");
    }
  }, [linkedVehicle, vehicleHasJacket, form, vinLookup]);

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
    if (!vinLookup && defaultVehicleId) {
      form.setValue("linkedVehicleId", defaultVehicleId);
    }
  }, [defaultVehicleId, form, vinLookup]);

  useEffect(() => {
    if (!vinLookup && selectedVehicle) {
      form.setValue("stockNo", selectedVehicle.stockNo);
      form.setValue("vin", selectedVehicle.vin);
      if (!form.formState.dirtyFields.salePrice) {
        form.setValue("salePrice", selectedVehicle.askingPrice);
      }
    }
  }, [selectedVehicle, form, vinLookup]);

  const derived = useMemo(() => {
    const price = Number(salePrice) || 0;
    const vehicleCost =
      selectedVehicle?.purchaseCost ??
      linkedVehicle?.acquisitionCost ??
      0;
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

  const vehicleUnavailable =
    linkedVehicle?.status === "Sold" ||
    linkedVehicle?.status === "Loss" ||
    linkedVehicle?.status === "Pending Deal";

  const saveDraft = form.handleSubmit(async () => {
    if (vehicleHasJacket || vehicleUnavailable) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    toast.success("Deal jacket saved as draft.");
  }, onValidationError);

  const saveDealJacket = form.handleSubmit(async (values) => {
    if (vehicleHasJacket || vehicleUnavailable) {
      triggerShake();
      return;
    }

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
        form.reset(buildDefaults(vinLookup ? null : selectedVehicle));
        setLinkedVehicle(null);
        setVehicleHasJacket(false);
        filesRef.current = [];
        onSuccess?.();
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
    selectedVehicle,
    linkedVehicle,
    handleLinkedVehicleChange,
    vehicleHasJacket,
    isSubmitting,
    shake,
    saveDraft,
    saveDealJacket,
    setFiles,
  };
}
