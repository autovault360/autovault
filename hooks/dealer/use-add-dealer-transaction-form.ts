"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { todayIsoDate } from "@/components/expenses/add/add-expense-modal-parts";
import {
  addDealerTransactionSchema,
  type AddDealerTransactionFormValues,
} from "@/lib/dealer/dashboard/schemas";
import type { DealerTransaction } from "@/lib/dealer/dashboard/types";

export function buildAddDealerTransactionDefaults(
  transaction?: DealerTransaction | null,
): AddDealerTransactionFormValues {
  if (transaction) {
    return {
      transactionType: transaction.type,
      vehicleId: transaction.inventoryId,
      stockNumber: transaction.stockNumber,
      dealerAuctionName: transaction.buyerSeller === "�€”" ? (transaction.auction ?? "") : transaction.buyerSeller,
      contactPerson: transaction.contactPerson,
      dealerLicense: transaction.dealerLicense ?? "",
      phone: transaction.phone ?? "",
      email: transaction.email ?? "",
      transactionDate: transaction.transactionDate,
      salePurchasePrice: transaction.salePurchasePrice,
      paymentMethod: transaction.paymentMethod,
      paymentStatus: transaction.paymentStatus,
      notes: transaction.notes,
      commonDocuments: [],
      addAnotherDocument: false,
    };
  }

  return {
    transactionType: "dealer_sale",
    vehicleId: "",
    stockNumber: "",
    dealerAuctionName: "",
    contactPerson: "",
    dealerLicense: "",
    phone: "",
    email: "",
    transactionDate: todayIsoDate(),
    salePurchasePrice: 0,
    paymentMethod: "wire_transfer",
    paymentStatus: "paid",
    notes: "",
    commonDocuments: [],
    addAnotherDocument: false,
  };
}

export function useAddDealerTransactionForm(
  open: boolean,
  transaction: DealerTransaction | null,
  onSave: () => Promise<void>,
  onSuccess?: () => void,
) {
  const [shake, setShake] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");

  const form = useForm<AddDealerTransactionFormValues>({
    resolver: zodResolver(
      addDealerTransactionSchema,
    ) as Resolver<AddDealerTransactionFormValues>,
    defaultValues: buildAddDealerTransactionDefaults(transaction),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildAddDealerTransactionDefaults(transaction));
      setVehicleSearch("");
    }
  }, [open, transaction, form]);

  const handleSubmit = form.handleSubmit(async () => {
    await onSave();
    toast.success(
      transaction
        ? "Transaction updated successfully."
        : "Transaction saved successfully.",
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
    isEdit: !!transaction,
  };
}
