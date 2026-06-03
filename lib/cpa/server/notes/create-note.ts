import { createClient } from "@/lib/supabase/server";
import type { CreateCpaNoteInput } from "../../actions/schemas";
import type { CpaNoteListItem } from "../../types";
import { logCpaNoteActivity } from "./activity";
import { mapNoteListItem } from "./mappers";

export async function createCpaNote(
  dealershipId: string,
  userId: string,
  input: CreateCpaNoteInput,
): Promise<CpaNoteListItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cpa_notes")
    .insert({
      title: input.title,
      description: input.description ?? "",
      category: input.category,
      priority: input.priority,
      status: "OPEN",
      created_by: userId,
      dealership_id: dealershipId,
      stock_number: input.stockNumber ?? null,
    })
    .select(
      `
      id, title, description, category, priority, status,
      stock_number, created_at, updated_at, created_by, is_archived,
      users:created_by ( full_name, email )
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  await logCpaNoteActivity(supabase, {
    noteId: data.id,
    userId,
    activityType: "Note Created",
    activityDescription: "Note created",
  });

  const users = Array.isArray(data.users) ? data.users[0] : data.users;
  return mapNoteListItem({ ...data, users });
}
