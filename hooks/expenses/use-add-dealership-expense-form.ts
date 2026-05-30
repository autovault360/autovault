"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createDealershipExpense } from "@/lib/expenses/server/create-dealership-expense";
import {
  getCategoryOption,
  getDefaultCategoryForType,
  type ExpenseFormCategory,
  type ExpenseFormType,
  type PaymentMethod,
} from "@/lib/expenses/form-types";
import { todayIsoDate } from "@/components/expenses/add/add-expense-modal-parts";

export type DealershipExpenseFormState = {
  category: ExpenseFormCategory;
  expenseDate: string;
  reference: string;
  vendor: string;
  description: string;
  amount: number;
  taxDeductible: "yes" | "no";
  markRecurring: boolean;
  saveMerchant: boolean;
  addNote: boolean;
  notes: string;
  paymentMethod: PaymentMethod | "";
};

function buildInitialForm(expenseType: ExpenseFormType): DealershipExpenseFormState {
  return {
    category: getDefaultCategoryForType(expenseType),
    expenseDate: todayIsoDate(),
    reference: "",
    vendor: "",
    description: "",
    amount: 0,
    taxDeductible: "yes",
    markRecurring: expenseType === "recurring",
    saveMerchant: false,
    addNote: false,
    notes: "",
    paymentMethod: "",
  };
}

export function useAddDealershipExpenseForm(
  expenseType: ExpenseFormType,
  open: boolean,
) {
  const [form, setForm] = useState<DealershipExpenseFormState>(() =>
    buildInitialForm(expenseType),
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(expenseType));
    setReceiptFile(null);
  }, [open, expenseType]);

  const patchForm = useCallback((patch: Partial<DealershipExpenseFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const selectedCategory = getCategoryOption(form.category);

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

  const validate = useCallback((): boolean => {
    if (!form.vendor.trim()) {
      toast.error("Vendor is required.");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description is required.");
      return false;
    }
    if (form.amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return false;
    }
    return true;
  }, [form]);

  const submit = useCallback(
    async (addAnother: boolean) => {
      if (!validate()) return false;

      setSaving(true);
      try {
        const payload = {
          expenseDate: form.expenseDate,
          category: form.category,
          vendor: form.vendor.trim(),
          description: form.description.trim(),
          amount: form.amount,
          referenceNumber: form.reference.trim() || undefined,
          paymentMethod: form.paymentMethod || undefined,
          taxDeductible: form.taxDeductible === "yes",
          isRecurring: form.markRecurring || expenseType === "recurring",
          notes: form.addNote ? form.notes.trim() || undefined : undefined,
          saveMerchant: form.saveMerchant,
        };

        const formData = new FormData();
        formData.set("payload", JSON.stringify(payload));
        if (receiptFile) formData.set("receipt", receiptFile);

        const result = await createDealershipExpense(formData);
        if (!result.success) {
          toast.error(result.error);
          return false;
        }

        toast.success(
          addAnother
            ? "Expense saved. You can add another."
            : "Expense saved successfully.",
        );

        if (addAnother) {
          setForm(buildInitialForm(expenseType));
          setReceiptFile(null);
        }

        return true;
      } finally {
        setSaving(false);
      }
    },
    [form, receiptFile, validate, expenseType],
  );

  return {
    form,
    patchForm,
    selectedCategory,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    saving,
    submit,
  };
}
