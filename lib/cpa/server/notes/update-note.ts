import { createClient } from "@/lib/supabase/server";
import type { UpdateCpaNoteInput } from "../../actions/schemas";
import { logCpaNoteActivity } from "./activity";

export async function updateCpaNote(
  dealershipId: string,
  userId: string,
  noteId: string,
  input: UpdateCpaNoteInput,
  canManage: boolean,
): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("cpa_notes")
    .select("id, status, created_by")
    .eq("id", noteId)
    .eq("dealership_id", dealershipId)
    .single();

  if (!existing) throw new Error("Note not found");

  if (!canManage && existing.created_by !== userId) {
    throw new Error("You cannot update this note.");
  }

  if (
    !canManage &&
    (input.status === "RESOLVED" || input.isArchived === true)
  ) {
    throw new Error("Only administrators can resolve or archive notes.");
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.status !== undefined) {
    updates.status = input.status;
    if (input.status === "RESOLVED") {
      updates.resolved_at = new Date().toISOString();
    }
    if (input.status === "ARCHIVED") {
      updates.is_archived = true;
    }
  }
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo;
  if (input.isArchived !== undefined) updates.is_archived = input.isArchived;
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;

  const { error } = await supabase
    .from("cpa_notes")
    .update(updates)
    .eq("id", noteId);

  if (error) throw new Error(error.message);

  if (input.status) {
    await logCpaNoteActivity(supabase, {
      noteId,
      userId,
      activityType: "Status Changed",
      activityDescription: `Status changed to ${input.status}`,
    });
    if (input.status === "RESOLVED") {
      await logCpaNoteActivity(supabase, {
        noteId,
        userId,
        activityType: "Marked Resolved",
        activityDescription: "Note marked as resolved",
      });
    }
  }
}
