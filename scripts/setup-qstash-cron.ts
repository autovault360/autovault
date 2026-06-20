/**
 * AutoVault360 �€” QStash Cron Setup
 *
 * Registers a daily cron job to check tax filing reminders.
 * Run once after deploying to production.
 *
 * Usage:
 *   npx tsx scripts/setup-qstash-cron.ts
 *
 * Prerequisites:
 *   1. Sign up at https://upstash.com
 *   2. Create a QStash instance
 *   3. Add QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY to .env
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!QSTASH_TOKEN) {
  console.error("??? Set QSTASH_TOKEN in .env (find it in Upstash Console > QStash > Tokens)");
  process.exit(1);
}

async function main() {
  console.log("\n==============================================");
  console.log("  AutoVault360 �€” QStash Cron Setup");
  console.log("==============================================\n");

  const cronEndpoint = `${APP_URL}/api/tax-filing/check-reminders`;
  console.log(`? Endpoint: ${cronEndpoint}`);

  const body = {
    destination: cronEndpoint,
    cron: "0 14 * * *", // Daily at 2PM UTC
    retries: 3,
    delay: 0,
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log(`? Schedule: 0 14 * * * (daily at 2PM UTC)`);

  const response = await fetch("https://qstash.upstash.io/v1/schedules", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${QSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`??? Failed: ${response.status} �€” ${error}`);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`? Cron created! Schedule ID: ${data.scheduleId}`);
  console.log("\nTo view/manage crons: https://console.upstash.com/qstash");
  console.log("==============================================\n");
}

main().catch((err) => {
  console.error("???", err);
  process.exit(1);
});
