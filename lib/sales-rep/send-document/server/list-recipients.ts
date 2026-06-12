import { createClient } from "@/lib/supabase/server";
import { requireSendDocumentAccess } from "./auth";
import type { SendDocumentRecipient } from "./types";

export async function listSendDocumentRecipients(): Promise<
  SendDocumentRecipient[] | { error: string }
> {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createClient();

  const { data: reps, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("role", "sales_rep")
    .eq("is_active", true)
    .neq("id", auth.user.userId)
    .order("full_name", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return (reps ?? []).map((rep) => ({
    id: rep.id,
    name: rep.full_name ?? "Unknown",
    email: rep.email ?? "",
  }));
}
