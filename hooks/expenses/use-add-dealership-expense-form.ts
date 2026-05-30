"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createDealershipExpense } from "@/lib/expenses/server/create-dealership-expense";
import { buildDealershipExpenseDefaults } from "@/lib/expenses/actions/defaults";
import {
  dealershipExpenseSchema,
  type DealershipExpenseFormValues,
} from "@/lib/expenses/actions/schemas";
import {
  getCategoryOption,
  type ExpenseFormType,
} from "@/lib/expenses/form-types";

export function useAddDealershipExpenseForm(
  expenseType: ExpenseFormType,
  open: boolean,
  onSuccess?: () => void,
) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [shake, setShake] = useState(false);
  const saveModeRef = useRef<"save" | "saveAndAddAnother">("save");

  const form = useForm<DealershipExpenseFormValues>({
    resolver: zodResolver(dealershipExpenseSchema) as Resolver<DealershipExpenseFormValues>,
    defaultValues: buildDealershipExpenseDefaults(expenseType === "recurring" ? "recurring" : "general"),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDealershipExpenseDefaults(expenseType === "recurring" ? "recurring" : "general"));
      setReceiptFile(null);
    }
  }, [open, expenseType, form]);

  const category = form.watch("category");
  const selectedCategory = getCategoryOption(category as Parameters<typeof getCategoryOption>[0]);

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

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      expenseDate: values.expenseDate,
      category: values.category,
      vendor: values.vendor.trim(),
      description: values.description.trim(),
      amount: values.amount,
      referenceNumber: values.reference?.trim() || undefined,
      paymentMethod: values.paymentMethod || undefined,
      taxDeductible: values.taxDeductible === "yes",
      isRecurring: values.markRecurring || expenseType === "recurring",
      notes: values.addNote ? values.notes?.trim() || undefined : undefined,
      saveMerchant: values.saveMerchant,
    };

    const formData = new FormData();
    formData.set("payload", JSON.stringify(payload));
    if (receiptFile) formData.set("receipt", receiptFile);

    const result = await createDealershipExpense(formData);
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
      form.reset(buildDealershipExpenseDefaults(expenseType === "recurring" ? "recurring" : "general"));
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
    selectedCategory,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    saveModeRef,
  };
}
