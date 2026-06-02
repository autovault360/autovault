/**
 * Backfill script: Scans existing storage paths in metadata tables
 * and inserts records into the unified `files` table.
 *
 * Run: npx tsx scripts/backfill-files.ts
 *
 * Handles:
 * - vehicle_images -> files (vehicle-images bucket)
 * - customer_documents -> files (vehicle-documents bucket)
 * - customer.image_url -> files (customer-images bucket)
 * - user (users.image_url) -> files (user-images bucket)
 * - dealership_expenses.receipt_storage_path -> files (expense-receipts bucket)
 * - vehicle_expenses.receipt_storage_path -> files (expense-receipts bucket)
 * - deal_jacket_documents -> files (deal-jacket-documents bucket)
 * - deals.buyer_id_front_path, buyer_id_back_path, etc. -> files (vehicle-documents bucket)
 * - vehicle_losses.document_paths -> files (vehicle-documents bucket)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = __dirname ?? resolve(fileURLToPath(import.meta.url), "..");
const envContent = readFileSync(resolve(scriptDir, "..", ".env"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function backfillVehicleImages() {
  console.log("Backfilling vehicle_images...");
  const { data: rows, error } = await supabase
    .from("vehicle_images")
    .select("id, vehicle_id, dealership_id, storage_path, created_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching vehicle_images:", error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    const { error: insertError } = await supabase.from("files").upsert({
      dealership_id: row.dealership_id,
      bucket: "vehicle-images",
      storage_path: row.storage_path,
      original_name: `vehicle_image_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: "image/jpeg",
      file_type: "jpg",
      source_entity: "vehicle",
      source_entity_id: row.vehicle_id,
      uploaded_by: await resolveUserId(row.dealership_id, await getCreator("vehicles", row.vehicle_id)),
      uploaded_at: row.created_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting vehicle_image ${row.id}:`, insertError.message);
    } else {
      count++;
    }
  }
  console.log(`  Inserted ${count} vehicle_images`);
  return count;
}

async function backfillCustomerDocuments() {
  console.log("Backfilling customer_documents...");
  const { data: rows, error } = await supabase
    .from("customer_documents")
    .select("id, customer_id, dealership_id, storage_path, created_by, created_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching customer_documents:", error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    const { error: insertError } = await supabase.from("files").upsert({
      dealership_id: row.dealership_id,
      bucket: "vehicle-documents",
      storage_path: row.storage_path,
      original_name: `customer_doc_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: "application/octet-stream",
      file_type: "other",
      source_entity: "customer",
      source_entity_id: row.customer_id,
      uploaded_by: await resolveUserId(row.dealership_id, row.created_by),
      uploaded_at: row.created_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting customer_doc ${row.id}:`, insertError.message);
    } else {
      count++;
    }
  }
  console.log(`  Inserted ${count} customer_documents`);
  return count;
}

async function backfillCustomerImages() {
  console.log("Backfilling customer images (image_url)...");
  const { data: rows, error } = await supabase
    .from("customers")
    .select("id, dealership_id, image_url, created_by, created_at")
    .is("deleted_at", null)
    .not("image_url", "is", null);

  if (error) {
    console.error("  Error fetching customers:", error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    if (!row.image_url) continue;
    const { error: insertError } = await supabase.from("files").upsert({
      dealership_id: row.dealership_id,
      bucket: "customer-images",
      storage_path: row.image_url,
      original_name: `customer_image_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: "image/jpeg",
      file_type: "jpg",
      source_entity: "customer",
      source_entity_id: row.id,
      uploaded_by: await resolveUserId(row.dealership_id, row.created_by),
      uploaded_at: row.created_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting customer image ${row.id}:`, insertError.message);
    } else {
      count++;
    }
  }
  console.log(`  Inserted ${count} customer images`);
  return count;
}

async function backfillUserImages() {
  console.log("Backfilling user images (image_url)...");
  const { data: rows, error } = await supabase
    .from("users")
    .select("id, dealership_id, image_url, created_at")
    .not("image_url", "is", null);

  if (error) {
    console.error("  Error fetching users:", error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    if (!row.image_url) continue;
    const { error: insertError } = await supabase.from("files").upsert({
      dealership_id: row.dealership_id,
      bucket: "user-images",
      storage_path: row.image_url,
      original_name: `user_image_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: "image/jpeg",
      file_type: "jpg",
      source_entity: "user",
      source_entity_id: row.id,
      uploaded_by: row.id,
      uploaded_at: row.created_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting user image ${row.id}:`, insertError.message);
    } else {
      count++;
    }
  }
  console.log(`  Inserted ${count} user images`);
  return count;
}

async function backfillExpenseReceipts(table: "dealership_expenses" | "vehicle_expenses") {
  const label = table === "dealership_expenses" ? "dealership" : "vehicle";
  const entity = table === "dealership_expenses" ? "dealership_expense" : "expense";
  console.log(`Backfilling ${table} receipts...`);

  const { data: rows, error } = await supabase
    .from(table)
    .select("id, dealership_id, receipt_storage_path, created_by, created_at")
    .is("deleted_at", null)
    .not("receipt_storage_path", "is", null);

  if (error) {
    console.error(`  Error fetching ${table}:`, error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    if (!row.receipt_storage_path) continue;
    const { error: insertError } = await supabase.from("files").upsert({
      dealership_id: row.dealership_id,
      bucket: "expense-receipts",
      storage_path: row.receipt_storage_path,
      original_name: `receipt_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: "application/octet-stream",
      file_type: "other",
      source_entity: entity,
      source_entity_id: row.id,
      uploaded_by: await resolveUserId(row.dealership_id, row.created_by),
      uploaded_at: row.created_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting receipt ${row.id}:`, insertError.message);
    } else {
      count++;
    }
  }
  console.log(`  Inserted ${count} ${label} receipts`);
  return count;
}

async function backfillDealJacketDocuments() {
  console.log("Backfilling deal_jacket_documents...");
  const { data: rows, error } = await supabase
    .from("deal_jacket_documents")
    .select("id, deal_jacket_id, dealership_id, file_url, file_type, uploaded_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching deal_jacket_documents:", error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    if (!row.file_url) continue;
    const { error: insertError } = await supabase.from("files").upsert({
      dealership_id: row.dealership_id,
      bucket: "deal-jacket-documents",
      storage_path: row.file_url,
      original_name: `deal_jacket_doc_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: row.file_type === "image" ? "image/jpeg" : "application/octet-stream",
      file_type: row.file_type === "image" ? "jpg" : "other",
      source_entity: "deal_jacket",
      source_entity_id: row.deal_jacket_id,
      uploaded_by: await resolveUserId(row.dealership_id),
      uploaded_at: row.uploaded_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting deal_jacket_doc ${row.id}:`, insertError.message);
    } else {
      count++;
    }
  }
  console.log(`  Inserted ${count} deal_jacket_documents`);
  return count;
}

async function backfillDealDocuments() {
  console.log("Backfilling deal documents (buyer_id, etc.)...");
  const { data: rows, error } = await supabase
    .from("deals")
    .select("id, vehicle_id, dealership_id, buyer_id_front_path, buyer_id_back_path, drivers_license_path, other_doc_path, created_by, created_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching deals:", error.message);
    return 0;
  }

  let count = 0;
  for (const row of rows ?? []) {
    const paths = [
      { path: row.buyer_id_front_path, name: "Buyer ID Front" },
      { path: row.buyer_id_back_path, name: "Buyer ID Back" },
      { path: row.drivers_license_path, name: "Drivers License" },
      { path: row.other_doc_path, name: "Other Document" },
    ];

    for (const { path } of paths) {
      if (!path) continue;
      const { error: insertError } = await supabase.from("files").upsert({
        dealership_id: row.dealership_id,
        bucket: "vehicle-documents",
        storage_path: path,
        original_name: `deal_doc_${row.id.slice(0, 8)}`,
        file_size: 0,
        mime_type: "application/octet-stream",
        file_type: "other",
        source_entity: "deal",
        source_entity_id: row.vehicle_id,
      uploaded_by: await resolveUserId(row.dealership_id, row.created_by),
      uploaded_at: row.created_at,
    }, { onConflict: "storage_path", ignoreDuplicates: true });

    if (insertError) {
      console.error(`  Error inserting deal doc:`, insertError.message);
      } else {
        count++;
      }
    }
  }
  console.log(`  Inserted ${count} deal documents`);
  return count;
}

const userCache = new Map<string, string>();

async function resolveUserId(dealershipId: string, preferredId?: string | null): Promise<string> {
  if (preferredId) return preferredId;
  const cached = userCache.get(dealershipId);
  if (cached) return cached;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .limit(1)
    .maybeSingle();
  const id = data?.id ?? (await resolveSuperAdminId());
  if (id) userCache.set(dealershipId, id);
  return id ?? "";
}

let superAdminId = "";
async function resolveSuperAdminId(): Promise<string> {
  if (superAdminId) return superAdminId;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("role", "super_admin")
    .limit(1)
    .maybeSingle();
  superAdminId = data?.id ?? "";
  return superAdminId;
}

async function getCreator(table: string, id: string): Promise<string | null> {
  const { data } = await supabase
    .from(table)
    .select("created_by")
    .eq("id", id)
    .maybeSingle();
  return data?.created_by ?? null;
}

async function main() {
  console.log("=== Backfilling files table ===\n");

  let total = 0;
  total += await backfillVehicleImages();
  total += await backfillCustomerDocuments();
  total += await backfillCustomerImages();
  total += await backfillUserImages();
  total += await backfillExpenseReceipts("dealership_expenses");
  total += await backfillExpenseReceipts("vehicle_expenses");
  total += await backfillDealJacketDocuments();
  total += await backfillDealDocuments();

  console.log(`\n=== Done! Total records inserted: ${total} ===`);
}

main().catch(console.error);
