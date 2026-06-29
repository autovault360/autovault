"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import type {
  FlooringSummary,
  FlooringVehicleOption,
} from "@/lib/vehicles/flooring/types";
import { formatField } from "@/lib/vehicles/types";

const ACTIVE_STATUSES = ["in_stock", "needs_attention", "pending_deal"];

const EMPTY_SUMMARY: FlooringSummary = {
  totalFlooringCost: 0,
  vehicleCount: 0,
  planName: null,
  planId: null,
};

export async function getFlooringSummary(): Promise<FlooringSummary> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return EMPTY_SUMMARY;

    const supabase = await createClient();
    const { dealershipId } = auth.user;

    const { data: vehicles, error } = await supabase
      .from("vehicles")
      .select("flooring_fees, flooring_plan_id")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .in("status", ACTIVE_STATUSES)
      .not("flooring_plan_id", "is", null);

    if (error) {
      console.warn("getFlooringSummary: query error", error.message);
      return EMPTY_SUMMARY;
    }

    const totalFlooringCost = (vehicles ?? []).reduce(
      (sum, v) => sum + Number(v.flooring_fees ?? 0),
      0,
    );

    const planId = vehicles?.find((v) => v.flooring_plan_id)?.flooring_plan_id ?? null;
    let planName: string | null = null;

    if (planId) {
      const { data: plan } = await supabase
        .from("flooring_plans")
        .select("name")
        .eq("id", planId)
        .maybeSingle();
      planName = plan?.name ?? null;
    }

    return {
      totalFlooringCost: Math.round(totalFlooringCost * 100) / 100,
      vehicleCount: vehicles?.length ?? 0,
      planName,
      planId,
    };
  } catch (err) {
    console.warn("getFlooringSummary: unexpected error", err);
    return EMPTY_SUMMARY;
  }
}

export async function getFlooringVehicleOptions(): Promise<FlooringVehicleOption[]> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, year, make, model, stock_number, vin, acquisition_cost, status")
      .eq("dealership_id", auth.user.dealershipId)
      .is("deleted_at", null)
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("getFlooringVehicleOptions: query error", error.message);
      return [];
    }

    return (data ?? []).map((v) => ({
      id: v.id,
      label: `${v.year} ${formatField("make", v.make)} ${formatField("model", v.model, v.make)}`,
      stockNumber: v.stock_number ?? "",
      vin: v.vin,
      purchasePrice: Number(v.acquisition_cost ?? 0),
      status: v.status,
    }));
  } catch (err) {
    console.warn("getFlooringVehicleOptions: unexpected error", err);
    return [];
  }
}
