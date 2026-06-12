"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getStickyNotes as getStickyNotesService } from "@/services/sticky-notes.service";
import type { StickyNoteWithUser } from "@/lib/sticky-notes/types";

export async function getStickyNotes(
  dashboardPath?: string,
): Promise<StickyNoteWithUser[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  return getStickyNotesService(auth.user.dealershipId, dashboardPath);
}
