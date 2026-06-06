import { z } from "zod";

export const DEAL_TYPES = ["Retail", "Wholesale", "Fleet"] as const;
export const PAYMENT_TYPES = ["Cash", "Finance", "Lease"] as const;

export const createDealJacketSchema = z
  .object({
    stockNo: z
      .string()
      .min(1, "Stock # is required")
      .regex(/^[A-Za-z0-9-]+$/, "Invalid stock number format"),
    vin: z
      .string()
      .min(1, "VIN is required")
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, "VIN must be 17 alphanumeric characters"),
    saleDate: z.string().min(1, "Sale date is required"),
    dealType: z.enum(DEAL_TYPES, { message: "Deal type is required" }),
    paymentType: z.enum(PAYMENT_TYPES, { message: "Payment type is required" }),
    salePrice: z.coerce
      .number({ message: "Sale price is required" })
      .positive("Sale price must be greater than zero"),
    hasTradeIn: z.boolean(),
    tradeInVehicle: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasTradeIn && !data.tradeInVehicle) {
      ctx.addIssue({
        code: "custom",
        message: "Trade-in vehicle is required",
        path: ["tradeInVehicle"],
      });
    }
  });

export type CreateDealJacketFormValues = z.infer<typeof createDealJacketSchema>;
