"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadFile, authenticateUser } from "@/lib/vehicles/server/utils";

export type DocumentUploadResult =
  | { success: true }
  | { success: false; error: string };

export async function uploadCustomerDocument(
  customerId: string,
  file: File,
  label?: string,
): Promise<DocumentUploadResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${auth.user.dealershipId}/customers/${customerId}/${Date.now()}-${safeName}`;

    await uploadFile("vehicle-documents", path, file);

    const docLabel =
      label?.trim() ||
      safeName.replace(/\.[^.]+$/, "").replace(/_/g, " ") ||
      "Document";

    const supabase = await createClient();
    const { error } = await supabase.from("customer_documents").insert({
      customer_id: customerId,
      dealership_id: auth.user.dealershipId,
      label: docLabel,
      storage_path: path,
      created_by: auth.user.userId,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
