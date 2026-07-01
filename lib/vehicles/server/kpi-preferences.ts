"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";

const PAGE_KEY = "vehicles_inventory";

const upsertSchema = z.object({
  kpiKey: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  columnKey: z.string().min(1).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type KpiPreference = {
  id: string;
  kpiKey: string;
  colorHex: string;
  columnKey: string | null;
  sortOrder: number;
};

export async function getInventoryKpiPreferences(): Promise<KpiPreference[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_table")
    .select("id, kpi_key, color_hex, column_key, sort_order")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("page_key", PAGE_KEY)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    kpiKey: row.kpi_key as string,
    colorHex: row.color_hex as string,
    columnKey: (row.column_key as string | null) ?? null,
    sortOrder: Number(row.sort_order ?? 0),
  }));
}

export async function resetInventoryKpiPreference(kpiKey: string) {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!["super_admin", "owner", "manager"].includes(auth.user.role)) {
      return { success: false, error: "Insufficient permissions to reset KPI colors" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("kpi_table")
      .delete()
      .eq("dealership_id", auth.user.dealershipId)
      .eq("page_key", PAGE_KEY)
      .eq("kpi_key", kpiKey);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function upsertInventoryKpiPreference(payload: unknown) {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!["super_admin", "owner", "manager"].includes(auth.user.role)) {
      return { success: false, error: "Insufficient permissions to update KPI colors" };
    }

    const input = upsertSchema.parse(payload);
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("kpi_table")
      .select("id")
      .eq("dealership_id", auth.user.dealershipId)
      .eq("page_key", PAGE_KEY)
      .eq("kpi_key", input.kpiKey)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const row = {
      dealership_id: auth.user.dealershipId,
      page_key: PAGE_KEY,
      kpi_key: input.kpiKey,
      color_hex: input.colorHex,
      column_key: input.columnKey ?? null,
      sort_order: input.sortOrder ?? 0,
      deleted_at: null,
    };

    if (existing?.id) {
      const { error } = await supabase.from("kpi_table").update(row).eq("id", existing.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("kpi_table").insert(row);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
