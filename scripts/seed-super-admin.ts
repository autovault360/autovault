/**
 * AutoVault360 — Super Admin Seeder
 * Creates the first super admin using the service role key.
 *
 * Usage: npx tsx scripts/seed-super-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env manually
const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const envContent = readFileSync(resolve(scriptDir, "..", ".env"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const [email, password, fullName] = process.argv.slice(2);

if (!email || !password || !fullName) {
  console.error("Usage: npx tsx scripts/seed-super-admin.ts <email> <password> <fullName>");
  process.exit(1);
}

async function main() {
  console.log("╔══════════════════════════════════════════�—");
  console.log("║   AutoVault360 — Super Admin Seeder     ║");
  console.log("╚══════════════════════════════════════════�—\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("�—� Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${fullName}`);
  console.log("\n⏳ Creating super admin...\n");

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "super_admin" },
  });

  if (authError) {
    console.error("�—� Failed to create auth user:", authError.message);
    process.exit(1);
  }

  console.log(`✅ Auth user created: ${authUser.user.id}`);

  const { error: dbError } = await supabase.from("users").insert({
    auth_user_id: authUser.user.id,
    email,
    full_name: fullName,
    role: "super_admin",
    dealership_id: null,
  });

  if (dbError) {
    console.error("�—� Failed to create user record:", dbError.message);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    console.log("🧹 Cleaned up auth user.");
    process.exit(1);
  }

  console.log("✅ User record created in database");
  console.log(`\n🎉 Super admin created successfully!`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: super_admin`);
  console.log(`   Login at: /login\n`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
