/**
 * AutoVault360 — Setup Script
 * Applies SQL migration via Supabase Management API + creates super admin.
 * Uses only the service role key (no db password needed).
 *
 * Usage: npx tsx scripts/setup.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFileSync } from "node:fs";

const rl = readline.createInterface({ input, output });

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║        AutoVault360 — Setup Script           ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env");
    process.exit(1);
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  console.log(`🔧 Project: ${supabaseUrl}`);
  console.log(`🔧 Project ref: ${projectRef}\n`);

  // Step 1: Try Management API to apply SQL
  console.log("Step 1: Applying database schema...");

  const migrationSql = readFileSync("supabase/migrations/00001_initial_schema.sql", "utf-8");

  // Try the Management API with the service role key
  const mgmtResponse = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: migrationSql }),
    }
  );

  if (mgmtResponse.ok) {
    console.log("✅ Schema applied via Management API!\n");
  } else {
    const mgmtError = await mgmtResponse.text();
    console.log(`⚠️  Management API: ${mgmtResponse.status} - ${mgmtError}`);

    // Fallback: try sending SQL as a query to the project's REST API
    console.log("Trying alternative approach...");

    // Try creating the tables using sequential REST calls
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try creating via raw SQL through the pg connection via the CLI
    const dbPassword = await rl.question(
      "Management API needs a Personal Access Token or DB password.\n" +
      "Enter Supabase database password (Project Settings > Database): "
    );

    const dbUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;

    const { execSync } = await import("node:child_process");
    const sqlPath = "supabase/migrations/00001_initial_schema.sql";

    try {
      execSync(
        `npx supabase db execute --db-url "${dbUrl}" --file "${sqlPath}"`,
        { stdio: "inherit", timeout: 30000 }
      );
      console.log("✅ Schema applied via direct DB connection!\n");
    } catch {
      console.error("❌ Failed to apply migration.");
      console.log("\n👉 Paste supabase/migrations/00001_initial_schema.sql into your Supabase SQL Editor, then re-run this script.\n");
      rl.close();
      return;
    }
  }

  // Step 2: Create Super Admin (uses service role key, no password needed)
  console.log("Step 2: Creating super admin...");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = await rl.question("Super Admin email: ");
  const password = await rl.question("Super Admin password (min 6 chars): ");
  const fullName = await rl.question("Super Admin full name: ");

  console.log("\n⏳ Creating super admin...");

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "super_admin" },
    });

  if (authError) {
    // Maybe the user already exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing.users.find((u) => u.email === email);
    if (found) {
      console.log(`ℹ️  Auth user already exists: ${found.id}`);
      console.log("Skipping auth creation, checking user record...");

      const { data: existingRecord } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", found.id)
        .single();

      if (existingRecord) {
        console.log("✅ User record already exists.");
        console.log("\n🎉 System already set up! Login at /login\n");
        rl.close();
        return;
      }

      // Create the user record
      const { error: insertError } = await supabase.from("users").insert({
        auth_user_id: found.id,
        email,
        full_name: fullName,
        role: "super_admin",
        dealership_id: null,
      });

      if (insertError) {
        console.error("❌ Failed to create user record:", insertError.message);
        process.exit(1);
      }

      console.log("✅ User record created");
      console.log(`\n🎉 Super admin ready!`);
      console.log(`   Email: ${email}`);
      console.log(`   Login at /login\n`);
      rl.close();
      return;
    }

    console.error("❌ Auth user creation failed:", authError.message);
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
    console.error("❌ User record failed:", dbError.message);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    process.exit(1);
  }

  console.log("✅ User record created");
  console.log(`\n🎉 Setup complete!`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: super_admin`);
  console.log(`   Login at /login\n`);

  rl.close();
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
