import {
  SEND_DOCUMENT_ALLOWED_EXTENSIONS,
  SEND_DOCUMENT_ALLOWED_MIME_TYPES,
  SEND_DOCUMENT_MAX_FILE_SIZE,
  SEND_DOCUMENT_MESSAGE_MAX,
} from "./constants";
import type { DeliveryMethod, RecipientType, SendDocumentFile } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function parseEmailList(raw: string): string[] {
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function validateEmailList(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Email address is required.";
  const emails = parseEmailList(trimmed);
  if (emails.length === 0) return "Enter at least one email address.";
  for (const email of emails) {
    if (!EMAIL_REGEX.test(email)) {
      return `"${email}" is not a valid email address.`;
    }
  }
  return null;
}

export function validateSalesRepId(id: string): string | null {
  if (!id.trim()) return "Please select a sales rep.";
  return null;
}

export function validateMessage(message: string): string | null {
  if (message.length > SEND_DOCUMENT_MESSAGE_MAX) {
    return `Message must be ${SEND_DOCUMENT_MESSAGE_MAX} characters or less.`;
  }
  return null;
}

export function validateFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (
    !SEND_DOCUMENT_ALLOWED_EXTENSIONS.includes(
      ext as (typeof SEND_DOCUMENT_ALLOWED_EXTENSIONS)[number],
    ) &&
    !SEND_DOCUMENT_ALLOWED_MIME_TYPES.includes(file.type)
  ) {
    return `${file.name}: Only PDF, JPG, PNG, DOC, and DOCX files are allowed.`;
  }
  if (file.size > SEND_DOCUMENT_MAX_FILE_SIZE) {
    return `${file.name}: File exceeds 25MB limit.`;
  }
  return null;
}

export function canSendDocument(options: {
  recipientType: RecipientType;
  emailAddresses: string;
  salesRepId: string;
  message: string;
  files: SendDocumentFile[];
  deliveryMethod: DeliveryMethod;
  sending?: boolean;
}): boolean {
  if (options.sending) return false;
  if (options.files.length === 0) return false;
  if (validateMessage(options.message)) return false;

  if (options.recipientType === "email") {
    return validateEmailList(options.emailAddresses) === null;
  }

  return validateSalesRepId(options.salesRepId) === null;
}

export function getRecipientError(options: {
  recipientType: RecipientType;
  emailAddresses: string;
  salesRepId: string;
  touched: boolean;
}): string | null {
  if (!options.touched) return null;
  if (options.recipientType === "email") {
    return validateEmailList(options.emailAddresses);
  }
  return validateSalesRepId(options.salesRepId);
}
