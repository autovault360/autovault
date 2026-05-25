"use server";

import { createClient } from "@/lib/supabase/server";

export type AuthUser = {
  userId: string;
  dealershipId: string;
  role: "super_admin" | "owner" | "manager" | "sales_rep" | "cpa";
};

export type ActionResult =
  | { success: true; vehicleId?: string }
  | { success: false; error: string };

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

type UserProfile = {
  id: string;
  dealership_id: string | null;
  role: AuthUser["role"];
};

async function resolveDealershipId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: UserProfile,
): Promise<string | null> {
  if (profile.dealership_id) {
    return profile.dealership_id;
  }

  if (profile.role !== "super_admin") {
    return null;
  }

  const { data: dealership } = await supabase
    .from("dealerships")
    .select("id")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return dealership?.id ?? null;
}

export async function authenticateUser(): Promise<AuthResult> {
  const supabase = await createClient();

  let authUserId: string;

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    authUserId = user.id;
  } else {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { ok: false, error: "Authentication required" };
    }
    authUserId = session.user.id;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, dealership_id, role")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: `Database error: ${profileError.message}` };
  }

  if (!profile) {
    return {
      ok: false,
      error: `User profile not found for auth ID ${authUserId}. Ensure a row exists in the users table with this auth_user_id.`,
    };
  }

  const dealershipId = await resolveDealershipId(supabase, profile);

  if (!dealershipId) {
    if (profile.role === "super_admin") {
      return {
        ok: false,
        error:
          "No dealership exists yet. Create a dealership before managing vehicles.",
      };
    }

    return {
      ok: false,
      error: "Your account is not linked to a dealership.",
    };
  }

  return {
    ok: true,
    user: {
      userId: profile.id,
      dealershipId,
      role: profile.role,
    },
  };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const result = await authenticateUser();
  return result.ok ? result.user : null;
}

export async function assertVehicleActive(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string,
  dealershipId: string,
): Promise<string | null> {
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId)
    .single();

  if (error || !vehicle) return "Vehicle not found";
  if (vehicle.status === "sold" || vehicle.status === "loss") {
    return "Vehicle is already marked as sold/loss and cannot be modified";
  }
  return null;
}

export async function uploadFile(
  bucket: "vehicle-images" | "vehicle-documents",
  storagePath: string,
  file: File,
): Promise<string> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return storagePath;
}

export async function getSignedUrl(
  bucket: "vehicle-images" | "vehicle-documents",
  storagePath: string,
  expiresInSeconds: number = 3600,
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Signed URL failed: ${error.message}`);
  }

  return data.signedUrl;
}

export async function rollbackVehicle(
  vehicleId: string,
  storagePaths: string[],
  bucket: "vehicle-images" | "vehicle-documents",
): Promise<void> {
  const supabase = await createClient();

  if (storagePaths.length > 0) {
    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove(storagePaths);

    if (removeError) {
      console.error("Rollback: failed to remove files", removeError.message);
    }
  }

  const { error: deleteError } = await supabase
    .from("vehicles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", vehicleId);

  if (deleteError) {
    console.error("Rollback: failed to soft-delete vehicle", deleteError.message);
  }
}
