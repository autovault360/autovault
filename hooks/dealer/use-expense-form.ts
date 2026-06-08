"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  expenseSchema,
  type ExpenseFormValues,
} from "@/lib/dealer/dashboard/schemas";

const defaultValues: ExpenseFormValues = {
  category: "miscellaneous",
  description: "",
  amount: 0,
};

export function useExpenseForm() {
  return useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseFormValues>,
    defaultValues,
    mode: "onBlur",
  });
}
