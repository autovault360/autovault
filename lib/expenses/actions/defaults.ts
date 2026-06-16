import { todayIsoDate } from "@/components/expenses/add/add-expense-modal-parts";
import { getDefaultCategoryForType } from "@/lib/expenses/form-types";
import type { ExpenseDetail } from "@/lib/expenses/types";
import {
  VEHICLE_EXPENSE_SUBCATEGORIES,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/expenses/form-types";
import type {
  DealershipExpenseFormValues,
  VehicleExpenseFormValues,
} from "./schemas";

export function buildVehicleExpenseDefaults(): VehicleExpenseFormValues {
  return {
    expenseName: "",
    expenseDate: todayIsoDate(),
    vehicleSubcategory: "",
    vendor: "",
    reference: "",
    description: "",
    amount: 0,
    paymentMethod: "",
    saveMerchant: false,
    addNote: false,
    notes: "",
    receiptFile: null,
  };
}

export function buildDealershipExpenseDefaults(
  expenseType: "general" | "recurring",
): DealershipExpenseFormValues {
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
    receiptFile: null,
  };
}

function findSubcategoryValue(label: string): string {
  const found = VEHICLE_EXPENSE_SUBCATEGORIES.find(
    (opt) => opt.label.toLowerCase() === label.toLowerCase(),
  );
  return found?.value ?? label;
}

function findPaymentMethodValue(label: string): string {
  const found = PAYMENT_METHOD_OPTIONS.find(
    (opt) => opt.label.toLowerCase() === label.toLowerCase(),
  );
  return found?.value ?? label;
}

export function buildEditExpenseDefaults(
  expense: ExpenseDetail,
): VehicleExpenseFormValues | DealershipExpenseFormValues {
  const hasNotes = !!expense.notes;

  if (expense.expenseKind === "vehicle") {
    return {
      expenseName: expense.expenseName ?? expense.description,
      expenseDate: expense.date,
      vehicleSubcategory: findSubcategoryValue(expense.expenseSubcategory ?? ""),
      vendor: expense.vendor,
      reference: expense.transactionId === expense.id.slice(0, 8).toUpperCase() ? "" : expense.transactionId,
      description: expense.description,
      amount: Math.max(0, expense.amount - (expense.vehicleNotesAmount ?? 0)),
      paymentMethod: findPaymentMethodValue(expense.paymentMethod),
      saveMerchant: false,
      addNote: hasNotes,
      notes: expense.notes ?? "",
      receiptFile: null,
    };
  }

  return {
    category: expense.category === "recurring" ? "advertising" : expense.category,
    expenseDate: expense.date,
    reference: expense.transactionId === expense.id.slice(0, 8).toUpperCase() ? "" : expense.transactionId,
    vendor: expense.vendor,
    description: expense.description,
    amount: expense.amount,
    taxDeductible: "yes",
    markRecurring: expense.category === "recurring",
    saveMerchant: false,
    addNote: hasNotes,
    notes: expense.notes ?? "",
    paymentMethod: findPaymentMethodValue(expense.paymentMethod),
    receiptFile: null,
  };
}
