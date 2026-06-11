export const SEND_DOCUMENT_MAX_FILE_SIZE = 25 * 1024 * 1024;

export const SEND_DOCUMENT_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
] as const;

export const SEND_DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const SEND_DOCUMENT_MESSAGE_MAX = 500;

export const SEND_DOCUMENT_DEFAULT_MESSAGE =
  "Please find the attached documents for your review. Let me know if you have any questions.";
