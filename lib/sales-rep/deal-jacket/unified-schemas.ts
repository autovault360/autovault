import { z } from "zod";
import { DEAL_TYPES, US_STATES } from "./constants";
import { phoneRegex, phoneSchemaMessage } from "@/lib/shared/phone";

const licenseRegex = /^[A-Za-z0-9]{5,15}$/;

export const unifiedDealJacketSchema = z.object({
  linkedVehicleId: z.string().min(1, "Please select a linked vehicle"),
  stockNo: z
    .string()
    .min(1, "Stock # is required")
    .regex(/^[A-Za-z0-9-]+$/, "Invalid stock number format"),
  vin: z
    .string()
    .min(1, "VIN is required")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, "VIN must be 17 alphanumeric characters"),
  buyerName: z
    .string()
    .min(1, "Buyer name is required")
    .min(2, "Buyer name must be at least 2 characters"),
  buyerPhone: z
    .string()
    .min(1, "Phone is required")
    .regex(phoneRegex, phoneSchemaMessage),
  buyerEmail: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  buyerAddress: z.string().optional(),
  driverLicenseNo: z
    .string()
    .min(1, "Driver license # is required")
    .regex(licenseRegex, "Invalid driver license format"),
  buyerState: z.enum(US_STATES, { message: "State is required" }),
  salePrice: z.coerce
    .number({ message: "Sale price is required" })
    .positive("Sale price must be greater than zero"),
  saleDate: z.string().min(1, "Date sold is required"),
  downPayment: z.coerce.number().min(0, "Down payment cannot be negative"),
  tradeInAllowance: z.coerce.number().min(0, "Trade-in allowance cannot be negative"),
  dmvFees: z.coerce.number().min(0, "DMV fees cannot be negative"),
  registrationFees: z.coerce.number().min(0, "Registration fees cannot be negative"),
  documentationFees: z.coerce.number().min(0, "Documentation fees cannot be negative"),
  warrantyAmount: z.coerce.number().min(0, "Warranty amount cannot be negative"),
  gapAmount: z.coerce.number().min(0, "GAP amount cannot be negative"),
  lender: z.string().optional(),
  rosNumber: z.string().optional(),
  dealType: z.enum(DEAL_TYPES, { message: "Deal type is required" }),
  notes: z.string().optional(),
});

export type UnifiedDealJacketFormValues = z.infer<typeof unifiedDealJacketSchema>;
