"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, assertVehicleActive, uploadFile, trackFile, type ActionResult } from "./utils";
import { revalidatePath } from "next/cache";

const schema = z.object({
  vehicleId: z.string().uuid(),
  lossDate: z.string().min(1),
  lossReason: z.string().min(1),
  lossType: z.string().min(1),
  explanation: z.string().min(10),
  estimatedLossAmount: z.coerce.number().positive(),
  insuranceProceeds: z.coerce.number().default(0),
});

export async function markAsLoss(formData: FormData): Promise<ActionResult> {
  const uploadedPaths: string[] = [];

  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId, role } = auth.user;

    if (!["super_admin", "owner", "manager"].includes(role)) {
      return { success: false, error: "Only managers can mark vehicles as loss" };
    }

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const activeError = await assertVehicleActive(supabase, data.vehicleId, dealershipId);
    if (activeError) return { success: false, error: activeError };

    const { data: vehicle, error: fetchError } = await supabase
      .from("vehicles")
      .select("acquisition_cost, reconditioning_cost, total_invested")
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .single();

    if (fetchError || !vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    const totalInvestment = Number(vehicle.acquisition_cost ?? 0);
    const totalExpenses = Number(vehicle.reconditioning_cost ?? 0);
    const totalCostBasis = Number(vehicle.total_invested);
    const netLoss = totalCostBasis - data.insuranceProceeds;

    const docs = formData.getAll("documents") as File[];
    const docPaths: string[] = [];
    const docBase = `${dealershipId}/${data.vehicleId}/loss-docs`;

    for (let i = 0; i < docs.length; i++) {
      const ext = docs[i].name.split(".").pop();
      const path = `${docBase}/${i}.${ext}`;
      await uploadFile("vehicle-documents", path, docs[i]);
      uploadedPaths.push(path);
      docPaths.push(path);
      await trackFile(docs[i], "vehicle-documents", path, dealershipId, userId, {
        sourceEntity: "vehicle",
        sourceEntityId: data.vehicleId,
      });
    }

    const { error: lossError } = await supabase.from("vehicle_losses").insert({
      vehicle_id: data.vehicleId,
      dealership_id: dealershipId,
      loss_date: data.lossDate,
      loss_reason: data.lossReason,
      loss_type: data.lossType,
      explanation: data.explanation,
      total_investment: totalInvestment,
      total_expenses: totalExpenses,
      total_cost_basis: totalCostBasis,
      estimated_loss_amount: data.estimatedLossAmount,
      insurance_proceeds: data.insuranceProceeds,
      net_loss: netLoss,
      document_paths: docPaths,
      created_by: userId,
    });

    if (lossError) throw new Error(lossError.message);

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "MARKED_LOSS",
      new_values: { loss_reason: data.lossReason, loss_type: data.lossType, net_loss: netLoss },
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${data.vehicleId}`);
    return { success: true };
  } catch (err) {
    if (uploadedPaths.length > 0) {
      const supabase = await createClient();
      await supabase.storage.from("vehicle-documents").remove(uploadedPaths);
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
