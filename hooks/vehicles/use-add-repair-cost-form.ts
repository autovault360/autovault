"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { buildAddRepairCostDefaults } from "@/lib/vehicles/actions/defaults";
import {
  addRepairCostSchema,
  type AddRepairCostFormValues,
} from "@/lib/vehicles/actions/schemas";
import { getSuccessMessage } from "@/lib/vehicles/actions/submit";
import { addRepairCost } from "@/lib/vehicles/server/add-repair-cost";

export function useAddRepairCostForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<AddRepairCostFormValues>({
    resolver: zodResolver(addRepairCostSchema) as Resolver<AddRepairCostFormValues>,
    defaultValues: buildAddRepairCostDefaults(),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildAddRepairCostDefaults());
    }
  }, [open, vehicle.id, form]);

  const laborCost = form.watch("laborCost");
  const partsCost = form.watch("partsCost");
  const otherFees = form.watch("otherFees");
  const attachments = form.watch("attachments");

  const derived = useMemo(
    () => ({
      totalRepairCost: laborCost + partsCost + otherFees,
    }),
    [laborCost, partsCost, otherFees],
  );

  const addAttachments = (files: File[]) => {
    const current = form.getValues("attachments") ?? [];
    form.setValue("attachments", [...current, ...files], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeAttachment = (index: number) => {
    const current = form.getValues("attachments") ?? [];
    form.setValue(
      "attachments",
      current.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        repairDate: values.repairDate,
        repairCategory: values.repairCategory,
        repairType: values.repairType,
        priority: values.priority,
        description: values.description,
        laborCost: values.laborCost,
        partsCost: values.partsCost,
        shopVendor: values.shopVendor,
        otherFees: values.otherFees,
        totalRepairCost: derived.totalRepairCost,
        isInternalRepair: values.isInternalRepair === "yes",
        paymentMethod: values.paymentMethod,
        invoiceNumber: values.invoiceNumber ?? "",
        paymentStatus: values.paymentStatus,
        datePaid: values.datePaid ?? "",
        notes: values.notes,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      for (const file of values.attachments ?? []) {
        formData.append("attachments", file);
      }

      const result = await addRepairCost(formData);

      if (result.success) {
        toast.success(getSuccessMessage("add-repair-cost"));
        onSuccess();
      } else {
        toast.error(result.error ?? "Failed to save repair cost");
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
    attachments: attachments ?? [],
    addAttachments,
    removeAttachment,
  };
}
