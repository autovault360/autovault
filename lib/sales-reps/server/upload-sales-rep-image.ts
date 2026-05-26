"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadFile, authenticateUser } from "@/lib/vehicles/server/utils";
import { revalidatePath } from "next/cache";
import { canManageSalesReps } from "./permissions";

export type ImageActionResult =
  | { success: true }
  | { success: false; error: string };

export async function uploadSalesRepImage(
  userId: string,
  file: File,
): Promise<ImageActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!canManageSalesReps(auth.user.role)) {
      return { success: false, error: "You do not have permission to manage sales reps" };
    }

    const path = `${auth.user.dealershipId}/${userId}.jpg`;
    await uploadFile("user-images", path, file);

    const supabase = await createClient();
    const { error } = await supabase
      .from("users")
      .update({ image_url: path })
      .eq("id", userId)
      .eq("dealership_id", auth.user.dealershipId);

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/sales-reps");
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
