import { z } from "zod";
import { phoneRegex, phoneSchemaMessage, zipRegex, zipSchemaMessage } from "@/lib/shared/phone";

export const DEFAULT_MONTHLY_GOAL = 50000;
export const DEFAULT_COMMISSION_RATE = 10;

export const SALES_REP_ROLES = ["sales_rep", "manager"] as const;
export type SalesRepRole = (typeof SALES_REP_ROLES)[number];

export const salesRepFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, phoneSchemaMessage),
  email: z.string().email("Invalid email address"),
  role: z.enum(SALES_REP_ROLES),
  isActive: z.boolean(),
  address: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z
    .string()
    .optional()
    .refine((v) => !v || zipRegex.test(v), zipSchemaMessage),
  hireDate: z.string().optional().or(z.literal("")),
  commissionRate: z.coerce
    .number()
    .min(0, "Commission rate must be 0% or greater")
    .max(100, "Commission rate cannot exceed 100%"),
  monthlyGoal: z.coerce.number().min(0, "Monthly goal must be 0 or greater"),
});

export type SalesRepFormValues = z.infer<typeof salesRepFormSchema>;

export function formatSalesRepRole(role: SalesRepRole): string {
  return role === "manager" ? "Manager" : "Sales Rep";
}
