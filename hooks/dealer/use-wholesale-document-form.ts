"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import {
  createWholesaleDocument,
} from "@/lib/dealer/documents/server/document-actions";
import {
  wholesaleDocumentFormSchema,
  validateUploadedFile,
  type WholesaleDocumentFormValues,
} from "@/lib/dealer/documents/schemas";
import type { WholesaleDocument } from "@/lib/dealer/documents/types";

export function buildWholesaleDocumentDefaults(): WholesaleDocumentFormValues {
  return {
    documentType: "vehicle_document",
    vehicleId: "",
    vin: "",
    stockNo: "",
    category: "bill_of_sale",
    documentName: "",
    description: "",
    expiryDate: "",
    status: "active",
    remarks: "",
  };
}

export function buildWholesaleDocumentDefaultsFromRecord(
  doc: WholesaleDocument,
): WholesaleDocumentFormValues {
  return {
    documentType: doc.documentType,
    vehicleId: doc.vehicleId ?? "",
    vin: doc.vehicle?.vin ?? "",
    stockNo: doc.vehicle?.stockNumber ?? "",
    category: doc.category,
    documentName: doc.documentName,
    description: doc.description ?? "",
    expiryDate: doc.expiryDate ?? "",
    status: doc.status,
    remarks: doc.remarks ?? "",
  };
}

export function useWholesaleDocumentForm(options?: {
  onSuccess?: () => void;
  editDocument?: WholesaleDocument | null;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(null);
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!options?.editDocument;

  const form = useForm<WholesaleDocumentFormValues>({
    resolver: zodResolver(
      wholesaleDocumentFormSchema,
    ) as Resolver<WholesaleDocumentFormValues>,
    defaultValues: buildWholesaleDocumentDefaults(),
    mode: "onBlur",
  });

  const documentType = form.watch("documentType");

  useEffect(() => {
    if (linkedVehicle) {
      form.setValue("vehicleId", linkedVehicle.id);
      form.setValue("vin", linkedVehicle.vin);
      form.setValue("stockNo", linkedVehicle.stockNumber);
    } else if (documentType === "vehicle_document") {
      form.setValue("vehicleId", "");
      form.setValue("vin", "");
      form.setValue("stockNo", "");
    }
  }, [linkedVehicle, form, documentType]);

  const resetForm = () => {
    form.reset(buildWholesaleDocumentDefaults());
    setFile(null);
    setLinkedVehicle(null);
    setStep(1);
  };

  const handleFileSelect = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      return;
    }
    const error = validateUploadedFile(selected);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(selected);
    const baseName = selected.name.replace(/\.[^.]+$/, "").replace(/_/g, " ");
    if (!form.getValues("documentName")?.trim()) {
      form.setValue("documentName", baseName, { shouldDirty: true });
    }
  };

  const validateStep = async (currentStep: 1 | 2 | 3): Promise<boolean> => {
    if (currentStep === 1) {
      const fields: (keyof WholesaleDocumentFormValues)[] = [
        "documentType",
        "category",
        "documentName",
      ];
      if (documentType === "vehicle_document") {
        fields.push("vehicleId");
      }
      const valid = await form.trigger(fields);
      if (!valid) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        return false;
      }
      if (documentType === "vehicle_document" && !linkedVehicle) {
        toast.error("Please lookup and select a vehicle.");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!file && !isEdit) {
        toast.error("Please upload a document file.");
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = async () => {
    const valid = await validateStep(step);
    if (!valid) return;
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  };

  const goBack = () => {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  };

  const submitCreate = form.handleSubmit(async (values) => {
    if (!file) {
      toast.error("Please upload a document file.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", values.documentType);
      fd.append("category", values.category);
      fd.append("documentName", values.documentName);
      if (values.vehicleId) fd.append("vehicleId", values.vehicleId);
      if (values.vin) fd.append("vin", values.vin);
      if (values.stockNo) fd.append("stockNo", values.stockNo);
      if (values.description) fd.append("description", values.description);
      if (values.expiryDate) fd.append("expiryDate", values.expiryDate);
      if (values.status) fd.append("status", values.status);
      if (values.remarks) fd.append("remarks", values.remarks);

      const result = await createWholesaleDocument(fd);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Document uploaded successfully.");
      resetForm();
      options?.onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  }, () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  });

  return {
    form,
    step,
    setStep,
    file,
    setFile: handleFileSelect,
    linkedVehicle,
    setLinkedVehicle,
    shake,
    isSubmitting,
    isEdit,
    resetForm,
    goNext,
    goBack,
    submitCreate,
    validateStep,
  };
}
