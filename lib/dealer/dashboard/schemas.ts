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

export const expenseSchema = z.object({
  category: z.enum([
    "auction_fees",
    "transportation",
    "recon_repairs",
    "storage_fees",
    "dealer_fees",
    "miscellaneous",
  ]),
  description: z.string().min(1, "Description is required"),
  amount: currencyField.refine((v) => v > 0, "Amount is required"),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
