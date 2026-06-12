"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { updateStickyNote as updateStickyNoteService } from "@/services/sticky-notes.service";

const schema = z.object({
  id: z.string().uuid(),
  color: z.string().optional(),
  text: z.string().min(1).max(2000).optional(),
  is_pinned: z.boolean().optional(),
});

export type UpdateStickyNoteResult =
  | { success: true }
  | { success: false; error: string };

export async function updateStickyNote(
  formData: FormData,
): Promise<UpdateStickyNoteResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const note = await updateStickyNoteService({
      id: data.id,
      dealershipId,
      color: data.color,
      text: data.text,
      is_pinned: data.is_pinned,
    });

    if (!note) {
      return { success: false, error: "Failed to update sticky note" };
    }

    revalidatePath(note.dashboard_path);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
