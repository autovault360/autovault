"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import type { ApplyFlooringPlanInput, FlooringPlanRow } from "@/lib/vehicles/flooring/types";
import {
  calculateFlooringCost,
  planRowToConfig,
  resolveFlooringStartDate,
} from "@/services/flooring.service";

const ACTIVE_STATUSES = ["in_stock", "needs_attention", "pending_deal"] as const;

export type ApplyFlooringPlanResult =
  | { success: true; planId: string; vehiclesUpdated: number }
  | { success: false; error: string };

async function recalculateVehicleFlooring(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string,
  dealershipId: string,
) {
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, acquisition_cost, acquisition_date, flooring_plan_id, flooring_start_date")
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (!vehicle?.flooring_plan_id) {
    await supabase
      .from("vehicles")
      .update({ flooring_fees: 0 })
      .eq("id", vehicleId);
    await supabase.rpc("update_vehicle_financials", { p_vehicle_id: vehicleId });
    return 0;
  }

  const { data: plan } = await supabase
    .from("flooring_plans")
    .select("*")
    .eq("id", vehicle.flooring_plan_id)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (!plan) return 0;

  const config = planRowToConfig(plan as FlooringPlanRow);
  const startDate =
    vehicle.flooring_start_date ??
    resolveFlooringStartDate(vehicle.acquisition_date, config.effectiveDate);

  const breakdown = calculateFlooringCost({
    plan: config,
    purchasePrice: Number(vehicle.acquisition_cost ?? 0),
    flooringStartDate: startDate,
  });

  await supabase
    .from("vehicles")
    .update({
      flooring_fees: breakdown.totalCost,
      flooring_start_date: startDate,
    })
    .eq("id", vehicleId);

  await supabase.rpc("update_vehicle_financials", { p_vehicle_id: vehicleId });
  return breakdown.totalCost;
}

export async function applyFlooringPlan(
  input: ApplyFlooringPlanInput,
): Promise<ApplyFlooringPlanResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!["super_admin", "owner", "manager"].includes(auth.user.role)) {
      return { success: false, error: "Only managers can apply flooring plans" };
    }

    const { dealershipId, userId } = auth.user;
    const supabase = await createClient();

    const { data: plan, error: planError } = await supabase
      .from("flooring_plans")
      .insert({
        dealership_id: dealershipId,
        name: input.planName ?? "Standard Floor Plan",
        rate_type: input.rateType,
        base_rate: input.baseRate,
        effective_date: input.effectiveDate,
        rate_increase_enabled: input.rateIncreaseEnabled,
        increase_after_days: input.rateIncreaseEnabled ? input.increaseAfterDays : null,
        increase_amount_type: input.rateIncreaseEnabled
          ? input.increaseAmountType
          : null,
        increase_amount: input.rateIncreaseEnabled ? input.increaseAmount : null,
        max_cap: input.maxCap,
        buy_fee: input.buyFee,
        late_fee_after_days: input.lateFeeAfterDays || null,
        late_fee_per_day: input.lateFeePerDay,
        grace_period_days: input.gracePeriodDays,
        is_active: true,
        created_by: userId,
      })
      .select("id")
      .single();

    if (planError || !plan) {
      return { success: false, error: planError?.message ?? "Failed to create plan" };
    }

    let vehicleIds: string[] = [];

    if (input.applyTo === "all") {
      const { data: rows } = await supabase
        .from("vehicles")
        .select("id")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .in("status", [...ACTIVE_STATUSES]);
      vehicleIds = (rows ?? []).map((r) => r.id);
    } else {
      vehicleIds = input.vehicleIds ?? [];
    }

    if (vehicleIds.length === 0) {
      return { success: false, error: "No vehicles selected for flooring plan" };
    }

    const config = planRowToConfig({
      id: plan.id,
      dealership_id: dealershipId,
      name: input.planName ?? "Standard Floor Plan",
      rate_type: input.rateType,
      base_rate: input.baseRate,
      effective_date: input.effectiveDate,
      rate_increase_enabled: input.rateIncreaseEnabled,
      increase_after_days: input.increaseAfterDays,
      increase_amount_type: input.increaseAmountType,
      increase_amount: input.increaseAmount,
      max_cap: input.maxCap,
      buy_fee: input.buyFee,
      late_fee_after_days: input.lateFeeAfterDays,
      late_fee_per_day: input.lateFeePerDay,
      grace_period_days: input.gracePeriodDays,
      is_active: true,
    });

    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, acquisition_date")
      .eq("dealership_id", dealershipId)
      .in("id", vehicleIds)
      .is("deleted_at", null);

    for (const vehicle of vehicles ?? []) {
      const startDate = resolveFlooringStartDate(
        vehicle.acquisition_date,
        config.effectiveDate,
      );

      const { data: fullVehicle } = await supabase
        .from("vehicles")
        .select("acquisition_cost")
        .eq("id", vehicle.id)
        .single();

      const cost = calculateFlooringCost({
        plan: config,
        purchasePrice: Number(fullVehicle?.acquisition_cost ?? 0),
        flooringStartDate: startDate,
      });

      await supabase
        .from("vehicles")
        .update({
          flooring_plan_id: plan.id,
          flooring_start_date: startDate,
          flooring_fees: cost.totalCost,
        })
        .eq("id", vehicle.id);

      await supabase.rpc("update_vehicle_financials", { p_vehicle_id: vehicle.id });
    }

    await supabase
      .from("flooring_plans")
      .update({ is_active: false })
      .eq("dealership_id", dealershipId)
      .neq("id", plan.id)
      .is("deleted_at", null);

    await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "flooring_plans",
      entity_id: plan.id,
      action: "FLOORING_PLAN_APPLIED",
      new_values: {
        vehicles_count: vehicleIds.length,
        rate_type: input.rateType,
        base_rate: input.baseRate,
      },
      changed_by: userId,
    });

    revalidatePath("/dashboard/vehicles");
    return { success: true, planId: plan.id, vehiclesUpdated: vehicleIds.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function recalculateDealershipFlooring(): Promise<void> {
  const auth = await authenticateUser();
  if (!auth.ok) return;

  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id")
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .not("flooring_plan_id", "is", null)
    .in("status", [...ACTIVE_STATUSES]);

  for (const vehicle of vehicles ?? []) {
    await recalculateVehicleFlooring(
      supabase,
      vehicle.id,
      auth.user.dealershipId,
    );
  }

  revalidatePath("/dashboard/vehicles");
}

export { recalculateVehicleFlooring };
