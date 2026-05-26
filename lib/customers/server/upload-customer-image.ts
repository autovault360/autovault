"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadFile, authenticateUser } from "@/lib/vehicles/server/utils";
import { revalidatePath } from "next/cache";

export type ImageActionResult =
  | { success: true }
  | { success: false; error: string };

export async function uploadCustomerImage(
  customerId: string,
  file: File,
): Promise<ImageActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const path = `${auth.user.dealershipId}/${customerId}.jpg`;
    await uploadFile("customer-images", path, file);

    const supabase = await createClient();
    const { error } = await supabase
      .from("customers")
      .update({ image_url: path })
      .eq("id", customerId)
      .eq("dealership_id", auth.user.dealershipId);

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
