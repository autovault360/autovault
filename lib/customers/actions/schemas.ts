import { z } from "zod";
import { phoneRegex, phoneSchemaMessage, zipRegex, zipSchemaMessage } from "@/lib/shared/phone";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, phoneSchemaMessage),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  type: z.enum(["individual", "dealer", "wholesale"]),
  status: z.enum(["lead", "active_deal", "customer"]),
  salesRepId: z.string().optional().or(z.literal("")),
  source: z
    .union([
      z.enum(["website", "referral", "walk_in", "ads", "social_media", "other"]),
      z.literal(""),
    ])
    .optional(),
  address: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z
    .string()
    .optional()
    .refine((v) => !v || zipRegex.test(v), zipSchemaMessage),
  dateOfBirth: z.string().optional().or(z.literal("")),
  driversLicenseNumber: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[A-Za-z0-9\s-]{4,20}$/.test(v),
      "Enter a valid driver's license number (4-20 letters, numbers, spaces, or hyphens)",
    ),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerNoteSchema = z.object({
  customerId: z.string().uuid(),
  body: z.string().min(1, "Note is required"),
});

export const customerCommunicationSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(["email", "call", "sms", "meeting", "inquiry"]),
  subject: z.string().optional(),
  body: z.string().min(1, "Message is required"),
  occurredAt: z.string().optional(),
});

export type CustomerNoteFormValues = z.infer<typeof customerNoteSchema>;
export type CustomerCommunicationFormValues = z.infer<typeof customerCommunicationSchema>;
