"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateExpense } from "@/lib/expenses/server/update-expense";
import { lookupVehicleById } from "@/lib/expenses/server/lookup-vehicle";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import { buildEditExpenseDefaults } from "@/lib/expenses/actions/defaults";
import {
  vehicleExpenseSchema,
  dealershipExpenseSchema,
  type VehicleExpenseFormValues,
  type DealershipExpenseFormValues,
} from "@/lib/expenses/actions/schemas";
import type { ExpenseDetail } from "@/lib/expenses/types";
import type {
  PaymentMethod,
  VehicleExpenseSubcategory,
} from "@/lib/expenses/form-types";

export function useEditExpenseForm(
  expense: ExpenseDetail,
  open: boolean,
  onSuccess?: () => void,
) {
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(null);
  const [linkedVehicleLoading, setLinkedVehicleLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [removedExistingReceipt, setRemovedExistingReceipt] = useState(false);
  const [shake, setShake] = useState(false);
  const isVehicle = expense.expenseKind === "vehicle";

  const defaults = useMemo(
    () => buildEditExpenseDefaults(expense),
    [expense],
  );

  const form = useForm<VehicleExpenseFormValues | DealershipExpenseFormValues>({
    resolver: zodResolver(
      isVehicle ? vehicleExpenseSchema : dealershipExpenseSchema,
    ) as Resolver<VehicleExpenseFormValues | DealershipExpenseFormValues>,
    defaultValues: defaults as Record<string, unknown>,
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      const d = buildEditExpenseDefaults(expense);
      form.reset(d as Record<string, unknown>);
      setReceiptFile(null);
      setRemovedExistingReceipt(false);

      if (isVehicle && expense.vehicleId) {
        setLinkedVehicleLoading(true);
        lookupVehicleById(expense.vehicleId).then((result) => {
          setLinkedVehicleLoading(false);
          if (result.success) {
            setLinkedVehicle(result.vehicle);
          } else {
            setLinkedVehicle(null);
          }
        });
      } else {
        setLinkedVehicle(null);
      }
    }
  }, [open, expense, form, isVehicle]);

  const receiptPreview = useMemo(() => {
    if (receiptFile) return URL.createObjectURL(receiptFile);
    if (!removedExistingReceipt && expense.receiptImageUrl) return expense.receiptImageUrl;
    return null;
  }, [receiptFile, removedExistingReceipt, expense.receiptImageUrl]);

  useEffect(() => {
    const url = receiptPreview;
    return () => {
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [receiptPreview]);

  const handleFileChange = (file: File | null) => {
    setReceiptFile(file);
    if (file) setRemovedExistingReceipt(false);
  };

  const vehicleIsSold =
    linkedVehicle?.status === "Sold" || linkedVehicle?.status === "Loss";

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isVehicle && !linkedVehicle) {
      toast.error("Link a vehicle before saving.");
      return;
    }
    if (vehicleIsSold) return;

    const payload: Record<string, unknown> = {};

    if (isVehicle) {
      const v = values as VehicleExpenseFormValues;
      payload.vehicleId = linkedVehicle!.id;
      payload.expenseDate = v.expenseDate;
      payload.expenseSubcategory = v.vehicleSubcategory as VehicleExpenseSubcategory;
      payload.vendor = v.vendor.trim();
      payload.description = v.description.trim();
      payload.amount = v.amount;
      payload.referenceNumber = v.reference?.trim() || undefined;
      payload.paymentMethod = v.paymentMethod as PaymentMethod;
      payload.notes = v.addNote ? v.notes?.trim() || undefined : undefined;
      payload.saveMerchant = v.saveMerchant;
    } else {
      const d = values as DealershipExpenseFormValues;
      payload.expenseDate = d.expenseDate;
      payload.category = d.category;
      payload.vendor = d.vendor.trim();
      payload.description = d.description.trim();
      payload.amount = d.amount;
      payload.referenceNumber = d.reference?.trim() || undefined;
      payload.paymentMethod = d.paymentMethod || undefined;
      payload.taxDeductible = d.taxDeductible === "yes";
      payload.isRecurring = d.markRecurring;
      payload.notes = d.addNote ? d.notes?.trim() || undefined : undefined;
      payload.saveMerchant = d.saveMerchant;
    }

    const formData = new FormData();
    formData.set("payload", JSON.stringify(payload));

    if (receiptFile) {
      formData.set("receipt", receiptFile);
    } else if (removedExistingReceipt) {
      formData.set("removeReceipt", "true");
    }

    const result = await updateExpense(
      expense.expenseKind,
      expense.id,
      formData,
    );
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Expense updated successfully.");
    onSuccess?.();
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
    setReceiptFile: handleFileChange,
    receiptPreview,
    shake,
    isVehicle,
    vehicleIsSold,
    linkedVehicleLoading,
  };
}
