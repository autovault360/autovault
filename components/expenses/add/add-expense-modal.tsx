"use client";

import type { ExpenseFormType } from "@/lib/expenses/form-types";
import AddGeneralExpenseModal from "./add-general-expense-modal";
import AddVehicleExpenseModal from "./add-vehicle-expense-modal";

export default function AddExpenseModal({
  open,
  onOpenChange,
  expenseType = "general",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseType?: ExpenseFormType;
}) {
  if (expenseType === "vehicle") {
    return (
      <AddVehicleExpenseModal open={open} onOpenChange={onOpenChange} />
    );
  }

  return (
    <AddGeneralExpenseModal
      open={open}
      onOpenChange={onOpenChange}
      expenseType={expenseType}
    />
  );
}
