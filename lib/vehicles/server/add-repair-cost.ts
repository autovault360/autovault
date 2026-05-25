"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, assertVehicleActive, type ActionResult } from "./utils";
import { revalidatePath } from "next/cache";

const schema = z.object({
  vehicleId: z.string().uuid(),
  repairDate: z.string().min(1),
  repairCategory: z.string().min(1),
  repairType: z.string().min(1),
  priority: z.string(),
  description: z.string().min(1),
  laborCost: z.coerce.number().default(0),
  partsCost: z.coerce.number().default(0),
  shopVendor: z.string().optional(),
  otherFees: z.coerce.number().default(0),
  totalRepairCost: z.coerce.number().positive(),
  isInternalRepair: z.boolean().default(false),
  paymentMethod: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentStatus: z.string().default("unpaid"),
  datePaid: z.string().optional(),
  notes: z.string().optional(),
});

export async function addRepairCost(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const activeError = await assertVehicleActive(supabase, data.vehicleId, dealershipId);
    if (activeError) return { success: false, error: activeError };

    const { error: insertError } = await supabase
      .from("vehicle_expenses")
      .insert({
        vehicle_id: data.vehicleId,
        dealership_id: dealershipId,
        repair_date: data.repairDate,
        category: data.repairCategory,
        repair_type: data.repairType,
        priority: data.priority,
        description: data.description,
        labor_cost: data.laborCost,
        parts_cost: data.partsCost,
        shop_vendor: data.shopVendor,
        other_fees: data.otherFees,
        total_cost: data.totalRepairCost,
        is_internal: data.isInternalRepair,
        payment_method: data.paymentMethod,
        invoice_number: data.invoiceNumber,
        payment_status: data.paymentStatus,
        date_paid: data.datePaid,
        notes: data.notes,
        created_by: userId,
      });

    if (insertError) throw new Error(insertError.message);

    const { error: rpcError } = await supabase.rpc("update_vehicle_financials", {
      p_vehicle_id: data.vehicleId,
    });

    if (rpcError) throw new Error(rpcError.message);

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "REPAIR_ADDED",
      new_values: { repair_category: data.repairCategory, total_cost: data.totalRepairCost, description: data.description },
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
