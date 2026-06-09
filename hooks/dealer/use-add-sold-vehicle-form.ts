"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { todayIsoDate } from "@/components/expenses/add/add-expense-modal-parts";
import {
  addSoldVehicleSchema,
  type AddSoldVehicleFormValues,
} from "@/lib/dealer/dashboard/schemas";
import type { SoldVehicleRecord } from "@/lib/dealer/dashboard/types";

export function buildAddSoldVehicleDefaults(
  record?: SoldVehicleRecord | null,
): AddSoldVehicleFormValues {
  if (record) {
    return {
      saleType: record.saleType,
      vehicleId: record.inventoryId,
      stockNumber: record.stockNumber,
      buyerName: record.buyer,
      contactPerson: record.contactPerson,
      dealerLicense: record.dealerLicense ?? "",
      phone: record.phone ?? "",
      email: record.email ?? "",
      buyerType: record.buyerType,
      saleDate: record.dateSold,
      salePrice: record.salePrice,
      paymentMethod: record.paymentMethod,
      paymentStatus: record.paymentStatus,
      dealNumber: record.dealNumber,
      salesperson: record.salesperson ?? "",
      notes: record.notes,
      commonDocuments: [],
      addAnotherDocument: false,
    };
  }

  return {
    saleType: "wholesale",
    vehicleId: "",
    stockNumber: "",
    buyerName: "",
    contactPerson: "",
    dealerLicense: "",
    phone: "",
    email: "",
    buyerType: "dealer",
    saleDate: todayIsoDate(),
    salePrice: 0,
    paymentMethod: "wire_transfer",
    paymentStatus: "paid",
    dealNumber: "",
    salesperson: "",
    notes: "",
    commonDocuments: [],
    addAnotherDocument: false,
  };
}

export function useAddSoldVehicleForm(
  open: boolean,
  record: SoldVehicleRecord | null,
  onSave: () => Promise<void>,
  onSuccess?: () => void,
) {
  const [shake, setShake] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");

  const form = useForm<AddSoldVehicleFormValues>({
    resolver: zodResolver(
      addSoldVehicleSchema,
    ) as Resolver<AddSoldVehicleFormValues>,
    defaultValues: buildAddSoldVehicleDefaults(record),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildAddSoldVehicleDefaults(record));
      setVehicleSearch("");
    }
  }, [open, record, form]);

  const handleSubmit = form.handleSubmit(async () => {
    await onSave();
    toast.success(
      record ? "Sale updated successfully." : "Sale saved successfully.",
    );
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
    shake,
    vehicleSearch,
    setVehicleSearch,
    isEdit: !!record,
  };
}
