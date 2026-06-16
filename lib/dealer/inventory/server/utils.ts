"use server";

import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  type AuthResult,
} from "@/lib/vehicles/server/utils";

export async function authenticateWholesaleDealer(): Promise<AuthResult> {
  const auth = await authenticateUser();
  if (!auth.ok) return auth;

  const allowed = new Set(["wholesale_dealer", "super_admin", "owner", "manager"]);
  if (!allowed.has(auth.user.role)) {
    return { ok: false, error: "Wholesale dealer access required" };
  }

  return auth;
}

export async function revalidateWholesaleInventoryPaths() {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dealer/dashboard");
  revalidatePath("/dealer/inventory");
  revalidatePath("/dealer/dashboard/missing-titles");
  revalidatePath("/dealer/dashboard/arbitration");
  revalidatePath("/dealer/documents");
}

export async function insertStatusHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    vehicleId: string;
    dealershipId: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string;
    notes?: string;
  },
) {
  await supabase.from("status_history").insert({
    vehicle_id: params.vehicleId,
    dealership_id: params.dealershipId,
    from_status: params.fromStatus,
    to_status: params.toStatus,
    notes: params.notes,
    changed_by: params.changedBy,
  });
}

export async function insertVehicleAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    dealershipId: string;
    vehicleId: string;
    action: string;
    changedBy: string;
    newValues?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    dealership_id: params.dealershipId,
    entity_type: "vehicles",
    entity_id: params.vehicleId,
    action: params.action,
    new_values: params.newValues ?? null,
    changed_by: params.changedBy,
  });
  if (error) console.error("audit_logs insert failed:", error.message);
}
