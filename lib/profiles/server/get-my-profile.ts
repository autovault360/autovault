"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateForProfile } from "./auth";

export type MyProfileData =
  | {
      role: "sales_rep";
      userId: string;
      email: string;
      fullName: string;
      phone: string;
      imageUrl: string | null;
      address: string;
      address2: string;
      city: string;
      state: string;
      zip: string;
      hireDate: string;
      commissionRate: number;
      monthlyGoal: number;
    }
  | {
      role: "wholesale_dealer";
      userId: string;
      email: string;
      fullName: string;
      imageUrl: string | null;
      companyName: string;
      businessPhone: string;
      contactPerson: string;
      taxId: string;
      licenseNumber: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    }
  | {
      role: "cpa";
      userId: string;
      email: string;
      fullName: string;
      phone: string;
      imageUrl: string | null;
      firstName: string;
      lastName: string;
      status: string;
    };

export type GetMyProfileResult =
  | { ok: true; profile: MyProfileData }
  | { ok: false; error: string };

async function resolveImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imagePath: string | null,
): Promise<string | null> {
  if (!imagePath) return null;
  const { data: signed } = await supabase.storage
    .from("user-images")
    .createSignedUrl(imagePath, 3600);
  return signed?.signedUrl ?? null;
}

export async function getMyProfile(): Promise<GetMyProfileResult> {
  const auth = await authenticateForProfile();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, full_name, phone, image_url, role")
    .eq("id", auth.userId)
    .single();

  if (userError || !user) {
    return { ok: false, error: userError?.message ?? "Profile not found" };
  }

  const imageUrl = await resolveImageUrl(supabase, user.image_url);

  if (auth.role === "sales_rep") {
    const { data: profile } = await supabase
      .from("sales_rep_profiles")
      .select(
        "address, address2, city, state, zip, hire_date, commission_rate, monthly_goal",
      )
      .eq("user_id", auth.userId)
      .maybeSingle();

    return {
      ok: true,
      profile: {
        role: "sales_rep",
        userId: user.id,
        email: user.email,
        fullName: user.full_name ?? "",
        phone: user.phone ?? "",
        imageUrl,
        address: profile?.address ?? "",
        address2: profile?.address2 ?? "",
        city: profile?.city ?? "",
        state: profile?.state ?? "",
        zip: profile?.zip ?? "",
        hireDate: profile?.hire_date ?? "",
        commissionRate: Number(profile?.commission_rate ?? 0) * 100,
        monthlyGoal: Number(profile?.monthly_goal ?? 0),
      },
    };
  }

  if (auth.role === "wholesale_dealer") {
    const { data: profile } = await supabase
      .from("wholesale_dealer_profiles")
      .select(
        "company_name, business_phone, contact_person, tax_id, license_number, address, city, state, zip",
      )
      .eq("user_id", auth.userId)
      .maybeSingle();

    return {
      ok: true,
      profile: {
        role: "wholesale_dealer",
        userId: user.id,
        email: user.email,
        fullName: user.full_name ?? "",
        imageUrl,
        companyName: profile?.company_name ?? "",
        businessPhone: profile?.business_phone ?? user.phone ?? "",
        contactPerson: profile?.contact_person ?? user.full_name ?? "",
        taxId: profile?.tax_id ?? "",
        licenseNumber: profile?.license_number ?? "",
        address: profile?.address ?? "",
        city: profile?.city ?? "",
        state: profile?.state ?? "",
        zip: profile?.zip ?? "",
      },
    };
  }

  const { data: profile } = await supabase
    .from("cpa_profiles")
    .select("first_name, last_name, status")
    .eq("user_id", auth.userId)
    .maybeSingle();

  const fullName = user.full_name ?? "";
  const nameParts = fullName.split(" ").filter(Boolean);

  return {
    ok: true,
    profile: {
      role: "cpa",
      userId: user.id,
      email: user.email,
      fullName,
      phone: user.phone ?? "",
      imageUrl,
      firstName: profile?.first_name ?? nameParts[0] ?? "",
      lastName: profile?.last_name ?? nameParts.slice(1).join(" ") ?? "",
      status: profile?.status ?? "ACTIVE",
    },
  };
}
