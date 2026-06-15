"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  footerWaitlistSchema,
  heroWaitlistSchema,
  type FooterWaitlistValues,
  type HeroWaitlistValues,
  type WaitlistActionResult,
} from "../actions/schemas";

function duplicateEmailResult(): WaitlistActionResult {
  return {
    success: false,
    error: "This email is already on the waitlist.",
    fieldErrors: {
      email: ["This email is already on the waitlist."],
    },
  };
}

function isDuplicateEmailError(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    /duplicate|unique|already exists/i.test(error.message ?? "")
  );
}

async function emailAlreadyOnWaitlist(email: string): Promise<boolean> {
  const supabase = createServiceClient();
  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("waitlist_signups")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) {
    // If the lookup fails, fall back to insert-time unique constraint handling.
    return false;
  }

  return Boolean(data);
}

function formatZodErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return {
    success: false as const,
    error: "Please fix the errors below.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

async function insertWaitlist(payload: {
  email: string;
  full_name?: string | null;
  phone?: string | null;
  dealership_name?: string | null;
  source: string;
}) {
  const normalizedEmail = payload.email.trim().toLowerCase();

  if (await emailAlreadyOnWaitlist(normalizedEmail)) {
    return duplicateEmailResult();
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("waitlist_signups").insert({
    email: normalizedEmail,
    full_name: payload.full_name ?? null,
    phone: payload.phone ?? null,
    dealership_name: payload.dealership_name ?? null,
    source: payload.source,
  });

  if (error) {
    if (isDuplicateEmailError(error)) {
      return duplicateEmailResult();
    }
    return { success: false as const, error: "Something went wrong. Please try again." };
  }

  return {
    success: true as const,
    message: "You're on the waitlist! We'll be in touch soon.",
  };
}

export async function joinWaitlist(
  values: HeroWaitlistValues,
): Promise<WaitlistActionResult> {
  try {
    const parsed = heroWaitlistSchema.safeParse(values);
    if (!parsed.success) return formatZodErrors(parsed.error);
    if (parsed.data.website) {
      return { success: true, message: "You're on the waitlist! We'll be in touch soon." };
    }

    return insertWaitlist({
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      dealership_name: parsed.data.dealershipName,
      source: parsed.data.source,
    });
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function joinWaitlistFooter(
  values: FooterWaitlistValues,
): Promise<WaitlistActionResult> {
  try {
    const parsed = footerWaitlistSchema.safeParse(values);
    if (!parsed.success) return formatZodErrors(parsed.error);
    if (parsed.data.website) {
      return { success: true, message: "You're on the waitlist! We'll be in touch soon." };
    }

    return insertWaitlist({
      email: parsed.data.email,
      source: parsed.data.source,
    });
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
