"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FieldLabel,
  ModalBody,
  ModalHeader,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  WHOLESALE_DOCUMENT_CATEGORIES,
  WHOLESALE_DOCUMENT_CATEGORY_LABELS,
  WHOLESALE_DOCUMENT_TYPES,
  WHOLESALE_DOCUMENT_TYPE_LABELS,
} from "@/lib/dealer/documents/constants";
import {
  wholesaleDocumentFormSchema,
  type WholesaleDocumentFormValues,
} from "@/lib/dealer/documents/schemas";
import { updateWholesaleDocument } from "@/lib/dealer/documents/server/document-actions";
import type { WholesaleDocument } from "@/lib/dealer/documents/types";
import {
  buildWholesaleDocumentDefaultsFromRecord,
} from "@/hooks/dealer/use-wholesale-document-form";
import DocumentVehicleLookup from "./document-vehicle-lookup";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import { DateField } from "@/components/expenses/add/add-expense-modal-parts";

export default function EditDocumentModal({
  open,
  onOpenChange,
  document,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: WholesaleDocument | null;
  onSuccess: () => void;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [linkedVehicle, setLinkedVehicle] = useState<LinkedVehicleResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<WholesaleDocumentFormValues>({
    resolver: zodResolver(
      wholesaleDocumentFormSchema,
    ) as Resolver<WholesaleDocumentFormValues>,
    defaultValues: buildWholesaleDocumentDefaultsFromRecord(
      document ?? ({} as WholesaleDocument),
    ),
  });

  const documentType = form.watch("documentType");

  useEffect(() => {
    if (open && document) {
      form.reset(buildWholesaleDocumentDefaultsFromRecord(document));
      if (document.vehicle) {
        setLinkedVehicle({
          id: document.vehicle.id,
          year: document.vehicle.year,
          make: document.vehicle.make,
          model: document.vehicle.model,
          trim: document.vehicle.trim ?? "",
          stockNumber: document.vehicle.stockNumber,
          vin: document.vehicle.vin,
          mileage: 0,
          color: "...",
          status: "In Stock",
          image: document.vehicle.imageUrl ?? "/placeholder-vehicle.png",
        });
      } else {
        setLinkedVehicle(null);
      }
    }
  }, [open, document, form]);

  useEffect(() => {
    if (linkedVehicle) {
      form.setValue("vehicleId", linkedVehicle.id);
      form.setValue("vin", linkedVehicle.vin);
      form.setValue("stockNo", linkedVehicle.stockNumber);
    }
  }, [linkedVehicle, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!document) return;
    if (values.documentType === "vehicle_document" && !linkedVehicle) {
      toast.error("Please select a vehicle.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateWholesaleDocument(document.id, {
        documentType: values.documentType,
        vehicleId: values.vehicleId,
        category: values.category,
        documentName: values.documentName,
        description: values.description,
        expiryDate: values.expiryDate,
        remarks: values.remarks,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Document updated successfully.");
      onOpenChange(false);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }, () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  });

  if (!document) return null;

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} theme="dark" size="lg">
      <ModalHeader
        icon={<Pencil className="h-4 w-4 text-white" />}
        iconClassName="bg-emerald-600"
        title="Edit Document"
        subtitle="Update document details and metadata."
        onClose={() => onOpenChange(false)}
      />
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake} className="space-y-3.5">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel label="Document Type" required />
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger theme="dark" className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent theme="dark">
                      {WHOLESALE_DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-[12px]">
                          {WHOLESALE_DOCUMENT_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {documentType === "vehicle_document" && (
              <DocumentVehicleLookup
                vehicle={linkedVehicle}
                onVehicleChange={setLinkedVehicle}
              />
            )}

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel label="Category" required />
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger theme="dark" className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent theme="dark">
                      {WHOLESALE_DOCUMENT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-[12px]">
                          {WHOLESALE_DOCUMENT_CATEGORY_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentName"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel label="Document Name" required />
                  <FormControl>
                    <Input theme="dark" {...field} className="h-9 text-[12px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel label="Notes" />
                  <FormControl>
                    <Textarea
                      theme="dark"
                      {...field}
                      rows={3}
                      maxLength={250}
                      className="resize-none text-[12px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel label="Expiry Date" />
                  <DateField
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    dateInputRef={dateInputRef}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel label="Remarks" />
                  <FormControl>
                    <Textarea
                      theme="dark"
                      {...field}
                      rows={2}
                      maxLength={500}
                      className="resize-none text-[12px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ModalBody>
          <div className="flex justify-end gap-2 border-t border-slate-700/80 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 bg-transparent text-slate-300"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
