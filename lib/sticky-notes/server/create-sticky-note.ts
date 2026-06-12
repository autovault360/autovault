"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { createStickyNote as createStickyNoteService } from "@/services/sticky-notes.service";

const schema = z.object({
  color: z.string().default("#FFD966"),
  text: z.string().min(1).max(2000),
  is_pinned: z.boolean().default(false),
  dashboard_path: z.string().min(1),
});

export type CreateStickyNoteResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createStickyNote(
  formData: FormData,
): Promise<CreateStickyNoteResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const note = await createStickyNoteService({
      dealershipId,
      userId,
      color: data.color,
      text: data.text,
      is_pinned: data.is_pinned,
      dashboard_path: data.dashboard_path,
    });

    if (!note) {
      return { success: false, error: "Failed to create sticky note" };
    }

    revalidatePath(data.dashboard_path);
    return { success: true, id: note.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
