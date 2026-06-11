"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { SEND_DOCUMENT_DEFAULT_MESSAGE } from "@/lib/sales-rep/send-document/constants";
import { DEMO_SELECTED_DOCUMENTS, SALES_REP_OPTIONS } from "@/lib/sales-rep/send-document/mock-data";
import type {
  DeliveryMethod,
  RecipientType,
  SendDocumentFile,
} from "@/lib/sales-rep/send-document/types";
import {
  canSendDocument,
  getRecipientError,
  validateFile,
  validateMessage,
} from "@/lib/sales-rep/send-document/validation";

function createFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function fileToDocument(file: File): SendDocumentFile {
  const isImage = file.type.startsWith("image/");
  return {
    id: createFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
  };
}

export function useSendDocumentForm() {
  const [recipientType, setRecipientType] = useState<RecipientType>("email");
  const [emailAddresses, setEmailAddresses] = useState("");
  const [salesRepId, setSalesRepId] = useState("");
  const [message, setMessage] = useState(SEND_DOCUMENT_DEFAULT_MESSAGE);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [requireConfirmation, setRequireConfirmation] = useState(false);
  const [notifyOnView, setNotifyOnView] = useState(false);
  const [files, setFiles] = useState<SendDocumentFile[]>(DEMO_SELECTED_DOCUMENTS);
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");

  const recipientError = useMemo(
    () =>
      getRecipientError({
        recipientType,
        emailAddresses,
        salesRepId,
        touched: recipientTouched,
      }),
    [recipientType, emailAddresses, salesRepId, recipientTouched],
  );

  const messageError = useMemo(() => validateMessage(message), [message]);

  const canSend = useMemo(
    () =>
      canSendDocument({
        recipientType,
        emailAddresses,
        salesRepId,
        message,
        files,
        deliveryMethod,
        sending,
      }),
    [
      recipientType,
      emailAddresses,
      salesRepId,
      message,
      files,
      deliveryMethod,
      sending,
    ],
  );

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const accepted: SendDocumentFile[] = [];
    for (const file of list) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        continue;
      }
      accepted.push(fileToDocument(file));
    }

    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
      toast.success(
        accepted.length === 1
          ? "Document added"
          : `${accepted.length} documents added`,
      );
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
    toast.info("Document removed");
  }, []);

  const handleRecipientTypeChange = useCallback((type: RecipientType) => {
    setRecipientType(type);
    setRecipientTouched(false);
    setSendStatus("idle");
  }, []);

  const handleSend = useCallback(async () => {
    setRecipientTouched(true);
    if (!canSendDocument({ recipientType, emailAddresses, salesRepId, message, files, deliveryMethod })) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSending(true);
    setSendStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setSendStatus("success");
      toast.success("Documents sent successfully.");
    } catch {
      setSendStatus("error");
      toast.error("Failed to send documents. Please try again.");
    } finally {
      setSending(false);
    }
  }, [recipientType, emailAddresses, salesRepId, message, files, deliveryMethod]);

  const resetForm = useCallback(() => {
    for (const doc of files) {
      if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
    }
    setRecipientType("email");
    setEmailAddresses("");
    setSalesRepId("");
    setMessage(SEND_DOCUMENT_DEFAULT_MESSAGE);
    setDeliveryMethod("email");
    setRequireConfirmation(false);
    setNotifyOnView(false);
    setFiles([]);
    setRecipientTouched(false);
    setSendStatus("idle");
    toast.info("Form cleared");
  }, [files]);

  return {
    recipientType,
    emailAddresses,
    salesRepId,
    message,
    deliveryMethod,
    requireConfirmation,
    notifyOnView,
    files,
    recipientTouched,
    sending,
    sendStatus,
    recipientError,
    messageError,
    canSend,
    salesReps: SALES_REP_OPTIONS,
    setEmailAddresses,
    setSalesRepId,
    setMessage,
    setDeliveryMethod,
    setRequireConfirmation,
    setNotifyOnView,
    setRecipientTouched,
    handleRecipientTypeChange,
    addFiles,
    removeFile,
    handleSend,
    resetForm,
  };
}
