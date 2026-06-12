"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import {
  toggleStickyNotePin as togglePinService,
  getStickyNoteById,
} from "@/services/sticky-notes.service";

const schema = z.object({
  id: z.string().uuid(),
  pinned: z.boolean(),
});

export type TogglePinResult =
  | { success: true }
  | { success: false; error: string };

export async function togglePin(
  formData: FormData,
): Promise<TogglePinResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const note = await getStickyNoteById(data.id, dealershipId);
    if (!note) {
      return { success: false, error: "Sticky note not found" };
    }

    const ok = await togglePinService(data.id, dealershipId, data.pinned);
    if (!ok) {
      return { success: false, error: "Failed to update pin status" };
    }

    revalidatePath(note.dashboard_path);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
