"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { updateCommissionStatus } from "./update-commission-status";

export async function markCommissionPaid(
  dealJacketId: string,
): Promise<{ success: boolean; error?: string }> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { success: false, error: "Authentication required" };
  }

  if (!["super_admin", "owner", "manager"].includes(auth.user.role)) {
    return { success: false, error: "Only managers can mark commissions as paid" };
  }

  const supabase = await createClient();
  const result = await updateCommissionStatus(dealJacketId, "paid", {
    paid_by: auth.user.userId,
  });

  if (!result) {
    return { success: false, error: "Failed to mark commission as paid" };
  }

  await supabase
    .from("deal_jackets")
    .update({
      commission_status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealJacketId);

  return { success: true };
}
