"use server";

import { createClient } from "@/lib/supabase/server";
import { phoneRegex } from "@/lib/shared/phone";
import { authenticateUser, type AuthResult, type AuthUser } from "@/lib/vehicles/server/utils";

export { authenticateUser, type AuthResult, type AuthUser };

export async function checkPhoneUniqueness(
  phone: string,
  excludeCustomerId?: string,
): Promise<{ isDuplicate: boolean }> {
  if (!phoneRegex.test(phone)) {
    return { isDuplicate: false };
  }

  const auth = await authenticateUser();
  if (!auth.ok) return { isDuplicate: false };

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("phone", phone)
    .is("deleted_at", null)
    .limit(1);

  if (excludeCustomerId) {
    query = query.neq("id", excludeCustomerId);
  }

  const { data } = await query.maybeSingle();
  return { isDuplicate: !!data };
}

export async function assertPhoneAvailable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  phone: string,
  excludeCustomerId?: string,
): Promise<string | null> {
  let query = supabase
    .from("customers")
    .select("id")
    .eq("dealership_id", dealershipId)
    .eq("phone", phone)
    .is("deleted_at", null)
    .limit(1);

  if (excludeCustomerId) {
    query = query.neq("id", excludeCustomerId);
  }

  const { data } = await query.maybeSingle();
  if (data) {
    return "A customer with this phone number already exists";
  }
  return null;
}
