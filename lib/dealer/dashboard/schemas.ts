import { z } from "zod";

const currencyField = z.coerce.number().min(0, "Must be 0 or greater");

export const inventoryWorkspaceSchema = z.object({
  vin: z
    .string()
    .min(17, "VIN must be 17 characters")
    .max(17, "VIN must be 17 characters"),
  year: z.coerce.number().min(1980).max(2030),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  stockNumber: z.string().min(1, "Stock number is required"),
  acquisitionCost: currencyField,
  auctionFees: currencyField,
  transportationCosts: currencyField,
  reconRepairDetails: currencyField,
  storageFees: currencyField,
  dealerFees: currencyField,
  marketValue: currencyField.refine((v) => v > 0, "Market value is required"),
});

export type InventoryWorkspaceValues = z.infer<typeof inventoryWorkspaceSchema>;

export const transactionWorkspaceSchema = z.object({
  buyerDealerName: z.string().min(1, "Buyer dealer name is required"),
  salePrice: currencyField.refine((v) => v > 0, "Sale price is required"),
  paymentStatus: z.enum(["pending", "funded", "settled"]),
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
});

export type TransactionWorkspaceValues = z.infer<
  typeof transactionWorkspaceSchema
>;

const wholesaleExpenseCategoryEnum = z.enum([
  "auction_fees",
  "transportation",
  "recon_repairs",
  "storage_fees",
  "dealer_fees",
  "miscellaneous",
]);

export const wholesaleExpenseSchema = z.object({
  expenseName: z.string().min(1, "Expense name is required"),
  category: wholesaleExpenseCategoryEnum,
  amount: currencyField.refine((v) => v > 0, "Amount is required"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  reference: z.string().optional(),
  tags: z.array(z.string()).optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  vendor: z.string().min(1, "Vendor is required"),
  expenseDate: z.string().min(1, "Date is required"),
  status: z.enum(["paid", "pending", "unpaid"]),
});

export type WholesaleExpenseFormValues = z.infer<typeof wholesaleExpenseSchema>;
