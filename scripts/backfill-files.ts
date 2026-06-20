/**
 * Backfill script: Scans existing storage paths in metadata tables
 * and inserts records into the unified `files` table.
 *
 * Run: npx tsx scripts/backfill-files.ts
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

type FileInsertRow = {
  dealership_id: string;
  bucket: string;
  storage_path: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  source_entity: string;
  source_entity_id: string | null;
  uploaded_by: string;
  uploaded_at?: string;
};

async function fileRecordExists(bucket: string, storagePath: string): Promise<boolean> {
  const { data } = await supabase
    .from("files")
    .select("id")
    .eq("bucket", bucket)
    .eq("storage_path", storagePath)
    .is("deleted_at", null)
    .maybeSingle();

  return !!data;
}

async function insertFileIfMissing(row: FileInsertRow): Promise<"inserted" | "skipped" | "error"> {
  const exists = await fileRecordExists(row.bucket, row.storage_path);
  if (exists) return "skipped";

  const { error } = await supabase.from("files").insert(row);

  if (error) {
    console.error(`  Error inserting ${row.original_name}:`, error.message);
    return "error";
  }

  return "inserted";
}

type BackfillStats = { inserted: number; skipped: number; errors: number };

function logBackfillStats(label: string, stats: BackfillStats) {
  console.log(
    `  ${label}: ${stats.inserted} inserted, ${stats.skipped} skipped (already in files), ${stats.errors} errors`,
  );
}

async function runBackfill(
  label: string,
  rows: FileInsertRow[],
): Promise<BackfillStats> {
  const stats: BackfillStats = { inserted: 0, skipped: 0, errors: 0 };

  for (const row of rows) {
    const result = await insertFileIfMissing(row);
    if (result === "inserted") stats.inserted++;
    else if (result === "skipped") stats.skipped++;
    else stats.errors++;
  }

  logBackfillStats(label, stats);
  return stats;
}

async function backfillVehicleImages() {
  console.log("Backfilling vehicle_images...");
  const { data: rows, error } = await supabase
    .from("vehicle_images")
    .select("id, vehicle_id, dealership_id, storage_path, created_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching vehicle_images:", error.message);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    fileRows.push({
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
    });
  }

  return runBackfill("vehicle_images", fileRows);
}

async function backfillCustomerDocuments() {
  console.log("Backfilling customer_documents...");
  const { data: rows, error } = await supabase
    .from("customer_documents")
    .select("id, customer_id, dealership_id, storage_path, created_by, created_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching customer_documents:", error.message);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    fileRows.push({
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
    });
  }

  return runBackfill("customer_documents", fileRows);
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
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    if (!row.image_url) continue;
    fileRows.push({
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
    });
  }

  return runBackfill("customer images", fileRows);
}

async function backfillUserImages() {
  console.log("Backfilling user images (image_url)...");
  const { data: rows, error } = await supabase
    .from("users")
    .select("id, dealership_id, image_url, created_at")
    .not("image_url", "is", null);

  if (error) {
    console.error("  Error fetching users:", error.message);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    if (!row.image_url || !row.dealership_id) continue;
    fileRows.push({
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
    });
  }

  return runBackfill("user images", fileRows);
}

async function backfillExpenseReceipts(table: "dealership_expenses" | "vehicle_expenses") {
  const label = table === "dealership_expenses" ? "dealership receipts" : "vehicle receipts";
  const entity = table === "dealership_expenses" ? "dealership_expense" : "expense";
  console.log(`Backfilling ${table} receipts...`);

  const { data: rows, error } = await supabase
    .from(table)
    .select("id, dealership_id, receipt_storage_path, created_by, created_at")
    .is("deleted_at", null)
    .not("receipt_storage_path", "is", null);

  if (error) {
    console.error(`  Error fetching ${table}:`, error.message);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    if (!row.receipt_storage_path) continue;
    fileRows.push({
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
    });
  }

  return runBackfill(label, fileRows);
}

function inferDealJacketDocBucket(storagePath: string): string {
  if (storagePath.includes("/deal_jackets/") || storagePath.startsWith("deal-jackets/")) {
    return "deal-jacket-documents";
  }
  return "vehicle-documents";
}

async function backfillDealJacketDocuments() {
  console.log("Backfilling deal_jacket_documents...");
  const { data: rows, error } = await supabase
    .from("deal_jacket_documents")
    .select("id, deal_jacket_id, file_url, file_type, document_name, uploaded_at");

  if (error) {
    console.error("  Error fetching deal_jacket_documents:", error.message);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    if (!row.file_url) continue;

    const { data: jacket } = await supabase
      .from("deal_jackets")
      .select("dealership_id, created_by")
      .eq("id", row.deal_jacket_id)
      .maybeSingle();

    if (!jacket?.dealership_id) {
      console.error(`  Skipping deal_jacket_doc ${row.id}: jacket not found`);
      continue;
    }

    const bucket = inferDealJacketDocBucket(row.file_url);
    const mimeType =
      row.file_type?.startsWith("image/") || row.file_type === "image"
        ? "image/jpeg"
        : row.file_type === "application/pdf"
          ? "application/pdf"
          : "application/octet-stream";
    const fileType =
      row.file_type === "image" || row.file_type?.startsWith("image/")
        ? "jpg"
        : row.file_type === "application/pdf"
          ? "pdf"
          : "other";

    fileRows.push({
      dealership_id: jacket.dealership_id,
      bucket,
      storage_path: row.file_url,
      original_name: row.document_name ?? `deal_jacket_doc_${row.id.slice(0, 8)}`,
      file_size: 0,
      mime_type: mimeType,
      file_type: fileType,
      source_entity: "deal_jacket",
      source_entity_id: row.deal_jacket_id,
      uploaded_by: await resolveUserId(jacket.dealership_id, jacket.created_by),
      uploaded_at: row.uploaded_at,
    });
  }

  return runBackfill("deal_jacket_documents", fileRows);
}

async function backfillDealDocuments() {
  console.log("Backfilling deal documents (buyer_id, etc.)...");
  const { data: rows, error } = await supabase
    .from("deals")
    .select("id, vehicle_id, dealership_id, buyer_id_front_path, buyer_id_back_path, drivers_license_path, other_doc_path, created_by, created_at")
    .is("deleted_at", null);

  if (error) {
    console.error("  Error fetching deals:", error.message);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const fileRows: FileInsertRow[] = [];
  for (const row of rows ?? []) {
    const paths = [
      { path: row.buyer_id_front_path, name: "Buyer ID Front" },
      { path: row.buyer_id_back_path, name: "Buyer ID Back" },
      { path: row.drivers_license_path, name: "Drivers License" },
      { path: row.other_doc_path, name: "Other Document" },
    ];

    for (const { path, name } of paths) {
      if (!path) continue;
      fileRows.push({
        dealership_id: row.dealership_id,
        bucket: "vehicle-documents",
        storage_path: path,
        original_name: name,
        file_size: 0,
        mime_type: "application/octet-stream",
        file_type: "other",
        source_entity: "deal",
        source_entity_id: row.vehicle_id,
        uploaded_by: await resolveUserId(row.dealership_id, row.created_by),
        uploaded_at: row.created_at,
      });
    }
  }

  return runBackfill("deal documents", fileRows);
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
  console.log("Uses insert-if-missing (no upsert) �€” safe to re-run.\n");

  const totals: BackfillStats = { inserted: 0, skipped: 0, errors: 0 };
  const sections = [
    backfillVehicleImages,
    backfillCustomerDocuments,
    backfillCustomerImages,
    backfillUserImages,
    () => backfillExpenseReceipts("dealership_expenses"),
    () => backfillExpenseReceipts("vehicle_expenses"),
    backfillDealJacketDocuments,
    backfillDealDocuments,
  ];

  for (const run of sections) {
    const stats = await run();
    totals.inserted += stats.inserted;
    totals.skipped += stats.skipped;
    totals.errors += stats.errors;
  }

  console.log(
    `\n=== Done! ${totals.inserted} inserted, ${totals.skipped} skipped, ${totals.errors} errors ===`,
  );
}

main().catch(console.error);
