import { phoneRegex, zipRegex } from "@/lib/shared/phone";
import { z } from "zod";
import { validateFile } from "./utils";

const currencyField = z.coerce.number().min(0, "Must be 0 or greater");

export const updatePricingSchema = z.object({
  currentAskingPrice: currencyField,
  newAskingPrice: currencyField.refine((v) => v > 0, "New asking price is required"),
  wholesalePrice: currencyField,
  retailPrice: currencyField,
  minAcceptablePrice: currencyField,
  targetProfit: currencyField,
  pricingStrategy: z.string().min(1, "Pricing strategy is required"),
  reason: z.string().min(1, "Reason for price update is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  photoFile: z.instanceof(File).nullable().optional(),
});

export type UpdatePricingFormValues = z.infer<typeof updatePricingSchema>;

const addRepairCostBaseSchema = z.object({
  repairDate: z.string().min(1, "Repair date is required"),
  repairCategory: z.string().min(1, "Repair category is required"),
  repairType: z.string().min(1, "Repair type is required"),
  priority: z.string().min(1, "Priority is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or less"),
  laborCost: currencyField,
  partsCost: currencyField,
  shopVendor: z.string().min(1, "Shop / vendor is required"),
  otherFees: currencyField,
  isInternalRepair: z.enum(["yes", "no"]),
  paymentMethod: z.string().min(1, "Payment method is required"),
  invoiceNumber: z.string().optional(),
  paymentStatus: z.string().min(1, "Payment status is required"),
  datePaid: z.string().optional(),
  attachments: z.array(z.instanceof(File)),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

export type AddRepairCostFormValues = z.infer<typeof addRepairCostBaseSchema>;

export const addRepairCostSchema = addRepairCostBaseSchema
  .refine(
    (data) => data.laborCost + data.partsCost + data.otherFees > 0,
    { message: "Total repair cost must be greater than 0", path: ["laborCost"] },
  )
  .superRefine((data, ctx) => {
    data.attachments.forEach((file, index) => {
      const error = validateFile(file, {
        maxSizeMB: 10,
        allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
      });
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
          path: ["attachments", index],
        });
      }
    });
  });

const dealerPayoutItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: currencyField.refine((v) => v > 0, "Amount must be greater than 0"),
  frequency: z.enum(["one_time", "weekly", "monthly", "per_deal"]),
});

const markAsSoldBaseSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number: (XXX) XXX-XXXX"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z
    .string()
    .min(1, "ZIP code is required")
    .regex(zipRegex, "Enter a valid ZIP code"),
  saleDate: z.string().min(1, "Sold date is required"),
  soldPriceBeforeTax: currencyField.refine(
    (v) => v > 0,
    "Sold price is required",
  ),
  salesTaxAmount: currencyField,
  licenseRegistrationFees: currencyField,
  rosNumber: z.string().min(1, "ROS number is required"),
  zipCodeOfSale: z
    .string()
    .min(1, "ZIP code is required")
    .regex(zipRegex, "Enter a valid ZIP code"),
  salesRepId: z.string().optional().or(z.literal("")),
  commissionType: z.enum(["percentage", "manual"]),
  commissionRate: currencyField,
  manualCommissionAmount: currencyField,
  dealerPayoutsEnabled: z.boolean(),
  payoutItems: z.array(dealerPayoutItemSchema),
  documents: z.array(z.instanceof(File)).min(1, "At least one document is required"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

export type MarkAsSoldFormValues = z.infer<typeof markAsSoldBaseSchema>;
export type DealerPayoutItemValues = z.infer<typeof dealerPayoutItemSchema>;

export const markAsSoldSchema = markAsSoldBaseSchema.superRefine((data, ctx) => {
  data.documents.forEach((file, index) => {
    const error = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg"],
    });
    if (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error,
        path: ["documents", index],
      });
    }
  });

  if (data.dealerPayoutsEnabled && data.payoutItems.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Add at least one payout item or turn off dealer payouts",
      path: ["payoutItems"],
    });
  }
});

const markAsLossBaseSchema = z.object({
  lossDate: z.string().min(1, "Loss date is required"),
  lossReason: z.string().min(1, "Loss reason is required"),
  lossType: z.string().min(1, "Loss type is required"),
  explanation: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(1000, "Explanation must be 1000 characters or less"),
  estimatedLossAmount: currencyField.refine(
    (v) => v > 0,
    "Estimated loss amount is required",
  ),
  insuranceProceeds: currencyField,
  documents: z.array(z.instanceof(File)),
});

export type MarkAsLossFormValues = z.infer<typeof markAsLossBaseSchema>;

export const markAsLossSchema = markAsLossBaseSchema.superRefine((data, ctx) => {
  data.documents.forEach((file, index) => {
    const error = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
    });
    if (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error,
        path: ["documents", index],
      });
    }
  });
});
