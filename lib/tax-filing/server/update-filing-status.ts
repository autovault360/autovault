"use server";

import { z } from "zod";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { updatePeriodStatus } from "@/services/tax-filing.service";

const schema = z.object({
  periodId: z.string().uuid(),
  status: z.enum(["open", "due", "paid", "filed", "closed"]),
});

export async function updateFilingStatusAction(
  input: z.infer<typeof schema>,
): Promise<{ success: true } | { success: false; error: string }> {
  const auth = await authenticateUser();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updatePeriodStatus(parsed.data.periodId, auth.user.dealershipId, parsed.data.status);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update status";
    return { success: false, error: message };
  }
}
