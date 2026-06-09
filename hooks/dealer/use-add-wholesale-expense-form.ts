"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { todayIsoDate } from "@/components/expenses/add/add-expense-modal-parts";
import {
  wholesaleExpenseSchema,
  type WholesaleExpenseFormValues,
} from "@/lib/dealer/dashboard/schemas";

export function buildWholesaleExpenseDefaults(): WholesaleExpenseFormValues {
  return {
    expenseName: "",
    category: "miscellaneous",
    amount: 0,
    description: "",
    notes: "",
    reference: "",
    tags: [],
    paymentMethod: "",
    vendor: "",
    expenseDate: todayIsoDate(),
    status: "paid",
  };
}

export function useAddWholesaleExpenseForm(
  open: boolean,
  onSave: () => Promise<void>,
  onSuccess?: () => void,
) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [shake, setShake] = useState(false);
  const saveModeRef = useRef<"save" | "saveAndAddAnother">("save");

  const form = useForm<WholesaleExpenseFormValues>({
    resolver: zodResolver(
      wholesaleExpenseSchema,
    ) as Resolver<WholesaleExpenseFormValues>,
    defaultValues: buildWholesaleExpenseDefaults(),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildWholesaleExpenseDefaults());
      setReceiptFile(null);
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

  const handleSubmit = form.handleSubmit(async () => {
    await onSave();

    toast.success(
      saveModeRef.current === "saveAndAddAnother"
        ? "Expense saved. You can add another."
        : "Expense saved successfully.",
    );

    if (saveModeRef.current === "saveAndAddAnother") {
      form.reset(buildWholesaleExpenseDefaults());
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
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    saveModeRef,
  };
}
