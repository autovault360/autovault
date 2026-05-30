import { z } from "zod";

export const DEALERSHIP_EXPENSE_CATEGORIES = [
  "advertising",
  "accounting",
  "office",
  "salary_wages",
  "other",
  "software",
  "utilities",
  "rent",
  "insurance",
] as const;

export const VEHICLE_EXPENSE_SUBCATEGORIES = [
  "brakes",
  "tires",
  "engine",
  "transmission",
  "paint_body",
  "detail",
  "smog",
  "inspection",
  "towing",
  "parts",
  "labor",
  "keys",
  "registration",
  "other",
] as const;

export const RECURRENCE_FREQUENCIES = [
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export const PAYMENT_METHODS = [
  "credit_card",
  "check",
  "ach",
  "cash",
  "debit_card",
] as const;

export const dealershipExpenseSchema = z.object({
  expenseDate: z.string().min(1),
  category: z.enum(DEALERSHIP_EXPENSE_CATEGORIES),
  vendor: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  referenceNumber: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  taxDeductible: z.boolean().default(true),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(RECURRENCE_FREQUENCIES).optional(),
  recurrenceNextDueDate: z.string().optional(),
  notes: z.string().optional(),
  saveMerchant: z.boolean().default(false),
});

export const vehicleExpenseSchema = z.object({
  vehicleId: z.string().uuid(),
  expenseDate: z.string().min(1),
  expenseSubcategory: z.enum(VEHICLE_EXPENSE_SUBCATEGORIES),
  vendor: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  referenceNumber: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().optional(),
  saveMerchant: z.boolean().default(false),
});

export const lookupVehicleSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("vin"),
    query: z.string().min(1),
  }),
  z.object({
    mode: z.literal("stock"),
    query: z.string().min(1),
  }),
  z.object({
    mode: z.literal("make_model"),
    year: z.coerce.number().int().min(1900),
    make: z.string().min(1),
    model: z.string().min(1),
  }),
]);

export const deleteExpenseSchema = z.object({
  expenseKind: z.enum(["dealership", "vehicle"]),
  expenseId: z.string().uuid(),
});

export type DealershipExpenseInput = z.infer<typeof dealershipExpenseSchema>;
export type VehicleExpenseInput = z.infer<typeof vehicleExpenseSchema>;
