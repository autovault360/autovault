import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Receiver } from "@upstash/qstash";
import { sendTransactionalEmail } from "@/services/brevo.service";
import { taxReminderEmail } from "@/lib/email/tax-reminder-email";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function getUpcomingRemindersForDealership(dealershipId: string) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const { data: settings } = await supabase
    .from("dealership_tax_settings")
    .select("reminder_days")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  const reminderDays = settings?.reminder_days ?? 14;

  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("dealership_id", dealershipId)
    .in("status", ["open", "due"])
    .order("due_date", { ascending: true });

  if (!periods) return [];

  const reminders: Array<{
    periodId: string;
    periodName: string;
    dueDate: string;
    daysUntilDue: number;
    vehicleCount: number;
    status: string;
  }> = [];

  for (const period of periods) {
    const dueDate = new Date(period.due_date);
    const diffMs = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= reminderDays) {
      const { count } = await supabase
        .from("filing_period_deals")
        .select("id", { count: "exact", head: true })
        .eq("filing_period_id", period.id);

      reminders.push({
        periodId: period.id,
        periodName: period.name,
        dueDate: period.due_date,
        daysUntilDue,
        vehicleCount: count ?? 0,
        status: period.status,
      });
    }
  }

  return reminders;
}

export async function POST(request: NextRequest) {
  try {
    const qstashSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;

    if (qstashSigningKey) {
      const receiver = new Receiver({
        currentSigningKey: qstashSigningKey,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? qstashSigningKey,
      });

      const signature = request.headers.get("upstash-signature") ?? "";
      const rawBody = await request.clone().text();

      const isValid = await receiver
        .verify({ signature, body: rawBody })
        .catch(() => false);

      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const { data: dealerships } = await supabase
      .from("dealerships")
      .select("id, name")
      .eq("status", "active");

    if (!dealerships || dealerships.length === 0) {
      return NextResponse.json({ ok: true, message: "No active dealerships" });
    }

    const results: Array<{ dealershipId: string; name: string; sent: number; errors: string[] }> = [];

    for (const dealership of dealerships) {
      const reminders = await getUpcomingRemindersForDealership(dealership.id);

      if (reminders.length === 0) {
        results.push({ dealershipId: dealership.id, name: dealership.name, sent: 0, errors: [] });
        continue;
      }

      const { data: owner } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("dealership_id", dealership.id)
        .in("role", ["owner", "manager"])
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!owner?.email) {
        results.push({ dealershipId: dealership.id, name: dealership.name, sent: 0, errors: ["No owner/manager email found"] });
        continue;
      }

      const htmlContent = taxReminderEmail({
        ownerName: owner.full_name ?? "Dealer",
        ownerEmail: owner.email,
        dealershipName: dealership.name,
        reminders,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/state-tax`,
      });

      const result = await sendTransactionalEmail({
        to: [{ email: owner.email, name: owner.full_name ?? undefined }],
        subject: `Sales Tax Filing Reminder — ${dealership.name}`,
        htmlContent,
      });

      if (result.success) {
        results.push({ dealershipId: dealership.id, name: dealership.name, sent: reminders.length, errors: [] });
      } else {
        results.push({ dealershipId: dealership.id, name: dealership.name, sent: 0, errors: [result.error] });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[check-reminders]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
