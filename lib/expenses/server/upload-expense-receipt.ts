"use server";

import {
  authenticateUser,
  getSignedUrl,
  uploadFile,
} from "@/lib/vehicles/server/utils";

const RECEIPT_BUCKET = "expense-receipts" as const;

export async function uploadExpenseReceipt(
  dealershipId: string,
  expenseKind: "dealership" | "vehicle",
  expenseId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const folder = expenseKind === "dealership" ? "dealership" : "vehicle";
  const path = `${dealershipId}/${folder}/${expenseId}/receipt.${ext}`;
  await uploadFile(RECEIPT_BUCKET, path, file);
  return path;
}

export async function getExpenseReceiptUrl(
  storagePath: string | null | undefined,
): Promise<string | null> {
  if (!storagePath) return null;
  try {
    return await getSignedUrl(RECEIPT_BUCKET, storagePath);
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const auth = await authenticateUser();
  if (!auth.ok) {
    throw new Error(auth.error);
  }
  return auth.user;
}
