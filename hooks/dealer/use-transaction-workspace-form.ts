"use client";

import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionWorkspaceSchema,
  type TransactionWorkspaceValues,
} from "@/lib/dealer/dashboard/schemas";
import type { DealerTransaction } from "@/lib/dealer/dashboard/types";

const emptyDefaults: TransactionWorkspaceValues = {
  buyerDealerName: "",
  salePrice: 0,
  paymentStatus: "pending",
  notes: "",
};

function transactionToFormValues(
  transaction: DealerTransaction | null,
): TransactionWorkspaceValues {
  if (!transaction) return emptyDefaults;
  return {
    buyerDealerName: transaction.buyerDealer,
    salePrice: transaction.salePrice,
    paymentStatus: transaction.paymentStatus,
    notes: transaction.notes,
  };
}

export function useTransactionWorkspaceForm(
  transaction: DealerTransaction | null,
) {
  const form = useForm<TransactionWorkspaceValues>({
    resolver: zodResolver(
      transactionWorkspaceSchema,
    ) as Resolver<TransactionWorkspaceValues>,
    defaultValues: transactionToFormValues(transaction),
    mode: "onBlur",
  });

  return form;
}

export function resetTransactionForm(
  form: UseFormReturn<TransactionWorkspaceValues>,
  transaction: DealerTransaction | null,
) {
  form.reset(transactionToFormValues(transaction));
}
