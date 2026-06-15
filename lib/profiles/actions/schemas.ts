import { z } from "zod";
import { phoneRegex, phoneSchemaMessage, zipRegex, zipSchemaMessage } from "@/lib/shared/phone";

const optionalPhone = z
  .string()
  .optional()
  .refine((v) => !v || phoneRegex.test(v), phoneSchemaMessage);

const optionalZip = z
  .string()
  .optional()
  .refine((v) => !v || zipRegex.test(v), zipSchemaMessage);

export const salesRepProfileUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120, "Name is too long"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, phoneSchemaMessage),
  address: z.string().max(200).optional(),
  address2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zip: optionalZip,
});

export type SalesRepProfileUpdateValues = z.infer<typeof salesRepProfileUpdateSchema>;

export const wholesaleDealerProfileUpdateSchema = z.object({
  contactPerson: z
    .string()
    .min(1, "Contact person is required")
    .max(255, "Contact person name is too long"),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name is too long"),
  businessPhone: z
    .string()
    .min(1, "Business phone is required")
    .regex(phoneRegex, phoneSchemaMessage),
  taxId: z.string().max(100).optional(),
  licenseNumber: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zip: optionalZip,
});

export type WholesaleDealerProfileUpdateValues = z.infer<
  typeof wholesaleDealerProfileUpdateSchema
>;

export const cpaProfileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  phone: optionalPhone,
});

export type CpaProfileUpdateValues = z.infer<typeof cpaProfileUpdateSchema>;
