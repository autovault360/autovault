"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import type { CpaSession } from "../types";
import { canManageCpaNotes, isCpaReadOnly } from "./permissions";

export async function getCpaSession(): Promise<CpaSession | null> {
  const auth = await authenticateUser();
  if (!auth.ok) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role, dealership_id, image_url")
    .eq("id", auth.user.userId)
    .single();

  if (!profile) return null;

  let imageUrl: string | undefined;
  if (profile.image_url) {
    const { data: signed } = await supabase.storage
      .from("user-images")
      .createSignedUrl(profile.image_url, 3600);
    if (signed?.signedUrl) imageUrl = signed.signedUrl;
  }

  let dealershipName = "Dealership";
  if (profile.dealership_id) {
    const { data: dealership } = await supabase
      .from("dealerships")
      .select("name")
      .eq("id", profile.dealership_id)
      .single();
    if (dealership?.name) dealershipName = dealership.name;
  }

  const fullName = profile.full_name || profile.email;
  const parts = fullName.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : fullName.slice(0, 2).toUpperCase();

  return {
    userId: profile.id,
    email: profile.email,
    fullName,
    initials,
    imageUrl,
    role: profile.role,
    dealershipId: auth.user.dealershipId,
    dealershipName,
    canManageNotes: canManageCpaNotes(auth.user.role),
    isReadOnly: isCpaReadOnly(auth.user.role),
  };
}
