export type RecipientType = "email" | "sales_rep";

export type DeliveryMethod = "email" | "secure_link" | "upload_portal";

export type SendDocumentFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  previewUrl?: string;
};

export type SalesRepOption = {
  id: string;
  name: string;
  email: string;
};

export type SendDocumentFormState = {
  recipientType: RecipientType;
  emailAddresses: string;
  salesRepId: string;
  message: string;
  deliveryMethod: DeliveryMethod;
  requireConfirmation: boolean;
  notifyOnView: boolean;
  files: SendDocumentFile[];
};
