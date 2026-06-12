/**
 * Upload placeholder blobs to Supabase Storage for `files` rows
 * that have no corresponding storage object (common after seed-full).
 *
 * Usage: npx tsx scripts/backfill-seed-storage.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { placeholderForMimeType } from "./lib/seed-storage-blobs";

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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function storageObjectExists(bucket: string, storagePath: string): Promise<boolean> {
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  return !error && !!data;
}

async function main() {
  console.log("=== Backfilling missing storage objects for files table ===\n");

  const { data: rows, error } = await supabase
    .from("files")
    .select("id, bucket, storage_path, original_name, mime_type")
    .is("deleted_at", null);

  if (error) {
    console.error("Failed to load files:", error.message);
    process.exit(1);
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const exists = await storageObjectExists(row.bucket, row.storage_path);
    if (exists) {
      skipped++;
      continue;
    }

    const body = placeholderForMimeType(row.mime_type ?? "application/pdf");
    const { error: uploadError } = await supabase.storage
      .from(row.bucket)
      .upload(row.storage_path, body, {
        upsert: true,
        contentType: row.mime_type || "application/octet-stream",
      });

    if (uploadError) {
      console.error(`  FAIL ${row.original_name} (${row.bucket}/${row.storage_path}): ${uploadError.message}`);
      failed++;
    } else {
      console.log(`  OK   ${row.original_name} -> ${row.bucket}/${row.storage_path}`);
      uploaded++;

      await supabase
        .from("files")
        .update({ file_size: body.byteLength })
        .eq("id", row.id);
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, already present: ${skipped}, failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
