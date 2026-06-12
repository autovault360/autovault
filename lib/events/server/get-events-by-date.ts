"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { createClient } from "@/lib/supabase/server";
import type { EventWithCreator } from "@/lib/events/types";

export async function getEventsByDate(date: string): Promise<EventWithCreator[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, creator:users!events_created_by_fkey(id, full_name)")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("event_date", date)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getEventsByDate failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const rawCreator = Array.isArray(row.creator) ? row.creator[0] : row.creator;
    return {
      id: row.id as string,
      dealership_id: row.dealership_id as string,
      created_by: row.created_by as string,
      event_date: row.event_date as string,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      creator: rawCreator
        ? {
            id: rawCreator.id as string,
            fullName: (rawCreator.full_name as string | null)?.trim() || "Unknown",
          }
        : undefined,
    };
  });
}