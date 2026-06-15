"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  authenticateWholesaleDealer,
  revalidateWholesaleInventoryPaths,
} from "@/lib/dealer/inventory/server/utils";
import type { ArbitrationNote } from "../types";

const schema = z.object({
  vehicleId: z.string().uuid(),
});

export async function getArbitrationNotes(
  vehicleId: string,
): Promise<{ success: true; notes: ArbitrationNote[] } | { success: false; error: string }> {
  try {
    const auth = await authenticateWholesaleDealer();
    if (!auth.ok) return { success: false, error: auth.error };

    const parsed = schema.parse({ vehicleId });
    const supabase = await createClient();

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", parsed.vehicleId)
      .eq("dealership_id", auth.user.dealershipId)
      .eq("status", "arbitration")
      .is("deleted_at", null)
      .maybeSingle();

    if (!vehicle) {
      return { success: false, error: "Arbitration vehicle not found" };
    }

    const { data: rows, error } = await supabase
      .from("arbitration_notes")
      .select("id, vehicle_id, author_name, body, created_at")
      .eq("vehicle_id", parsed.vehicleId)
      .eq("dealership_id", auth.user.dealershipId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const notes: ArbitrationNote[] = (rows ?? []).map((row) => ({
      id: row.id as string,
      vehicleId: row.vehicle_id as string,
      authorName: row.author_name as string,
      body: row.body as string,
      createdAt: row.created_at as string,
    }));

    return { success: true, notes };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load notes",
    };
  }
}

const addNoteSchema = z.object({
  vehicleId: z.string().uuid(),
  body: z.string().trim().min(1, "Note is required").max(2000),
});

export async function addArbitrationNote(input: z.infer<typeof addNoteSchema>) {
  try {
    const auth = await authenticateWholesaleDealer();
    if (!auth.ok) return { success: false as const, error: auth.error };

    const data = addNoteSchema.parse(input);
    const supabase = await createClient();

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", data.vehicleId)
      .eq("dealership_id", auth.user.dealershipId)
      .eq("status", "arbitration")
      .is("deleted_at", null)
      .maybeSingle();

    if (!vehicle) {
      return { success: false as const, error: "Arbitration vehicle not found" };
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", auth.user.userId)
      .maybeSingle();

    if (!profile) {
      return { success: false as const, error: "User profile not found" };
    }

    const { error: insertError } = await supabase.from("arbitration_notes").insert({
      vehicle_id: data.vehicleId,
      dealership_id: auth.user.dealershipId,
      author_id: profile.id,
      author_name: profile.full_name || "Team Member",
      body: data.body,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    await revalidateWholesaleInventoryPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to add note",
    };
  }
}
