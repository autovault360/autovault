import { z } from "zod";

const currencyField = z.coerce.number().min(0, "Must be 0 or greater");

export const vehicleExpenseSchema = z.object({
  expenseName: z
    .string()
    .trim()
    .min(1, "Expense name is required")
    .max(80, "Expense name must be 80 characters or less"),
  expenseDate: z.string().min(1, "Expense date is required"),
  vehicleSubcategory: z.string().min(1, "Type is required"),
  vendor: z.string().min(1, "Vendor is required"),
  reference: z.string().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(150, "Description must be 150 characters or less"),
  amount: currencyField.refine((v) => v > 0, "Amount must be greater than 0"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  saveMerchant: z.boolean(),
  addNote: z.boolean(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  receiptFile: z.instanceof(File).nullable().optional(),
});

export type VehicleExpenseFormValues = z.infer<typeof vehicleExpenseSchema>;

export const dealershipExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  expenseDate: z.string().min(1, "Expense date is required"),
  reference: z.string().optional(),
  vendor: z.string().min(1, "Vendor is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(150, "Description must be 150 characters or less"),
  amount: currencyField.refine((v) => v > 0, "Amount must be greater than 0"),
  taxDeductible: z.enum(["yes", "no"]),
  markRecurring: z.boolean(),
  saveMerchant: z.boolean(),
  addNote: z.boolean(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  paymentMethod: z.string().optional(),
  receiptFile: z.instanceof(File).nullable().optional(),
});

export type DealershipExpenseFormValues = z.infer<typeof dealershipExpenseSchema>;
