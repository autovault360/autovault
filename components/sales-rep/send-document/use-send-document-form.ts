"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { SEND_DOCUMENT_DEFAULT_MESSAGE } from "@/lib/sales-rep/send-document/constants";
import { getNormalizedFileType } from "@/lib/files-storage/file-type-utils";
import {
  isImageSendDocumentFile,
  isPdfSendDocumentFile,
} from "@/lib/sales-rep/send-document/file-type-helpers";

import type {

  DeliveryMethod,

  DocumentLibraryItem,

  RecipientType,

  SalesRepOption,

  SendDocumentFile,

} from "@/lib/sales-rep/send-document/types";

import type { SendHistoryItem } from "@/lib/sales-rep/send-document/server/types";

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
  const type = file.type || "application/octet-stream";
  const fileType = getNormalizedFileType(type, file.name);
  const draft: SendDocumentFile = {
    id: createFileId(),
    name: file.name,
    size: file.size,
    type,
    fileType,
    file,
  };

  return {
    ...draft,
    previewUrl:
      isImageSendDocumentFile(draft) || isPdfSendDocumentFile(draft)
        ? URL.createObjectURL(file)
        : undefined,
  };
}

function libraryItemToSelected(item: DocumentLibraryItem): SendDocumentFile {
  return {
    id: createFileId(),
    fileId: item.id,
    name: item.name,
    size: item.size,
    type: item.mimeType,
    fileType: item.fileType,
    previewUrl: item.previewUrl ?? undefined,
    sourceEntity: item.sourceEntity,
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

  const [files, setFiles] = useState<SendDocumentFile[]>([]);

  const [libraryFiles, setLibraryFiles] = useState<DocumentLibraryItem[]>([]);

  const [libraryLoading, setLibraryLoading] = useState(true);

  const [salesReps, setSalesReps] = useState<SalesRepOption[]>([]);

  const [historyItems, setHistoryItems] = useState<SendHistoryItem[]>([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [recipientTouched, setRecipientTouched] = useState(false);

  const [sending, setSending] = useState(false);

  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");



  const fetchLibrary = useCallback(async () => {

    setLibraryLoading(true);

    try {

      const response = await fetch("/api/send-document/documents?pageSize=100");

      const data = await response.json();



      if (!response.ok) {

        throw new Error(data.error ?? "Failed to load documents.");

      }



      setLibraryFiles(data.files ?? []);

    } catch (error) {

      toast.error(error instanceof Error ? error.message : "Failed to load documents.");

    } finally {

      setLibraryLoading(false);

    }

  }, []);



  const fetchRecipients = useCallback(async () => {

    try {

      const response = await fetch("/api/send-document/recipients");

      const data = await response.json();

      if (!response.ok) return;

      setSalesReps(

        (data.recipients ?? []).map((rep: { id: string; name: string; email: string }) => ({

          id: rep.id,

          name: rep.name,

          email: rep.email,

        })),

      );

    } catch {

      // non-blocking

    }

  }, []);



  const fetchHistory = useCallback(async () => {

    setHistoryLoading(true);

    try {

      const response = await fetch("/api/send-document/history");

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error ?? "Failed to load send history.");

      }

      setHistoryItems(data.items ?? []);

    } catch (error) {

      toast.error(error instanceof Error ? error.message : "Failed to load send history.");

    } finally {

      setHistoryLoading(false);

    }

  }, []);



  useEffect(() => {

    fetchRecipients();

    fetchLibrary();

  }, [fetchRecipients, fetchLibrary]);



  useEffect(() => {

    if (historyOpen) {

      fetchHistory();

    }

  }, [historyOpen, fetchHistory]);



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



  const toggleLibrarySelect = useCallback((item: DocumentLibraryItem) => {

    setFiles((prev) => {

      const existing = prev.find((file) => file.fileId === item.id);

      if (existing) {

        return prev.filter((file) => file.fileId !== item.id);

      }

      return [...prev, libraryItemToSelected(item)];

    });

  }, []);



  const removeFile = useCallback((id: string) => {

    setFiles((prev) => {

      const target = prev.find((file) => file.id === id);

      if (target?.previewUrl?.startsWith("blob:")) {

        URL.revokeObjectURL(target.previewUrl);

      }

      return prev.filter((file) => file.id !== id);

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



    if (deliveryMethod !== "email") {

      toast.info("Only email delivery is available right now.");

      return;

    }



    if (

      !canSendDocument({

        recipientType,

        emailAddresses,

        salesRepId,

        message,

        files,

        deliveryMethod,

      })

    ) {

      toast.error("Please complete all required fields.");

      return;

    }



    setSending(true);

    setSendStatus("idle");



    try {

      const pendingUploads = files.filter((file) => file.file && !file.fileId);

      const existingFileIds = files

        .map((file) => file.fileId)

        .filter((id): id is string => Boolean(id));



      let response: Response;



      if (pendingUploads.length > 0) {

        const formData = new FormData();

        formData.append("recipientType", recipientType);

        formData.append("emailAddresses", emailAddresses);

        formData.append("salesRepId", salesRepId);

        formData.append("message", message);

        formData.append("fileIds", JSON.stringify(existingFileIds));

        for (const pending of pendingUploads) {

          if (pending.file) formData.append("uploads", pending.file);

        }

        response = await fetch("/api/send-document/send", {

          method: "POST",

          body: formData,

        });

      } else {

        response = await fetch("/api/send-document/send", {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({

            recipientType,

            emailAddresses,

            salesRepId,

            message,

            fileIds: existingFileIds,

          }),

        });

      }



      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error ?? "Failed to send documents.");

      }



      setSendStatus("success");

      toast.success("Documents sent successfully.");

      fetchHistory();

    } catch (error) {

      setSendStatus("error");

      toast.error(error instanceof Error ? error.message : "Failed to send documents.");

    } finally {

      setSending(false);

    }

  }, [

    recipientType,

    emailAddresses,

    salesRepId,

    message,

    files,

    deliveryMethod,

    fetchHistory,

  ]);



  const resetForm = useCallback(() => {

    for (const doc of files) {

      if (doc.previewUrl?.startsWith("blob:")) {

        URL.revokeObjectURL(doc.previewUrl);

      }

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

    libraryFiles,

    libraryLoading,

    historyItems,

    historyLoading,

    historyOpen,

    recipientTouched,

    sending,

    sendStatus,

    recipientError,

    messageError,

    canSend,

    salesReps,

    setEmailAddresses,

    setSalesRepId,

    setMessage,

    setDeliveryMethod,

    setRequireConfirmation,

    setNotifyOnView,

    setHistoryOpen,

    setRecipientTouched,

    handleRecipientTypeChange,

    addFiles,

    toggleLibrarySelect,

    removeFile,

    handleSend,

    resetForm,

  };

}


