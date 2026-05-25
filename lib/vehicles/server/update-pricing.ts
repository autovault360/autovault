"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, assertVehicleActive, type ActionResult } from "./utils";
import { revalidatePath } from "next/cache";

const schema = z.object({
  vehicleId: z.string().uuid(),
  newAskingPrice: z.coerce.number().positive(),
  wholesalePrice: z.coerce.number().optional(),
  retailPrice: z.coerce.number().optional(),
  minAcceptablePrice: z.coerce.number().optional(),
  targetProfit: z.coerce.number().optional(),
  pricingStrategy: z.string().min(1),
  reason: z.string().min(1),
  effectiveDate: z.string().min(1),
  notes: z.string().optional(),
});

export async function updatePricing(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId, role } = auth.user;

    if (!["super_admin", "owner", "manager", "cpa"].includes(role)) {
      return { success: false, error: "Insufficient permissions to update pricing" };
    }

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const activeError = await assertVehicleActive(supabase, data.vehicleId, dealershipId);
    if (activeError) return { success: false, error: activeError };

    const { data: vehicle, error: fetchError } = await supabase
      .from("vehicles")
      .select("asking_price")
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .single();

    if (fetchError || !vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    const updates: Record<string, unknown> = {
      asking_price: data.newAskingPrice,
    };
    if (data.wholesalePrice !== undefined) {
      updates.wholesale_price = data.wholesalePrice;
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updates)
      .eq("id", data.vehicleId);

    if (updateError) throw new Error(updateError.message);

    const { error: historyError } = await supabase.from("pricing_history").insert({
      vehicle_id: data.vehicleId,
      dealership_id: dealershipId,
      previous_price: vehicle.asking_price,
      new_price: data.newAskingPrice,
      wholesale_price: data.wholesalePrice,
      retail_price: data.retailPrice,
      min_acceptable_price: data.minAcceptablePrice,
      target_profit: data.targetProfit,
      strategy: data.pricingStrategy,
      reason: data.reason,
      effective_date: data.effectiveDate,
      notes: data.notes,
      changed_by: userId,
    });

    if (historyError) throw new Error(historyError.message);

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "PRICE_UPDATE",
      old_values: { asking_price: vehicle.asking_price },
      new_values: { asking_price: data.newAskingPrice, reason: data.reason },
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
