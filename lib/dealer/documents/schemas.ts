import { z } from "zod";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  WHOLESALE_DOCUMENT_CATEGORIES,
  WHOLESALE_DOCUMENT_STATUSES,
  WHOLESALE_DOCUMENT_TYPES,
} from "./constants";

const documentTypeSchema = z.enum(WHOLESALE_DOCUMENT_TYPES, {
  message: "Please select a valid document type.",
});

const categorySchema = z.enum(WHOLESALE_DOCUMENT_CATEGORIES, {
  message: "Please select a valid document category.",
});

const statusSchema = z.enum(WHOLESALE_DOCUMENT_STATUSES, {
  message: "Please select a valid status.",
});

function validateFileMeta(
  fileName: string,
  mimeType: string,
  fileSize: number,
  ctx: z.RefinementCtx,
  required = true,
) {
  if (!fileName && !required) return;
  if (!fileName && required) {
    ctx.addIssue({ code: "custom", message: "Please upload a document file." });
    return;
  }
  const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number])) {
    ctx.addIssue({
      code: "custom",
      message: "File type not allowed. Use PDF, JPG, PNG, DOCX, or XLSX.",
    });
  }
  if (
    mimeType &&
    !ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])
  ) {
    ctx.addIssue({ code: "custom", message: "File MIME type is not allowed." });
  }
  if (fileSize > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    ctx.addIssue({ code: "custom", message: "File must be 25 MB or smaller." });
  }
}

export const wholesaleDocumentFormSchema = z
  .object({
    documentType: documentTypeSchema,
    vehicleId: z.string().optional(),
    vin: z.string().optional(),
    stockNo: z.string().optional(),
    category: categorySchema,
    documentName: z
      .string()
      .trim()
      .min(1, "Document name is required.")
      .max(200, "Document name must be 200 characters or less."),
    description: z
      .string()
      .trim()
      .max(250, "Notes must be 250 characters or less.")
      .optional(),
    expiryDate: z.string().optional(),
    status: statusSchema.optional(),
    remarks: z
      .string()
      .trim()
      .max(500, "Remarks must be 500 characters or less.")
      .optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
    fileSize: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.documentType === "vehicle_document" && !data.vehicleId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please select a vehicle for vehicle documents.",
        path: ["vehicleId"],
      });
    }
    if (data.expiryDate) {
      const expiry = new Date(`${data.expiryDate}T00:00:00`);
      if (Number.isNaN(expiry.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Expiry date is invalid.",
          path: ["expiryDate"],
        });
      }
    }
  });

export const createWholesaleDocumentSchema = wholesaleDocumentFormSchema.superRefine(
  (data, ctx) => {
    validateFileMeta(
      data.fileName ?? "",
      data.mimeType ?? "",
      data.fileSize ?? 0,
      ctx,
      true,
    );
  },
);

export const updateWholesaleDocumentSchema = wholesaleDocumentFormSchema;

export const updateWholesaleDocumentStatusSchema = z.object({
  status: statusSchema,
  remarks: z
    .string()
    .trim()
    .max(500, "Remarks must be 500 characters or less.")
    .optional(),
});

export type WholesaleDocumentFormValues = z.infer<typeof wholesaleDocumentFormSchema>;

export function validateUploadedFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number])) {
    return "File type not allowed. Use PDF, JPG, PNG, DOCX, or XLSX.";
  }
  if (
    file.type &&
    !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])
  ) {
    return "File MIME type is not allowed.";
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return "File must be 25 MB or smaller.";
  }
  return null;
}
