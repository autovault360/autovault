"use server";

import {
  authenticateUser,
  getSignedUrl,
  uploadFile,
  trackFile,
} from "@/lib/vehicles/server/utils";

const RECEIPT_BUCKET = "expense-receipts" as const;
const MAX_RECEIPT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_RECEIPT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
const ALLOWED_RECEIPT_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);

function validateReceiptFile(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (file.size <= 0) {
    throw new Error("Receipt file is empty.");
  }
  if (file.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
    throw new Error("Receipt file must be 10MB or smaller.");
  }
  if (!ALLOWED_RECEIPT_EXTENSIONS.has(ext)) {
    throw new Error("Receipt must be a PDF, JPG, JPEG, or PNG file.");
  }
  if (!ALLOWED_RECEIPT_MIME_TYPES.has(file.type)) {
    throw new Error("Receipt file type is not supported.");
  }

  return ext;
}

export async function uploadExpenseReceipt(
  dealershipId: string,
  expenseKind: "dealership" | "vehicle",
  expenseId: string,
  file: File,
  userId: string,
): Promise<string> {
  const ext = validateReceiptFile(file);
  const folder = expenseKind === "dealership" ? "dealership" : "vehicle";
  const path = `${dealershipId}/${folder}/${expenseId}/receipt.${ext}`;
  await uploadFile(RECEIPT_BUCKET, path, file);

  const sourceEntity = expenseKind === "dealership" ? "dealership_expense" : "expense";
  await trackFile(file, RECEIPT_BUCKET, path, dealershipId, userId, {
    sourceEntity,
    sourceEntityId: expenseId,
  });

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
