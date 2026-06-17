"use server";

import { z } from "zod";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { upsertTaxSettings } from "@/services/tax-filing.service";

const schema = z.object({
  state: z.string().min(1, "State is required"),
  filingFrequency: z.enum(["monthly", "quarterly", "annual", "custom"]),
  reminderDays: z.coerce.number().min(1).max(90),
});

export async function saveTaxSettingsAction(
  input: z.infer<typeof schema>,
): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await authenticateUser();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await upsertTaxSettings(auth.user.dealershipId, parsed.data);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return { success: false, error: message };
  }
}
