"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createVehicleExpense } from "@/lib/expenses/server/create-vehicle-expense";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import {
  type PaymentMethod,
  type VehicleExpenseSubcategory,
} from "@/lib/expenses/form-types";
import { todayIsoDate } from "@/components/expenses/add/add-expense-modal-parts";

export type VehicleExpenseFormState = {
  expenseDate: string;
  reference: string;
  vendor: string;
  description: string;
  amount: number;
  saveMerchant: boolean;
  addNote: boolean;
  notes: string;
  vehicleSubcategory: VehicleExpenseSubcategory | "";
  paymentMethod: PaymentMethod | "";
};

const EXPENSE_FIELD_DEFAULTS: VehicleExpenseFormState = {
  expenseDate: todayIsoDate(),
  reference: "",
  vendor: "",
  description: "",
  amount: 0,
  saveMerchant: false,
  addNote: false,
  notes: "",
  vehicleSubcategory: "",
  paymentMethod: "",
};

export function useAddVehicleExpenseForm(open: boolean) {
  const [form, setForm] = useState<VehicleExpenseFormState>(EXPENSE_FIELD_DEFAULTS);
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(
    null,
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ ...EXPENSE_FIELD_DEFAULTS, expenseDate: todayIsoDate() });
    setReceiptFile(null);
    setLinkedVehicle(null);
  }, [open]);

  const patchForm = useCallback((patch: Partial<VehicleExpenseFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

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
    if (!linkedVehicle) {
      toast.error("Link a vehicle before saving.");
      return false;
    }
    if (!form.vehicleSubcategory) {
      toast.error("Select an expense category.");
      return false;
    }
    if (!form.vendor.trim()) {
      toast.error("Vendor is required.");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description is required.");
      return false;
    }
    if (!form.paymentMethod) {
      toast.error("Payment method is required.");
      return false;
    }
    if (form.amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return false;
    }
    return true;
  }, [form, linkedVehicle]);

  const resetExpenseFields = useCallback(() => {
    setForm({ ...EXPENSE_FIELD_DEFAULTS, expenseDate: todayIsoDate() });
    setReceiptFile(null);
  }, []);

  const submit = useCallback(
    async (addAnother: boolean) => {
      if (!validate() || !linkedVehicle) return false;

      setSaving(true);
      try {
        const payload = {
          vehicleId: linkedVehicle.id,
          expenseDate: form.expenseDate,
          expenseSubcategory: form.vehicleSubcategory as VehicleExpenseSubcategory,
          vendor: form.vendor.trim(),
          description: form.description.trim(),
          amount: form.amount,
          referenceNumber: form.reference.trim() || undefined,
          paymentMethod: form.paymentMethod as PaymentMethod,
          notes: form.addNote ? form.notes.trim() || undefined : undefined,
          saveMerchant: form.saveMerchant,
        };

        const formData = new FormData();
        formData.set("payload", JSON.stringify(payload));
        if (receiptFile) formData.set("receipt", receiptFile);

        const result = await createVehicleExpense(formData);
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
          resetExpenseFields();
        }

        return true;
      } finally {
        setSaving(false);
      }
    },
    [form, linkedVehicle, receiptFile, validate, resetExpenseFields],
  );

  return {
    form,
    patchForm,
    linkedVehicle,
    setLinkedVehicle,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    saving,
    submit,
  };
}
