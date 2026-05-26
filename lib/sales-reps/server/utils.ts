"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { authenticateUser, type AuthResult, type AuthUser } from "@/lib/vehicles/server/utils";
import { canManageSalesReps } from "./permissions";

export { authenticateUser, type AuthResult, type AuthUser };

export async function assertCanManageSalesReps(): Promise<
  | { ok: true; user: AuthUser }
  | { ok: false; error: string }
> {
  const auth = await authenticateUser();
  if (!auth.ok) return auth;
  if (!canManageSalesReps(auth.user.role)) {
    return { ok: false, error: "You do not have permission to manage sales reps" };
  }
  return auth;
}

export async function checkEmailUniqueness(
  email: string,
  excludeUserId?: string,
): Promise<{ isDuplicate: boolean }> {
  const auth = await assertCanManageSalesReps();
  if (!auth.ok) return { isDuplicate: false };

  const supabase = await createClient();
  let query = supabase
    .from("users")
    .select("id")
    .eq("dealership_id", auth.user.dealershipId)
    .ilike("email", email.trim());

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data } = await query.maybeSingle();
  return { isDuplicate: !!data };
}

export async function assertEmailAvailable(
  email: string,
  dealershipId: string,
  excludeUserId?: string,
): Promise<string | null> {
  const supabase = await createClient();
  let query = supabase
    .from("users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .ilike("email", email.trim());

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data } = await query.maybeSingle();
  if (data) return "A sales rep with this email already exists in your dealership";
  return null;
}

export async function findAuthUserByEmail(email: string) {
  const service = createServiceClient();
  const normalized = email.trim().toLowerCase();

  const { data, error } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) return null;

  return (
    data.users.find((u) => u.email?.toLowerCase() === normalized) ?? null
  );
}
