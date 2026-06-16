"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createVehicleExpense } from "@/lib/expenses/server/create-vehicle-expense";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import { buildVehicleExpenseDefaults } from "@/lib/expenses/actions/defaults";
import {
  vehicleExpenseSchema,
  type VehicleExpenseFormValues,
} from "@/lib/expenses/actions/schemas";
import type {
  PaymentMethod,
  VehicleExpenseSubcategory,
} from "@/lib/expenses/form-types";

export function useAddVehicleExpenseForm(open: boolean, onSuccess?: () => void) {
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [shake, setShake] = useState(false);
  const saveModeRef = useRef<"save" | "saveAndAddAnother">("save");

  const form = useForm<VehicleExpenseFormValues>({
    resolver: zodResolver(vehicleExpenseSchema) as Resolver<VehicleExpenseFormValues>,
    defaultValues: buildVehicleExpenseDefaults(),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildVehicleExpenseDefaults());
      setReceiptFile(null);
      setLinkedVehicle(null);
    }
  }, [open, form]);

  const receiptPreview = useMemo(() => {
    if (!receiptFile) return null;
    return URL.createObjectURL(receiptFile);
  }, [receiptFile]);

  useEffect(() => {
    const url = receiptPreview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [receiptPreview]);

  const vehicleIsSold =
    linkedVehicle?.status === "Sold" || linkedVehicle?.status === "Loss";

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!linkedVehicle) {
      toast.error("Link a vehicle before saving.");
      return;
    }
    if (vehicleIsSold) return;

    const payload = {
      vehicleId: linkedVehicle.id,
      expenseName: values.expenseName.trim(),
      expenseDate: values.expenseDate,
      expenseSubcategory: values.vehicleSubcategory as VehicleExpenseSubcategory,
      vendor: values.vendor.trim(),
      description: values.description.trim(),
      amount: values.amount,
      vehicleNotesAmount: 0,
      referenceNumber: values.reference?.trim() || undefined,
      paymentMethod: values.paymentMethod as PaymentMethod,
      notes: values.addNote ? values.notes?.trim() || undefined : undefined,
      saveMerchant: values.saveMerchant,
    };

    const formData = new FormData();
    formData.set("payload", JSON.stringify(payload));
    if (receiptFile) formData.set("receipt", receiptFile);

    const result = await createVehicleExpense(formData);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      saveModeRef.current === "saveAndAddAnother"
        ? "Expense saved. You can add another."
        : "Expense saved successfully.",
    );

    if (saveModeRef.current === "saveAndAddAnother") {
      form.reset(buildVehicleExpenseDefaults());
      setReceiptFile(null);
    } else {
      onSuccess?.();
    }
  }, (errors) => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.setFocus(firstError as Parameters<typeof form.setFocus>[0]);
    }
  });

  return {
    form,
    handleSubmit,
    linkedVehicle,
    setLinkedVehicle,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    vehicleIsSold,
    saveModeRef,
  };
}
