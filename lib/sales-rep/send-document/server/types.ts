export type DocumentCenterFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  fileType: string;
  sourceEntity: string | null;
  uploadedAt: string;
  previewUrl: string | null;
};

export type DocumentCenterListResponse = {
  files: DocumentCenterFile[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type SendDocumentRecipient = {
  id: string;
  name: string;
  email: string;
};

export type SendHistoryItem = {
  id: string;
  senderName: string;
  recipientLabel: string;
  recipientType: "email" | "sales_rep";
  documentCount: number;
  documentNames: string[];
  sentAt: string;
  deliveryMethod: "email" | "internal_message";
  readStatus: "read" | "unread" | "pending" | "n/a";
  downloadStatus: "downloaded" | "pending" | "n/a";
  conversationId: string | null;
  messageId: string | null;
};

export type SendHistoryResponse = {
  items: SendHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};
