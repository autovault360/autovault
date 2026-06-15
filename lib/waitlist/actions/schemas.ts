import { z } from "zod";
import { phoneRegex, phoneSchemaMessage } from "@/lib/shared/phone";

export const waitlistSourceSchema = z.enum(["hero_form", "footer_form"]);

export const heroWaitlistSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), phoneSchemaMessage),
  dealershipName: z.string().trim().min(2, "Dealership name is required"),
  source: waitlistSourceSchema,
  website: z.string().max(0).optional(),
});

export const footerWaitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  source: waitlistSourceSchema,
  website: z.string().max(0).optional(),
});

export type HeroWaitlistValues = z.infer<typeof heroWaitlistSchema>;
export type FooterWaitlistValues = z.infer<typeof footerWaitlistSchema>;

export type WaitlistActionResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
