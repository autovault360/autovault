"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import {
  buildMarkAsLossDefaults,
  getLossFinancials,
} from "@/lib/vehicles/actions/defaults";
import {
  markAsLossSchema,
  type MarkAsLossFormValues,
} from "@/lib/vehicles/actions/schemas";
import { getSuccessMessage } from "@/lib/vehicles/actions/submit";
import { markAsLoss } from "@/lib/vehicles/server/mark-as-loss";

export function useMarkAsLossForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<MarkAsLossFormValues>({
    resolver: zodResolver(markAsLossSchema) as Resolver<MarkAsLossFormValues>,
    defaultValues: buildMarkAsLossDefaults(vehicle),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildMarkAsLossDefaults(vehicle));
    }
  }, [open, vehicle, form]);

  const estimatedLossAmount = form.watch("estimatedLossAmount");
  const insuranceProceeds = form.watch("insuranceProceeds");
  const documents = form.watch("documents");

  const financials = useMemo(() => getLossFinancials(vehicle), [vehicle]);

  const derived = useMemo(
    () => ({
      ...financials,
      netLoss: estimatedLossAmount - insuranceProceeds,
    }),
    [financials, estimatedLossAmount, insuranceProceeds],
  );

  const addDocuments = (files: File[]) => {
    const current = form.getValues("documents") ?? [];
    form.setValue("documents", [...current, ...files], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeDocument = (index: number) => {
    const current = form.getValues("documents") ?? [];
    form.setValue(
      "documents",
      current.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        lossDate: values.lossDate,
        lossReason: values.lossReason,
        lossType: values.lossType,
        explanation: values.explanation,
        estimatedLossAmount: values.estimatedLossAmount,
        insuranceProceeds: values.insuranceProceeds,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      for (const file of values.documents ?? []) {
        formData.append("documents", file);
      }

      const result = await markAsLoss(formData);

      if (result.success) {
        toast.success(getSuccessMessage("mark-as-loss"));
        onSuccess();
      } else {
        toast.error(result.error ?? "Failed to mark vehicle as loss");
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
    documents: documents ?? [],
    addDocuments,
    removeDocument,
  };
}
