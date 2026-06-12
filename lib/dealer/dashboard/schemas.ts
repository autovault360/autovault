import { z } from "zod";

const currencyField = z.coerce.number().min(0, "Must be 0 or greater");

export const inventoryWorkspaceSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  vin: z
    .string()
    .min(17, "VIN must be 17 characters")
    .max(17, "VIN must be 17 characters"),
  year: z.coerce.number().min(1980).max(2035),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional(),
  stockNumber: z.string().min(1, "Stock number is required"),
  mileage: z.coerce.number().min(0).optional(),
  lotLocation: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair"]).optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: currencyField,
  auctionFees: currencyField,
  transportationCosts: currencyField,
  reconRepairDetails: currencyField,
  storageFees: currencyField,
  dealerFees: currencyField,
  marketValue: currencyField.refine((v) => v > 0, "Market value is required"),
  wholesaleValue: currencyField.optional(),
  titleReceived: z.boolean(),
  inventoryStatus: z
    .enum(["in_stock", "pending_sale", "sold"])
    .default("in_stock"),
  odometerStatus: z.string().optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  timesInAuction: z.coerce.number().min(0).optional(),
  nextAuctionDate: z.string().optional(),
  lastAuctionDate: z.string().optional(),
  soldAt: z.string().optional(),
  soldPrice: z.coerce.number().optional(),
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

const transactionTypeEnum = z.enum([
  "dealer_sale",
  "auction_sale",
  "dealer_purchase",
  "auction_purchase",
]);

export const addDealerTransactionSchema = z.object({
  transactionType: transactionTypeEnum,
  vehicleId: z.string().min(1, "Vehicle is required"),
  stockNumber: z.string().optional(),
  dealerAuctionName: z.string().min(1, "Dealer / Auction name is required"),
  contactPerson: z.string().optional(),
  dealerLicense: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Enter a valid email",
    ),
  transactionDate: z.string().min(1, "Date is required"),
  salePurchasePrice: currencyField.refine((v) => v > 0, "Price is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.enum(["paid", "partial", "pending"]),
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
  commonDocuments: z.array(z.string()).optional(),
  addAnotherDocument: z.boolean().optional(),
});

export type AddDealerTransactionFormValues = z.infer<
  typeof addDealerTransactionSchema
>;

const saleTypeEnum = z.enum(["wholesale", "retail", "dealer_trade", "auction"]);
const buyerTypeEnum = z.enum(["dealer", "auction", "private", "other"]);

export const addSoldVehicleSchema = z.object({
  saleType: saleTypeEnum,
  vehicleId: z.string().min(1, "Vehicle is required"),
  stockNumber: z.string().optional(),
  buyerName: z.string().min(1, "Buyer / Business name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Enter a valid email",
    ),
  dealerLicense: z.string().optional(),
  buyerType: buyerTypeEnum,
  saleDate: z.string().min(1, "Sale date is required"),
  salePrice: currencyField.refine((v) => v > 0, "Sale price is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.enum(["paid", "partial", "pending"]),
  dealNumber: z.string().optional(),
  salesperson: z.string().optional(),
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
  commonDocuments: z.array(z.string()).optional(),
  addAnotherDocument: z.boolean().optional(),
});

export type AddSoldVehicleFormValues = z.infer<typeof addSoldVehicleSchema>;
