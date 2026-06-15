"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { uploadFile, trackFile } from "@/lib/vehicles/server/utils";
import { authenticateForProfile } from "./auth";

export type ProfileImageResult =
  | { success: true }
  | { success: false; error: string };

export async function uploadMyProfileImage(
  file: File,
): Promise<ProfileImageResult> {
  try {
    const auth = await authenticateForProfile();
    if (!auth.ok) return { success: false, error: auth.error };

    const path = `${auth.dealershipId}/${auth.userId}.jpg`;
    await uploadFile("user-images", path, file);

    await trackFile(file, "user-images", path, auth.dealershipId, auth.userId, {
      sourceEntity: "user",
      sourceEntityId: auth.userId,
    });

    const service = createServiceClient();
    const { error } = await service
      .from("users")
      .update({ image_url: path })
      .eq("id", auth.userId);

    if (error) throw new Error(error.message);

    switch (auth.role) {
      case "sales_rep":
        revalidatePath("/sales-rep", "layout");
        revalidatePath("/sales-rep/profile");
        break;
      case "wholesale_dealer":
        revalidatePath("/dealer", "layout");
        revalidatePath("/dealer/profile");
        break;
      case "cpa":
        revalidatePath("/cpa", "layout");
        revalidatePath("/cpa/profile");
        break;
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload photo";
    return { success: false, error: message };
  }
}
