import { createClient } from "@/lib/supabase/server";
import type { StickyNoteRow, StickyNoteWithUser } from "@/lib/sticky-notes/types";

export async function getStickyNotes(
  dealershipId: string,
  dashboardPath?: string,
): Promise<StickyNoteWithUser[]> {
  const supabase = await createClient();

  let query = supabase
    .from("sticky_notes")
    .select("*, user:users!inner(id, full_name)")
    .eq("dealership_id", dealershipId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (dashboardPath) {
    query = query.eq("dashboard_path", dashboardPath);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getStickyNotes failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const rawUser = Array.isArray(row.user) ? row.user[0] : row.user;
    return {
      ...row,
      user: {
        id: rawUser?.id ?? row.user_id,
        fullName: rawUser?.full_name?.trim() || "Unknown",
      },
    };
  }) as unknown as StickyNoteWithUser[];
}

export async function getStickyNoteById(
  id: string,
  dealershipId: string,
): Promise<StickyNoteRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sticky_notes")
    .select("*")
    .eq("id", id)
    .eq("dealership_id", dealershipId)
    .single();

  if (error || !data) return null;
  return data as StickyNoteRow;
}

export type CreateStickyNoteServiceParams = {
  dealershipId: string;
  userId: string;
  color: string;
  text: string;
  is_pinned: boolean;
  dashboard_path: string;
};

export async function createStickyNote(
  params: CreateStickyNoteServiceParams,
): Promise<StickyNoteRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sticky_notes")
    .insert({
      dealership_id: params.dealershipId,
      user_id: params.userId,
      color: params.color,
      text: params.text,
      is_pinned: params.is_pinned,
      dashboard_path: params.dashboard_path,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createStickyNote failed:", error.message);
    return null;
  }

  return data as StickyNoteRow;
}

export type UpdateStickyNoteServiceParams = {
  id: string;
  dealershipId: string;
} & Partial<{
  color: string;
  text: string;
  is_pinned: boolean;
}>;

export async function updateStickyNote(
  params: UpdateStickyNoteServiceParams,
): Promise<StickyNoteRow | null> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (params.color !== undefined) updates.color = params.color;
  if (params.text !== undefined) updates.text = params.text;
  if (params.is_pinned !== undefined) updates.is_pinned = params.is_pinned;

  if (Object.keys(updates).length === 0) return null;

  const { data, error } = await supabase
    .from("sticky_notes")
    .update(updates)
    .eq("id", params.id)
    .eq("dealership_id", params.dealershipId)
    .select("*")
    .single();

  if (error) {
    console.error("updateStickyNote failed:", error.message);
    return null;
  }

  return data as StickyNoteRow;
}

export async function deleteStickyNote(
  id: string,
  dealershipId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sticky_notes")
    .delete()
    .eq("id", id)
    .eq("dealership_id", dealershipId);

  if (error) {
    console.error("deleteStickyNote failed:", error.message);
    return false;
  }

  return true;
}

export async function toggleStickyNotePin(
  id: string,
  dealershipId: string,
  pinned: boolean,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sticky_notes")
    .update({ is_pinned: pinned })
    .eq("id", id)
    .eq("dealership_id", dealershipId);

  if (error) {
    console.error("toggleStickyNotePin failed:", error.message);
    return false;
  }

  return true;
}
