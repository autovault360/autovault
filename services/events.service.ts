import { createClient } from "@/lib/supabase/server";
import type { CreateEventInput, EventRow } from "@/lib/events/types";

export async function fetchEventsInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<EventRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("dealership_id", dealershipId)
    .gte("event_date", from)
    .lte("event_date", to)
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchEventsInRange failed:", error.message);
    return [];
  }

  return (data ?? []) as EventRow[];
}

export async function createEvent(
  dealershipId: string,
  userId: string,
  input: CreateEventInput,
): Promise<EventRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      dealership_id: dealershipId,
      created_by: userId,
      event_date: input.event_date,
      title: input.title,
      description: input.description ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createEvent failed:", error.message);
    return null;
  }

  return data as EventRow;
}

export async function deleteEvent(
  id: string,
  dealershipId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("dealership_id", dealershipId);

  if (error) {
    console.error("deleteEvent failed:", error.message);
    return false;
  }

  return true;
}
