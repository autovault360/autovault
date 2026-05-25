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

export function useMarkAsSoldForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<MarkAsSoldFormValues>({
    resolver: zodResolver(markAsSoldSchema) as Resolver<MarkAsSoldFormValues>,
    defaultValues: buildMarkAsSoldDefaults(vehicle),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildMarkAsSoldDefaults(vehicle));
    }
  }, [open, vehicle, form]);

  const totalPriceOtd = form.watch("totalPriceOtd");
  const salesTaxAmount = form.watch("salesTaxAmount");
  const licenseRegistrationFees = form.watch("licenseRegistrationFees");
  const dmvDocFees = form.watch("dmvDocFees");
  const otherFees = form.watch("otherFees");

  const derived = useMemo(
    () => ({
      totalCollected:
        totalPriceOtd +
        salesTaxAmount +
        licenseRegistrationFees +
        dmvDocFees +
        otherFees,
    }),
    [
      totalPriceOtd,
      salesTaxAmount,
      licenseRegistrationFees,
      dmvDocFees,
      otherFees,
    ],
  );

  const handlePhoneChange = (value: string) => {
    form.setValue("phoneNumber", formatPhoneNumber(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        customerType: values.customerType,
        customerName: values.customerName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        address2: values.address2,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        saleDate: values.saleDate,
        totalPriceOtd: values.totalPriceOtd,
        salesTaxAmount: values.salesTaxAmount,
        licenseRegistrationFees: values.licenseRegistrationFees,
        dmvDocFees: values.dmvDocFees,
        otherFees: values.otherFees,
        totalCollected: derived.totalCollected,
        rosNumber: values.rosNumber,
        zipCodeOfSale: values.zipCodeOfSale,
        notes: values.notes,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      if (values.buyerIdFront) formData.append("buyerIdFront", values.buyerIdFront as File);
      if (values.buyerIdBack) formData.append("buyerIdBack", values.buyerIdBack);
      if (values.driversLicense) formData.append("driversLicense", values.driversLicense);
      if (values.otherDocument) formData.append("otherDocument", values.otherDocument);

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
    shake,
    handlePhoneChange,
  };
}
