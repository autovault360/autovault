import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: users } = await supabase.auth.admin.listUsers();
  const admin = users?.users?.find(u => u.email === "admin@autovault.com");
  if (!admin) { console.log("admin@autovault.com auth user not found"); return; }
  console.log("Admin auth ID:", admin.id);

  const { data: profile } = await supabase.from("users").select("id, role, dealership_id").eq("auth_user_id", admin.id).maybeSingle();
  if (profile) {
    console.log("Profile already exists:", profile.id, "role:", profile.role, "dealership_id:", profile.dealership_id);
    return;
  }

  const { data: dealerships } = await supabase.from("dealerships").select("id").eq("status", "active").order("created_at", { ascending: true }).limit(1);
  if (!dealerships?.length) { console.log("No active dealerships"); return; }

  const { error } = await supabase.from("users").insert({
    auth_user_id: admin.id,
    dealership_id: dealerships[0].id,
    email: "admin@autovault.com",
    full_name: "Super Admin",
    role: "super_admin",
    is_active: true,
  });
  if (error) console.log("Error:", error.message);
  else console.log("Profile created for dealership", dealerships[0].id);
}

main();
